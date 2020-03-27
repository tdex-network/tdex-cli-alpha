import axios from 'axios';

import { info, log, error, success } from '../logger';
import State from '../state';
import { networks } from 'liquidjs-lib';
const state = new State();


export default function (): void {
  info('=========*** Wallet ***==========\n');

  const { wallet, network } = state.get();

  if (!network.selected)
    return error("Select a valid network");

  if (!wallet.selected)
    return error('A wallet is required. Create or restoste with the wallet command');

  //Get balance with the explorer
  fetchBalances(wallet.address, network.explorer)
    .then(balances => {
      const entries = Object.entries(balances);
      
      if (entries.length === 0)
        return log('No transactions found.');

      entries.forEach(([asset, balance]) => {
        let title = "Unknown"
        if (asset === (networks as any)[network.chain].assetHash)
          title = "Liquid Bitcoin";

        success(`*** ${title} ***`)
        log(`Balance ${balance}`)
        log(`Hash ${asset}`)
        log()
      })
    })

}

async function fetchBalances(address: string, url: string) {
  const utxos = (await axios.get(`${url}/address/${address}/utxo`)).data;
  return utxos.reduce((storage: { [x: string]: any; }, item: { [x: string]: any; value: any; }) => {
    // get the first instance of the key by which we're grouping
    var group = item["asset"];

    // set `storage` for this instance of group to the outer scope (if not empty) or initialize it
    storage[group] = storage[group] || 0;

    // add this item to its group within `storage`
    storage[group] += (item.value);

    // return the updated storage to the reduce function, which will then loop through the next 
    return storage;
  }, {}); // {} is the initial value of the storage
}




