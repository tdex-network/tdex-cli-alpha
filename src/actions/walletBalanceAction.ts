import { info, log } from '../logger';
import State from '../state';
const state = new State();


export default function():void {
  info('=========*** Wallet ***==========\n');

  const { wallet } = state.get();

  if (!wallet.selected)
    return error('A wallet is required. Create or restoste with the wallet command');

  //Get balance with the explorer

}