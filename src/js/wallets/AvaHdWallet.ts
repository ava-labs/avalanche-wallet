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
    UTXO,
    AssetAmountDestination,
    UTXOSet,
} from 'avalanche/dist/apis/avm'

import {
    KeyChain as PlatformVMKeyChain,
    UTXOSet as PlatformUTXOSet,
    UnsignedTx as PlatformUnsignedTx,
    Tx as PlatformTx,
} from 'avalanche/dist/apis/platformvm'

import { getPreferredHRP, PayloadBase } from 'avalanche/dist/utils'

import * as bip39 from 'bip39'
import { BN, Buffer } from 'avalanche'
import { ava, avm, bintools, pChain } from '@/AVA'
import { IAvaHdWallet, IIndexKeyCache } from '@/js/wallets/IAvaHdWallet'
import HDKey from 'hdkey'
import { ITransaction } from '@/components/wallet/transfer/types'
import { HdHelper } from '@/js/HdHelper'
import { KeyPair as PlatformVMKeyPair } from 'avalanche/dist/apis/platformvm'
import createHash from 'create-hash'
import { HdWalletCore } from '@/js/wallets/HdWalletCore'
import { WalletType } from '@/store/types'
import { StandardTx, StandardUnsignedTx } from 'avalanche/dist/common'
import { digestMessage } from '@/helpers/helper'

// HD WALLET
// Accounts are not used and the account index is fixed to 0
// m / purpose' / coin_type' / account' / change / address_index

const AVA_TOKEN_INDEX: string = '9000'
const AVA_ACCOUNT_PATH: string = `m/44'/${AVA_TOKEN_INDEX}'/0'` // Change and index left out

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
    type: WalletType

    // The master key from avalanche.js
    constructor(mnemonic: string) {
        let seed: globalThis.Buffer = bip39.mnemonicToSeedSync(mnemonic)
        let masterHdKey: HDKey = HDKey.fromMasterSeed(seed)
        let accountHdKey = masterHdKey.derive(AVA_ACCOUNT_PATH)

        super(accountHdKey, false)

        this.type = 'mnemonic'
        this.seed = seed.toString('hex')
        this.hdKey = masterHdKey
        this.mnemonic = mnemonic
        this.isLoading = false
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
        rewardAddress?: string
    ): Promise<string> {
        let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain
        const utxoSet: PlatformUTXOSet = this.platformHelper.utxoSet as PlatformUTXOSet
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
        rewardAddress?: string
    ): Promise<string> {
        let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain
        const utxoSet: PlatformUTXOSet = this.platformHelper.utxoSet as PlatformUTXOSet

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

    async chainTransfer(amt: BN, sourceChain: string = 'X'): Promise<string> {
        let fee = avm.getTxFee()
        let amtFee = amt.add(fee)

        // EXPORT
        let pId = pChain.getBlockchainID()
        let xId = avm.getBlockchainID()
        let txId
        if (sourceChain === 'X') {
            let keychain = this.getKeyChain()
            let toAddress = this.platformHelper.getCurrentAddress()
            let xChangeAddr = this.internalHelper.getCurrentAddress()
            let fromAddrs = keychain.getAddressStrings()

            // console.log(toAddress);

            let exportTx = await avm.buildExportTx(
                this.utxoset,
                amtFee,
                pId,
                [toAddress],
                fromAddrs,
                [xChangeAddr]
            )
            let tx = exportTx.sign(keychain)
            return avm.issueTx(tx)
        } else if (sourceChain === 'P') {
            let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain
            let utxoSet = this.platformHelper.utxoSet as PlatformUTXOSet
            let toAddress = this.externalHelper.getCurrentAddress()
            let pChangeAddr = this.platformHelper.getCurrentAddress()
            let fromAddrs = keychain.getAddressStrings()

            // console.log(toAddress);

            let exportTx = await pChain.buildExportTx(
                utxoSet,
                amtFee,
                xId,
                [toAddress],
                fromAddrs,
                [pChangeAddr]
            )

            let tx = exportTx.sign(keychain)
            return pChain.issueTx(tx)
        } else {
            throw 'Invalid source chain.'
        }
    }

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

        const unsignedTx = await pChain.buildImportTx(
            utxoSet,
            pAddrs,
            avm.getBlockchainID(),
            [pToAddr],
            [pToAddr],
            [pToAddr],
            undefined,
            undefined
        )
        const tx = unsignedTx.sign(keyChain)

        // Update UTXOS
        setTimeout(async () => {
            await this.getUTXOs()
        }, 3000)

        return pChain.issueTx(tx)
    }

    async importToXChain() {
        const utxoSet = (await this.externalHelper.getAtomicUTXOs()) as AVMUTXOSet

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        let keyChain = this.getKeyChain() as AVMKeyChain
        let xAddrs = keyChain.getAddressStrings()
        let xToAddr = this.externalHelper.getCurrentAddress()

        // Owner addresses, the addresses we exported to
        const unsignedTx = await avm.buildImportTx(
            utxoSet,
            xAddrs,
            pChain.getBlockchainID(),
            [xToAddr],
            xAddrs,
            [xToAddr]
        )
        const tx = unsignedTx.sign(keyChain)

        // // Update UTXOS
        setTimeout(async () => {
            await this.getUTXOs()
        }, 3000)

        return avm.issueTx(tx)
    }

    async issueBatchTx(
        orders: (ITransaction | UTXO)[],
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

    async mintNft(mintUtxo: UTXO, payload: PayloadBase, quantity: number) {
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
