# alpha-wallet
Wallet CLI for making swaps on TDEX

## Usage

* Install

```sh
$ npm install -g tdex-cli
```

* Connect to a liquidity provider

```sh
$ tdex-cli connect https://tdex.vulpem.com
```

* Select a market to use for trading

```sh
$ tdex-cli market LBTC-USDT
```

* Create or Restore Wallet

```sh
$ tdex-cli wallet
=========*** Wallet ***==========

✔ Want to restore from WIF (Wallet Import Format)? · Nope / Yep
✔ Type your private key WIF (Wallet Import Format) · 
✔ How do you want to store your private key? 🔑 · encrypted
✔ Type your password · ****
```

* Run again to get current pubkey and address
```sh
$ tdex-cli wallet
=========*** Wallet ***==========

Public key 02df46a7074ea5ba872393560d208416369800c4c187344b74874bfd857a3c44ef
Address ert1qgzeyqlelkg38d320eh06jl3suwp86565t5ngcm
```

## Development

**Requirements**

* Node/npm or yarn


* Install deps

```sh
yarn install
```

* Build .ts files

```sh
yarn build
```

* Build and Test

```sh
yarn test
``` 

* Try it out locally

```sh
npm install -g 
tdex-cli --version
```













