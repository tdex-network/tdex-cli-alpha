import { info, log, error, success } from '../logger';
import { Wallet, WalletInterface } from 'tdex-sdk';
import { encrypt } from '../crypto';
//eslint-disable-next-line
const enquirer = require('enquirer');

import State from '../state';
const state = new State();

function setWalletState(
  walletObject: WalletInterface,
  type: string,
  value: string
): void {
  const pubkey = walletObject.publicKey;
  const address = walletObject.address;
  const script = walletObject.script;
  state.set({
    wallet: {
      selected: true,
      pubkey,
      address,
      script,
      keystore: {
        type,
        value,
      },
    },
  });
  log();
  success(`Wallet has been created/restored successfully`);
  log();
  log(`Be sure to backup your data directory before sending any funds`);
  log(`Wallet address: ${address}`);
}

export default function (): void {
  info('=========*** Wallet ***==========\n');

  const { network, wallet } = state.get();

  if (!network.selected) return error('Select a valid network');

  if (wallet.selected)
    return log(`Public key ${wallet.pubkey}\nAddress ${wallet.address}`);

  const restore = new enquirer.Toggle({
    message: 'Want to restore from WIF (Wallet Import Format)?',
    enabled: 'Yep',
    disabled: 'Nope',
  });

  const type = new enquirer.Select({
    type: 'select',
    name: 'type',
    message: 'A new wallet will be created. How do you want to store your private key? 🔑',
    choices: [
      { name: 'encrypted', message: 'Encrypted (AES-128-CBC)' }, //<= choice object
      { name: 'plain', message: 'Plain Text (not recommended)' }, //<= choice object
    ],
  });

  const password = new enquirer.Password({
    type: 'password',
    name: 'password',
    message: 'Type your password',
  });

  const privatekey = new enquirer.Password({
    type: 'password',
    name: 'key',
    message: 'Type your private key WIF (Wallet Import Format)',
  });

  restore.run().then((restoreFromWif: boolean) => {
    if (!restoreFromWif) {
      const walletFromScratch: WalletInterface = Wallet.fromRandom(
        network.chain
      );
      type.run().then((storageType: string) => {
        if (storageType === 'encrypted')
          password
            .run()
            .then((password: string) => {
              setWalletState(
                walletFromScratch,
                storageType,
                encrypt(walletFromScratch.keyPair.toWIF(), password)
              );
            })
            .catch(error);
        else
          setWalletState(
            walletFromScratch,
            storageType,
            walletFromScratch.keyPair.toWIF()
          );
      });
    } else {
      privatekey.run().then((wif: string) => {
        const restoredWallet: WalletInterface = Wallet.fromWIF(
          wif,
          network.chain
        );

        type.run().then((storageType: string) => {
          if (storageType === 'encrypted')
            password
              .run()
              .then((password: string) => {
                setWalletState(
                  restoredWallet,
                  storageType,
                  encrypt(wif, password)
                );
              })
              .catch(error);
          else
            setWalletState(
              restoredWallet,
              storageType,
              restoredWallet.keyPair.toWIF()
            );
        });
      });
    }
  });
}
