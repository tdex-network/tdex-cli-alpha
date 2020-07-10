import { info, log } from '../logger';

import State from '../state';
const state = new State();

export default function () {
  info('=========*** Info ***==========\n');

  const { market, provider, network, wallet, operator } = state.get();

  if (network.selected) log(`Network: ${network.chain}`);

  if (provider.selected) log(`Provider endpoint: ${provider.endpoint}`);

  if (market.selected) log(`Market: ${market.pair}`);

  if (wallet.selected) log(`Wallet address: ${wallet.address}`);

  if (operator.selected) log(`Operator endpoint: ${operator.endpoint}`)
}
