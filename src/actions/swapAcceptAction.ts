import { info, log, error, success } from '../logger';
import State from '../state';
const state = new State();

const { Confirm } = require('enquirer');

const confirm = new Confirm({
  name: 'question',
  message: 'Do you accept the proposed terms?'
});


export default function (message): void {
  info('=========*** Swap ***==========\n');

  const { wallet } = state.get();

  if (!wallet.selected)
    return error('A wallet is required. Create or restoste with wallet command');

  let json
  try {
    json = JSON.parse(message);
  } catch (ignore) {
    return error('Not a valid SwapRequest message');
  }

  log(JSON.stringify(json, undefined, 2));
  log();



  confirm.run().then((keepGoing: Boolean) => {
    if (!keepGoing)
      throw "Canceled";
    // Add inputs and putputs to psbt 
    // Sign inputs
    setTimeout(() => {
      log("\nSigning with private key...");
    }, 800);

    // Send back the signed transaction
    // client.TradeComplete().then( txHahs => )
    setTimeout(() => success("\n√ Done\n"), 800);
  }).catch(error)
}