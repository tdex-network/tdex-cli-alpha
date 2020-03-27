"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const path = __importStar(require("path"));
const state_1 = __importDefault(require("../state"));
const logger_1 = require("../logger");
const wallet_1 = __importStar(require("../wallet"));
const crypto = __importStar(require("crypto"));
const enquirer = require('enquirer');
const state = new state_1.default({ path: path.resolve(__dirname, "../../state.json") });
function default_1() {
    logger_1.info('=========*** Wallet ***==========\n');
    const { network, wallet } = state.get();
    if (!network.selected)
        return logger_1.error("Select a valid network");
    if (wallet.selected)
        return logger_1.log(`Public key ${wallet.pubkey}\nAddress ${wallet.address}`);
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
            { name: 'encrypted', message: 'Encrypted (AES-128-CBC)' },
            { name: 'plain', message: 'Plain Text (not recommended)' },
        ]
    });
    const password = new enquirer.Password({
        type: 'password',
        name: 'password',
        message: 'Type your password'
    });
    const privatekey = new enquirer.Password({
        type: 'password',
        name: 'key',
        message: 'Type your private key WIF (Wallet Import Format)'
    });
    restore.run().then(restoreFromWif => {
        if (!restoreFromWif) {
            const walletFromScratch = new wallet_1.default({ network: network.chain });
            type.run().then(storageType => {
                if (storageType === "encrypted")
                    password.run().then(password => {
                        setWalletState(walletFromScratch.publicKey, walletFromScratch.address, storageType, encrypt(walletFromScratch.keyPair.toWIF(), password));
                    }).catch(logger_1.error);
                else
                    setWalletState(walletFromScratch.publicKey, walletFromScratch.address, storageType, walletFromScratch.keyPair.toWIF());
            });
        }
        else {
            privatekey.run().then(wif => {
                const restoredWallet = wallet_1.fromWIF(wif, network.chain);
                type.run().then(storageType => {
                    if (storageType === "encrypted")
                        password.run().then(password => {
                            setWalletState(restoredWallet.publicKey, restoredWallet.address, storageType, encrypt(wif, password));
                        }).catch(logger_1.error);
                    else
                        setWalletState(restoredWallet.publicKey, restoredWallet.address, storageType, restoredWallet.keyPair.toWIF());
                });
            });
        }
    });
}
exports.default = default_1;
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
function encrypt(payload, password) {
    const hash = crypto
        .createHash("sha1")
        .update(password);
    const secret = hash.digest().slice(0, 16);
    const key = crypto.createCipheriv('aes-128-cbc', secret, iv);
    let encrypted = key.update(payload, 'utf8', 'hex');
    encrypted += key.final('hex');
    return encrypted;
}
exports.encrypt = encrypt;
function decrypt(encrypted, password) {
    const hash = crypto
        .createHash("sha1")
        .update(password);
    const secret = hash.digest().slice(0, 16);
    const key = crypto.createDecipheriv('aes-128-cbc', secret, iv);
    let decrypted = key.update(encrypted, 'hex', 'utf8');
    decrypted += key.final('utf8');
    return decrypted;
}
exports.decrypt = decrypt;
