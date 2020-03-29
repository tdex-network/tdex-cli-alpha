// @ts-nocheck
// baseline estimates, used to improve performance
const TX_VERSION = 4
const TX_LOCKTIME = 4
const TX_IN_COUNT = 1
const TX_OUT_COUNT = 1
const TX_FLAG = 1
const TX_EMPTY_SIZE = TX_VERSION + TX_LOCKTIME + TX_IN_COUNT + TX_OUT_COUNT + TX_FLAG

const TX_PREV_OUT_HASH = 32
const TX_PREV_OUT_INDEX = 4
const TX_INPUT_SEQUENCE = 4
const TX_INPUT_SCRIPT_LENGHT = 1  
const TX_INPUT_BASE = TX_PREV_OUT_HASH + TX_PREV_OUT_INDEX + TX_INPUT_SCRIPT_LENGHT + TX_INPUT_SEQUENCE
const TX_INPUT_SCRIPT = 107

const TX_OUTPUT_ASSET = 32 + 1
const TX_OUTPUT_NONCE = 1
const TX_OUTPUT_VALUE = 8 + 1
const TX_OUTPUT_BASE = TX_OUTPUT_VALUE + TX_OUTPUT_ASSET + TX_OUTPUT_NONCE 
const TX_OUTPUT_SCRIPT = 24


function transactionBytes (vin, vout) {
  return TX_EMPTY_SIZE + 
    (vin * (TX_INPUT_BASE + TX_INPUT_SCRIPT)) + 
    (vout * (TX_OUTPUT_BASE + TX_OUTPUT_SCRIPT))  
};



function calculateFees(vin, vout, opts = {}) {
  const satPerByte = opts.satPerByte ? opts.satPerByte : 1;
  const rate = opts.rate ? opts.rate : 10;

  const size = transactionBytes(vin, vout);
  const fees = parseInt(size * satPerByte);

  const spread = parseInt(fees / 100 * rate);
  const total = parseInt(fees + spread);
  
  return {
    size,
    satPerByte,
    fees,
    spread,
    rate,
    total
  }
};


function naiveCoinSelection(utxos, amount) {
  let unspents = [];
  let availableSat = 0;
  let change = 0;


  for (let i = 0; i < utxos.length; i++) {
    const utxo = utxos[i]
    unspents.push({ txid: utxo.txid, vout: utxo.vout, value: utxo.value, asset: utxo.asset })
    availableSat += utxo.value

    if (availableSat >= amount)
      break;
  };

  if (availableSat < amount)
    throw "You do not have enough in your wallet";

  change = availableSat - amount;

  return { unspents, change } 
};

  /* const changeWithoutFees = availableSat - amount;


  //let fee = getTxSize(unspents.length, changeWithoutFees > 0 ? 2 : 1) * feePerByte;


  if (amount < fee)
    throw "Satoshis amount must be larger than the fee";

  if (fee < MAGIC_MIN_RELAY_FEE)
    fee = MAGIC_MIN_RELAY_FEE;

  const change = changeWithoutFees - fee;

  if (change < 0)
    throw "You do not have enough in your wallet to pay for fees";


  return { unspents, change, fee }
 */

export default naiveCoinSelection;
