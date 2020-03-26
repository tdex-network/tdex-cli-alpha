#!/usr/bin/env node

//  0. Load from WIF/Create keyPair
//  1. Select an endpoint and connect to the daemon
//  2. Select asset pair and Fetch his market rate 
//  3. Start swap proposal 
//  4. Parsing acceptance from the daemon & sign
//  5. Sending signed swap back to daemon. 

import * as path from 'path';
import { program } from 'commander';

//Components
import Wallet, { fromWIF } from './wallet';
import { log, error, info, success } from './logger';
import State from './state';
//Helpers
import { isValidUrl } from './helpers';

const pkg = require('../package.json');
const state = new State({ path: path.resolve(__dirname, "../state.json") })
//Loggers

//const w = fromWIF("cNiZ5A2UgR11Kw79QsgqeziPJLXVnftGVBmeHZag53RcvDod5SsW", "regtest");
//console.log(w.address)

program
  .version(pkg.version)

program
  .command('info')
  .description('Get info about the current session')
  .action(() => {
    info('=========*** Info ***==========\n')

    const { market, provider } = state.get();

    if (provider.selected)
      log(`Endpoint: ${provider.endpoint}`);

    if (market.selected)
      log(`Market: ${market.pair}`);


  })
/**
 * Connect
 */
program
  .command('connect <endpoint>')
  .description('Select the default liquidity provider')
  .action((endpoint) => {
    info('=========*** Provider ***==========\n')

    if (!isValidUrl(endpoint))
      return error('The provided endpoint URL is not valid');

    // TODO: Connect to provided endpoint and fetch the available pairs along with his pubkey
    const pairs = ['LBTC-USDT', 'LBTC-EQUI'];
    state.set({ provider: { endpoint, pairs, selected: true } });

    return log(`Current provider endpoint: ${endpoint}`)
  });

/**
 * Market
 */

const market = program
  .command('market <pair>')
  .description('Select the default asset pair to use for the swap')
  .action((pair) => {
    info('=========*** Market ***==========\n');

    const { provider, market } = state.get();
    if (!provider.selected)
      return error('A provider is required. Select with connect <endpoint> command');

    /*    if (cmdObj.list)
         return provider.pairs.forEach(p => log(p))
    */
    /*    if (!pair)
         return error('An asset pair is required. Get all the avilable ones with the --list option');
    */
    if (!provider.pairs.includes(pair))
      return error('Pair not suppported by the selcted provider');

    if (!market.selected && market.pair !== pair)
      state.set({ market: { selected: true, pair } });

    //TODO: Fetch the price from the daemon
    log(`Selected market: ${pair}`);
  });

market
  .command('list')
  .description('Get available assets pairs for current provider')
  .action(() => {
    info('=========*** Market ***==========\n');

    const { provider } = state.get();
    provider.pairs.forEach(p => log(p))
  })

market
  .command('price')
  .description('Get the current price for the selected market')
  .action(() => {
    info('=========*** Market ***==========\n');

    const { market } = state.get();

    log(`Current market: ${market.pair}`);
    log(`Price: 1 asset_a is equal to X asset_b at timestamp`);
  })

/**
 * Wallet
 */

program
  .command('wallet [wif]')
  .description('Create new key pair or import from WIF')
  .action((wif) => {
    info('=========*** Wallet ***==========');


  });

/**
 * swap
 */
program
  .command('swap <amount> <asset>')
  .description('Make a swap proposal of <amount> <asset>')
  .action(() => {

  });




program.parse(process.argv);