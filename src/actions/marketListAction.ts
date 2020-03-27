import { info, log, success, error } from '../logger';

import State from '../state';
const state = new State();

export default function():void {
  info('=========*** Market ***==========\n');

  const { provider, market } = state.get();

  if (!provider.selected)
    return error('A provider is required. Select one with connect <endpoint> command');

  provider.pairs.forEach(p => p === market.pair ? success(`${p} (selected)`) : log(p))
}