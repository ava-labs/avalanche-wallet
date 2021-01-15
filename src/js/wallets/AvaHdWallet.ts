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

import { web3 } from '@/evm'
import { privateToAddress } from 'ethereumjs-util'

import {
    KeyChain as PlatformVMKeyChain,
    UTXOSet as PlatformUTXOSet,
    UnsignedTx as PlatformUnsignedTx,
    UTXO as PlatformUTXO,
    Tx as PlatformTx,
} from 'avalanche/dist/apis/platformvm'

import {
    UTXOSet as EVMUTXOSet,
    KeyChain as EVMKeyChain,
    UnsignedTx as EVMUnsignedTx,
} from 'avalanche/dist/apis/evm'
import { getPreferredHRP, PayloadBase } from 'avalanche/dist/utils'

import * as bip39 from 'bip39'
import { BN, Buffer } from 'avalanche'
import { ava, avm, bintools, cChain, pChain } from '@/AVA'
import { IAvaHdWallet, IIndexKeyCache } from '@/js/wallets/IAvaHdWallet'
import HDKey from 'hdkey'
import { ITransaction } from '@/components/wallet/transfer/types'
import { HdHelper } from '@/js/HdHelper'
import { KeyPair as PlatformVMKeyPair } from 'avalanche/dist/apis/platformvm'
import createHash from 'create-hash'
import { HdWalletCore } from '@/js/wallets/HdWalletCore'
import { WalletNameType } from '@/store/types'
import { StandardTx, StandardUnsignedTx, UTXOResponse } from 'avalanche/dist/common'
import { digestMessage } from '@/helpers/helper'
import { buildExportTransaction } from '@/js/TxHelper'
import { ChainIdType } from '@/constants'
import { KeyChain } from 'avalanche/dist/apis/evm'

// HD WALLET
// Accounts are not used and the account index is fixed to 0
// m / purpose' / coin_type' / account' / change / address_index

