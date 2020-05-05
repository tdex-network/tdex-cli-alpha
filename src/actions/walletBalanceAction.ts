import { info, log, error, success } from '../logger';
import State from '../state';
import { networks, fetchBalances } from 'tdex-sdk';
const state = new State();

export default function (): void {
  info('=========*** Wallet ***==========\n');

  const { wallet, network, market } = state.get();

  if (!wallet.selected)
    return error(
      'A wallet is required. Create or restoste with the wallet command'
    );

  //Get balance with the explorer
  fetchBalances(wallet.address, network.explorer).then((balances) => {
    const entries = Object.entries(balances);

    if (entries.length === 0) return log('No transactions found.');

    entries.forEach(([asset, balance]) => {
      let title = market.tickers[asset] || 'Unknown';
      if (asset === (networks as any)[network.chain].assetHash) title = 'LBTC';

      success(`*** ${title} ***`);
      log(`Balance ${balance}`);
      log(`Hash ${asset}`);
      log();
    });
  });
}
