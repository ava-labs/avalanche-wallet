import { ava, avm, bintools, cChain, pChain } from '@/AVA'
import { UTXOSet as EVMUTXOSet } from 'avalanche/dist/apis/evm'
import {
    UTXOSet as PlatformUTXOSet,
    UTXO as PlatformUTXO,
} from 'avalanche/dist/apis/platformvm/utxos'
import { UTXOSet as AVMUTXOSet, UTXO as AVMUTXO } from 'avalanche/dist/apis/avm/utxos'
import { WalletType } from '@/store/types'
import { BN, Buffer } from 'avalanche'
import { Tx as AVMTx, UnsignedTx as AVMUnsignedTx } from 'avalanche/dist/apis/avm/tx'
import {
    buildAvmExportTransaction,
    buildCreateNftFamilyTx,
    buildEvmExportTransaction,
    buildMintNftTx,
} from '@/js/TxHelper'
import { PayloadBase } from 'avalanche/dist/utils'
import { ITransaction } from '@/components/wallet/transfer/types'

import {
    Tx as PlatformTx,
    UnsignedTx as PlatformUnsignedTx,
} from 'avalanche/dist/apis/platformvm/tx'
import { AvmExportChainType, AvmImportChainType } from '@/js/wallets/IAvaHdWallet'
import { ChainIdType } from '@/constants'
import { web3 } from '@/evm'
import EthereumjsCommon from '@ethereumjs/common'
import { Transaction } from '@ethereumjs/tx'
import Erc20Token from '@/js/Erc20Token'

async function getAtomicUTXOsForAllAddresses<
    UtxoSet extends AVMUTXOSet | PlatformUTXOSet | EVMUTXOSet
>(addrs: string[], chainAlias: string): Promise<UtxoSet> {
    let selection = addrs.slice(0, 1024)
    let remaining = addrs.slice(1024)

    let utxoSet
    if (chainAlias === 'X') {
        utxoSet = await avmGetAtomicUTXOs(selection)
    } else if (chainAlias === 'P') {
        utxoSet = await platformGetAtomicUTXOs(selection)
    } else {
        utxoSet = await evmGetAtomicUTXOs(selection)
    }

    if (remaining.length > 0) {
        // @ts-ignore
        let nextSet = await getAtomicUTXOsForAllAddresses<UtxoSet>(remaining, chainAlias)
        // @ts-ignore
        utxoSet = utxoSet.merge(nextSet)
    }

    return utxoSet as UtxoSet
}

// todo: Use end index to get ALL utxos
async function avmGetAtomicUTXOs(addrs: string[]): Promise<AVMUTXOSet> {
    if (addrs.length > 1024) {
        throw 'Number of addresses can not be greater than 1024.'
    }

    let resultP: AVMUTXOSet = (await avm.getUTXOs(addrs, pChain.getBlockchainID())).utxos
    let resultC: AVMUTXOSet = (await avm.getUTXOs(addrs, cChain.getBlockchainID())).utxos
    // TODO: Can you merge like this?
    let result = resultP.merge(resultC)
    return result
}

// todo: Use end index to get ALL utxos
async function platformGetAtomicUTXOs(addrs: string[]): Promise<PlatformUTXOSet> {
    if (addrs.length > 1024) {
        throw 'Number of addresses can not be greater than 1024.'
    }

    let result: PlatformUTXOSet = (await pChain.getUTXOs(addrs, avm.getBlockchainID())).utxos
    return result
}

// todo: Use end index to get ALL utxos
async function evmGetAtomicUTXOs(addrs: string[]): Promise<EVMUTXOSet> {
    if (addrs.length > 1024) {
        throw 'Number of addresses can not be greater than 1024.'
    }

    let result: EVMUTXOSet = (await cChain.getUTXOs(addrs, avm.getBlockchainID())).utxos
    return result
}

async function getStakeForAddresses(addrs: string[]): Promise<BN> {
    if (addrs.length <= 256) {
        return await pChain.getStake(addrs)
    } else {
        //Break the list in to 1024 chunks
        let chunk = addrs.slice(0, 256)
        let remainingChunk = addrs.slice(256)

        let chunkStake = await pChain.getStake(chunk)
        return chunkStake.add(await getStakeForAddresses(remainingChunk))
    }
}

