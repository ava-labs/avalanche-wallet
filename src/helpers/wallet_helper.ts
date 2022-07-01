import { ava } from '@/AVA'
import {
    UTXOSet as PlatformUTXOSet,
    UTXO as PlatformUTXO,
} from '@c4tplatform/camino/dist/apis/platformvm/utxos'
import { UTXO as AVMUTXO } from '@c4tplatform/camino/dist/apis/avm/utxos'
import { WalletType } from '@/js/wallets/types'

import { BN, Buffer } from '@c4tplatform/camino'
import {
    buildCreateNftFamilyTx,
    buildEvmTransferErc20Tx,
    buildEvmTransferERCNftTx,
    buildEvmTransferNativeTx,
    buildMintNftTx,
} from '@/js/TxHelper'
import { PayloadBase } from '@c4tplatform/camino/dist/utils'
import { ITransaction } from '@/components/wallet/transfer/types'

import { web3 } from '@/evm'
import Erc20Token from '@/js/Erc20Token'
import { getStakeForAddresses } from '@/helpers/utxo_helper'
import ERCNftToken from '@/js/ERCNftToken'

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
        return await ava.XChain().issueTx(signed)
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
        return await ava.XChain().issueTx(signed)
    }

    static async issueBatchTx(
        wallet: WalletType,
        orders: (ITransaction | AVMUTXO)[],
        addr: string,
        memo: Buffer | undefined
    ): Promise<string> {
        let unsignedTx = await wallet.buildUnsignedTransaction(orders, addr, memo)
        const tx = await wallet.signX(unsignedTx)
        const txId: string = await ava.XChain().issueTx(tx)

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

        const unsignedTx = await ava.PChain().buildAddValidatorTx(
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
        return await ava.PChain().issueTx(tx)
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

        const unsignedTx = await ava.PChain().buildAddDelegatorTx(
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
        return await ava.PChain().issueTx(tx)
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

    static async sendERCNft(
        wallet: WalletType,
        to: string,
        gasPrice: BN,
        gasLimit: number,
        token: ERCNftToken,
        tokenId: string
    ) {
        let fromAddr = '0x' + wallet.getEvmAddress()
        let tx = await buildEvmTransferERCNftTx(fromAddr, to, gasPrice, gasLimit, token, tokenId)
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
