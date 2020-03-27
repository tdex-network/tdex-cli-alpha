// @ts-nocheck
import * as path from 'path';
import State from '../state';
import { info, log, error, success } from '../logger';
import Wallet, { WalletInterface, fromWIF } from '../wallet';
import * as crypto from 'crypto';


const enquirer = require('enquirer');
const state = new State({ path: path.resolve(__dirname, "../../state.json") });


export default function () {
  info('=========*** Wallet ***==========\n');

  const { network, wallet } = state.get();

  if (!network.selected)
    return error("Select a valid network")

  if (wallet.selected)
    return log(`Public key ${wallet.pubkey}\nAddress ${wallet.address}`);

  const restore = new enquirer.Toggle({
    message: 'Want to restore from WIF (Wallet Import Format)?',
    enabled: 'Yep',
    disabled: 'Nope'
  });

  const type = new enquirer.Select({
    type: 'select',
    name: 'type',
    message: 'How do you want to store your private key? 🔑',
    choices: [
      { name: 'encrypted', message: 'Encrypted (AES-128-CBC)' }, //<= choice object
      { name: 'plain', message: 'Plain Text (not recommended)' }, //<= choice object
    ]
  });

  const password = new enquirer.Password({
    type: 'password',
    name: 'password',
    message: 'Type your password'
  })

  const privatekey = new enquirer.Password({
    type: 'password',
    name: 'key',
    message: 'Type your private key WIF (Wallet Import Format)'
  })

  restore.run().then(restoreFromWif => {

    if (!restoreFromWif) {

      const walletFromScratch: WalletInterface = new Wallet({ network: network.chain });
      type.run().then(storageType => {

        if (storageType === "encrypted")
          password.run().then(password => {

            setWalletState(
              walletFromScratch.publicKey,
              walletFromScratch.address,
              storageType,
              encrypt(walletFromScratch.keyPair.toWIF(), password)
            );
          }).catch(error);
        else
          setWalletState(
            walletFromScratch.publicKey,
            walletFromScratch.address,
            storageType,
            walletFromScratch.keyPair.toWIF()
          );
      });
    } else {
      privatekey.run().then(wif => {

        const restoredWallet: WalletInterface = fromWIF(wif, network.chain);

        type.run().then(storageType => {
          if (storageType === "encrypted")
            password.run().then(password => {

              setWalletState(
                restoredWallet.publicKey,
                restoredWallet.address,
                storageType,
                encrypt(wif, password)
              );

            }).catch(error);
          else
            setWalletState(
              restoredWallet.publicKey,
              restoredWallet.address,
              storageType,
              restoredWallet.keyPair.toWIF()
            );
        });
      });
    }
  });


}


function setWalletState(pubkey, address, type, value) {
  state.set({
    wallet: {
      selected: true,
      pubkey,
      address,
      keystore: {
        type,
        value
      }
    }
  });
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
