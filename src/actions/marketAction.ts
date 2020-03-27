import { info, log, error } from '../logger';

import State from '../state';
const state = new State();


export default function(pair:string):void {
  info('=========*** Market ***==========\n');

  const { provider } = state.get();
  if (!provider.selected)
    return error('A provider is required. Select one with connect <endpoint> command');

  if (!provider.pairs.includes(pair))
    return error('Pair not suppported by the selcted provider');

  state.set({ market: { selected: true, pair } });

  log(`Current market: ${pair}`);
}