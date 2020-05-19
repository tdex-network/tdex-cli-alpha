import axios from 'axios';
import * as PathModule from 'path';
import { Swap, WatchOnlyWallet, fetchUtxos, networks } from 'tdex-sdk';

import { info, log, error, success } from '../logger';
import State from '../state';
import { fromSatoshi, toSatoshi, writeBinary, fileExists } from '../helpers';
//eslint-disable-next-line
const { NumberPrompt, Confirm, Form } = require('enquirer');

const state = new State();

export default function (cmdObj: any): void {
  info('=========*** Swap ***==========\n');

  const { wallet, network } = state.get();

  if (
    cmdObj.output &&
    (!cmdObj.output.endsWith('.bin') ||
      !fileExists(PathModule.dirname(PathModule.resolve(cmdObj.output))))
  )
    return error('Output path id not valid');

  if (!network.selected) return error('Select a valid network first');

  if (!wallet.selected)
    return error('A wallet is required. Create or restore with wallet command');

  const assets = new Form({
    name: 'assets',
    message:
      'Please provide the assets (move with up/down arrow and then Enter)',
    choices: [
      { name: 'toBeSent', message: 'Which asset do you want to send?' },
      { name: 'toReceive', message: 'Which asset do you want to receive?' },
    ],
  });

  const amount = (message: string) =>
    new NumberPrompt({
      name: 'number',
      message,
    });
  const confirm = new Confirm({
    name: 'question',
    message: 'Are you sure continue?',
  });
  const isValidAmount = (amount: number): boolean =>
    !(amount <= 0 || !Number.isSafeInteger(amount));

  let toBeSent: string,
    toReceive: string,
    amountToBeSent: number,
    amountToReceive: number,
    swapRequest: any,
    swapRequestFile: string;

  assets
    .run()
    .then((answers: any) => {
      if (!answers.toBeSent || !answers.toReceive) throw 'Empty asset';

      toBeSent = answers.toBeSent;
      toReceive = answers.toReceive;

      //TODO store and show the ticker to the user
      const promises = [
        axios.get(`${network.explorer}/asset/${answers.toBeSent}`),
        axios.get(`${network.explorer}/asset/${answers.toReceive}`),
      ];
      return Promise.all(promises).catch(() => {
        throw 'Asset hash does not exist';
      });
    })
    .then(() => {
      return amount(`How much do you want to send?`).run();
    })
    .then((inputAmount: number) => {
      amountToBeSent = toSatoshi(inputAmount);
      if (!isValidAmount(amountToBeSent))
        return Promise.reject(new Error('Amount is not valid'));
      return amount(`How much do you want to receive?`).run();
    })
    .then((outputAmount: number) => {
      amountToReceive = toSatoshi(outputAmount);
      if (!isValidAmount(amountToReceive))
        return Promise.reject(new Error('Amount is not valid'));
      const previewLength = 4;
      log(
        `Gotcha! You will send ${toBeSent.substring(
          0,
          previewLength
        )} ${fromSatoshi(amountToBeSent)} and receive ${toReceive.substring(
          0,
          previewLength
        )} ${fromSatoshi(amountToReceive)}`
      );
      return confirm.run();
    })
    .then((keepGoing: boolean) => {
      if (!keepGoing) throw 'Canceled';
      return fetchUtxos(wallet.address, network.explorer);
    })
    .then((utxos: any[]) => {
      const woWallet = new WatchOnlyWallet({
        address: wallet.address,
        network: (networks as any)[network.chain],
      });
      const emptyPsbt = WatchOnlyWallet.createTx();
      const psbtBase64 = woWallet.updateTx(
        emptyPsbt,
        utxos,
        amountToBeSent,
        amountToReceive,
        toBeSent,
        toReceive
      );

      const swap = new Swap();
      swapRequest = swap.request({
        psbtBase64,
        amountToBeSent,
        amountToReceive,
        assetToBeSent: toBeSent,
        assetToReceive: toReceive,
      });

      swapRequestFile = cmdObj.output
        ? PathModule.resolve(cmdObj.output)
        : PathModule.resolve(process.cwd(), 'swap_request.bin');

      return writeBinary(swapRequestFile, swapRequest);
    })
    .then(() => {
      success(`SwapRequest message saved into ${swapRequestFile}`);

      if (cmdObj.print) {
        const json = Swap.parse({
          message: swapRequest,
          type: 'SwapRequest',
        });
        log(`\nSwapRequest message\n\n${json}`);
      }
    })
    .catch(error);
}
