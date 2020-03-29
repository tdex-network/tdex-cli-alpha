# alpha-wallet
Wallet CLI for making swaps on TDEX

## Usage

### Install

* Install from NPM
```sh
$ npm install -g tdex-cli
```

* Configure custom directory for data persistence (Default ~/.tdex)

```sh
$ export TDEX_CLI_PATH=/path/to/data/dir 
$ tdex-cli help
```
### Network

* Set the network to work against 

> NOTICE With the --explorer flag you can set a different electrum REST server (eg. Blockstream/electrs) for connecting to the blockchain

```sh
# Mainnet
$ tdex-cli netwrok liquid
# Public regtest Nigiri
$ tdex-cli netwrok regtest
# Local Nigiri or Electrum REST server
$ tdex-cli network regtest --explorer localhost:3001
```

### Info

* Show current persisted state

```sh
$ tdex-cli info
```

### Provider

* Connect to a liquidity provider

```sh
$ tdex-cli connect https://tdex.vulpem.com
```

### Market

* List all available markets for current provider

```sh
$ tdex-cli market list
```

* Select a market to use for trading

```sh
$ tdex-cli market LBTC-USDT
```

* Get current exchnage rate for selected market

```sh
$ tdex-cli market LBTC-USDT
```

### Wallet 

* Create or Restore Wallet

```sh
$ tdex-cli wallet
=========*** Wallet ***==========

✔ Want to restore from WIF (Wallet Import Format)? · Nope / Yep
✔ Type your private key WIF (Wallet Import Format) · 
✔ How do you want to store your private key? 🔑 · encrypted
✔ Type your password · ****
```

* Run again to print pubkey and address
```sh
$ tdex-cli wallet
```

* Get Wallet Balance
```sh
$ tdex-cli wallet balance
```


### Swap

* Start a swap against the selected provider

> NOTICE With the --local flag you can export manually the SwapRequest message without the need of a connection with the provider.

```sh
$ tdex-cli swap 
=========*** Swap ***==========

✔ Which asset do you want to send? · USDT / LBTC
✔ How much do you want to send? · 0.5
Gotcha! You will send LBTC 0.5 and receive USDT 3000
✔ Are you sure continue? (y/N) · true

Sending SwapRequest to provider...

Swap has been accepted!

Signing with private key...
Sending SwapComplete to provider...

Swap completed!
```

* Import manually a SwapRequest and sign a resulting SwapAccept message

```sh
$ tdex-cli swap accept <message>
```

* Import a SwapAccept message and sign a resulting SwapComplete message 

> NOTICE With the --push flag you can print the hex encoded extracted transaction and broadcast to the network

```sh
$ tdex-cli swap complete <message>
```

## Development

### Requirements

* Node/npm or yarn

### Instructions

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