export async function avmGetAllUTXOs(addrs: string[]): Promise<AVMUTXOSet> {
    if (addrs.length <= 1024) {
        let utxos = await avmGetAllUTXOsForAddresses(addrs)
        return utxos
    } else {
        //Break the list in to 1024 chunks
        let chunk = addrs.slice(0, 1024)
        let remainingChunk = addrs.slice(1024)

        let newSet = await avmGetAllUTXOsForAddresses(chunk)
        return newSet.merge(await avmGetAllUTXOs(remainingChunk))
    }
}

async function avmGetAllUTXOsForAddresses(
    addrs: string[],
    endIndex: any = undefined
): Promise<AVMUTXOSet> {
    if (addrs.length > 1024) throw new Error('Maximum length of addresses is 1024')
    let response
    if (!endIndex) {
        response = await avm.getUTXOs(addrs)
    } else {
        response = await avm.getUTXOs(addrs, undefined, 0, endIndex)
    }

    let utxoSet = response.utxos
    let utxos = utxoSet.getAllUTXOs()
    let nextEndIndex = response.endIndex
    let len = response.numFetched

    if (len >= 1024) {
        let subUtxos = await avmGetAllUTXOsForAddresses(addrs, nextEndIndex)
        return utxoSet.merge(subUtxos)
    }
    return utxoSet
}

// helper method to get utxos for more than 1024 addresses
export async function platformGetAllUTXOs(addrs: string[]): Promise<PlatformUTXOSet> {
    if (addrs.length <= 1024) {
        let newSet = await platformGetAllUTXOsForAddresses(addrs)
        return newSet
    } else {
        //Break the list in to 1024 chunks
        let chunk = addrs.slice(0, 1024)
        let remainingChunk = addrs.slice(1024)

        let newSet = await platformGetAllUTXOsForAddresses(chunk)

        return newSet.merge(await platformGetAllUTXOs(remainingChunk))
    }
}

async function platformGetAllUTXOsForAddresses(
    addrs: string[],
    endIndex: any = undefined
): Promise<PlatformUTXOSet> {
    let response
    if (!endIndex) {
        response = await pChain.getUTXOs(addrs)
    } else {
        response = await pChain.getUTXOs(addrs, undefined, 0, endIndex)
    }

    let utxoSet = response.utxos
    let nextEndIndex = response.endIndex
    let len = response.numFetched

    if (len >= 1024) {
        let subUtxos = await platformGetAllUTXOsForAddresses(addrs, nextEndIndex)
        return utxoSet.merge(subUtxos)
    }

    return utxoSet
}

class WalletHelper {
    constructor() {}

    static async getStake(wallet: WalletType): Promise<BN> {
        let addrs = wallet.getAllAddressesP()
        return await getStakeForAddresses(addrs)
    }

    static async createNftFamily(
        wallet: WalletType,
        name: string,
        symbol: string,
        groupNum: number
    ) {
        let fromAddresses = wallet.getDerivedAddresses()
        let changeAddress = wallet.getChangeAddressAvm()

        let minterAddress = wallet.getCurrentAddressAvm()

        let utxoSet = wallet.utxoset

        let unsignedTx = await buildCreateNftFamilyTx(
            name,
            symbol,
            groupNum,
            fromAddresses,
            minterAddress,
            changeAddress,
            utxoSet
        )

        let signed = await wallet.signX(unsignedTx)
        return await avm.issueTx(signed)
    }

    static async mintNft(
        wallet: WalletType,
        mintUtxo: AVMUTXO,
        payload: PayloadBase,
        quantity: number
    ) {
        let ownerAddress = wallet.getCurrentAddressAvm()
        let changeAddress = wallet.getChangeAddressAvm()

        let sourceAddresses = wallet.getDerivedAddresses()

        let utxoSet = wallet.utxoset
        let tx = await buildMintNftTx(
            mintUtxo,
            payload,
            quantity,
            ownerAddress,
            changeAddress,
            sourceAddresses,
            utxoSet
        )
        let signed = await wallet.signX(tx)
        return await avm.issueTx(signed)
    }

    static async issueBatchTx(
        wallet: WalletType,
        orders: (ITransaction | AVMUTXO)[],
        addr: string,
        memo: Buffer | undefined
    ): Promise<string> {
        let unsignedTx = await wallet.buildUnsignedTransaction(orders, addr, memo)
        const tx = await wallet.signX(unsignedTx)
        const txId: string = await avm.issueTx(tx)

        return txId
    }

