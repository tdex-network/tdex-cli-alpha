import { info, log, error, success } from '../logger';

import State from '../state';
import { fetchBalances } from '../wallet';
const state = new State();

const { Toggle, NumberPrompt, Confirm } = require('enquirer');


// 1. Fetch utxos 
// 2. CHeck if input amount is enough
// 3. AMOUNT_P of ASSET_P and receiving AMOUNT_R of ASSET_R
// 4. Send SwapRequest message and parse SwapAccept message 
// 5. Sign the final psbt
// 6. Send SwapComplete back

export default function () {
  info('=========*** Swap ***==========\n');


  const { wallet, provider, market, network } = state.get();

  if (!provider.selected)
    return error('A provider is required. Select one with connect <endpoint> command');

  if (!market.selected)
    return error('A market is required. Select one with market <pair> command');

  if (!wallet.selected)
    return error('A wallet is required. Create or restoste with wallet command');
 

  const [tickerA, tickerB] = Object.keys(market.assets);
  const toggle = new Toggle({
    message: 'Which asset do you want to send?',
    enabled: tickerA,
    disabled: tickerB
  });
  const amount = new NumberPrompt({
    name: 'number',
    message: `How much do you want to send?`
  });
  const confirm = new Confirm({
    name: 'question',
    message: 'Are you sure continue?'
  });


  
  let toBeSent:string, toReceive:string
  toggle.run().then((isTickerA:Boolean) => {
    if (isTickerA) {
      toBeSent = tickerA;
      toReceive = tickerB;
    } else {
      toBeSent = tickerB;
      toReceive = tickerA;
    }

    return amount.run();
  }).then((amountToBeSent: number) => {

    const amountToReceive = amountToBeSent * (toBeSent === 'LBTC' ? 6000 : 0.000167);
    log(`Gotcha! You will send ${toBeSent} ${amountToBeSent} and receive circa ${toReceive} ${amountToReceive} based on current market rate`);

    return confirm.run()
  }).then((keepGoing: Boolean) => {
    if (!keepGoing)
      return log('Terminated');
    
    success(`\nSending Swap Proposal to provider...\n`)
    setTimeout(() => success("Swap succesful!"), 800);
    //DO the magic and swap all the things
  }).catch(error);


}