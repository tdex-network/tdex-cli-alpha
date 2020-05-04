import { info, log, success, error } from '../logger';

import State from '../state';
import { TraderClient } from 'tdex-sdk';
import { tickersFromMarkets } from '../helpers';
const state = new State();

export default function (): void {
  info('=========*** Market ***==========\n');

  const { provider, market, network } = state.get();

  if (!network)
    return error(
      'A network is required. Select one with network <name> command'
    );

  if (!provider.selected)
    return error(
      'A provider is required. Select one with connect <endpoint> command'
    );

  const client = new TraderClient(provider.endpoint);
  client
    .markets()
    .then(async (markets) => {
      const marketsByTicker = await tickersFromMarkets(
        markets,
        network.explorer
      );
      const pairs = Object.keys(marketsByTicker);

      state.set({
        provider: {
          pairs,
          markets: marketsByTicker,
        },
      });
      pairs.forEach((p) =>
        p === market.pair ? success(`${p} (selected)`) : log(p)
      );
    })
    .catch(error);
}
