/*
The base wallet class used for common functionality
*/
import { BN } from '@c4tplatform/camino'
import { UTXOSet as AVMUTXOSet } from '@c4tplatform/camino/dist/apis/avm'
import { UTXOSet as PlatformUTXOSet } from '@c4tplatform/camino/dist/apis/platformvm'
import {
    chainIdFromAlias,
    ExportChainsC,
    ExportChainsP,
    ExportChainsX,
    UtxoHelper,
    TxHelper,
    GasHelper,
} from '@c4tplatform/camino-wallet-sdk'
import { ava, bintools } from '@/AVA'
import { UTXOSet as EVMUTXOSet } from '@c4tplatform/camino/dist/apis/evm/utxos'
import { Tx as EVMTx, UnsignedTx as EVMUnsignedTx } from '@c4tplatform/camino/dist/apis/evm/tx'
import {
    Tx as PlatformTx,
    UnsignedTx as PlatformUnsignedTx,
} from '@c4tplatform/camino/dist/apis/platformvm/tx'
import { Tx as AVMTx, UnsignedTx as AVMUnsignedTx } from '@c4tplatform/camino/dist/apis/avm/tx'
import { AvmImportChainType } from '@/js/wallets/types'
import { ExportTx as PlatformExportTx } from '@c4tplatform/camino/dist/apis/platformvm'

