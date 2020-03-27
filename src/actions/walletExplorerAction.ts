import { info, log, error } from '../logger';
import State from '../state';
import { isValidUrl } from '../helpers';
const state = new State();


export default function(endpoint:string):void {
  info('=========*** Wallet ***==========\n');
  //Set new endpoint for the explorer
  const { network } = state.get();
  
  if (!network.selected)
    return error("Select a valid network");

  if (!isValidUrl(endpoint))
    return error('The provided endpoint URL is not valid');

  state.set({ wallet: { explorer: endpoint }})

  return log(`Current explorer endpoint: ${endpoint}`)

}