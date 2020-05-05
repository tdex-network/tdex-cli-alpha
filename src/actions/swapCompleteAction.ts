import * as PathModule from 'path';
import { Wallet, WalletInterface, Swap } from 'tdex-sdk';

import { info, log, error, success } from '../logger';
import State from '../state';
import { decrypt } from '../crypto';
import { readBinary, writeBinary } from '../helpers';
//eslint-disable-next-line
const { Confirm, Password } = require('enquirer');

const state = new State();
const confirm = new Confirm({
  name: 'question',
  message: 'Are you sure to confirm?',
});
const password = new Password({
  type: 'password',
  name: 'key',
  message: 'Type your password',
});

export default function (path: string, cmdObj: any): void {
  info('=========*** Swap ***==========\n');

  const { wallet, network } = state.get();

  if (!network.selected) return error('Select a valid network first');

  if (!wallet.selected)
    return error(
      'A wallet is required. Create or restoste with wallet command'
    );

  if (!path || !PathModule.isAbsolute(path)) {
    return error('Swap file path must be absolute');
  }

  if (cmdObj.output && !PathModule.isAbsolute(cmdObj.output))
    return error('Output path must be asbolute if specified');

  let swapAccept: any,
    serializedSwapAccept: Uint8Array,
    walletInstance: WalletInterface;

  readBinary(path)
    .then((data: Uint8Array) => {
      serializedSwapAccept = data;
      const json = Swap.parse({
        message: serializedSwapAccept,
        type: 'SwapAccept',
      });
      swapAccept = JSON.parse(json);
      log(`SwapAccept message: ${JSON.stringify(swapAccept, undefined, 2)}`);
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

      log('\nSigning with private key...');
      return walletInstance.sign(swapAccept.transaction);
    })
    .then((signedPsbt: string) => {
      success('\n√ Done\n');

      const swap = new Swap({ chain: network.chain });
      const swapComplete = swap.complete({
        message: serializedSwapAccept,
        psbtBase64: signedPsbt,
      });
      const json = Swap.parse({ message: swapComplete, type: 'SwapComplete' });

      const defaultPath = PathModule.resolve(
        PathModule.dirname(path),
        `${JSON.parse(json).id}.bin`
      );
      const file = cmdObj.output ? cmdObj.output : defaultPath;

      writeBinary(file, swapComplete);
      success(`SwapComplete message saved into ${file}`);

      if (cmdObj.push)
        log(`\nSigned transaction (hex format)\n\n${Wallet.toHex(signedPsbt)}`);
    })
    .catch(error);
}
