import { info, log } from '../logger';

import State from '../state';
const state = new State();

export default function() {
  info('=========*** Info ***==========\n')

  const { market, provider, network } = state.get();

  if (network.selected)
    log(`Network: ${network.chain}`)

  if (provider.selected)
    log(`Endpoint: ${provider.endpoint}`);

  if (market.selected)
    log(`Market: ${market.pair}`);
}