import { info, log, error } from '../logger';
//Helpers
import { isValidUrl } from '../helpers';

import State from '../state';
import { networks } from 'liquidjs-lib';
const state = new State();

export default function (endpoint: string): void {
  info('=========*** Provider ***==========\n');

  if (!isValidUrl(endpoint))
    return error('The provided endpoint URL is not valid');

  // TODO: Connect to provided endpoint and fetch the available pairs
  // client.Markets().then()
  const markets = {
    "LBTC-USDT": {
      "LBTC": "5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225",
      "USDT": "b66f2b61a8140ba67265c25f6a5d5c836e9c789ee7a172c1408eea37d9d17ab0"
    },
    "LBTC-EQUI": {
      "LBTC": "5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225",
      "EQUI": "1fd91e7be0f4cefd52853c33475d2947cf5173d5add03de8aa369352852a2b9c"
    }
  };

  const pairs = Object.keys(markets)

  state.set({
    provider: {
      endpoint,
      pairs,
      markets,
      selected: true
    }
  });

  return log(`Current provider endpoint: ${endpoint}`)
}