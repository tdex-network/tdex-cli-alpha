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
      "USDT": "6554256e750fd6a4d4fd0e0ac1ad960ea8c4d774c9d7918ef84d1eb6db78ae72"
    },
    "LBTC-EQUI": {
      "LBTC": "5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225",
      "EQUI": "88d6951f3103ec292bf91d1d8ad14bf62e22f31c0f00221f7371440e4f9016bf"
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