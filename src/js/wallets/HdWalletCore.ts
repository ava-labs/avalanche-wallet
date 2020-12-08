import { AvaWalletCore } from '@/js/wallets/IAvaHdWallet'
import {
    AssetAmountDestination,
    BaseTx,
    TransferableInput,
    TransferableOutput,
    Tx,
    UnsignedTx,
    UTXO,
    UTXOSet,
} from 'avalanche/dist/apis/avm'

import { BN, Buffer } from 'avalanche'
import { ITransaction } from '@/components/wallet/transfer/types'
import { ava, avm, bintools, pChain } from '@/AVA'
import { UTXOSet as AVMUTXOSet } from 'avalanche/dist/apis/avm/utxos'
import HDKey from 'hdkey'
import { HdHelper } from '@/js/HdHelper'
import { UTXOSet as PlatformUTXOSet } from 'avalanche/dist/apis/platformvm/utxos'
import createHash from 'create-hash'
import { buildUnsignedTransaction } from '../TxHelper'

// A base class other HD wallets are based on.
// Mnemonic Wallet and LedgerWallet uses this

class HdWalletCore {
    chainId: string
    utxoset: UTXOSet
    platformUtxoset: PlatformUTXOSet
    stakeAmount: BN

    internalHelper: HdHelper
    externalHelper: HdHelper
    platformHelper: HdHelper

    constructor(accountHdKey: HDKey, isPublic = true) {
        this.chainId = avm.getBlockchainAlias() || avm.getBlockchainID()
        this.utxoset = new AVMUTXOSet()
        this.platformUtxoset = new PlatformUTXOSet()
        this.stakeAmount = new BN(0)

        this.externalHelper = new HdHelper(
            'm/0',
            accountHdKey,
            undefined,
            isPublic
        )
        this.internalHelper = new HdHelper(
            'm/1',
            accountHdKey,
            undefined,
            isPublic
        )
        this.platformHelper = new HdHelper('m/0', accountHdKey, 'P', isPublic)
    }

    getUTXOSet(): AVMUTXOSet {
        return this.utxoset
    }

    async getUTXOs(): Promise<AVMUTXOSet> {
        let setInternal = (await this.internalHelper.updateUtxos()) as AVMUTXOSet
        let setExternal = (await this.externalHelper.updateUtxos()) as AVMUTXOSet
        // platform utxos are updated but not returned by function
        let setPlatform = (await this.platformHelper.updateUtxos()) as PlatformUTXOSet

        this.getStake()

        let joined = setInternal.merge(setExternal)
        this.utxoset = joined
        return joined
    }

    async getPlatformUTXOs(): Promise<PlatformUTXOSet> {
        let setPlatform = (await this.platformHelper.updateUtxos()) as PlatformUTXOSet

        return setPlatform
    }

    getAllDerivedExternalAddresses(): string[] {
        return this.externalHelper.getAllDerivedAddresses()
    }

    getDerivedAddresses(): string[] {
        let internal = this.internalHelper.getAllDerivedAddresses()
        let external = this.externalHelper.getAllDerivedAddresses()
        return internal.concat(external)
    }

    // Returns addresses to check for history
    getHistoryAddresses(): string[] {
        let internalIndex = this.internalHelper.hdIndex
        let externalIndex = this.externalHelper.hdIndex

        let internal = this.internalHelper.getAllDerivedAddresses(internalIndex)
        let external = this.externalHelper.getAllDerivedAddresses(externalIndex)
        return internal.concat(external)
    }

    getExtendedPlatformAddresses(): string[] {
        let index = this.platformHelper.hdIndex
        let addrs = this.platformHelper.getAllDerivedAddresses(index + 20)
        return addrs
    }

    getCurrentAddress(): string {
        return this.externalHelper.getCurrentAddress()
    }

    getChangeAddress(): string {
        return this.internalHelper.getCurrentAddress()
    }

    getPlatformRewardAddress(): string {
        return this.platformHelper.getCurrentAddress()
    }

    getCurrentPlatformAddress(): string {
        return this.platformHelper.getCurrentAddress()
    }

    getPlatformUTXOSet() {
        return this.platformHelper.utxoSet as PlatformUTXOSet
    }

    getBaseAddress() {
        return this.externalHelper.getAddressForIndex(0)
    }

    // helper method to get all stake for more than 256 addresses
    async getAllStake(addrs: string[]): Promise<BN> {
        if (addrs.length <= 256) {
            return await pChain.getStake(addrs)
        } else {
            //Break the list in to 1024 chunks
            let chunk = addrs.slice(0, 256)
            let remainingChunk = addrs.slice(256)

            let chunkStake = await pChain.getStake(chunk)
            return chunkStake.add(await this.getAllStake(remainingChunk))
        }
    }

    async getStake(): Promise<BN> {
        // let xIndex = Math.max(this.externalHelper.hdIndex,this.internalHelper.hdIndex);
        // let pIndex = Math.max(this.platformHelper.hdIndex);
        // let uptoIndex = Math.max(xIndex, pIndex);
        let uptoIndex = this.platformHelper.hdIndex + 40
        let addrs = this.platformHelper.getAllDerivedAddresses(uptoIndex)
        let res = await this.getAllStake(addrs)
        this.stakeAmount = res
        return res
    }

    onnetworkchange(): void {
        this.externalHelper.onNetworkChange()
        this.internalHelper.onNetworkChange()
        this.platformHelper.onNetworkChange()
    }

    async buildUnsignedTransaction(
        orders: (ITransaction | UTXO)[],
        addr: string,
        memo?: Buffer
    ) {
        const changeAddress = this.getChangeAddress()
        const derivedAddresses: string[] = this.getDerivedAddresses()
        const utxoset = this.getUTXOSet()

        return buildUnsignedTransaction(
            orders,
            addr,
            derivedAddresses,
            utxoset,
            changeAddress,
            memo
        )
    }
}
export { HdWalletCore }
