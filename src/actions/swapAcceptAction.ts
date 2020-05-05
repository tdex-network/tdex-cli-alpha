import axios from 'axios';
import * as PathModule from 'path';
import { Wallet, WalletInterface, fetchUtxos, Swap } from 'tdex-sdk';

import { info, log, error, success } from '../logger';
import State from '../state';
import { decrypt } from '../crypto';
import { TAXI_API_URL, readBinary, writeBinary, fileExists } from '../helpers';
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

export default async function (cmdObj: any): Promise<void> {
  info('=========*** Swap ***==========\n');

  const { wallet, network } = state.get();

  let swapRequestFile: string;
  if (cmdObj.file) {
    swapRequestFile = PathModule.resolve(cmdObj.file);
  } else {
    swapRequestFile = PathModule.resolve(process.cwd(), 'swap_request.bin');
  }

  if (!network.selected) return error('Select a valid network first');

  if (!wallet.selected)
    return error(
      'A wallet is required. Create or restoste with wallet command'
    );

  if (!fileExists(swapRequestFile)) {
    return error('File is not valid or does not exist');
  }

  if (
    cmdObj.output &&
    (!cmdObj.output.endsWith('.bin') ||
      !fileExists(PathModule.dirname(PathModule.resolve(cmdObj.output))))
  )
    return error('Output path id not valid');

  let swapRequest: any,
    serializedSwapRequest: Uint8Array,
    walletInstance: WalletInterface,
    swapAccept: any,
    swapAcceptFile: string;

  readBinary(swapRequestFile)
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
      swapAccept = swap.accept({
        message: serializedSwapRequest,
        psbtBase64: signedPsbt,
      });

      const defaultPath = PathModule.resolve(
        PathModule.dirname(swapRequestFile),
        'swap_accept.bin'
      );
      swapAcceptFile = cmdObj.output
        ? PathModule.resolve(cmdObj.output)
        : defaultPath;
      return writeBinary(swapAcceptFile, swapAccept);
    })
    .then(() => {
      success(`SwapAccept message saved into ${swapAcceptFile}`);

      if (cmdObj.print) {
        const json = Swap.parse({
          message: swapAccept,
          type: 'SwapAccept',
        });
        log(`\nSwapAccept message\n\n${json}`);
      }
    })
    .catch(error);
}
