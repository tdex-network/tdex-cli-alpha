import { info, log, error } from '../logger';
//Helpers
import { isValidUrl } from '../helpers';

import State from '../state';
const state = new State();

export default function(endpoint:string):void {
  info('=========*** Provider ***==========\n')

  if (!isValidUrl(endpoint))
    return error('The provided endpoint URL is not valid');

  // TODO: Connect to provided endpoint and fetch the available pairs along with his pubkey
  const pairs = ['LBTC-USDT', 'LBTC-EQUI'];
  state.set({ provider: { endpoint, pairs, selected: true } });

  return log(`Current provider endpoint: ${endpoint}`)
}