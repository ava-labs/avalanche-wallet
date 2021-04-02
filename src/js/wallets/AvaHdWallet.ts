// A simple wrapper thar combines avalanche.js, bip39 and HDWallet

import {
    KeyPair as AVMKeyPair,
    KeyChain as AVMKeyChain,
    UTXOSet as AVMUTXOSet,
    TransferableInput,
    TransferableOutput,
    BaseTx,
    UnsignedTx as AVMUnsignedTx,
    Tx as AVMTx,
    UTXO as AVMUTXO,
    AssetAmountDestination,
    UTXOSet,
} from 'avalanche/dist/apis/avm'

import { privateToAddress } from 'ethereumjs-util'

import {
    KeyChain as PlatformVMKeyChain,
    UnsignedTx as PlatformUnsignedTx,
    UTXO as PlatformUTXO,
    Tx as PlatformTx,
} from 'avalanche/dist/apis/platformvm'

import {
    KeyChain as EVMKeyChain,
    UnsignedTx as EVMUnsignedTx,
    Tx as EvmTx,
} from 'avalanche/dist/apis/evm'
import { getPreferredHRP, PayloadBase } from 'avalanche/dist/utils'

import * as bip39 from 'bip39'
import { BN, Buffer as BufferAvalanche } from 'avalanche'
import { ava, avm, bintools, cChain, pChain } from '@/AVA'
import { AvmExportChainType, AvmImportChainType, IAvaHdWallet } from '@/js/wallets/types'
import HDKey from 'hdkey'
import { ITransaction } from '@/components/wallet/transfer/types'
import { KeyPair as PlatformVMKeyPair } from 'avalanche/dist/apis/platformvm'
import { HdWalletCore } from '@/js/wallets/HdWalletCore'
import { WalletNameType } from '@/js/wallets/types'
import { digestMessage } from '@/helpers/helper'
import { KeyChain } from 'avalanche/dist/apis/evm'
import Erc20Token from '@/js/Erc20Token'
import { WalletHelper } from '@/helpers/wallet_helper'
import { Transaction } from '@ethereumjs/tx'

// HD WALLET
// Accounts are not used and the account index is fixed to 0
// m / purpose' / coin_type' / account' / change / address_index

const AVA_TOKEN_INDEX: string = '9000'
export const AVA_ACCOUNT_PATH: string = `m/44'/${AVA_TOKEN_INDEX}'/0'` // Change and index left out
export const ETH_ACCOUNT_PATH: string = `m/44'/60'/0'`
export const LEDGER_ETH_ACCOUNT_PATH = ETH_ACCOUNT_PATH + '/0/0'

const INDEX_RANGE: number = 20 // a gap of at least 20 indexes is needed to claim an index unused
const SCAN_SIZE: number = 70 // the total number of utxos to look at initially to calculate last index
const SCAN_RANGE: number = SCAN_SIZE - INDEX_RANGE // How many items are actually scanned

// Possible indexes for each request is
// SCAN_SIZE - INDEX_RANGE

export default class AvaHdWallet extends HdWalletCore implements IAvaHdWallet {
    seed: string
    hdKey: HDKey
    mnemonic: string
    isLoading: boolean
    type: WalletNameType
    ethKey: string
    ethKeyBech: string
    ethKeyChain: EVMKeyChain
    ethAddress: string
    ethAddressBech: string
    ethBalance: BN

    // TODO : Move to hd core class
    onnetworkchange() {
        super.onnetworkchange()

        // Update EVM values
        this.ethKeyChain = new EVMKeyChain(ava.getHRP(), 'C')
        let cKeypair = this.ethKeyChain.importKey(this.ethKeyBech)
        this.ethAddressBech = cKeypair.getAddressString()
        this.ethBalance = new BN(0)
    }

