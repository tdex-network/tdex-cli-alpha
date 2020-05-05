import { Trade, TradeType } from 'tdex-sdk';
import { info, log, error, success } from '../logger';

import State from '../state';
import { decrypt } from '../crypto';
import { fromSatoshi, toSatoshi } from '../helpers';

const state = new State();
//eslint-disable-next-line
const { Toggle, NumberPrompt, Confirm, Password } = require('enquirer');

// 1. Fetch utxos
// 2. CHeck if input amount is enough
// 3. AMOUNT_P of ASSET_P and receiving AMOUNT_R of ASSET_R
// 4. Send SwapRequest message and parse SwapAccept message
// 5. Sign the final psbt
// 6. Send SwapComplete back

export default function () {
  info('=========*** Trade ***==========\n');

  const { wallet, provider, market, network } = state.get();

  if (!network.selected) return error('Select a valid network first');

  if (!provider.selected)
    return error(
      'A provider is required. Select one with connect <endpoint> command'
    );

  if (!market.selected)
    return error('A market is required. Select one with market <pair> command');

  if (!wallet.selected)
    return error('A wallet is required. Create or restore with wallet command');

  const init = {
    chain: network.chain,
    providerUrl: provider.endpoint,
    explorerUrl: network.explorer,
  };
  const trade = new Trade(init);

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
  const password = new Password({
    type: 'password',
    name: 'key',
    message: 'Type your password',
  });

  let toBeSent: string,
    toReceive: string,
    amountToBeSent: number,
    amountToReceive: number,
    previewInSatoshis: any;

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
      return Promise.resolve();
    })
    .then(() => {
      // Fetch market rate from daemon and calulcate prices for each ticker
      const isBuyType = market.assets.baseAsset.includes(toReceive);
      const tradeType = isBuyType ? TradeType.BUY : TradeType.SELL;

      return trade.preview(market.assets, tradeType, toSatoshi(amountToBeSent));
    })
    .then((preview: any) => {
      previewInSatoshis = preview;
      amountToReceive = preview.amountToReceive;

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

      log(`\nSending Trade proposal to provider...`);
      log('Signing with private key...');

      const params = {
        market: market.assets,
        amount: previewInSatoshis.amountToBeSent,
        privateKey: wif,
      };

      return trade.sell(params);
    })
    .then((txid: string) => {
      success('Trade completed!\n');
      info(`tx hash ${txid}`);
    })
    .catch(error);
}