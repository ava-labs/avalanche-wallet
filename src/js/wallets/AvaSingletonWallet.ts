// Depreciated
// @ts-nocheck

import { IAvaSingletonWallet, wallet_type } from './IAvaHdWallet'
import {
    AVMKeyChain,
    AVMKeyPair,
    BaseTx,
    getPreferredHRP,
    TransferableInput,
    TransferableOutput,
    Tx,
    UnsignedTx,
    UTXOSet,
} from 'avalanche'
import { ava, avm, bintools } from '@/AVA'
import { ITransaction } from '@/components/wallet/transfer/types'
import BN from 'bn.js'
import { Buffer } from 'buffer/'

export default class AvaSingletonWallet implements IAvaSingletonWallet {
    masterKey: AVMKeyPair
    keyChain: AVMKeyChain
    utxoset: UTXOSet
    type: wallet_type
    address: string

    constructor(keypair: AVMKeyPair) {
        this.type = 'singleton'
        this.masterKey = keypair
        this.utxoset = new UTXOSet()
        this.address = keypair.getAddressString()

        this.keyChain = new AVMKeyChain(getPreferredHRP(ava.getNetworkID()), 'X')
        this.keyChain.addKey(keypair)

        this.getUTXOs()
    }

    getCurrentKey(): AVMKeyPair {
        return this.masterKey
    }

    getKeyChain(): AVMKeyChain {
        return this.keyChain
    }

    getCurrentAddress(): string {
        return this.masterKey.getAddressString()
    }

    async onnetworkchange() {
        this.utxoset = new UTXOSet()
        this.getUTXOs()
    }

    async getUTXOs(): Promise<UTXOSet> {
        let addrs: Buffer[] = this.keyChain.getAddresses()
        let result: UTXOSet = await avm.getUTXOs(addrs)
        this.utxoset = result // we can use local copy of utxos as cache for some functions

        return result
    }

    async issueBatchTx(orders: ITransaction[], addr: string): Promise<string> {
        let fromAddrsStr: string[] = this.keyChain.getAddressStrings()
        let changeAddr: string = this.address

        let ins: TransferableInput[] = []
        let outs: TransferableOutput[] = []

        for (let i: number = 0; i < orders.length; i++) {
            let order: ITransaction = orders[i]
            let amt: BN = new BN(order.amount.toString())
            let assetId: string = order.asset.id

            let baseTx: UnsignedTx = await avm.buildBaseTx(
                this.utxoset,
                amt,
                [addr],
                fromAddrsStr,
                [changeAddr],
                assetId
            )
            let rawTx: BaseTx = baseTx.getTransaction()

            ins = ins.concat(rawTx.getIns())
            outs = outs.concat(rawTx.getOuts())
        }

        let chainId: Buffer = bintools.cb58Decode(avm.getBlockchainID())
        let networkId: number = ava.getNetworkID()
        let baseTx: BaseTx = new BaseTx(networkId, chainId, outs, ins)
        const unsignedTx: UnsignedTx = new UnsignedTx(baseTx)
        const tx: Tx = unsignedTx.sign(this.keyChain)
        const txId: string = await avm.issueTx(tx)

        return txId
    }
}
