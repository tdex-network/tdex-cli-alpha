import axios from 'axios';
import * as PathModule from 'path';
import { Wallet, WalletInterface, Swap } from 'tdex-sdk';

import { info, log, error, success } from '../logger';
import State from '../state';
import { decrypt } from '../crypto';
import { readBinary, writeBinary, fileExists } from '../helpers';
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

export default function (cmdObj: any): void {
  info('=========*** Swap ***==========\n');

  const { wallet, network } = state.get();

  let swapAcceptFile: string;
  if (cmdObj.file) {
    swapAcceptFile = PathModule.resolve(cmdObj.file);
  } else {
    swapAcceptFile = PathModule.resolve(process.cwd(), 'swap_accept.bin');
  }

  if (!network.selected) return error('Select a valid network first');

  if (!wallet.selected)
    return error(
      'A wallet is required. Create or restoste with wallet command'
    );

  if (
    cmdObj.output &&
    (!cmdObj.output.endsWith('.bin') ||
      !fileExists(PathModule.dirname(PathModule.resolve(cmdObj.output))))
  )
    return error('Output path id not valid');

  if (cmdObj.output && !PathModule.isAbsolute(cmdObj.output))
    return error('Output path must be asbolute if specified');

  let swapAccept: any,
    serializedSwapAccept: Uint8Array,
    walletInstance: WalletInterface;

  readBinary(swapAcceptFile)
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

      const defaultPath = PathModule.resolve(
        PathModule.dirname(swapAcceptFile),
        'swap_completed.bin'
      );
      const file = cmdObj.output
        ? PathModule.resolve(cmdObj.output)
        : defaultPath;
      writeBinary(file, swapComplete);
      success(`SwapComplete message saved into ${file}`);

      let execute = () => Promise.resolve();

      if (cmdObj.push) {
        const options = {
          headers: {
            'Content-Type': 'text/plain',
          },
        };

        execute = () =>
          axios.post(
            `${network.explorer}/tx`,
            Wallet.toHex(signedPsbt),
            options
          );
      }
      return execute();
    })
    .then((txIdOrNothing: any) => {
      if (txIdOrNothing) log(`\nTransaction: ${txIdOrNothing.data}`);
    })
    .catch(() => ({}));
}
