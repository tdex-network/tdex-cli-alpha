#!/usr/bin/env node
"use strict";
//  0. Load from WIF/Create keyPair
//  1. Select an endpoint and connect to the daemon
//  2. Select asset pair and Fetch his market rate 
//  3. Start swap proposal 
//  4. Parsing acceptance from the daemon & sign
//  5. Sending signed swap back to daemon. 
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const commander_1 = require("commander");
//Components
const walletAction_1 = __importDefault(require("./actions/walletAction"));
const logger_1 = require("./logger");
const state_1 = __importDefault(require("./state"));
//Helpers
const helpers_1 = require("./helpers");
const pkg = require('../package.json');
const state = new state_1.default({ path: path.resolve(__dirname, "../state.json") });
const NETWORKS = ['liquid', 'regtest'];
commander_1.program
    .version(pkg.version);
commander_1.program
    .command('info')
    .description('Get info about the current session')
    .action(() => {
    logger_1.info('=========*** Info ***==========\n');
    const { market, provider, network } = state.get();
    if (network.selected)
        logger_1.log(`Network: ${network.chain}`);
    if (provider.selected)
        logger_1.log(`Endpoint: ${provider.endpoint}`);
    if (market.selected)
        logger_1.log(`Market: ${market.pair}`);
});
/**
 * Network
 */
commander_1.program
    .command('network <chain>')
    .description('Select the network. Avialable chains: ' + NETWORKS)
    .action((chain) => {
    if (!NETWORKS.includes(chain))
        return logger_1.error('Invalid network');
    state.set({ network: { selected: true, chain } });
    return logger_1.log(`Current network: ${chain}`);
});
/**
 * Connect
 */
commander_1.program
    .command('connect <endpoint>')
    .description('Select the liquidity provider')
    .action((endpoint) => {
    logger_1.info('=========*** Provider ***==========\n');
    if (!helpers_1.isValidUrl(endpoint))
        return logger_1.error('The provided endpoint URL is not valid');
    // TODO: Connect to provided endpoint and fetch the available pairs along with his pubkey
    const pairs = ['LBTC-USDT', 'LBTC-EQUI'];
    state.set({ provider: { endpoint, pairs, selected: true } });
    return logger_1.log(`Current provider endpoint: ${endpoint}`);
});
/**
 * Market
 */
const market = commander_1.program
    .command('market <pair>')
    .description('Select the asset pair to use for the swap')
    .action((pair) => {
    logger_1.info('=========*** Market ***==========\n');
    const { provider, market } = state.get();
    if (!provider.selected)
        return logger_1.error('A provider is required. Select with connect <endpoint> command');
    /*    if (cmdObj.list)
         return provider.pairs.forEach(p => log(p))
    */
    /*    if (!pair)
         return error('An asset pair is required. Get all the avilable ones with the --list option');
    */
    if (!provider.pairs.includes(pair))
        return logger_1.error('Pair not suppported by the selcted provider');
    state.set({ market: { selected: true, pair } });
    //TODO: Fetch the price from the daemon
    logger_1.log(`Current market: ${pair}`);
});
market
    .command('list')
    .description('Get available assets pairs for current provider')
    .action(() => {
    logger_1.info('=========*** Market ***==========\n');
    const { provider, market } = state.get();
    provider.pairs.forEach(p => p === market.pair ? logger_1.success(`${p} (selected)`) : logger_1.log(p));
});
market
    .command('price')
    .description('Get the current price for the selected market')
    .action(() => {
    logger_1.info('=========*** Market ***==========\n');
    const { market } = state.get();
    logger_1.log(`Current market: ${market.pair}`);
    logger_1.log(`Price: 1 asset_a is equal to X asset_b at timestamp`);
});
/**
 * Wallet
 */
commander_1.program
    .command('wallet')
    .description('Create new key pair or restore from WIF')
    .action(walletAction_1.default);
/**
 * swap
 */
commander_1.program
    .command('swap <amount> <asset>')
    .description('Make a swap proposal of <amount> <asset>')
    .action(() => {
});
commander_1.program.parse(process.argv);
