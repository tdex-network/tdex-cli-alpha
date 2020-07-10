import { info, log } from '../logger';

import State from '../state';
const state = new State();

export default function (): void {
  info('=========*** Info ***==========\n');

  const { market, provider, network, wallet, operator } = state.get();

  const infos: Array<string> = [];
  if (network.selected)
    infos.push(`Network: ${network.chain}\nExplorer: ${network.explorer}`);

  if (provider.selected) infos.push(`Provider endpoint: ${provider.endpoint}`);

  if (market.selected) infos.push(`Market: ${market.pair}`);

  if (wallet.selected) infos.push(`Wallet address: ${wallet.address}`);

  if (operator.selected) infos.push(`Operator endpoint: ${operator.endpoint}`);

  if (infos.length === 0)
    return log(`State is empty. Start configuring the CLI`);

  infos.forEach((info: string) => log(info));
}
