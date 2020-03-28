import { info, log, error } from '../logger';

import State from '../state';
const state = new State();

export default function():void {
  info('=========*** Market ***==========\n');

  const { market, provider } = state.get();

  if (!provider.selected)
    return error('A provider is required. Select one with connect <endpoint> command');

  if (!market.selected)
    return error('A market is required. Select one with market <pair> command');

  log(`Current market: ${market.pair}`);

  // client.Balances(market.pair).then() 
  // It should return the provider's balance for each ticker in the pair. 
  // Would be convenient to have the market rate pre-calculated. 
  log(`Price: 1 asset_a is equal to X asset_b at timestamp`);
}