    // The master key from avalanche.js
    constructor(mnemonic: string) {
        let seed: globalThis.Buffer = bip39.mnemonicToSeedSync(mnemonic)
        let masterHdKey: HDKey = HDKey.fromMasterSeed(seed)
        let accountHdKey = masterHdKey.derive(AVA_ACCOUNT_PATH)

        super(accountHdKey, false)

        // Derive EVM key and address
        let ethAccountKey = masterHdKey.derive(ETH_ACCOUNT_PATH + '/0/0')
        let ethPrivateKey = ethAccountKey.privateKey
        this.ethKey = ethPrivateKey.toString('hex')
        this.ethAddress = privateToAddress(ethPrivateKey).toString('hex')
        this.ethBalance = new BN(0)

        let cPrivKey = `PrivateKey-` + bintools.cb58Encode(BufferAvalanche.from(ethPrivateKey))
        this.ethKeyBech = cPrivKey

        let cKeyChain = new KeyChain(ava.getHRP(), 'C')
        this.ethKeyChain = cKeyChain

        let cKeypair = cKeyChain.importKey(cPrivKey)
        this.ethAddressBech = cKeypair.getAddressString()

        this.type = 'mnemonic'
        this.seed = seed.toString('hex')
        this.hdKey = masterHdKey
        this.mnemonic = mnemonic
        this.isLoading = false
    }

    getEvmAddress(): string {
        return this.ethAddress
    }

    getEvmAddressBech(): string {
        return this.ethAddressBech
    }

    async getEthBalance() {
        let bal = await WalletHelper.getEthBalance(this)
        this.ethBalance = bal
        return bal
    }

    async sendEth(to: string, amount: BN, gasPrice: BN, gasLimit: number) {
        return await WalletHelper.sendEth(this, to, amount, gasPrice, gasLimit)
        // let receiver = to
        // let txAmount = amount
        // let fromAddr = this.ethAddress
        //
        // let account = web3.eth.accounts.privateKeyToAccount(this.ethKey)
        //
        // const txConfig = {
        //     from: fromAddr,
        //     gasPrice: gasPrice,
        //     gas: gasLimit,
        //     to: receiver,
        //     value: txAmount.toString(), // in wei
        //     data: '',
        // }
        //
        // let signedTx = await account.signTransaction(txConfig)
        // let err,
        //     receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction as string)
        //
        // if (err) {
        //     console.error(err)
        //     throw err
        // }
        //
        // return receipt.transactionHash
    }

    // TODO: Move to shared file
    async estimateGas(to: string, amount: BN, token: Erc20Token): Promise<number> {
        let from = '0x' + this.ethAddress
        let tx = token.createTransferTx(to, amount)
        let estGas = await tx.estimateGas({
            from: from,
        })
        // Return 10% more
        return Math.round(estGas * 1.1)
    }

    async sendERC20(
        to: string,
        amount: BN,
        gasPrice: BN,
        gasLimit: number,
        token: Erc20Token
    ): Promise<string> {
        return await WalletHelper.sendErc20(this, to, amount, gasPrice, gasLimit, token)
        // let from = '0x' + this.ethAddress
        // let tx = token.createTransferTx(to, amount)
        //
        // const txConfig = {
        //     from: from,
        //     gasPrice: gasPrice,
        //     gas: gasLimit,
        //     to: token.data.address,
        //     data: tx.encodeABI(),
        // }
        //
        // let account = web3.eth.accounts.privateKeyToAccount(this.ethKey)
        // let signedTx = await account.signTransaction(txConfig)
        //
        // let err,
        //     receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction as string)
        //
        // if (err) {
        //     console.error(err)
        //     throw err
        // }
        //
        // return receipt.transactionHash
    }

    async getUTXOs(): Promise<void> {
        // TODO: Move to shared file
        this.isFetchUtxos = true
        // If we are waiting for helpers to initialize delay the call
        let isInit =
            this.externalHelper.isInit && this.internalHelper.isInit && this.platformHelper.isInit
        if (!isInit) {
            setTimeout(() => {
                this.getUTXOs()
            }, 1000)
            // console.info('HD Not ready try again in 1 sec..')
            return
        }

        super.getUTXOs()
        this.getStake()
        this.getEthBalance()
        return
    }

    getCurrentKey(): AVMKeyPair {
        return this.externalHelper.getCurrentKey() as AVMKeyPair
    }

    getAllDerivedKeys(isInternal = false): AVMKeyPair[] | PlatformVMKeyPair[] {
        if (isInternal) {
            return this.internalHelper.getAllDerivedKeys()
        } else {
            return this.externalHelper.getAllDerivedKeys()
        }
    }

    getMnemonic(): string {
        return this.mnemonic
    }

