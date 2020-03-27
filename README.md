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
```

* Get Wallet Balance
```sh
$ tdex-cli wallet balance
```

* Start a swap

```sh
$ tdex-cli swap 
=========*** Swap ***==========

✔ Which asset do you want to send? · USDT / LBTC
✔ How much do you want to send? · 600
Gotcha! You will send USDT 600 and receive circa LBTC 0.1002 based on current market rate
✔ Are you sure continue? (y/N) · true

Sending Swap Proposal to provider...

Swap succesful!
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













