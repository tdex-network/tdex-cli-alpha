import { TraderClient } from 'tdex-sdk';
// Helpers
import { info, log, error } from '../logger';
import { isValidUrl, tickersFromMarkets } from '../helpers';
// State
import State from '../state';
const state = new State();

export default function (endpoint: string): void {
  info('=========*** Provider ***==========\n');

  if (!isValidUrl(endpoint))
    return error('The provided endpoint URL is not valid');

  const client = new TraderClient(endpoint);
  client
    .markets()
    .then((markets) => {
      const marketsByTicker = tickersFromMarkets(markets);
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
