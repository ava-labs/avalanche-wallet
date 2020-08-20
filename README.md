
# Avalanche (AVAX) Wallet

This is the frontend Vue.js application for the Avalanche (AVAX) Wallet. 


## Prerequisites

- Yarn (https://classic.yarnpkg.com/en/docs/install/)
- Recent version of npm (6.13.4)
- Node v12.14.1
- Gecko, Avalanche client in Golang (https://github.com/ava-labs/gecko)

## Installation

1) Clone the repo ``git clone https://github.com/ava-labs/avalanche-wallet.git``
2) Go to root of the project ``cd avalanche-wallet``
3) Install javascript dependencies with ``yarn install``.

## Running The Project

In order for the wallet to work, it needs the Avalanche network to operate on. By default the wallet will connect to the Avalanche test network.

1) If you want to connect to a local network, make sure you have installed and able to run a Gecko node properly.
2) Run the project with hot reloading ``yarn serve``

When you go to the website on your browser, you might get a warning saying 
"Site is not secure". This is because we are signing our own SSL Certificates. Please ignore and continue to the website.

## Deployment

 1) Compile and minify to have a production ready application with ``yarn build``.
 2) Serve from the ``/dist`` directory.
 
 ## Changing the Network
 
 By default the wallet will connect to the Avalanche test network. You can change to another network by clicking the button labeled `TestNet`  on the navigation bar and selecting another network, or add a custom network.

## Explorer API


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

# Keystore File Spec

### v1.0.0 (initial)

```typescript
interface IKeystoreFile{
    salt
    pass_hash
    keys: [
        {
            key,
            nonce,
            address
        }  
    ]
}
```

### v2.0.0

```typescript
interface IKeystoreFile{
    version
    salt
    pass_hash
    warnings
    keys: [
        {
            key
            iv
            address
        }  
    ]
}
```

### v3.0.0
Underlying encryption changed.
```typescript
interface IKeystoreFile{
    version
    salt
    pass_hash
    warnings
    keys: [
        {
            key
            iv
            address
        }  
    ]
}
```

### v4.0.0
Avalanche uses bech32 addresses. Removed address field from keys and the warning message.
```typescript
interface IKeystoreFile{
    version
    salt
    pass_hash
    keys: [
        {
            key
            iv
        }  
    ]
}
```


### v5.0.0
Encodes mnemonic phrase as the key.
```typescript
interface IKeystoreFile{
    version
    salt
    pass_hash
    keys: [
        {
            key
            iv
        }  
    ]
}
```



# Local Storage Remember Wallet Spec
Basically same as storing the keystore file in the browser localstorage.

If there is a remembered wallet it will be the Keystore JSON format.

```json
{
  "w": IKeystoreFile | undefined
}
```
