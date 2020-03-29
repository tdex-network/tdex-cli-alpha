import axios from 'axios';
import { ECPair, networks, payments, Psbt, confidential } from 'liquidjs-lib';
//Libs
import coinselect from './coinselect'; 
//Types
import { ECPairInterface } from 'liquidjs-lib/types/ecpair';
import { Network } from 'liquidjs-lib/types/networks';

export interface WalletInterface {
  keyPair: ECPairInterface;
  privateKey: string;
  publicKey: string;
  address: string;
  script: string;
  network: Network;
  createTx(inputs: Array<any>, inputAmount:number, outputAmount: number, inputAsset:string, outputAsset:string): string;
  sign(psbt: string): string;
}

export default class Wallet implements WalletInterface {

  keyPair: ECPairInterface;
  privateKey: string;
  publicKey: string;
  address: string;
  script: string;
  network: Network;

  constructor(args: any) {
    const { network, keyPair }: { network: string, keyPair: ECPairInterface | undefined } = args;

    if (!keyPair)
      this.keyPair = ECPair.makeRandom({
        network: network ? (networks as any)[network] : networks.liquid
      });
    else
      this.keyPair = keyPair;

    this.privateKey = this.keyPair.privateKey!.toString('hex');
    this.publicKey = this.keyPair.publicKey!.toString('hex');

    this.network = this.keyPair.network;
    const { address, output } = payments.p2wpkh({
      pubkey: this.keyPair.publicKey,
      network: this.network
    });
    this.address = address!;
    this.script = output!.toString('hex');
  }

  createTx(inputs: Array<any>, inputAmount:number, outputAmount: number, inputAsset:string, outputAsset:string): string {
    //console.log(inputs, inputAmount, outputAmount, inputAsset, outputAsset)
    let psbt = new Psbt(); 
    
    inputs = inputs.filter((utxo: any) => utxo.asset === inputAsset);
    const { unspents, change } = coinselect(inputs, inputAmount);
  
    unspents.forEach((i:any) => psbt.addInput(({
      // if hash is string, txid, if hash is Buffer, is reversed compared to txid
      hash: i.txid,
      index: i.vout,
      //The scriptPubkey and the value only are needed.
      witnessUtxo: {
        script: Buffer.from(this.script, 'hex'),
        asset: Buffer.concat([
          Buffer.from("01", "hex"), //prefix for unconfidential asset
          Buffer.from(inputAsset, "hex").reverse(),
        ]),
        value: confidential.satoshiToConfidentialValue(i.value),
        nonce: Buffer.from('00', 'hex')
      }
    } as any)));
  
    psbt.addOutput({
      script: Buffer.from(this.script, 'hex'),
      value: confidential.satoshiToConfidentialValue(outputAmount),
      asset: Buffer.concat([
        Buffer.from("01", "hex"), //prefix for unconfidential asset
        Buffer.from(outputAsset, "hex").reverse(),
      ]),
      nonce: Buffer.from('00', 'hex')
    });

    if (change > 0) { 
      psbt.addOutput({
        script: Buffer.from(this.script, 'hex'),
        value: confidential.satoshiToConfidentialValue(change),
        asset: Buffer.concat([
          Buffer.from("01", "hex"), //prefix for unconfidential asset
          Buffer.from(inputAsset, "hex").reverse(),
        ]),
        nonce: Buffer.from('00', 'hex')
      })
    }

    const base64 = psbt.toBase64();
    return base64;
  } 

  sign(psbtBase64: string): string {
    let psbt
    try {
      psbt = Psbt.fromBase64(psbtBase64);
    } catch (ignore) {
      throw (new Error('Invalid psbt'));
    }

    psbt.signAllInputs(this.keyPair);

    if (!psbt.validateSignaturesOfAllInputs())
      throw new Error('Invalid signature');

    psbt.finalizeAllInputs();

    return psbt.toBase64();
  }
}


export function fromWIF(wif: string, network?: string): WalletInterface {

  const _network = network ? (networks as any)[network] : networks.liquid

  try {

    const keyPair = ECPair.fromWIF(wif, _network);
    return new Wallet({ keyPair });

  } catch (ignore) {

    throw new Error('Invalid keypair');

  }
}

export async function fetchUtxos(address:string, url:string): Promise<any> {
  return (await axios.get(`${url}/address/${address}/utxo`)).data
}



export async function fetchBalances(address: string, url: string) {
  const utxos = await fetchUtxos(address, url);
  return utxos.reduce((storage: { [x: string]: any; }, item: { [x: string]: any; value: any; }) => {
    // get the first instance of the key by which we're grouping
    var group = item["asset"];

    // set `storage` for this instance of group to the outer scope (if not empty) or initialize it
    storage[group] = storage[group] || 0;

    // add this item to its group within `storage`
    storage[group] += (item.value);

    // return the updated storage to the reduce function, which will then loop through the next 
    return storage;
  }, {}); // {} is the initial value of the storage
}