    async validate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        delegationFee: number = 0,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        return await WalletHelper.validate(
            this,
            nodeID,
            amt,
            start,
            end,
            delegationFee,
            rewardAddress,
            utxos
        )
    }

    // Delegates AVAX to the given node ID
    async delegate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        return await WalletHelper.delegate(this, nodeID, amt, start, end, rewardAddress, utxos)
        // let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain
        // let utxoSet: PlatformUTXOSet = this.platformHelper.utxoSet as PlatformUTXOSet
        //
        // // If given custom UTXO set use that
        // if (utxos) {
        //     utxoSet = new PlatformUTXOSet()
        //     utxoSet.addArray(utxos)
        // }
        //
        // let pAddressStrings = keychain.getAddressStrings()
        // let stakeAmount = amt
        //
        // // If reward address isn't given use index 0 address
        // if (!rewardAddress) {
        //     rewardAddress = this.getPlatformRewardAddress()
        // }
        //
        // // For change address use first available on the platform chain
        // let changeAddr = this.platformHelper.getFirstAvailableAddress()
        //
        // // Stake is always returned to address at index 0
        // let stakeReturnAddr = this.getPlatformRewardAddress()
        //
        // // Convert dates to unix time
        // let startTime = new BN(Math.round(start.getTime() / 1000))
        // let endTime = new BN(Math.round(end.getTime() / 1000))
        //
        // const unsignedTx = await pChain.buildAddDelegatorTx(
        //     utxoSet,
        //     [stakeReturnAddr],
        //     pAddressStrings,
        //     [changeAddr],
        //     nodeID,
        //     startTime,
        //     endTime,
        //     stakeAmount,
        //     [rewardAddress] // reward address
        // )
        // const tx = unsignedTx.sign(keychain)
        // // Update UTXOS
        // setTimeout(async () => {
        //     this.getUTXOs()
        // }, 3000)
        //
        // return pChain.issueTx(tx)
    }

    // async chainTransfer(
    //     amt: BN,
    //     sourceChain: ChainIdType,
    //     destinationChain: ChainIdType
    // ): Promise<string> {
    //     let fee = avm.getTxFee()
    //     let amtFee = amt.add(fee)
    //
    //     if (destinationChain === 'C') {
    //         // C Chain imports/exports do not have a fee
    //         amtFee = amt
    //     }
    //
    //     // Get from addresses
    //     if (sourceChain === 'X') {
    //         let destinationAddr
    //         if (destinationChain === 'P') {
    //             destinationAddr = this.getCurrentAddressPlatform()
    //         } else {
    //             // C Chain
    //             // todo: replace with shared wallet class method
    //             destinationAddr = this.ethAddressBech
    //         }
    //
    //         let fromAddresses = this.getAllAddressesX()
    //         let changeAddress = this.getChangeAddressAvm()
    //         let utxos = this.getUTXOSet()
    //         let exportTx = (await buildExportTransaction(
    //             sourceChain,
    //             destinationChain,
    //             utxos,
    //             fromAddresses,
    //             destinationAddr,
    //             amtFee,
    //             changeAddress
    //         )) as AVMUnsignedTx
    //
    //         let tx = await this.sign<AVMUnsignedTx, AVMTx>(exportTx)
    //
    //         return avm.issueTx(tx)
    //     } else if (sourceChain === 'P') {
    //         let destinationAddr = this.getCurrentAddressAvm()
    //         let fromAddresses = this.getAllAddressesP()
    //
    //         let changeAddress = this.getCurrentAddressPlatform()
    //         let utxos = this.getPlatformUTXOSet()
    //
    //         let exportTx = (await buildExportTransaction(
    //             sourceChain,
    //             destinationChain,
    //             utxos,
    //             fromAddresses,
    //             destinationAddr,
    //             amtFee,
    //             changeAddress
    //         )) as PlatformUnsignedTx
    //
    //         let tx = await this.sign<PlatformUnsignedTx, PlatformTx>(exportTx, false)
    //
    //         return pChain.issueTx(tx)
    //     } else if (sourceChain === 'C') {
    //         let destinationAddr = this.getCurrentAddressAvm()
    //         let fromAddresses = [this.ethAddress]
    //         let changeAddress = this.ethAddressBech
    //         let utxos = this.getPlatformUTXOSet()
    //
    //         let exportTx = (await buildExportTransaction(
    //             sourceChain,
    //             destinationChain,
    //             utxos,
    //             fromAddresses,
    //             destinationAddr,
    //             amtFee,
    //             changeAddress,
    //             this.ethAddressBech
    //         )) as EVMUnsignedTx
    //
    //         let tx = await exportTx.sign(this.ethKeyChain)
    //         return cChain.issueTx(tx)
    //     } else {
    //         throw 'Invalid source chain.'
    //     }
    // }

    async getStake(): Promise<BN> {
        this.stakeAmount = await WalletHelper.getStake(this)
        return this.stakeAmount
    }

    async exportFromPChain(amt: BN) {
        return await WalletHelper.exportFromPChain(this, amt)
    }

    async exportFromXChain(amt: BN, destinationChain: AvmExportChainType) {
        return await WalletHelper.exportFromXChain(this, amt, destinationChain)
    }

    async exportFromCChain(amt: BN) {
        return await WalletHelper.exportFromCChain(this, amt)
        // let fee = avm.getTxFee()
        // let amtFee = amt.add(fee)
        //
        // let destinationAddr = this.getCurrentAddressAvm()
        // let fromAddresses = [this.getEvmAddress()]
        // let fromAddrBech = this.getEvmAddressBech()
        //
        // let exportTx = (await buildEvmExportTransaction(
        //     fromAddresses,
        //     destinationAddr,
        //     amtFee,
        //     fromAddrBech
        // )) as EVMUnsignedTx
        //
        // let tx = await exportTx.sign(this.ethKeyChain)
        // return cChain.issueTx(tx)
    }

    async importToCChain(): Promise<string> {
        return await WalletHelper.importToCChain(this)
        //
        // const utxoResponse = await cChain.getUTXOs(this.ethAddressBech, avm.getBlockchainID())
        // const utxoSet: EVMUTXOSet = utxoResponse.utxos
        //
        // if (utxoSet.getAllUTXOs().length === 0) {
        //     throw new Error('Nothing to import.')
        // }
        //
        // let toAddress = '0x' + this.ethAddress
        // let ownerAddresses = [this.ethAddressBech]
        // let fromAddresses = ownerAddresses
        // let sourceChain = avm.getBlockchainID()
        //
        // const unsignedTx = await cChain.buildImportTx(
        //     utxoSet,
        //     toAddress,
        //     ownerAddresses,
        //     sourceChain,
        //     fromAddresses
        // )
        // let keyChain = this.ethKeyChain
        // const tx = unsignedTx.sign(keyChain)
        // let id = await cChain.issueTx(tx)
        //
        // return id
    }

    // TODO: Move to Core HD file
    async importToPlatformChain(): Promise<string> {
        return await WalletHelper.importToPlatformChain(this)

        // // await this.platformHelper.findHdIndex();
        // const utxoSet = (await this.platformHelper.getAtomicUTXOs()) as PlatformUTXOSet
        //
        // if (utxoSet.getAllUTXOs().length === 0) {
        //     throw new Error('Nothing to import.')
        // }
        //
        // let keyChain = this.platformHelper.getKeychain() as PlatformVMKeyChain
        // let pAddrs = keyChain.getAddressStrings()
        // // Owner addresses, the addresses we exported to
        // let pToAddr = this.platformHelper.getCurrentAddress()
        //
        // let hrp = ava.getHRP()
        // let utxoAddrs = utxoSet
        //     .getAddresses()
        //     .map((addr) => bintools.addressToString(hrp, 'P', addr))
        // let fromAddrs = utxoAddrs
        // let ownerAddrs = utxoAddrs
        //
        // const unsignedTx = await pChain.buildImportTx(
        //     utxoSet,
        //     ownerAddrs,
        //     avm.getBlockchainID(),
        //     [pToAddr],
        //     [pToAddr],
        //     [pToAddr],
        //     undefined,
        //     undefined
        // )
        // const tx = unsignedTx.sign(keyChain)
        //
        // return pChain.issueTx(tx)
    }

    // TODO: Move to Core HD file
    async importToXChain(sourceChain: AvmImportChainType) {
        return await WalletHelper.importToXChain(this, sourceChain)
        // const utxoSet = (await this.externalHelper.getAtomicUTXOs()) as AVMUTXOSet
        //
        // if (utxoSet.getAllUTXOs().length === 0) {
        //     throw new Error('Nothing to import.')
        // }
        //
        // let keyChain = this.getKeyChain() as AVMKeyChain
        // // let xAddrs = keyChain.getAddressStrings()
        // let xToAddr = this.externalHelper.getCurrentAddress()
        //
        // let hrp = ava.getHRP()
        // let utxoAddrs = utxoSet
        //     .getAddresses()
        //     .map((addr) => bintools.addressToString(hrp, 'X', addr))
        //
        // let fromAddrs = utxoAddrs
        // let ownerAddrs = utxoAddrs
        //
        // let sourceChainId
        // if (sourceChain === 'P') {
        //     sourceChainId = pChain.getBlockchainID()
        // } else {
        //     sourceChainId = cChain.getBlockchainID()
        // }
        // // Owner addresses, the addresses we exported to
        // const unsignedTx = await avm.buildImportTx(
        //     utxoSet,
        //     ownerAddrs,
        //     sourceChainId,
        //     [xToAddr],
        //     fromAddrs,
        //     [xToAddr]
        // )
        // const tx = unsignedTx.sign(keyChain)
        //
        // return avm.issueTx(tx)
    }

    async issueBatchTx(
        orders: (ITransaction | AVMUTXO)[],
        addr: string,
        memo: BufferAvalanche | undefined
    ): Promise<string> {
        return await WalletHelper.issueBatchTx(this, orders, addr, memo)
    }

    // returns a keychain that has all the derived private/public keys for X chain
    getKeyChain(): AVMKeyChain {
        let internal = this.internalHelper.getAllDerivedKeys() as AVMKeyPair[]
        let external = this.externalHelper.getAllDerivedKeys() as AVMKeyPair[]

        let allKeys = internal.concat(external)
        let keychain: AVMKeyChain = new AVMKeyChain(
            getPreferredHRP(ava.getNetworkID()),
            this.chainId
        )

        for (var i = 0; i < allKeys.length; i++) {
            keychain.addKey(allKeys[i])
        }
        return keychain
    }

    getExtendedKeyChain() {
        let internal = this.internalHelper.getAllDerivedKeys() as AVMKeyPair[]
        let external = this.externalHelper.getAllDerivedKeys() as AVMKeyPair[]

        let allKeys = internal.concat(external)
        let keychain: AVMKeyChain = new AVMKeyChain(
            getPreferredHRP(ava.getNetworkID()),
            this.chainId
        )

        for (var i = 0; i < allKeys.length; i++) {
            keychain.addKey(allKeys[i])
        }
        return keychain
    }

    // async sign<
    //     UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx,
    //     SignedTx extends AVMTx | PlatformTx
    // >(unsignedTx: UnsignedTx, isAVM: boolean = true): Promise<SignedTx> {
    //     let keychain = this.getKeyChain()
    //     let keychainP = this.platformHelper.getKeychain() as PlatformVMKeyChain
    //
    //     if (isAVM) {
    //         const tx = (unsignedTx as AVMUnsignedTx).sign(keychain)
    //         return tx as SignedTx
    //     } else {
    //         const tx = (unsignedTx as PlatformUnsignedTx).sign(keychainP)
    //         return tx as SignedTx
    //     }
    // }

    async signX(unsignedTx: AVMUnsignedTx): Promise<AVMTx> {
        let keychain = this.getKeyChain()

        const tx = unsignedTx.sign(keychain)
        return tx
    }

    async signP(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx> {
        let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain
        const tx = unsignedTx.sign(keychain)
        return tx
    }

    async signC(unsignedTx: EVMUnsignedTx): Promise<EvmTx> {
        let keyChain = this.ethKeyChain
        return unsignedTx.sign(keyChain)
    }

    async signEvm(tx: Transaction) {
        let keyBuff = Buffer.from(this.ethKey, 'hex')
        return tx.sign(keyBuff)
    }

    async signMessage(msgStr: string, address: string): Promise<string> {
        let index = this.externalHelper.findAddressIndex(address)

        if (index === null) throw 'Address not found.'

        let key = this.externalHelper.getKeyForIndex(index) as AVMKeyPair
        let digest = digestMessage(msgStr)

        // Convert to the other Buffer and sign
        let digestHex = digest.toString('hex')
        let digestBuff = BufferAvalanche.from(digestHex, 'hex')
        let signed = key.sign(digestBuff)

        return bintools.cb58Encode(signed)
    }

    async createNftFamily(name: string, symbol: string, groupNum: number) {
        return await WalletHelper.createNftFamily(this, name, symbol, groupNum)
    }

    async mintNft(mintUtxo: AVMUTXO, payload: PayloadBase, quantity: number) {
        return await WalletHelper.mintNft(this, mintUtxo, payload, quantity)
    }
}
