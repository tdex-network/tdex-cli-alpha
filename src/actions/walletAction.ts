import { info, log, error } from '../logger';
import Wallet, { WalletInterface, fromWIF } from '../wallet';
import {encrypt} from '../crypto';


const enquirer = require('enquirer');

import State from '../state';
const state = new State();


export default function () : void {
  info('=========*** Wallet ***==========\n');

  const { network, wallet } = state.get();
  
  if (!network.selected)
    return error("Select a valid network");

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

  restore.run().then((restoreFromWif: Boolean) => {

    if (!restoreFromWif) {

      const walletFromScratch: WalletInterface = new Wallet({ network: network.chain });
      type.run().then((storageType:string) => {

        if (storageType === "encrypted")
          password.run().then((password:string) => {

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
      privatekey.run().then((wif:string) => {

        const restoredWallet: WalletInterface = fromWIF(wif, network.chain);

        type.run().then((storageType:string) => {
          if (storageType === "encrypted")
            password.run().then((password:string) => {

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


function setWalletState(pubkey:string, address:string, type:string, value:string):void {
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