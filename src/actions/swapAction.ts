import { Swap, WatchOnlyWallet, fetchUtxos, networks } from 'tdex-sdk';
import { info, log, error, success } from '../logger';

import State from '../state';
import { fromSatoshi, toSatoshi } from '../helpers';

const state = new State();
//eslint-disable-next-line
const { Toggle, NumberPrompt, Confirm } = require('enquirer');

// 1. Fetch utxos
// 2. CHeck if input amount is enough
// 3. AMOUNT_P of ASSET_P and receiving AMOUNT_R of ASSET_R
// 4. Send SwapRequest message and parse SwapAccept message
// 5. Sign the final psbt
// 6. Send SwapComplete back

export default function (): void {
  info('=========*** Swap ***==========\n');

  const { wallet, market, network } = state.get();

  if (!network.selected) return error('Select a valid network first');

  if (!market.selected)
    return error('A market is required. Select one with market <pair> command');

  if (!wallet.selected)
    return error('A wallet is required. Create or restore with wallet command');

  const toggle = new Toggle({
    message: `Do you want to buy or sell ${
      market.tickers[market.assets.baseAsset]
    }?`,
    enabled: 'BUY',
    disabled: 'SELL',
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
    amountToReceive: number;

  toggle
    .run()
    .then((isBuyType: boolean) => {
      const { baseAsset, quoteAsset } = market.assets;
      if (isBuyType) {
        toBeSent = quoteAsset;
        toReceive = baseAsset;
      } else {
        toBeSent = baseAsset;
        toReceive = quoteAsset;
      }

      if (isBuyType) {
        throw new Error('Buy type not supported yet');
      }

      return amount(`How much do you want to send?`).run();
    })
    .then((inputAmount: number) => {
      amountToBeSent = inputAmount;
      return amount(`How much do you want to receive?`).run();
    })
    .then((outputAmount: number) => {
      amountToReceive = toSatoshi(outputAmount);
      return Promise.resolve();
    })
    .then(() => {
      log(
        `Gotcha! You will send ${
          market.tickers[toBeSent]
        } ${amountToBeSent} and receive ${
          market.tickers[toReceive]
        } ${fromSatoshi(amountToReceive)}`
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
        toSatoshi(amountToBeSent),
        amountToReceive,
        toBeSent,
        toReceive
      );

      const swap = new Swap();
      const swapRequest = swap.request({
        assetToBeSent: toBeSent,
        amountToBeSent: toSatoshi(amountToBeSent),
        assetToReceive: toReceive,
        amountToReceive: amountToReceive,
        psbtBase64,
      });

      const json = Swap.parse({
        message: swapRequest,
        type: 'SwapRequest',
      });
      return success(`\nSwapRequest message\n\n${json}`);
    })
    .catch(error);
}
