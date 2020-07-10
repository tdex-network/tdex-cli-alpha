import { fetchBalances } from 'tdex-sdk';
import { info, log, error, success } from '../logger';
import { fetchTicker } from '../helpers';
import State from '../state';
const state = new State();

export default function (): void {
  info('=========*** Wallet ***==========\n');

  const { wallet, network } = state.get();

  if (!wallet.selected)
    return error(
      'A wallet is required. Create or restore with the wallet command'
    );

  //Get balance with the explorer
  fetchBalances(wallet.address, network.explorer).then((balances) => {
    const entries = Object.entries(balances);

    if (entries.length === 0) return log('No transactions found.');

    const promises = entries.map(([asset, balance]) => {
      return fetchTicker(asset, network.chain, network.explorer)
        .then((response) => {
          const ticker = response || 'Unknown';
          success(`*** ${ticker} ***`);
          return;
        })
        .catch(() => {
          success(`*** Unknown ***`);
        })
        .finally(() => {
          log(`Balance ${balance} satoshis `);
          log(`Hash ${asset}`);
          log();
        });
    });
    Promise.all(promises);
  });
}
