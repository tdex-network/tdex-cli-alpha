import * as PathModule from 'path';
import { Swap, WatchOnlyWallet, fetchUtxos, networks } from 'tdex-sdk';

import { info, log, error, success } from '../logger';
import State from '../state';
import { fromSatoshi, toSatoshi, writeBinary, fileExists } from '../helpers';
//eslint-disable-next-line
const { Toggle, NumberPrompt, Confirm } = require('enquirer');

const state = new State();

export default function (cmdObj: any): void {
  info('=========*** Swap ***==========\n');

  const { wallet, market, network } = state.get();

  if (
    cmdObj.output &&
    (!cmdObj.output.endsWith('.bin') ||
      !fileExists(PathModule.dirname(PathModule.resolve(cmdObj.output))))
  )
    return error('Output path id not valid');

  if (!network.selected) return error('Select a valid network first');

  if (!market.selected)
    return error('A market is required. Select one with market <pair> command');

  if (!wallet.selected)
    return error('A wallet is required. Create or restore with wallet command');

  const baseAssetTicker = market.tickers[market.assets.baseAsset];
  const quoteAssetTicker = market.tickers[market.assets.quoteAsset];
  const toggle = new Toggle({
    message: `Which asset do you want to send?`,
    enabled: baseAssetTicker,
    disabled: quoteAssetTicker,
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

  let toBeSent: string,
    toReceive: string,
    amountToBeSent: number,
    amountToReceive: number,
    swapRequest: any,
    swapRequestFile: string;

  toggle
    .run()
    .then((isBaseAssetTicker: boolean) => {
      const { baseAsset, quoteAsset } = market.assets;
      if (!isBaseAssetTicker) {
        toBeSent = quoteAsset;
        toReceive = baseAsset;
      } else {
        toBeSent = baseAsset;
        toReceive = quoteAsset;
      }

      return amount(`How much do you want to send?`).run();
    })
    .then((inputAmount: number) => {
      amountToBeSent = toSatoshi(inputAmount);
      return amount(`How much do you want to receive?`).run();
    })
    .then((outputAmount: number) => {
      amountToReceive = toSatoshi(outputAmount);
      log(
        `Gotcha! You will send ${market.tickers[toBeSent]} ${fromSatoshi(
          amountToBeSent
        )} and receive ${market.tickers[toReceive]} ${fromSatoshi(
          amountToReceive
        )}`
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
