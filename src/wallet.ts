import { ECPair, networks, payments, Psbt } from 'liquidjs-lib';
import * as crypto from 'crypto';
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

const iv = Buffer.alloc(16, 0);

export function encrypt(payload, password) {
  const hash = crypto
    .createHash("sha1")
    .update(password);

  const secret = hash.digest().slice(0, 16);
  const key = crypto.createCipheriv('aes-128-cbc', secret, iv);
  let encrypted = key.update(payload, 'utf8', 'hex');
  encrypted += key.final('hex');

  return encrypted;
}

export function decrypt(encrypted, password) {
  const hash = crypto
  .createHash("sha1")
  .update(password);
  
  const secret = hash.digest().slice(0, 16);
  const key = crypto.createDecipheriv('aes-128-cbc', secret, iv);
  let decrypted = key.update(encrypted, 'hex', 'utf8')
  decrypted += key.final('utf8');

  return decrypted;
}
