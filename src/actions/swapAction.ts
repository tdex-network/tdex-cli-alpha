import { info, log, error, success } from '../logger';
import { makeid } from '../helpers';
import State from '../state';
import Wallet, { fetchUtxos, WalletInterface, fromWIF } from '../wallet';
import { decrypt } from '../crypto';
const state = new State();

const { Toggle, NumberPrompt, Confirm, Password } = require('enquirer');

// 1. Fetch utxos 
// 2. CHeck if input amount is enough
// 3. AMOUNT_P of ASSET_P and receiving AMOUNT_R of ASSET_R
// 4. Send SwapRequest message and parse SwapAccept message 
// 5. Sign the final psbt
// 6. Send SwapComplete back

export default function (cmdObj: any) {
  info('=========*** Swap ***==========\n');


  const { wallet, provider, market, network } = state.get();

  if (!cmdObj.local && !provider.selected)
    return error('A provider is required. Select one with connect <endpoint> command');

  if (!market.selected)
    return error('A market is required. Select one with market <pair> command');

  if (!wallet.selected)
    return error('A wallet is required. Create or restore with wallet command');


  const [tickerA, tickerB] = Object.keys(market.assets);
  const toggle = new Toggle({
    message: 'Which asset do you want to send?',
    enabled: tickerA,
    disabled: tickerB
  });
  const amount = (message) => new NumberPrompt({
    name: 'number',
    message
  });
  const confirm = new Confirm({
    name: 'question',
    message: 'Are you sure continue?'
  });
  const password = new Password({
    type: 'password',
    name: 'key',
    message: 'Type your password'
  });

  let walletInstance: WalletInterface, 
    toBeSent: string,
    toReceive: string,
    amountToBeSent: number,
    amountToReceive: number;

  toggle.run().then((isTickerA: Boolean) => {
    if (isTickerA) {
      toBeSent = tickerA;
      toReceive = tickerB;
    } else {
      toBeSent = tickerB;
      toReceive = tickerA;
    }

    return amount(`How much do you want to send?`).run()
  }).then((inputAmount: number) => {
    amountToBeSent = inputAmount;

    const execute = cmdObj.local ?
      () => amount(`How much do you want to receive?`).run() :
      () => Promise.resolve()
    
    return execute()
  }).then((outputAmountOrNothing: number) => {
    // Fetch market rate from daemon and calulcate prices for each ticker
    // client.Balances().then( balances => {})
    const OneOfTickerB = 6000;
    const OneOfTickerA = 0.000167;
    let amountToReceiveFromProvider = amountToBeSent * (toBeSent === 'LBTC' ? OneOfTickerB : OneOfTickerA);
    amountToReceiveFromProvider = Number(
      amountToReceiveFromProvider
        .toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 8 })
        .replace(',','')
    );
    amountToReceive = cmdObj.local ? outputAmountOrNothing : amountToReceiveFromProvider;
    
    log(`Gotcha! You will send ${toBeSent} ${amountToBeSent} and receive ${toReceive} ${amountToReceive}`);

    return confirm.run()
  }).then((keepGoing: Boolean) => {
    if (!keepGoing)
      throw 'Canceled';
  
    const execute = wallet.keystore.type === "encrypted" ? 
      () => password.run() : 
      () => Promise.resolve(wallet.keystore.value);   

    return execute()
  }).then((passwordOrWif: string) => {

    const wif = wallet.keystore.type === "encrypted" ? 
      decrypt(wallet.keystore.value, passwordOrWif) : 
      passwordOrWif;

    walletInstance  = fromWIF(wif, network.chain);

    return fetchUtxos(walletInstance.address, network.explorer)
  }).then((utxos: Array<any>) => {
    // Clean up numbers from fractional to satoshis
    amountToBeSent = Math.floor(amountToBeSent * Math.pow(10,8));
    amountToReceive = Math.floor(amountToReceive * Math.pow(10,8));

    return walletInstance.createTx(
      utxos,
      amountToBeSent,
      amountToReceive,
      (market.assets as any)[toBeSent],
      (market.assets as any)[toReceive]
    )
  }).then((unsignedPsbt: string) => {

    // Wait for the stream with either the SwapAccet or SwapFail message
    // We are going to send somethin like 
    const TradeRequest = {
      SwapRequest: {
        id: makeid(8),
        amount_p: amountToBeSent,
        asset_p: (market.assets as any)[toBeSent],
        amount_r: amountToReceive,
        asset_r: (market.assets as any)[toReceive],
        transaction: unsignedPsbt
      }
    }

    if (cmdObj.verbose)
      info(JSON.stringify(TradeRequest, undefined, 2));

    if (cmdObj.local) 
      return success(`\nSwapRequest message\n\n${JSON.stringify(TradeRequest.SwapRequest)}`);

    log(`\nSending SwapRequest to provider...\n`)
    // client.Trade().then( stream => { })
    setTimeout(() => {
      success("Swap has been accepted!\n");
      log("Signing with private key...");
      log("Sending SwapComplete to provider...\n");
    }, 800);

    // Send back the signed transaction
    // client.TradeComplete().then( txHahs => )
    setTimeout(() => success("Swap completed!\n"), 1600);

  }).catch(error);


}