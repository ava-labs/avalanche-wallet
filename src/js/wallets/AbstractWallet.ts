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
import { sortUTxoSetP } from '@/helpers/sortUTXOs'
import { getStakeForAddresses } from '@/helpers/utxo_helper'
import glacier from '@/js/Glacier/Glacier'
import { isMainnetNetworkID } from '@/store/modules/network/isMainnetNetworkID'
import { isTestnetNetworkID } from '@/store/modules/network/isTestnetNetworkID'
import { web3 } from '@/evm'
import { UTXO as PlatformUTXO } from 'avalanche/dist/apis/platformvm/utxos'
import {
    BlockchainId,
    CreatePrimaryNetworkTransactionExportRequest,
    PrimaryNetworkOptions,
} from '@avalabs/glacier-sdk'
import { toChecksumAddress } from 'ethereumjs-util'

const uniqid = require('uniqid')

abstract class AbstractWallet {
    id: string

    utxoset: AVMUTXOSet
    platformUtxoset: PlatformUTXOSet
    stakeAmount: BN
    ethBalance: BN

    isFetchUtxos: boolean
    isInit: boolean

    abstract getEvmAddressBech(): string
    abstract getEvmAddress(): string
    abstract getCurrentAddressAvm(): string
    abstract getChangeAddressAvm(): string
    abstract getCurrentAddressPlatform(): string
    abstract getAllAddressesP(): string[]
    abstract getAllAddressesX(): string[]
    abstract getAllChangeAddressesX(): string[]
    abstract getAllExternalAddressesX(): string[]
    abstract getHistoryAddresses(): string[]
    abstract signC(unsignedTx: EVMUnsignedTx): Promise<EVMTx>
    abstract signX(unsignedTx: AVMUnsignedTx): Promise<AVMTx>
    abstract signP(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx>

    abstract signMessage(msg: string, address?: string): Promise<string>
    abstract getPlatformUTXOSet(): PlatformUTXOSet

    /**
     *
     * @returns Returns the checksum encoded EVM hex address per ERC-55.
     */
    getEvmChecksumAddress() {
        return toChecksumAddress('0x' + this.getEvmAddress())
    }

    getUTXOSet(): AVMUTXOSet {
        return this.utxoset
    }

    protected constructor() {
        this.id = uniqid()
        this.utxoset = new AVMUTXOSet()
        this.platformUtxoset = new PlatformUTXOSet()
        this.stakeAmount = new BN(0)
        this.ethBalance = new BN(0)

        this.isInit = false
        this.isFetchUtxos = false
    }

    /**
     * Get change address to use with P Chain transactions. Uses current address.
     */
    getChangeAddressPlatform() {
        return this.getCurrentAddressPlatform()
    }

    /**
     * Address to use for staking rewards. Uses current P chain address.
     */
    getPlatformRewardAddress() {
        return this.getCurrentAddressPlatform()
    }

    async evmGetAtomicUTXOs(sourceChain: ExportChainsC) {
        const addrs = [this.getEvmAddressBech()]
        return await UtxoHelper.evmGetAtomicUTXOs(addrs, sourceChain)
    }

    async getEthBalance() {
        const netID = ava.getNetworkID()
        const isMainnet = isMainnetNetworkID(netID)
        const isFuji = isTestnetNetworkID(netID)

        let bal
        // Can't use glacier if not mainnet/fuji
        if (!isMainnet && !isFuji) {
            bal = new BN(await web3.eth.getBalance(this.getEvmAddress()))
        } else {
            const chainId = isMainnet ? '43114' : '43113'
            const res = await glacier.evm.getNativeBalance({
                chainId: chainId,
                address: '0x' + this.getEvmAddress(),
            })
            bal = new BN(res.nativeTokenBalance.balance)
        }

        this.ethBalance = bal
        return bal
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

    async getStake() {
        const addrs = this.getAllAddressesP()
        this.stakeAmount = await getStakeForAddresses(addrs)
        return this.stakeAmount
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
        // Sort by amount
        const sortedSet = sortUTxoSetP(utxoSet, false)

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
            sortedSet,
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

    /**
     * Create and issue an AddValidatorTx
     * @param nodeID Node ID to add as a validator
     * @param amt Stake amount in nAVAX
     * @param start Stake Start Date
     * @param end Stake End Date
     * @param delegationFee
     * @param rewardAddress Address which will receive the rewards
     * @param utxos UTXOs to use for the transaction
     */
    async validate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        delegationFee: number,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        let utxoSet = this.getPlatformUTXOSet()

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        // Sort utxos high to low
        const sortedSet = sortUTxoSetP(utxoSet, false)

        const pAddressStrings = this.getAllAddressesP()

        const stakeAmount = amt

        // If reward address isn't given use index 0 address
        if (!rewardAddress) {
            rewardAddress = this.getPlatformRewardAddress()
        }

        // For change address use first available on the platform chain
        const changeAddress = this.getChangeAddressPlatform()

        const stakeReturnAddr = this.getCurrentAddressPlatform()

        // Convert dates to unix time
        const startTime = new BN(Math.round(start.getTime() / 1000))
        const endTime = new BN(Math.round(end.getTime() / 1000))

        const unsignedTx = await pChain.buildAddValidatorTx(
            sortedSet,
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

        const tx = await this.signP(unsignedTx)
        return issueP(tx)
    }

    /**
     * Use Glacier to start a transaction history export job.
     * Excluding EVM for now.
     */
    async startTxExportJob(startDate: Date, endDate: Date, chains: BlockchainId[]) {
        const addresses = this.getHistoryAddresses()
        const stripped = addresses.map((addr) => addr.split('-')[1] || addr)

        const res = await glacier.operations.postTransactionExportJob({
            requestBody: {
                type:
                    CreatePrimaryNetworkTransactionExportRequest.type
                        .TRANSACTION_EXPORT_PRIMARY_NETWORK,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                options: {
                    // X/P/C and EVM addresses
                    addresses: [...stripped, this.getEvmChecksumAddress()],
                    includeChains: chains,
                },
            },
        })
        return res
    }

    /**
     * Create and issue an AddDelegatorTx
     * @param nodeID
     * @param amt
     * @param start
     * @param end
     * @param rewardAddress
     * @param utxos
     */
    async delegate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        let utxoSet = this.getPlatformUTXOSet()
        const pAddressStrings = this.getAllAddressesP()

        const stakeAmount = amt

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        // Sort utxos high to low
        const sortedSet = sortUTxoSetP(utxoSet, false)

        // If reward address isn't given use index 0 address
        if (!rewardAddress) {
            rewardAddress = this.getPlatformRewardAddress()
        }

        const stakeReturnAddr = this.getPlatformRewardAddress()

        // For change address use first available on the platform chain
        const changeAddress = this.getChangeAddressPlatform()

        // Convert dates to unix time
        const startTime = new BN(Math.round(start.getTime() / 1000))
        const endTime = new BN(Math.round(end.getTime() / 1000))

        const unsignedTx = await pChain.buildAddDelegatorTx(
            sortedSet,
            [stakeReturnAddr],
            pAddressStrings,
            [changeAddress],
            nodeID,
            startTime,
            endTime,
            stakeAmount,
            [rewardAddress] // reward address
        )

        const tx = await this.signP(unsignedTx)
        return issueP(tx)
    }
}
export { AbstractWallet }
