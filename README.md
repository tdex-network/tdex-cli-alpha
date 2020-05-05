# 💻 tdex-cli
Wallet CLI for making swaps on TDEX

## Install

* Install from NPM

```sh
$ npm install -g tdex-cli
```

* Download standalone binary (nodejs/npm not needed)

[Download latest release for Mac or Linux](https://github.com/Sevenlab/tdex-cli/releases)


## Custom datadir

* Configure custom directory for data persistence (Default ~/.tdex)

```sh
$ export TDEX_CLI_PATH=/path/to/data/dir 
$ tdex-cli help
```

## Commands

### Network

* Set the network to work against 

> NOTICE With the --explorer flag you can set a different electrum REST server (eg. Blockstream/electrs) for connecting to the blockchain

```sh
# Mainnet
$ tdex-cli network liquid
# Public regtest Nigiri
$ tdex-cli network regtest
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

* Get current exchange rate for selected market

```sh
$ tdex-cli market price
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

* Create a swap request message

> NOTICE With the —-output flag you can customize the output file
> NOTICE With the —-print flag you can print the request in JSON format to stdout

```sh
$ tdex-cli swap request
=========*** Swap ***==========

✔ Which asset do you want to send? › USDT / LBTC
✔ How much do you want to send? · 0.5
✔ How much do you want to receive? · 3000
Gotcha! You will send LBTC 0.5 and receive USDT 3000
✔ Are you sure continue? (y/N) · true
SwapRequest message saved into ./swap_request.bin
```

* Import manually a SwapRequest and sign a resulting SwapAccept message

> NOTICE With the —-file flag you can customize the input file
> NOTICE With the —-output flag you can customize the output file

```sh
$ cd path/to/swap_request.bin
$ tdex-cli swap accept
=========*** Swap ***==========

SwapRequest message: {
  "id": "Q1xH1HV5",
  "amountP": 11000000000,
  "assetP": "bd7f2f6630497c247044a56d2d092b96f2a1e7cca81d00056a64dd7bf281694d",
  "amountR": 10000000,
  "assetR": "5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225",
  "transaction": "cHNldP8BAHYCAAAAAAFGbhOAQ4zClf/b6eM/3WOlOjTGrXXy0axWweYaRdzdkwAAAAAA/////wEBJbJRBw4pyhkEPPM8zXMk4t2rA+zErgted8T8Dlz2yVoBAAAAAACYloAAFgAUf1pUznALvRdb2IseeB9EUJ/8FZEAAAAAAAEBQgFNaYHye91kagUAHajM56HylisJLW2lRHAkfEkwZi9/vQEAAAACj6auAAAWABR/WlTOcAu9F1vYix54H0RQn/wVkQAA",
  "inputBlindingKeyMap": [],
  "outputBlindingKeyMap": []
}
✔ Do you accept the proposed terms? (y/N) · true

Signing with private key...

√ Done

SwapAccept message saved into ./swap_accept.bin
```

* Import a SwapAccept message and sign a resulting SwapComplete message 

> NOTICE With the —-file flag you can customize the input file
> NOTICE With the —-output flag you can customize the output file
> NOTICE With the --push flag you can print the hex encoded extracted transaction and broadcast to the network

```sh
$ tdex-cli swap complete
=========*** Swap ***==========

SwapAccept message: {
  "id": "2z0V5XRX",
  "requestId": "Q1xH1HV5",
  "transaction": "cHNldP8BAP26AQIAAAAAA0ZuE4BDjMKV/9vp4z/dY6U6NMatdfLRrFbB5hpF3N2TAAAAAAD/////d7xePTC4ySCytltLkWIrKYVCgMDO0OWPxLYr1Ambp2EDAAAAAP////8Xi84xzOgYsQr9TFGzdt7PaIhnK2D3td4LrzolBBCMMgMAAAAA/////wUBJbJRBw4pyhkEPPM8zXMk4t2rA+zErgted8T8Dlz2yVoBAAAAAACYloAAFgAUf1pUznALvRdb2IseeB9EUJ/8FZEBTWmB8nvdZGoFAB2ozOeh8pYrCS1tpURwJHxJMGYvf70BAAAAAo+mrgAAFgAUzFEDYTJiiyak/avQesx3bwpPzrkBJbJRBw4pyhkEPPM8zXMk4t2rA+zErgted8T8Dlz2yVoBAAAAAAQsHYAAFgAUzFEDYTJiiyak/avQesx3bwpPzrkBJbJRBw4pyhkEPPM8zXMk4t2rA+zErgted8T8Dlz2yVoBAAAAAAX10dIAFgAUZZvttdPTx6sS1/hTI8OhtsBg774BJbJRBw4pyhkEPPM8zXMk4t2rA+zErgted8T8Dlz2yVoBAAAAAAAAA6oAAAAAAAAAAQFCAU1pgfJ73WRqBQAdqMznofKWKwktbaVEcCR8STBmL3+9AQAAAAKPpq4AABYAFH9aVM5wC70XW9iLHngfRFCf/BWRAAEBQgElslEHDinKGQQ88zzNcyTi3asD7MSuC153xPwOXPbJWgEAAAAABMS0AAAWABTMUQNhMmKLJqT9q9B6zHdvCk/OuSICA3AU/RQbLnq+Yh7tdR4aWBM0LkaNqJ4awVkFNxOysQd6RzBEAiAvIE7plQg7uqFLMbU+1xJAT8CakCpJRPQgTpdIR3pOfwIgSRN0o7Py1IHQEv/CjPJlnl39HWRa4IKgRPbNd2vG53YBAAEBQgElslEHDinKGQQ88zzNcyTi3asD7MSuC153xPwOXPbJWgEAAAAABfXVfAAWABRlm+2109PHqxLX+FMjw6G2wGDvviICAlFGRCD8yYouTNNHr+KKMtdpKH2s2GFHarhYuqQ70wjzRzBEAiBxnHoX/HBTyIjgnYXN7MU4/zwBfgXC7U5r3eTRgM+2dAIgOkx2Xw6+6ACU+TK7QKV3ymDvIOzgEeFK2egs2lPUpBIBAAAAAAAA",
  "inputBlindingKeyMap": [],
  "outputBlindingKeyMap": []
}
✔ Are you sure to confirm? (y/N) · true

Signing with private key...

√ Done

SwapComplete message saved into ./swap_completed.bin
```


### Trade

* Start a swap against the selected provider

```sh
$ tdex-cli trade 
=========*** Trade ***==========

✔ Do you want to buy or sell 5ac9? · SELL / BUY
✔ How much do you want to sell? · 0.5
Gotcha! You will send LBTC 0.5 and receive USDT 3000
✔ Are you sure continue? (y/N) · true

Sending Trade proposal to provider...
Signing with private key...
Trade completed!

tx hash c05beaea74dcbdb87a8f1f1e598a536517884ebcc15a6061832b77c7f41a30d2
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













