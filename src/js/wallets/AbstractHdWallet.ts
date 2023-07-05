import { ChainAlias } from '@/js/wallets/types'
import { UTXO } from 'avalanche/dist/apis/avm'

import { BN, Buffer } from 'avalanche'
import { ITransaction } from '@/components/wallet/transfer/types'
import { ava, avm, bintools, pChain } from '@/AVA'
import { UTXOSet as AVMUTXOSet } from 'avalanche/dist/apis/avm/utxos'
import HDKey from 'hdkey'
import { HdHelper } from '@/js/HdHelper'
import { UTXOSet as PlatformUTXOSet } from 'avalanche/dist/apis/platformvm/utxos'
import { buildUnsignedTransaction } from '../TxHelper'
import { AbstractWallet } from '@/js/wallets/AbstractWallet'
import { updateFilterAddresses } from '../../providers'
import { digestMessage } from '@/helpers/helper'

/**
 * A base class other HD wallets are based on.
 * Mnemonic Wallet and LedgerWallet uses this
 */
abstract class AbstractHdWallet extends AbstractWallet {
    chainId: string

    internalHelper: HdHelper
    externalHelper: HdHelper
    platformHelper: HdHelper

    ethHdNode: HDKey
    protected accountNodeXP: HDKey

    constructor(accountHdKey: HDKey, ethHdNode: HDKey, isPublic = true) {
        super()
        this.ethHdNode = ethHdNode
        this.chainId = avm.getBlockchainAlias() || avm.getBlockchainID()
        this.externalHelper = new HdHelper('m/0', accountHdKey, undefined, isPublic)
        this.internalHelper = new HdHelper('m/1', accountHdKey, undefined, isPublic)
        this.platformHelper = new HdHelper('m/0', accountHdKey, 'P', isPublic)
        this.accountNodeXP = accountHdKey

        this.externalHelper.oninit().then((res) => {
            this.updateInitState()
        })
        this.internalHelper.oninit().then((res) => {
            this.updateInitState()
        })
        this.platformHelper.oninit().then((res) => {
            this.updateInitState()
        })
    }

    getXpubXP() {
        return this.accountNodeXP.toJSON().xpub
    }

    getEvmAddressBech(): string {
        return bintools.addressToString(
            ava.getHRP(),
            'C',
            // @ts-ignore
            this.ethHdNode.pubKeyHash
        )
    }

    updateAvmUTXOSet(): void {
        // if (this.isFetchUtxos) return
        const setExternal = this.externalHelper.utxoSet as AVMUTXOSet
        const setInternal = this.internalHelper.utxoSet as AVMUTXOSet

        const joined = setInternal.merge(setExternal)
        this.utxoset = joined
    }

    updateFetchState() {
        this.isFetchUtxos =
            this.externalHelper.isFetchUtxo ||
            this.internalHelper.isFetchUtxo ||
            this.platformHelper.isFetchUtxo
    }

    updateInitState() {
        this.isInit =
            this.externalHelper.isInit && this.internalHelper.isInit && this.platformHelper.isInit

        if (this.isInit) {
            updateFilterAddresses()
        }
    }
    // Fetches the utxos
    async getUTXOs(): Promise<void> {
        this.updateUTXOsX()

        // platform utxos are updated but not returned by function
        this.updateUTXOsP()

        return
    }

    async updateUTXOsX() {
        this.updateUTXOsExternal()
        this.updateUTXOsInternal()
    }

    async updateUTXOsExternal() {
        const res = await this.externalHelper.updateUtxos()
        this.updateFetchState()
        this.updateAvmUTXOSet()
    }

    async updateUTXOsInternal() {
        const utxoSet = await this.internalHelper.updateUtxos()
        this.updateFetchState()
        this.updateAvmUTXOSet()
    }

    async updateUTXOsP() {
        const utxoSet = await this.platformHelper.updateUtxos()
        this.updateFetchState()
    }

    getAllDerivedExternalAddresses(): string[] {
        return this.externalHelper.getAllDerivedAddresses()
    }

    getAllChangeAddressesX(): string[] {
        return this.internalHelper.getAllDerivedAddresses()
    }

    getAllExternalAddressesX(): string[] {
        return this.externalHelper.getAllDerivedAddresses()
    }