var uniqid = require('uniqid')

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

    abstract signC(unsignedTx: EVMUnsignedTx): Promise<EVMTx>
    abstract signX(unsignedTx: AVMUnsignedTx): Promise<AVMTx>
    abstract signP(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx>

    abstract signMessage(msg: string, address?: string): Promise<string>
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
        let addrs = [this.getEvmAddressBech()]
        return await UtxoHelper.evmGetAtomicUTXOs(addrs, sourceChain)
    }

    async createImportTxC(sourceChain: ExportChainsC, utxoSet: EVMUTXOSet, fee: BN) {
        let bechAddr = this.getEvmAddressBech()
        let hexAddr = this.getEvmAddress()

        let toAddress = '0x' + hexAddr
        let ownerAddresses = [bechAddr]
        let fromAddresses = ownerAddresses
        const sourceChainId = chainIdFromAlias(sourceChain)

        return await ava
            .CChain()
            .buildImportTx(utxoSet, toAddress, ownerAddresses, sourceChainId, fromAddresses, fee)
    }

    /**
     *
     * @param sourceChain
     * @param fee Fee to use in nNative
     * @param utxoSet
     */
    async importToCChain(sourceChain: ExportChainsC, fee: BN, utxoSet?: EVMUTXOSet) {
        if (!utxoSet) {
            utxoSet = await this.evmGetAtomicUTXOs(sourceChain)
        }

        // TODO: Only use native Asset utxos
        // TODO?: If the import fee for a utxo is greater than the value of the utxo, ignore it

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        const unsignedTxFee = await this.createImportTxC(sourceChain, utxoSet, fee)
        let tx = await this.signC(unsignedTxFee)
        let id = await ava.CChain().issueTx(tx.toString())

        return id
    }

    async exportFromXChain(amt: BN, destinationChain: ExportChainsX, importFee?: BN) {
        if (destinationChain === 'C' && !importFee)
            throw new Error('Exports to C chain must specify an import fee.')

        let amtFee = amt.clone()

        // Get destination address
        let destinationAddr =
            destinationChain === 'P' ? this.getCurrentAddressPlatform() : this.getEvmAddressBech()

        // Add import fee to transaction
        if (importFee) {
            amtFee = amt.add(importFee)
        } else if (destinationChain === 'P') {
            let fee = ava.PChain().getTxFee()
            amtFee = amt.add(fee)
        }

        let fromAddresses = this.getAllAddressesX()
        let changeAddress = this.getChangeAddressAvm()
        let utxos = this.getUTXOSet()
        let exportTx = await TxHelper.buildAvmExportTransaction(
            destinationChain,
            utxos,
            fromAddresses,
            destinationAddr,
            amtFee,
            changeAddress
        )

        const eTx = (exportTx.getTransaction() as unknown) as PlatformExportTx
        let tx = await this.signX(exportTx)

        return ava.XChain().issueTx(tx)
    }

    async exportFromPChain(amt: BN, destinationChain: ExportChainsP, importFee?: BN) {
        let utxoSet = this.getPlatformUTXOSet()

        let pChangeAddr = this.getCurrentAddressPlatform()
        let fromAddrs = this.getAllAddressesP()

        if (destinationChain === 'C' && !importFee)
            throw new Error('Exports to C chain must specify an import fee.')

        // Calculate C chain import fee
        let amtFee = amt.clone()
        if (importFee) {
            amtFee = amt.add(importFee)
        } else if (destinationChain === 'X') {
            // We can add the import fee for X chain
            let fee = ava.XChain().getTxFee()
            amtFee = amt.add(fee)
        }

        // Get the destination address for the right chain
        let destinationAddr =
            destinationChain === 'C' ? this.getEvmAddressBech() : this.getCurrentAddressAvm()

        const exportTx = await TxHelper.buildPlatformExportTransaction(
            utxoSet,
            fromAddrs,
            destinationAddr,
            amtFee,
            pChangeAddr,
            destinationChain
        )

        let tx = await this.signP(exportTx)
        return await ava.PChain().issueTx(tx)
    }

    /**
     *
     * @param amt The amount to receive on the destination chain, in nNative.
     * @param destinationChain `X` or `P`
     * @param fee Fee to use in the export transaction, given in nNative.
     */
    async exportFromCChain(amt: BN, destinationChain: ExportChainsC, exportFee: BN) {
        // Add import fee
        // X and P have the same fee
        let importFee = ava.XChain().getTxFee()
        let amtFee = amt.add(importFee)

        let hexAddr = this.getEvmAddress()
        let bechAddr = this.getEvmAddressBech()

        let fromAddresses = [hexAddr]

        let destinationAddr =
            destinationChain === 'X'
                ? this.getCurrentAddressAvm()
                : this.getCurrentAddressPlatform()

        let exportTx = await TxHelper.buildEvmExportTransaction(
            fromAddresses,
            destinationAddr,
            amtFee,
            bechAddr,
            destinationChain,
            exportFee
        )

        let tx = await this.signC(exportTx)
        return ava.CChain().issueTx(tx.toString())
    }

    /**
     * Returns the estimated gas to export from C chain.
     * @param destinationChain
     * @param amount
     */
    async estimateExportFee(destinationChain: ExportChainsC, amount: BN): Promise<number> {
        let hexAddr = this.getEvmAddress()
        let bechAddr = this.getEvmAddressBech()

        let destinationAddr =
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
        let addrs = this.getAllAddressesX()
        return await UtxoHelper.avmGetAtomicUTXOs(addrs, sourceChain)
    }

    async platformGetAtomicUTXOs(sourceChain: ExportChainsP) {
        let addrs = this.getAllAddressesP()
        return await UtxoHelper.platformGetAtomicUTXOs(addrs, sourceChain)
    }

    async importToPlatformChain(sourceChain: ExportChainsP): Promise<string> {
        const utxoSet = await this.platformGetAtomicUTXOs(sourceChain)

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        const sourceChainId = chainIdFromAlias(sourceChain)
        // Owner addresses, the addresses we exported to
        let pToAddr = this.getCurrentAddressPlatform()

        let hrp = ava.getHRP()
        let utxoAddrs = utxoSet
            .getAddresses()
            .map((addr) => bintools.addressToString(hrp, 'P', addr))

        let fromAddrs = utxoAddrs
        let ownerAddrs = utxoAddrs

        const unsignedTx = await ava
            .PChain()
            .buildImportTx(
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
        return ava.PChain().issueTx(tx.toString())
    }

    async importToXChain(sourceChain: AvmImportChainType) {
        const utxoSet = await this.avmGetAtomicUTXOs(sourceChain)

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        let xToAddr = this.getCurrentAddressAvm()

        let hrp = ava.getHRP()
        let utxoAddrs = utxoSet
            .getAddresses()
            .map((addr) => bintools.addressToString(hrp, 'X', addr))

        let fromAddrs = utxoAddrs
        let ownerAddrs = utxoAddrs

        let sourceChainId = chainIdFromAlias(sourceChain)

        // Owner addresses, the addresses we exported to
        const unsignedTx = await ava
            .XChain()
            .buildImportTx(utxoSet, ownerAddrs, sourceChainId, [xToAddr], fromAddrs, [xToAddr])

        const tx = await this.signX(unsignedTx)
        return await ava.XChain().issueTx(tx.toString())
    }
}
export { WalletCore }
