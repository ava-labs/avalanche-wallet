# AVA Wallet
This is the frontend Vue.js application for the AVA Wallet. 


## Prerequisites
- Recent version of npm (6.13.4)
- Node v12.14.1

## Installation
1) Clone the repo ``git clone https://github.com/ava-labs/wallet-site.git``
2) Go to root of the project ``cd wallet-site``
3) Install javascript dependencies with ``npm install``.
4) Copy the example file ``.env.example``, and rename it ``.env``. Fill the variables with the correct values. 
Refer to the ENV FILES section for additional help.
5) Install Gecko, our AVA node client written in Golang to start a network (https://github.com/ava-labs/gecko). 


## ENV Files

Make sure to read the official Vue environment variables document to get an understanding
of how it works for development and production (https://cli.vuejs.org/guide/mode-and-env.html). Vairables
 beginning with ``VUE_APP_`` will get injected into the vue application.
 
Refer to ``.env.example``

- ``VUE_APP_AVA_IP`` The ip address of the Gecko jrpc node.
- ``VUE_APP_AVA_PORT`` The  port of the Gecko jrpc node.
- ``VUE_APP_AVA_PROTOCOL`` Either http or https
- ``VUE_APP_NETWORK_ID`` What is the network id of the AVA network you are connecting to.
- ``VUE_APP_AVA_ASSET_ID`` Which asset id is the actual AVA Token
- ``VUE_APP_CHAIN_ID`` The blockchain id of the AVA  Network you are connecting to.

## Running The Project

In order for the wallet to work, it needs the AVA network to operate on. 
1) Make sure you have installed and 
able to run a Gecko node properly.
2) Run the project with hot reloading ``npm run serve``


## Deployment
 1) Setup environment variables for production
 2) Compile and minify to have a production ready application with ``npm run build``. 
 3) Serve from the ``/dist`` directory.
 

