import * as path from 'path';
import State from '../state';
import { info, log, error, success } from '../logger';
import Wallet, { encrypt, WalletInterface, fromWIF } from '../wallet';


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