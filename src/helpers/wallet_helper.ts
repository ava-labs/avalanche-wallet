import { ava, avm, bintools, cChain, pChain } from '@/AVA'
import { UTXOSet as EVMUTXOSet } from 'avalanche/dist/apis/evm'
import {
    UTXOSet as PlatformUTXOSet,
    UTXO as PlatformUTXO,
} from 'avalanche/dist/apis/platformvm/utxos'
import { UTXOSet as AVMUTXOSet, UTXO as AVMUTXO } from 'avalanche/dist/apis/avm/utxos'
import { WalletType } from '@/js/wallets/types'

import { BN, Buffer } from 'avalanche'
import { Tx as AVMTx, UnsignedTx as AVMUnsignedTx } from 'avalanche/dist/apis/avm/tx'
import {
    buildAvmExportTransaction,
    buildCreateNftFamilyTx,
    buildEvmExportTransaction,
    buildEvmTransferErc20Tx,
    buildEvmTransferErc721Tx,
    buildEvmTransferNativeTx,
    buildMintNftTx,
} from '@/js/TxHelper'
import { PayloadBase } from 'avalanche/dist/utils'
import { ITransaction } from '@/components/wallet/transfer/types'

import { AvmExportChainType, AvmImportChainType } from '@/js/wallets/types'
import { web3 } from '@/evm'
import Erc20Token from '@/js/Erc20Token'
import { getStakeForAddresses } from '@/helpers/utxo_helper'
import ERC721Token from '@/js/ERC721Token'

import { UtxoHelper } from '@avalabs/avalanche-wallet-sdk'
class WalletHelper {
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
        return await UtxoHelper.avmGetAtomicUTXOs(addrs, sourceChain)
    }

    static async platformGetAtomicUTXOs(wallet: WalletType) {
        let addrs = wallet.getAllAddressesP()
        return await UtxoHelper.platformGetAtomicUTXOs(addrs)
    }

    static async evmGetAtomicUTXOs(wallet: WalletType) {
        let addrs = [wallet.getEvmAddressBech()]
        return await UtxoHelper.evmGetAtomicUTXOs(addrs)
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

        let utxoSet = await this.evmGetAtomicUTXOs(wallet)

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

        let tx = await buildEvmTransferNativeTx(fromAddr, to, amount, gasPrice, gasLimit)

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
        let tx = await buildEvmTransferErc20Tx(fromAddr, to, amount, gasPrice, gasLimit, token)

        let signedTx = await wallet.signEvm(tx)
        let txHex = signedTx.serialize().toString('hex')
        let hash = await web3.eth.sendSignedTransaction('0x' + txHex)
        return hash.transactionHash
    }

    static async sendErc721(
        wallet: WalletType,
        to: string,
        gasPrice: BN,
        gasLimit: number,
        token: ERC721Token,
        tokenId: string
    ) {
        let fromAddr = '0x' + wallet.getEvmAddress()
        let tx = await buildEvmTransferErc721Tx(fromAddr, to, gasPrice, gasLimit, token, tokenId)
        let signedTx = await wallet.signEvm(tx)
        let txHex = signedTx.serialize().toString('hex')
        let hash = await web3.eth.sendSignedTransaction('0x' + txHex)
        return hash.transactionHash
    }

    static async estimateTxGas(wallet: WalletType, tx: any) {
        let fromAddr = '0x' + wallet.getEvmAddress()
        let estGas = await tx.estimateGas({ from: fromAddr })
        return Math.round(estGas * 1.1)
    }

    static async estimateGas(wallet: WalletType, to: string, amount: BN, token: Erc20Token) {
        let from = '0x' + wallet.getEvmAddress()
        let tx = token.createTransferTx(to, amount)
        let estGas = await tx.estimateGas({
            from: from,
        })
        // Return 10% more
        return Math.round(estGas * 1.1)
    }
}

export { WalletHelper }
