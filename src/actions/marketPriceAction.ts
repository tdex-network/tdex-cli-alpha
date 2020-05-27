import { TraderClient } from 'tdex-sdk';
import { info, log, error, success } from '../logger';

import State from '../state';
const state = new State();

export default function (): void {
  info('=========*** Market ***==========\n');

  const { market, provider } = state.get();

  if (!provider.selected)
    return error(
      'A provider is required. Select one with connect <endpoint> command'
    );

  if (!market.selected)
    return error('A market is required. Select one with market <pair> command');

  log(`Current market: ${market.pair}\n`);

  // client.Balances(market.pair).then()
  const client = new TraderClient(provider.endpoint);
  const { baseAsset, quoteAsset } = market.assets;
  client
    .balances({
      baseAsset,
      quoteAsset,
    })
    .then((balancesAndFee: any) => {
      const { balances, fee } = balancesAndFee;
      info(`Liquidity provider fee : ${fee}%\n`);
      const [
        [firstAsset, firstBalance],
        [secondAsset, secondBalance],
      ] = Object.entries(balances);

      const price: string = (
        (secondBalance as number) / (firstBalance as number)
      ).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8,
      });
      success(
        `1 ${market.tickers[firstAsset]} is equal to ${price} ${market.tickers[secondAsset]}`
      );
    })
    .catch(error);
}
