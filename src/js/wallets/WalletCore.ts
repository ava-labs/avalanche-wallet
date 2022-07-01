/*
The base wallet class used for common functionality
*/
import { BN } from 'avalanche'
import { UTXOSet as AVMUTXOSet } from 'avalanche/dist/apis/avm'
import { UTXOSet as PlatformUTXOSet } from 'avalanche/dist/apis/platformvm'
import {
    ExportChainsC,
    ExportChainsP,
    ExportChainsX,
    UtxoHelper,
    TxHelper,
    GasHelper,
    chainIdFromAlias,
    xChain,
} from '@avalabs/avalanche-wallet-sdk'
import { ava, avm, bintools, cChain, pChain } from '@/AVA'
import { UTXOSet as EVMUTXOSet } from 'avalanche/dist/apis/evm/utxos'
import { Tx as EVMTx, UnsignedTx as EVMUnsignedTx } from 'avalanche/dist/apis/evm/tx'
import {
    Tx as PlatformTx,
    UnsignedTx as PlatformUnsignedTx,
} from 'avalanche/dist/apis/platformvm/tx'
import { Tx as AVMTx, UnsignedTx as AVMUnsignedTx } from 'avalanche/dist/apis/avm/tx'
import { AvmImportChainType, WalletType } from '@/js/wallets/types'
import { issueC, issueP, issueX } from '@/helpers/issueTx'
const uniqid = require('uniqid')

abstract class WalletCore {
    id: string

    utxoset: AVMUTXOSet
    platformUtxoset: PlatformUTXOSet
    stakeAmount: BN

    isFetchUtxos: boolean
    isInit: boolean

    abstract getEvmAddressBech(): string
    abstract getEvmAddress(): string
    abstract getCurrentAddressAvm(): string
    abstract getChangeAddressAvm(): string
    abstract getCurrentAddressPlatform(): string
    abstract getAllAddressesP(): string[]
    abstract getAllAddressesX(): string[]