    static async validate(
        wallet: WalletType,
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        delegationFee: number,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        let utxoSet = wallet.getPlatformUTXOSet()

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        let pAddressStrings = wallet.getAllAddressesP()
        // let pAddressStrings = this.platformHelper.getAllDerivedAddresses()

        let stakeAmount = amt

        // If reward address isn't given use index 0 address
        if (!rewardAddress) {
            rewardAddress = wallet.getPlatformRewardAddress()
        }

        // For change address use first available on the platform chain
        let changeAddress = wallet.getFirstAvailableAddressPlatform()

        let stakeReturnAddr = wallet.getCurrentAddressPlatform()

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

        let tx = await wallet.signP(unsignedTx)
        return await pChain.issueTx(tx)
    }

    static async delegate(
        wallet: WalletType,
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        let utxoSet = wallet.getPlatformUTXOSet()
        let pAddressStrings = wallet.getAllAddressesP()

        let stakeAmount = amt

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        // If reward address isn't given use index 0 address
        if (!rewardAddress) {
            rewardAddress = wallet.getPlatformRewardAddress()
        }

        let stakeReturnAddr = wallet.getPlatformRewardAddress()

        // For change address use first available on the platform chain
        let changeAddress = wallet.getFirstAvailableAddressPlatform()

        // Convert dates to unix time
        let startTime = new BN(Math.round(start.getTime() / 1000))
        let endTime = new BN(Math.round(end.getTime() / 1000))

        const unsignedTx = await pChain.buildAddDelegatorTx(
            utxoSet,
            [stakeReturnAddr],
            pAddressStrings,
            [changeAddress],
            nodeID,
            startTime,
            endTime,
            stakeAmount,
            [rewardAddress] // reward address
        )

        const tx = await wallet.signP(unsignedTx)
        return await pChain.issueTx(tx)
    }

    static async avmGetAtomicUTXOs(wallet: WalletType, sourceChain: AvmImportChainType) {
        let addrs = wallet.getAllAddressesX()
        let result = await getAtomicUTXOsForAllAddresses<AVMUTXOSet>(addrs, 'X')
        return result
    }

    static async platformGetAtomicUTXOs(wallet: WalletType) {
        let addrs = wallet.getAllAddressesP()
        let result = await getAtomicUTXOsForAllAddresses<PlatformUTXOSet>(addrs, 'P')
        return result
    }

    static async evmGetAtomicUTXOs(wallet: WalletType) {
        let addrs = [wallet.getEvmAddressBech()]
        let result = await getAtomicUTXOsForAllAddresses<EVMUTXOSet>(addrs, 'C')
        return result
    }

    static async importToXChain(wallet: WalletType, sourceChain: AvmImportChainType) {
        const utxoSet = await this.avmGetAtomicUTXOs(wallet, sourceChain)

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        let xToAddr = wallet.getCurrentAddressAvm()

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
        const tx = await wallet.signX(unsignedTx)
        return await avm.issueTx(tx)
    }

    static async importToPlatformChain(wallet: WalletType): Promise<string> {
        const utxoSet = await this.platformGetAtomicUTXOs(wallet)

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        // Owner addresses, the addresses we exported to
        let pToAddr = wallet.getCurrentAddressPlatform()

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
        const tx = await wallet.signP(unsignedTx)

        return pChain.issueTx(tx)
    }

    static async importToCChain(wallet: WalletType): Promise<string> {
        let bechAddr = wallet.getEvmAddressBech()
        let hexAddr = wallet.getEvmAddress()

        const utxoResponse = await cChain.getUTXOs(bechAddr, avm.getBlockchainID())
        const utxoSet: EVMUTXOSet = utxoResponse.utxos

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        let toAddress = '0x' + hexAddr
        let ownerAddresses = [bechAddr]
        let fromAddresses = ownerAddresses
        let sourceChain = avm.getBlockchainID()

        const unsignedTx = await cChain.buildImportTx(
            utxoSet,
            toAddress,
            ownerAddresses,
            sourceChain,
            fromAddresses
        )
        let tx = await wallet.signC(unsignedTx)
        // let keyChain = this.ethKeyChain
        // const tx = unsignedTx.sign(keyChain)
        let id = await cChain.issueTx(tx)

        return id
    }

