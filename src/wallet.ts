import { ECPair, networks, payments, Psbt } from 'liquidjs-lib';
//Types
import { ECPairInterface } from 'liquidjs-lib/types/ecpair';
import { Network } from 'liquidjs-lib/types/networks';

export interface WalletInterface {
  keyPair: ECPairInterface;
  privateKey: string;
  publicKey: string;
  address: string;
  network: Network;
  sign(psbt: string): string;
}

export default class Wallet implements WalletInterface {

  keyPair: ECPairInterface;
  privateKey: string;
  publicKey: string;
  address: string;
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
    this.address = payments.p2wpkh({
      pubkey: this.keyPair.publicKey,
      network: this.network
    }).address!;
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