    abstract async signC(unsignedTx: EVMUnsignedTx): Promise<EVMTx>
    abstract async signX(unsignedTx: AVMUnsignedTx): Promise<AVMTx>
    abstract async signP(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx>

    abstract async signMessage(msg: string, address?: string): Promise<string>
    abstract getPlatformUTXOSet(): PlatformUTXOSet

    getUTXOSet(): AVMUTXOSet {
        return this.utxoset
    }

    protected constructor() {
        this.id = uniqid()
        this.utxoset = new AVMUTXOSet()
        this.platformUtxoset = new PlatformUTXOSet()
        this.stakeAmount = new BN(0)

        this.isInit = false
        this.isFetchUtxos = false
    }

    async evmGetAtomicUTXOs(sourceChain: ExportChainsC) {
        const addrs = [this.getEvmAddressBech()]
        return await UtxoHelper.evmGetAtomicUTXOs(addrs, sourceChain)
    }

    async createImportTxC(sourceChain: ExportChainsC, utxoSet: EVMUTXOSet, fee: BN) {
        const bechAddr = this.getEvmAddressBech()
        const hexAddr = this.getEvmAddress()

        const toAddress = '0x' + hexAddr
        const ownerAddresses = [bechAddr]
        const fromAddresses = ownerAddresses
        const sourceChainId = chainIdFromAlias(sourceChain)

        return await cChain.buildImportTx(
            utxoSet,
            toAddress,
            ownerAddresses,
            sourceChainId,
            fromAddresses,
            fee
        )
    }

    /**
     *
     * @param sourceChain
     * @param fee Fee to use in nAVAX
     * @param utxoSet
     */
    async importToCChain(sourceChain: ExportChainsC, fee: BN, utxoSet?: EVMUTXOSet) {
        if (!utxoSet) {
            utxoSet = await this.evmGetAtomicUTXOs(sourceChain)
        }

        // TODO: Only use AVAX utxos
        // TODO?: If the import fee for a utxo is greater than the value of the utxo, ignore it

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        const unsignedTxFee = await this.createImportTxC(sourceChain, utxoSet, fee)
        const tx = await this.signC(unsignedTxFee)
        return this.issueC(tx)
    }

    protected async issueX(tx: AVMTx) {
        return issueX(tx)
    }

    protected async issueP(tx: PlatformTx) {
        return issueP(tx)
    }

    protected async issueC(tx: EVMTx) {
        return issueC(tx)
    }

    async exportFromXChain(amt: BN, destinationChain: ExportChainsX, importFee?: BN) {
        if (destinationChain === 'C' && !importFee)
            throw new Error('Exports to C chain must specify an import fee.')

        let amtFee = amt.clone()

        // Get destination address
        const destinationAddr =
            destinationChain === 'P' ? this.getCurrentAddressPlatform() : this.getEvmAddressBech()

        // Add import fee to transaction
        if (importFee) {
            amtFee = amt.add(importFee)
        } else if (destinationChain === 'P') {
            const fee = pChain.getTxFee()
            amtFee = amt.add(fee)
        }

        const fromAddresses = this.getAllAddressesX()
        const changeAddress = this.getChangeAddressAvm()
        const utxos = this.getUTXOSet()
        const exportTx = await TxHelper.buildAvmExportTransaction(
            destinationChain,
            utxos,
            fromAddresses,
            destinationAddr,
            amtFee,
            changeAddress
        )

        const tx = await this.signX(exportTx)

        return this.issueX(tx)
    }

    async exportFromPChain(amt: BN, destinationChain: ExportChainsP, importFee?: BN) {
        const utxoSet = this.getPlatformUTXOSet()

        const pChangeAddr = this.getCurrentAddressPlatform()
        const fromAddrs = this.getAllAddressesP()

        if (destinationChain === 'C' && !importFee)
            throw new Error('Exports to C chain must specify an import fee.')

        // Calculate C chain import fee
        let amtFee = amt.clone()
        if (importFee) {
            amtFee = amt.add(importFee)
        } else if (destinationChain === 'X') {
            // We can add the import fee for X chain
            const fee = avm.getTxFee()
            amtFee = amt.add(fee)
        }

        // Get the destination address for the right chain
        const destinationAddr =
            destinationChain === 'C' ? this.getEvmAddressBech() : this.getCurrentAddressAvm()

        const exportTx = await TxHelper.buildPlatformExportTransaction(
            utxoSet,
            fromAddrs,
            destinationAddr,
            amtFee,
            pChangeAddr,
            destinationChain
        )

        const tx = await this.signP(exportTx)
        return await this.issueP(tx)
    }

    /**
     *
     * @param amt The amount to receive on the destination chain, in nAVAX.
     * @param destinationChain `X` or `P`
     * @param fee Fee to use in the export transaction, given in nAVAX.
     */
    async exportFromCChain(amt: BN, destinationChain: ExportChainsC, exportFee: BN) {
        // Add import fee
        // X and P have the same fee
        const importFee = avm.getTxFee()
        const amtFee = amt.add(importFee)

        const hexAddr = this.getEvmAddress()
        const bechAddr = this.getEvmAddressBech()

        const fromAddresses = [hexAddr]

        const destinationAddr =
            destinationChain === 'X'
                ? this.getCurrentAddressAvm()
                : this.getCurrentAddressPlatform()

        const exportTx = await TxHelper.buildEvmExportTransaction(
            fromAddresses,
            destinationAddr,
            amtFee,
            bechAddr,
            destinationChain,
            exportFee
        )

        const tx = await this.signC(exportTx)
        return this.issueC(tx)
    }

    /**
     * Returns the estimated gas to export from C chain.
     * @param destinationChain
     * @param amount
     */
    async estimateExportFee(destinationChain: ExportChainsC, amount: BN): Promise<number> {
        const hexAddr = this.getEvmAddress()
        const bechAddr = this.getEvmAddressBech()

        const destinationAddr =
            destinationChain === 'X'
                ? this.getCurrentAddressAvm()
                : this.getCurrentAddressPlatform()

        return GasHelper.estimateExportGasFee(
            destinationChain,
            hexAddr,
            bechAddr,
            destinationAddr,
            amount
        )
    }

    async avmGetAtomicUTXOs(sourceChain: ExportChainsX) {
        const addrs = this.getAllAddressesX()
        return await UtxoHelper.avmGetAtomicUTXOs(addrs, sourceChain)
    }

    async platformGetAtomicUTXOs(sourceChain: ExportChainsP) {
        const addrs = this.getAllAddressesP()
        return await UtxoHelper.platformGetAtomicUTXOs(addrs, sourceChain)
    }

    async importToPlatformChain(sourceChain: ExportChainsP): Promise<string> {
        const utxoSet = await this.platformGetAtomicUTXOs(sourceChain)

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        const sourceChainId = chainIdFromAlias(sourceChain)
        // Owner addresses, the addresses we exported to
        const pToAddr = this.getCurrentAddressPlatform()

        const hrp = ava.getHRP()
        const utxoAddrs = utxoSet
            .getAddresses()
            .map((addr) => bintools.addressToString(hrp, 'P', addr))

        const fromAddrs = utxoAddrs
        const ownerAddrs = utxoAddrs

        const unsignedTx = await pChain.buildImportTx(
            utxoSet,
            ownerAddrs,
            sourceChainId,
            [pToAddr],
            [pToAddr],
            [pToAddr],
            undefined,
            undefined
        )
        const tx = await this.signP(unsignedTx)
        // Pass in string because AJS fails to verify Tx type
        return this.issueP(tx)
    }

    async importToXChain(sourceChain: AvmImportChainType) {
        const utxoSet = await this.avmGetAtomicUTXOs(sourceChain)

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        const xToAddr = this.getCurrentAddressAvm()

        const hrp = ava.getHRP()
        const utxoAddrs = utxoSet
            .getAddresses()
            .map((addr) => bintools.addressToString(hrp, 'X', addr))

        const fromAddrs = utxoAddrs
        const ownerAddrs = utxoAddrs

        const sourceChainId = chainIdFromAlias(sourceChain)

        // Owner addresses, the addresses we exported to
        const unsignedTx = await avm.buildImportTx(
            utxoSet,
            ownerAddrs,
            sourceChainId,
            [xToAddr],
            fromAddrs,
            [xToAddr]
        )

        const tx = await this.signX(unsignedTx)
        return this.issueX(tx)
    }
}
export { WalletCore }
