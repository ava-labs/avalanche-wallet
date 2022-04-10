import Web3 from 'web3'
import { Contract } from 'web3-eth/node_modules/web3-eth-contract'
import { AbiItem } from 'web3-utils'

import ERC721Abi from '@/abi/IERC721MetaData.json'
import ERC20Abi from '@/abi/IERC20.json'

const abiDecoder = require('abi-decoder') // NodeJS

abiDecoder.addABI(ERC721Abi)
abiDecoder.addABI(ERC20Abi)

let rpcUrl = `https://api.avax.network/ext/bc/C/rpc`

let web3 = new Web3(rpcUrl)

export { web3, Contract, AbiItem, abiDecoder }