const AVA_TOKEN_INDEX: string = '9000'
export const AVA_ACCOUNT_PATH: string = `m/44'/${AVA_TOKEN_INDEX}'/0'` // Change and index left out
const ETH_ACCOUNT_PATH: string = `m/44'/60'/0'`

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

        let cPrivKey = `PrivateKey-` + bintools.cb58Encode(Buffer.from(ethPrivateKey))
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

    async getEthBalance() {
        let bal = await web3.eth.getBalance(this.ethAddress)
        this.ethBalance = new BN(bal)
        return this.ethBalance
    }

    async sendEth(to: string, amount: BN, gasPrice: BN, gasLimit: number) {
        let receiver = to
        let txAmount = amount
        let fromAddr = this.ethAddress

        let account = web3.eth.accounts.privateKeyToAccount(this.ethKey)

        const txConfig = {
            from: fromAddr,
            gasPrice: gasPrice,
            gas: gasLimit,
            to: receiver,
            value: txAmount.toString(), // in wei
            data: '',
        }

        let signedTx = await account.signTransaction(txConfig)
        let err,
            receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction as string)

        if (err) {
            console.error(err)
            throw err
        }

        return receipt.transactionHash
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
        let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain
        let utxoSet: PlatformUTXOSet = this.platformHelper.utxoSet as PlatformUTXOSet

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        let pAddressStrings = keychain.getAddressStrings()

        let stakeAmount = amt

        // If reward address isn't given use index 0 address
        if (!rewardAddress) {
            rewardAddress = this.getPlatformRewardAddress()
        }

        // For change address use first available on the platform chain
        let changeAddress = this.platformHelper.getFirstAvailableAddress()

        // Stake is always returned to address at index 0
        let stakeReturnAddr = this.getPlatformRewardAddress()

        // Convert dates to unix time
        let startTime = new BN(Math.round(start.getTime() / 1000))
        let endTime = new BN(Math.round(end.getTime() / 1000))

        const unsignedTx = await pChain.buildAddValidatorTx(
            utxoSet,
            [stakeReturnAddr],
            pAddressStrings, // from
            [changeAddress], // change
            nodeID,
            startTime,
            endTime,
            stakeAmount,
            [rewardAddress],
            delegationFee
        )
        let tx = unsignedTx.sign(keychain)

        // Update UTXOS
        setTimeout(async () => {
            this.getUTXOs()
        }, 3000)
        return pChain.issueTx(tx)
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
        let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain
        let utxoSet: PlatformUTXOSet = this.platformHelper.utxoSet as PlatformUTXOSet

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        let pAddressStrings = keychain.getAddressStrings()
        let stakeAmount = amt

        // If reward address isn't given use index 0 address
        if (!rewardAddress) {
            rewardAddress = this.getPlatformRewardAddress()
        }

        // For change address use first available on the platform chain
        let changeAddr = this.platformHelper.getFirstAvailableAddress()

        // Stake is always returned to address at index 0
        let stakeReturnAddr = this.getPlatformRewardAddress()

        // Convert dates to unix time
        let startTime = new BN(Math.round(start.getTime() / 1000))
        let endTime = new BN(Math.round(end.getTime() / 1000))

        const unsignedTx = await pChain.buildAddDelegatorTx(
            utxoSet,
            [stakeReturnAddr],
            pAddressStrings,
            [changeAddr],
            nodeID,
            startTime,
            endTime,
            stakeAmount,
            [rewardAddress] // reward address
        )
        const tx = unsignedTx.sign(keychain)
        // Update UTXOS
        setTimeout(async () => {
            this.getUTXOs()
        }, 3000)

        return pChain.issueTx(tx)
    }

    async chainTransfer(
        amt: BN,
        sourceChain: ChainIdType,
        destinationChain: ChainIdType
    ): Promise<string> {
        let fee = avm.getTxFee()
        let amtFee = amt.add(fee)

        if (destinationChain === 'C') {
            // C Chain imports/exports do not have a fee
            amtFee = amt
        }

        // Get from addresses
        if (sourceChain === 'X') {
            let destinationAddr
            if (destinationChain === 'P') {
                destinationAddr = this.getCurrentPlatformAddress()
            } else {
                // C Chain
                // todo: replace with shared wallet class method
                destinationAddr = this.ethAddressBech
            }

            let fromAddresses = this.getAllAddressesX()
            let changeAddress = this.getChangeAddress()
            let utxos = this.getUTXOSet()
            let exportTx = (await buildExportTransaction(
                sourceChain,
                destinationChain,
                utxos,
                fromAddresses,
                destinationAddr,
                amtFee,
                changeAddress
            )) as AVMUnsignedTx

            let tx = await this.sign<AVMUnsignedTx, AVMTx>(exportTx)
            return avm.issueTx(tx)
        } else if (sourceChain === 'P') {
            let destinationAddr = this.getCurrentAddress()
            let fromAddresses = this.getAllAddressesP()

            let changeAddress = this.getCurrentPlatformAddress()
            let utxos = this.getPlatformUTXOSet()

            let exportTx = (await buildExportTransaction(
                sourceChain,
                destinationChain,
                utxos,
                fromAddresses,
                destinationAddr,
                amtFee,
                changeAddress
            )) as PlatformUnsignedTx

            let tx = await this.sign<PlatformUnsignedTx, PlatformTx>(exportTx, false)

            return pChain.issueTx(tx)
        } else if (sourceChain === 'C') {
            let destinationAddr = this.getCurrentAddress()
            let fromAddresses = [this.ethAddress]
            let changeAddress = this.ethAddressBech
            let utxos = this.getPlatformUTXOSet()

            let exportTx = (await buildExportTransaction(
                sourceChain,
                destinationChain,
                utxos,
                fromAddresses,
                destinationAddr,
                amtFee,
                changeAddress,
                this.ethAddressBech
            )) as EVMUnsignedTx

            let tx = await exportTx.sign(this.ethKeyChain)
            return cChain.issueTx(tx)
        } else {
            throw 'Invalid source chain.'
        }
    }

    // TODO: Move to Core HD file
    async importToCChain(): Promise<string> {
        const utxoResponse: UTXOResponse = await cChain.getUTXOs(
            this.ethAddressBech,
            avm.getBlockchainID()
        )
        const utxoSet: EVMUTXOSet = utxoResponse.utxos

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        let toAddress = '0x' + this.ethAddress
        let ownerAddresses = [this.ethAddressBech]
        let fromAddresses = ownerAddresses
        let sourceChain = avm.getBlockchainID()

        const unsignedTx = await cChain.buildImportTx(
            utxoSet,
            toAddress,
            ownerAddresses,
            sourceChain,
            fromAddresses
        )
        let keyChain = this.ethKeyChain
        const tx = unsignedTx.sign(keyChain)
        let id = await cChain.issueTx(tx)

        return id
    }

    // TODO: Move to Core HD file
    async importToPlatformChain(): Promise<string> {
        // await this.platformHelper.findHdIndex();
        const utxoSet = (await this.platformHelper.getAtomicUTXOs()) as PlatformUTXOSet

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        let keyChain = this.platformHelper.getKeychain() as PlatformVMKeyChain
        let pAddrs = keyChain.getAddressStrings()
        // Owner addresses, the addresses we exported to
        let pToAddr = this.platformHelper.getCurrentAddress()

        let hrp = ava.getHRP()
        let utxoAddrs = utxoSet
            .getAddresses()
            .map((addr) => bintools.addressToString(hrp, 'P', addr))
        let fromAddrs = utxoAddrs
        let ownerAddrs = utxoAddrs

        const unsignedTx = await pChain.buildImportTx(
            utxoSet,
            ownerAddrs,
            avm.getBlockchainID(),
            [pToAddr],
            [pToAddr],
            [pToAddr],
            undefined,
            undefined
        )
        const tx = unsignedTx.sign(keyChain)

        return pChain.issueTx(tx)
    }

    // TODO: Move to Core HD file
    async importToXChain(sourceChain: ChainIdType) {
        const utxoSet = (await this.externalHelper.getAtomicUTXOs()) as AVMUTXOSet

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        let keyChain = this.getKeyChain() as AVMKeyChain
        // let xAddrs = keyChain.getAddressStrings()
        let xToAddr = this.externalHelper.getCurrentAddress()

        let hrp = ava.getHRP()
        let utxoAddrs = utxoSet
            .getAddresses()
            .map((addr) => bintools.addressToString(hrp, 'X', addr))

        let fromAddrs = utxoAddrs
        let ownerAddrs = utxoAddrs

        let sourceChainId
        if (sourceChain === 'P') {
            sourceChainId = pChain.getBlockchainID()
        } else {
            sourceChainId = cChain.getBlockchainID()
        }
        // Owner addresses, the addresses we exported to
        const unsignedTx = await avm.buildImportTx(
            utxoSet,
            ownerAddrs,
            sourceChainId,
            [xToAddr],
            fromAddrs,
            [xToAddr]
        )
        const tx = unsignedTx.sign(keyChain)

        return avm.issueTx(tx)
    }

    async issueBatchTx(
        orders: (ITransaction | AVMUTXO)[],
        addr: string,
        memo: Buffer | undefined
    ): Promise<string> {
        let unsignedTx = await this.buildUnsignedTransaction(orders, addr, memo)
        let keychain = this.getKeyChain()

        const tx = unsignedTx.sign(keychain)
        const txId: string = await avm.issueTx(tx)

        // // TODO: This might not be necessary anymore
        // setTimeout(async () => {
        //     // Find the new HD index
        //     this.internalHelper.findHdIndex()
        //     this.externalHelper.findHdIndex()
        //     this.platformHelper.findHdIndex()
        // }, 2000)

        return txId
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

    async sign<
        UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx,
        SignedTx extends AVMTx | PlatformTx
    >(unsignedTx: UnsignedTx, isAVM: boolean = true): Promise<SignedTx> {
        let keychain = this.getKeyChain()
        let keychainP = this.platformHelper.getKeychain() as PlatformVMKeyChain

        if (isAVM) {
            const tx = (unsignedTx as AVMUnsignedTx).sign(keychain)
            return tx as SignedTx
        } else {
            const tx = (unsignedTx as PlatformUnsignedTx).sign(keychainP)
            return tx as SignedTx
        }
    }

    async signMessage(msgStr: string, address: string): Promise<string> {
        let index = this.externalHelper.findAddressIndex(address)

        if (index === null) throw 'Address not found.'

        let key = this.externalHelper.getKeyForIndex(index) as AVMKeyPair
        let digest = digestMessage(msgStr)

        // Convert to the other Buffer and sign
        let digestHex = digest.toString('hex')
        let digestBuff = Buffer.from(digestHex, 'hex')
        let signed = key.sign(digestBuff)

        return bintools.cb58Encode(signed)
    }

    async createNftFamily(name: string, symbol: string, groupNum: number) {
        let tx = await this.buildCreateNftFamilyTx(name, symbol, groupNum)
        let signed = await this.sign<AVMUnsignedTx, AVMTx>(tx)
        return await avm.issueTx(signed)
    }

    async mintNft(mintUtxo: AVMUTXO, payload: PayloadBase, quantity: number) {
        let tx = await this.buildMintNftTx(
            mintUtxo,
            payload,
            quantity,
            this.getCurrentAddress(),
            this.getChangeAddress()
        )
        let signed = await this.sign<AVMUnsignedTx, AVMTx>(tx)
        let txId = await avm.issueTx(signed)
        return txId
    }
}
