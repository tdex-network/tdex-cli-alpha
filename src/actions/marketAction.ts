import { info, log, error } from '../logger';

import State from '../state';
import { networks } from 'liquidjs-lib';
const state = new State();

export default function (pair: string): void {
  info('=========*** Market ***==========\n');

  const { provider, network } = state.get();

  if (!network.selected) return error('Select a valid network');

  if (!provider.selected)
    return error(
      'A provider is required. Select one with connect <endpoint> command'
    );

  if (!provider.pairs.includes(pair))
    return error('Pair not suppported by the selcted provider');

  const LBTC = (networks as any)[network.chain].assetHash;
  const tickers = (provider.markets as any)[pair];
  const hashes = Object.keys(tickers);
  const baseAsset = hashes.find((h) => h === LBTC);
  const quoteAsset = hashes.find((h) => h !== LBTC);
  const assets = { baseAsset, quoteAsset };
  state.set({ market: { selected: true, pair, tickers, assets } });

  log(`Current market: ${pair}`);
}
