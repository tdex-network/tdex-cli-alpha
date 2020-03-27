"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const liquidjs_lib_1 = require("liquidjs-lib");
class Wallet {
    constructor(args) {
        const { network, keyPair } = args;
        if (!keyPair)
            this.keyPair = liquidjs_lib_1.ECPair.makeRandom({
                network: network ? liquidjs_lib_1.networks[network] : liquidjs_lib_1.networks.liquid
            });
        else
            this.keyPair = keyPair;
        this.privateKey = this.keyPair.privateKey.toString('hex');
        this.publicKey = this.keyPair.publicKey.toString('hex');
        this.network = this.keyPair.network;
        this.address = liquidjs_lib_1.payments.p2wpkh({
            pubkey: this.keyPair.publicKey,
            network: this.network
        }).address;
    }
    sign(psbtBase64) {
        let psbt;
        try {
            psbt = liquidjs_lib_1.Psbt.fromBase64(psbtBase64);
        }
        catch (ignore) {
            throw (new Error('Invalid psbt'));
        }
        psbt.signAllInputs(this.keyPair);
        if (!psbt.validateSignaturesOfAllInputs())
            throw new Error('Invalid signature');
        psbt.finalizeAllInputs();
        return psbt.toBase64();
    }
}
exports.default = Wallet;
function fromWIF(wif, network) {
    const _network = network ? liquidjs_lib_1.networks[network] : liquidjs_lib_1.networks.liquid;
    try {
        const keyPair = liquidjs_lib_1.ECPair.fromWIF(wif, _network);
        return new Wallet({ keyPair });
    }
    catch (ignore) {
        throw new Error('Invalid keypair');
    }
}
exports.fromWIF = fromWIF;
