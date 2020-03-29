import { info, log, error, success } from '../logger';
import State from '../state';
import { WalletInterface, fromWIF } from '../wallet';
import { decrypt } from '../crypto';
import { makeid } from '../helpers';
const state = new State();

const { Confirm, Password } = require('enquirer');

const confirm = new Confirm({
  name: 'question',
  message: 'Are you sure to confirm?'
});
const password = new Password({
  type: 'password',
  name: 'key',
  message: 'Type your password'
});


export default function (message: string, cmdObj:any): void {
  info('=========*** Swap ***==========\n');

  const { wallet, network } = state.get();

  if (!wallet.selected)
    return error('A wallet is required. Create or restoste with wallet command');

  let json: any
  try {
    json = JSON.parse(message);
  } catch (ignore) {
    return error('Not a valid SwapAccept message');
  }

  const psbtBase64 = json.transaction;
  let walletInstance: WalletInterface;

  confirm.run().then((keepGoing: Boolean) => {
    if (!keepGoing)
      throw "Canceled";

    const execute = wallet.keystore.type === "encrypted" ?
      () => password.run() :
      () => Promise.resolve(wallet.keystore.value);

    return execute()
  }).then((passwordOrWif: string) => {
    const wif = wallet.keystore.type === "encrypted" ?
      decrypt(wallet.keystore.value, passwordOrWif) :
      passwordOrWif;

    walletInstance = fromWIF(wif, network.chain);

    log("\nSigning with private key...");
    return walletInstance.sign(psbtBase64);
  }).then((signedPsbt: string) => {
    success("\n√ Done\n");

    const TradeCompleteRequest = {
      SwapComplete: {
        id: makeid(8),
        accept_id: json.id,
        transaction: signedPsbt
      }
    };

    success(`\nSwapComplete message\n\n${JSON.stringify(TradeCompleteRequest.SwapComplete)}`);
    if (cmdObj.push)
      log(walletInstance.toHex(signedPsbt));
  }).catch(error)
}