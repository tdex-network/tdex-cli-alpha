import axios from 'axios';
import * as PathModule from 'path';
import { Wallet, WalletInterface, fetchUtxos, Swap } from 'tdex-sdk';

import { info, log, error, success } from '../logger';
import State from '../state';
import { decrypt } from '../crypto';
import { TAXI_API_URL, readBinary, writeBinary } from '../helpers';
//eslint-disable-next-line
const { Confirm, Password } = require('enquirer');

const state = new State();
const confirm = new Confirm({
  name: 'question',
  message: 'Do you accept the proposed terms?',
});
const password = new Password({
  type: 'password',
  name: 'key',
  message: 'Type your password',
});

export default async function (path: string, cmdObj: any): Promise<void> {
  info('=========*** Swap ***==========\n');

  const { wallet, network } = state.get();

  if (!network.selected) return error('Select a valid network first');

  if (!wallet.selected)
    return error(
      'A wallet is required. Create or restoste with wallet command'
    );

  if (!path || !PathModule.isAbsolute(path)) {
    return error('Path must be absolute');
  }

  if (cmdObj.output && !PathModule.isAbsolute(cmdObj.output))
    return error('Path must be asbolute if specified');

  let swapRequest: any,
    serializedSwapRequest: Uint8Array,
    walletInstance: WalletInterface;

  readBinary(path)
    .then((data: Uint8Array) => {
      serializedSwapRequest = data;
      const json = Swap.parse({
        message: serializedSwapRequest,
        type: 'SwapRequest',
      });
      swapRequest = JSON.parse(json);
      log(`SwapRequest message: ${JSON.stringify(swapRequest, undefined, 2)}`);
      return confirm.run();
    })
    .then((keepGoing: boolean) => {
      if (!keepGoing) throw 'Canceled';

      const execute =
        wallet.keystore.type === 'encrypted'
          ? () => password.run()
          : () => Promise.resolve(wallet.keystore.value);

      return execute();
    })
    .then((passwordOrWif: string) => {
      const wif =
        wallet.keystore.type === 'encrypted'
          ? decrypt(wallet.keystore.value, passwordOrWif)
          : passwordOrWif;

      walletInstance = Wallet.fromWIF(wif, network.chain);

      return fetchUtxos(walletInstance.address, network.explorer);
    })
    .then((utxos: Array<any>) => {
      // Add inputs and putputs to psbt

      const unsignedPsbt = walletInstance.updateTx(
        swapRequest.transaction,
        utxos,
        swapRequest.amountR,
        swapRequest.amountP,
        swapRequest.assetR,
        swapRequest.assetP
      );

      const body = { psbt: unsignedPsbt };
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': 'VULPEM_FREE',
        },
      };

      return axios.post(
        `${(TAXI_API_URL as any)[network.chain]}/topup`,
        body,
        options
      );
    })
    .then((taxiResponse: any) => {
      const psbtWithFees = taxiResponse.data.data.signedTx;

      log('\nSigning with private key...');

      return walletInstance.sign(psbtWithFees);
    })
    .then((signedPsbt: string) => {
      success('\n√ Done\n');

      const swap = new Swap({ chain: network.chain });
      const swapAccept = swap.accept({
        message: serializedSwapRequest,
        psbtBase64: signedPsbt,
      });
      const json = Swap.parse({
        message: swapAccept,
        type: 'SwapAccept',
      });

      const defaultPath = PathModule.resolve(
        PathModule.dirname(path),
        `${JSON.parse(json).id}.bin`
      );
      const file = cmdObj.output ? cmdObj.output : defaultPath;
      writeBinary(file, swapAccept);
      success(`SwapAccept message saved into ${file}`);

      if (cmdObj.print) {
        log(`\nSwapAccept message\n\n${json}`);
      }
    })
    .catch(error);
}
