# AVA Wallet

This is the frontend Vue.js application for the AVA Wallet. 


## Prerequisites

- Recent version of npm (6.13.4)
- Node v12.14.1
- Gecko, AVA client in Golang (https://github.com/ava-labs/gecko)

## Installation

1) Clone the repo ``git clone https://github.com/ava-labs/ava-wallet.git``
2) Go to root of the project ``cd ava-wallet``
3) Install javascript dependencies with ``npm install``.


## Running The Project

In order for the wallet to work, it needs the AVA network to operate on. By default the wallet will connect to the AVA test network.

1) If you want to connect to a local network, make sure you have installed and able to run a Gecko node properly.
2) Run the project with hot reloading ``npm run serve``

When you go to the website on your browser, you might get a warning saying 
"Site is not secure". This is because we are signing our own SSL Certificates. Please ignore and continue to the website.

## Deployment

 1) Compile and minify to have a production ready application with ``npm run build``. 
 2) Serve from the ``/dist`` directory.
 
 ## Changing the Network
 
 By default the wallet will connect to the AVA test network. You can change to another network by clicking the blue button labeled `TestNet`  on the navigation bar and selecting another network, or add a custom network.


## Explorer API

The wallet uses the AVA Explorer API to display wallet transaction history. 

WARNING: This history might be out of order and incomplete.

## Browser Support

We suggest using Google Chrome to view the AVA Wallet website.

### Firefox and https

Firefox does not allow https requests to localhost. But the AVA Wallet uses https by default, so we will need to change this to http. Make this switch by editing the `vue.config.js` file in the root directory and change 

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

and run `npm run serve` to reflect the change.
