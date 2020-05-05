#!/usr/bin/env node

//  0. Load from WIF/Create keyPair
//  1. Select an endpoint and connect to the daemon
//  2. Select asset pair and Fetch his market rate
//  3. Start swap proposal
//  4. Parsing acceptance from the daemon & sign
//  5. Sending signed swap back to daemon.
import { program } from 'commander';

//Components
import {
  walletAction,
  infoAction,
  networkAction,
  marketAction,
  marketListAction,
  connectAction,
  marketPriceAction,
  walletBalanceAction,
  swapRequestAction,
  swapAcceptAction,
  swapCompleteAction,
  tradeAction,
} from './actions';
import {
  operatorConnectAction,
  operatorDepositAction,
} from './operatorActions';
import { NETWORKS } from './helpers';
//eslint-disable-next-line
const pkg = require('../package.json');

program.version(pkg.version);

program
  .command('info')
  .description('Get info about the current session')
  .action(infoAction);

/**
 * Network
 */
program
  .command('network <chain>')
  .option(
    '-e, --explorer <endpoint>',
    'Set a different electrum server endpoint for connecting to the blockchain'
  )
  .description(
    'Select the network. Available networks: ' + Object.keys(NETWORKS)
  )
  .action(networkAction);

/**
 * Connect
 */
program
  .command('connect <endpoint>')
  .description('Select the liquidity provider')
  .action(connectAction);

/**
 * Trade
 */
program
  .command('trade')
  .description('Make a trade proposal')
  .action(tradeAction);

/**
 * Market
 */

const market = program
  .command('market <pair>')
  .description('Select the asset pair to use for the swap')
  .action(marketAction);

market
  .command('list')
  .description('Get available assets pairs for current provider')
  .action(marketListAction);

market
  .command('price')
  .description('Get the current price for the selected market')
  .action(marketPriceAction);

/**
 * Wallet
 */

const wallet = program
  .command('wallet')
  .description('Create new key pair or restore from WIF')
  .action(walletAction);

wallet
  .command('balance')
  .description('Show current wallet balance')
  .action(walletBalanceAction);

/**
 * swap
 */
const swap = program.command('swap');

swap
  .command('request')
  .option('-p, --print', 'Print to stdout', false)
  .option(
    '-o, --output <file>',
    'Set a diffent path where to save the file (defaults to datadir)'
  )
  .description('Make a swap proposal')
  .action(swapRequestAction);

swap
  .command('accept <file>')
  .option('-p, --print', 'Print to stdout', false)
  .option(
    '-o, --output <file>',
    'Set a diffent path where to save the file. (defaults to the same folder of SwapRequest file)'
  )
  .description('Parse and accept a given SwapRequest message')
  .action(swapAcceptAction);

swap
  .command('complete <file>')
  .option('-p, --push', 'Extract hex string and broadcast to the chain')
  .option(
    '-o, --output <file>',
    'Set a diffent path where to save the file. (defaults to the same folder of SwapAccept file)'
  )
  .description('Parse and complete a given SwapAccept message')
  .action(swapCompleteAction);

/**
 * operator
 */
const operator = program
  .command('operator')
  .description('Interact with operator gRPC interface of the tdex-daemon');

operator
  .command('connect <endpoint>')
  .description('Select gRPC interface of the tdex-daemon')
  .action(operatorConnectAction);

operator
  .command('deposit')
  .option('-f, --fee', 'Get the fee account address')
  .description('Get the deposit address for creating a new market')
  .action(operatorDepositAction);

program.parse(process.argv);
