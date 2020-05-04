import { TraderClient } from 'tdex-sdk';
// Helpers
import { info, log, error } from '../logger';
import { isValidUrl, tickersFromMarkets } from '../helpers';
// State
import State from '../state';
const state = new State();

export default function (endpoint: string): void {
  info('=========*** Provider ***==========\n');

  const { network } = state.get();

  if (!network)
    return error(
      'A network is required. Select one with network <name> command'
    );

  if (!isValidUrl(endpoint))
    return error('The provided endpoint URL is not valid');

  const client = new TraderClient(endpoint);
  client
    .markets()
    .then((markets) => tickersFromMarkets(markets, network.explorer))
    .then((marketsByTicker) => {
      const pairs = Object.keys(marketsByTicker);

      state.set({
        provider: {
          endpoint,
          pairs,
          markets: marketsByTicker,
          selected: true,
        },
      });

      return log(`Current provider endpoint: ${endpoint}`);
    })
    .catch(error);
}
