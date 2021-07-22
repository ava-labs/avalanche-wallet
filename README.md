# Avalanche (AVAX) Wallet

This is the frontend Vue.js application for the Avalanche (AVAX) Wallet.

## Prerequisites

-   Yarn (https://classic.yarnpkg.com/en/docs/install/)
-   Recent version of npm (7.4.0)
-   Node v15.6.0
-   Gecko, Avalanche client in Golang (https://github.com/ava-labs/avalanchego)

## Installation

1. Clone the repo `git clone https://github.com/ava-labs/avalanche-wallet.git`
2. Go to root of the project `cd avalanche-wallet`
3. Install javascript dependencies with `yarn install`.

## Running The Project

In order for the wallet to work, it needs the Avalanche network to operate on. By default the wallet will connect to the Avalanche mainnet.

1. If you want to connect to a local network, make sure you have installed and able to run a AvlaancheGo node properly.
2. Run the project with hot reloading `yarn serve`

When you go to the website on your browser, you might get a warning saying
"Site is not secure". This is because we are signing our own SSL Certificates. Please ignore and continue to the website.

## Deployment

1.  Compile and minify to have a production ready application with `yarn build`.
2.  Serve from the `/dist` directory.

## Releases

1.  Generate a [personal access token](https://github.com/settings/tokens/new?scopes=repo&description=release-it)
2.  Save it in your local env as RELEASE_IT_GITHUB_TOKEN
3.  Run `yarn release`

## Changing the Network

By default the wallet will connect to the Avalanche tmainnet. You can change to another network by clicking the button labeled `TestNet` on the navigation bar and selecting another network, or add a custom network.

## Explorer API

A valid explorer API is required to correctly display balances for Mnemonic and Ledger type wallets.
The wallet uses the Avalanche Explorer API to display wallet transaction history.

WARNING: This history might be out of order and incomplete.

## Browser Support

We suggest using Google Chrome to view the Avalanche Wallet website.

### Firefox and https

Firefox does not allow https requests to localhost. But the Avalanche Wallet uses https by default, so we will need to change this to http. Make this switch by editing the `vue.config.js` file in the root directory and change

```
devServer: {
    https: true
},
```

to

```
devServer: {
    https: false
},
```

and run `yarn serve` to reflect the change.

# Accounts

The wallet can encrypt your private keys into a secure file encrypted by a password.

```json
{
    "accounts": iUserAccountEncrypted[]
}
```

# Language Setting

Saved into local storage as a 2 letter code.

```
"lang": "en"
```

# Dependencies

##### Avalanche Node (https://github.com/ava-labs/avalanchego)

To get utxos and to send transactions.

#### Explorer API Node (https://github.com/ava-labs/ortelius)

To check if an address was used before, and to get activity history.

# Default Connections

The wallet needs to connect to an Avalanche node, and an explorer node to operate properly.

By default, there are two network options to connect to: `Mainnet` and `Fuji`.

##### Mainnet

-   Avalanche API: `https://api.avax.network:443`
-   Explorer API: `https://explorerapi.avax.network`

##### Fuji (Testnet)

-   Avalanche API: `https://api.avax-test.network:443`
-   Explorer API: `https://explorerapi.avax-test.network`