    getDerivedAddresses(): string[] {
        const internal = this.internalHelper.getAllDerivedAddresses()
        const external = this.externalHelper.getAllDerivedAddresses()
        return internal.concat(external)
    }

    getDerivedAddressesP(): string[] {
        return this.platformHelper.getAllDerivedAddresses()
    }

    getAllAddressesX() {
        return this.getDerivedAddresses()
    }

    getAllAddressesP() {
        return this.getDerivedAddressesP()
    }
    // Returns addresses to check for history
    getHistoryAddresses(): string[] {
        const internalIndex = this.internalHelper.hdIndex

        const evmBech32 = this.getEvmAddressBech()
        // They share the same address space, so whatever has the highest index
        const externalIndex = Math.max(this.externalHelper.hdIndex, this.platformHelper.hdIndex)

        const internal = this.internalHelper.getAllDerivedAddresses(internalIndex)
        const external = this.externalHelper.getAllDerivedAddresses(externalIndex)
        return [...internal, ...external, evmBech32]
    }

    getCurrentAddressAvm(): string {
        return this.externalHelper.getCurrentAddress()
    }

    getChangeAddressAvm() {
        return this.internalHelper.getCurrentAddress()
    }

    getChangePath(chainId?: ChainAlias): string {
        switch (chainId) {
            case 'P':
                return this.platformHelper.changePath
            case 'X':
            default:
                return this.internalHelper.changePath
        }
    }

    getChangeIndex(chainId?: ChainAlias): number {
        switch (chainId) {
            case 'P':
                return this.platformHelper.hdIndex
            case 'X':
            default:
                return this.internalHelper.hdIndex
        }
    }

    getChangeFromIndex(idx?: number, chainId?: ChainAlias): string | null {
        if (idx === undefined || idx === null) return null

        switch (chainId) {
            case 'P':
                return this.platformHelper.getAddressForIndex(idx)
            case 'X':
            default:
                return this.internalHelper.getAddressForIndex(idx)
        }
    }

    getCurrentAddressPlatform(): string {
        return this.platformHelper.getCurrentAddress()
    }

    getPlatformUTXOSet() {
        return this.platformHelper.utxoSet as PlatformUTXOSet
    }

    getPlatformActiveIndex() {
        return this.platformHelper.hdIndex
    }

    getExternalActiveIndex() {
        return this.externalHelper.hdIndex
    }

    getBaseAddress() {
        return this.externalHelper.getAddressForIndex(0)
    }

    onnetworkchange(): void {
        this.isInit = false
        this.stakeAmount = new BN(0)

        this.externalHelper.onNetworkChange().then(() => {
            this.updateInitState()
        })
        this.internalHelper.onNetworkChange().then(() => {
            this.updateInitState()
        })
        this.platformHelper.onNetworkChange().then(() => {
            this.updateInitState()
        })

        // TODO: Handle EVM changes
    }

    async buildUnsignedTransaction(orders: (ITransaction | UTXO)[], addr: string, memo?: Buffer) {
        const changeAddress = this.getChangeAddressAvm()
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

    findExternalAddressIndex(address: string): number | null {
        // TODO: Look for P addresses too
        const indexX = this.externalHelper.findAddressIndex(address)
        const indexP = this.platformHelper.findAddressIndex(address)

        const index = indexX !== null ? indexX : indexP

        if (indexX === null && indexP === null) throw new Error('Address not found.')
        return index
    }

    async signMessageByExternalAddress(msgStr: string, address: string) {
        const index = this.findExternalAddressIndex(address)
        if (index === null) throw new Error('Address not found.')
        return await this.signMessageByExternalIndex(msgStr, index)
    }

    async signMessageByExternalIndex(msgStr: string, index: number): Promise<string> {
        const digest = digestMessage(msgStr)

        // Convert to the other Buffer and sign
        const digestHex = digest.toString('hex')
        const digestBuff = Buffer.from(digestHex, 'hex')

        return await this.signHashByExternalIndex(index, digestBuff)
    }

    async signMessage(msg: string, address: string) {
        return await this.signMessageByExternalAddress(msg, address)
    }

    abstract signHashByExternalIndex(index: number, hash: Buffer): Promise<string>
}
export { AbstractHdWallet }
