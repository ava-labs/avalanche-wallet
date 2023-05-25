import { ava, cChain, pChain } from '@/AVA'
import {
    UTXOSet as PlatformUTXOSet,
    UTXO as PlatformUTXO,
} from 'avalanche/dist/apis/platformvm/utxos'
import { UTXO as AVMUTXO } from 'avalanche/dist/apis/avm/utxos'
import { WalletType } from '@/js/wallets/types'

import { BN, Buffer } from 'avalanche'
import {
    buildCreateNftFamilyTx,
    buildEvmTransferErc20Tx,
    buildEvmTransferErc721Tx,
    buildEvmTransferNativeTx,
    buildMintNftTx,
} from '@/js/TxHelper'
import { PayloadBase } from 'avalanche/dist/utils'
import { ITransaction } from '@/components/wallet/transfer/types'

import { web3 } from '@/evm'
import Erc20Token from '@/js/Erc20Token'
import ERC721Token from '@/js/ERC721Token'
import { issueP, issueX } from '@/helpers/issueTx'
import { sortUTxoSetP } from '@/helpers/sortUTXOs'
import glacier from '@/js/Glacier/Glacier'

class WalletHelper {
    static async createNftFamily(
        wallet: WalletType,
        name: string,
        symbol: string,
        groupNum: number
    ) {
        const fromAddresses = wallet.getDerivedAddresses()
        const changeAddress = wallet.getChangeAddressAvm()

        const minterAddress = wallet.getCurrentAddressAvm()

        const utxoSet = wallet.getUTXOSet()

        const unsignedTx = await buildCreateNftFamilyTx(
            name,
            symbol,
            groupNum,
            fromAddresses,
            minterAddress,
            changeAddress,
            utxoSet
        )

        const signed = await wallet.signX(unsignedTx)
        return issueX(signed)
    }

    static async mintNft(
        wallet: WalletType,
        mintUtxo: AVMUTXO,
        payload: PayloadBase,
        quantity: number
    ) {
        const ownerAddress = wallet.getCurrentAddressAvm()
        const changeAddress = wallet.getChangeAddressAvm()

        const sourceAddresses = wallet.getDerivedAddresses()

        const utxoSet = wallet.getUTXOSet()
        const tx = await buildMintNftTx(
            mintUtxo,
            payload,
            quantity,
            ownerAddress,
            changeAddress,
            sourceAddresses,
            utxoSet
        )
        const signed = await wallet.signX(tx)
        return issueX(signed)
    }

    static async issueBatchTx(
        wallet: WalletType,
        orders: (ITransaction | AVMUTXO)[],
        addr: string,
        memo: Buffer | undefined
    ): Promise<string> {
        const unsignedTx = await wallet.buildUnsignedTransaction(orders, addr, memo)
        const tx = await wallet.signX(unsignedTx)
        const txId: string = await issueX(tx)

        return txId
    }

    static async sendEth(
        wallet: WalletType,
        to: string,
        amount: BN, // in wei
        gasPrice: BN,
        gasLimit: number
    ) {
        const fromAddr = '0x' + wallet.getEvmAddress()

        const tx = await buildEvmTransferNativeTx(fromAddr, to, amount, gasPrice, gasLimit)

        const signedTx = await wallet.signEvm(tx)

        const txHex = signedTx.serialize().toString('hex')
        const hash = await web3.eth.sendSignedTransaction('0x' + txHex)
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
        const fromAddr = '0x' + wallet.getEvmAddress()
        const tx = await buildEvmTransferErc20Tx(fromAddr, to, amount, gasPrice, gasLimit, token)

        const signedTx = await wallet.signEvm(tx)
        const txHex = signedTx.serialize().toString('hex')
        const hash = await web3.eth.sendSignedTransaction('0x' + txHex)
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
        const fromAddr = '0x' + wallet.getEvmAddress()
        const tx = await buildEvmTransferErc721Tx(fromAddr, to, gasPrice, gasLimit, token, tokenId)
        const signedTx = await wallet.signEvm(tx)
        const txHex = signedTx.serialize().toString('hex')
        const hash = await web3.eth.sendSignedTransaction('0x' + txHex)
        return hash.transactionHash
    }

    static async estimateTxGas(wallet: WalletType, tx: any) {
        const fromAddr = '0x' + wallet.getEvmAddress()
        const estGas = await tx.estimateGas({ from: fromAddr })
        return Math.round(estGas * 1.1)
    }

    static async estimateGas(wallet: WalletType, to: string, amount: BN, token: Erc20Token) {
        const from = '0x' + wallet.getEvmAddress()
        const tx = token.createTransferTx(to, amount)
        const estGas = await tx.estimateGas({
            from: from,
        })
        // Return 10% more
        return Math.round(estGas * 1.1)
    }
}

export { WalletHelper }