    static async exportFromXChain(
        wallet: WalletType,
        amt: BN,
        destinationChain: AvmExportChainType
    ) {
        let fee = avm.getTxFee()
        let amtFee = amt.add(fee)

        if (destinationChain === 'C') {
            // C Chain imports/exports do not have a fee
            amtFee = amt
        }

        let destinationAddr
        if (destinationChain === 'P') {
            destinationAddr = wallet.getCurrentAddressPlatform()
        } else {
            // C Chain
            destinationAddr = wallet.getEvmAddressBech()
        }

        let fromAddresses = wallet.getAllAddressesX()
        let changeAddress = wallet.getChangeAddressAvm()
        let utxos = wallet.getUTXOSet()
        let exportTx = (await buildAvmExportTransaction(
            destinationChain,
            utxos,
            fromAddresses,
            destinationAddr,
            amtFee,
            changeAddress
        )) as AVMUnsignedTx

        let tx = await wallet.signX(exportTx)

        return avm.issueTx(tx)
    }

    static async exportFromPChain(wallet: WalletType, amt: BN) {
        let fee = avm.getTxFee()
        let amtFee = amt.add(fee)

        let utxoSet = wallet.getPlatformUTXOSet()
        let destinationAddr = wallet.getCurrentAddressAvm()

        let pChangeAddr = wallet.getCurrentAddressPlatform()
        let fromAddrs = wallet.getAllAddressesP()

        let xId = avm.getBlockchainID()

        let exportTx = await pChain.buildExportTx(
            utxoSet,
            amtFee,
            xId,
            [destinationAddr],
            fromAddrs,
            [pChangeAddr]
        )

        let tx = await wallet.signP(exportTx)
        return await pChain.issueTx(tx)
    }

    static async exportFromCChain(wallet: WalletType, amt: BN) {
        let fee = avm.getTxFee()
        let amtFee = amt.add(fee)

        let hexAddr = wallet.getEvmAddress()
        let bechAddr = wallet.getEvmAddressBech()

        let fromAddresses = [hexAddr]
        let destinationAddr = wallet.getCurrentAddressAvm()

        let exportTx = await buildEvmExportTransaction(
            fromAddresses,
            destinationAddr,
            amtFee,
            bechAddr
        )

        let tx = await wallet.signC(exportTx)
        return cChain.issueTx(tx)
    }

    static async getEthBalance(wallet: WalletType) {
        let bal = await web3.eth.getBalance(wallet.ethAddress)
        return new BN(bal)
    }

    static async sendEth(
        wallet: WalletType,
        to: string,
        amount: BN, // in wei
        gasPrice: BN,
        gasLimit: number
    ) {
        let fromAddr = '0x' + wallet.getEvmAddress()
        const nonce = await web3.eth.getTransactionCount(fromAddr)
        const chainId = await web3.eth.getChainId()
        const networkId = await web3.eth.net.getId()
        const chainParams = {
            common: EthereumjsCommon.forCustomChain('mainnet', { networkId, chainId }, 'istanbul'),
        }

        let tx = new Transaction(
            {
                nonce: nonce,
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: to,
                value: amount,
                data: '0x',
            },
            chainParams
        )

        let signedTx = await wallet.signEvm(tx)

        let txHex = signedTx.serialize().toString('hex')
        let hash = await web3.eth.sendSignedTransaction('0x' + txHex)
        return hash.transactionHash
    }

    static async sendErc20(
        wallet: WalletType,
        to: string,
        amount: BN,
        gasPrice: BN,
        gasLimit: number,
        token: Erc20Token
    ) {
        let fromAddr = '0x' + wallet.getEvmAddress()
        const nonce = await web3.eth.getTransactionCount(fromAddr)
        const chainId = await web3.eth.getChainId()
        const networkId = await web3.eth.net.getId()
        const chainParams = {
            common: EthereumjsCommon.forCustomChain('mainnet', { networkId, chainId }, 'istanbul'),
        }

        let tokenTx = token.createTransferTx(to, amount)

        let tx = new Transaction(
            {
                nonce: nonce,
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                value: '0x0',
                to: token.data.address,
                data: tokenTx.encodeABI(),
            },
            chainParams
        )

        let signedTx = await wallet.signEvm(tx)
        let txHex = signedTx.serialize().toString('hex')
        let hash = await web3.eth.sendSignedTransaction('0x' + txHex)
        return hash.transactionHash
    }
}

export { getAtomicUTXOsForAllAddresses, WalletHelper }
