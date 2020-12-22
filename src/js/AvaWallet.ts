// Depreciated
// @ts-nocheck

import { AVMKeyChain, AVMKeyPair, UTXOSet } from 'avalanche'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import AvaSingletonWallet from '@/js/wallets/AvaSingletonWallet'
import { AvaWalletCore, wallet_type } from './wallets/IAvaHdWallet'
import { ITransaction } from '@/components/wallet/transfer/types'

// A wrapper class that join HD and Singleton wallets with the ability to switch between.
export class AvaWallet implements AvaWalletCore {
    type: wallet_type
    wallet: AvaHdWallet | AvaSingletonWallet
    masterKey: AVMKeyPair

    cacheHD: AvaHdWallet | null
    cacheSingleton: AvaSingletonWallet | null

    constructor(keypair: AVMKeyPair, type: wallet_type) {
        this.type = type
        this.cacheSingleton = null
        this.cacheHD = null

        let wallet: AvaHdWallet | AvaSingletonWallet
        if (type === 'hd') {
            wallet = new AvaHdWallet(keypair)
            this.cacheHD = wallet
        } else {
            wallet = new AvaSingletonWallet(keypair)
            this.cacheSingleton = wallet
        }
        this.wallet = wallet
        this.masterKey = keypair
    }

    getMasterKey(): AVMKeyPair {
        return this.masterKey
    }

    getCurrentKey(): AVMKeyPair {
        return this.wallet.getCurrentKey()
    }

    getKeyChain(): AVMKeyChain {
        return this.wallet.getKeyChain()
    }

    getCurrentAddress(): string {
        return this.wallet.getCurrentAddress()
    }

    getUTXOs(): Promise<UTXOSet> {
        return this.wallet.getUTXOs()
    }

    getUTXOSet(): UTXOSet {
        return this.wallet.utxoset
    }

    issueBatchTx(orders: ITransaction[], addr: string): Promise<string> {
        return this.wallet.issueBatchTx(orders, addr)
    }

    onnetworkchange(): void {
        // Invalidate cache
        this.cacheSingleton = null
        this.cacheHD = null

        this.wallet.onnetworkchange()
    }

    toggleMode() {
        let keypair: AVMKeyPair = this.masterKey

        let type: wallet_type
        if (this.type === 'hd') type = 'singleton'
        else type = 'hd'
        let wallet: AvaHdWallet | AvaSingletonWallet

        if (type === 'hd') {
            wallet = this.cacheHD || new AvaHdWallet(keypair)
            this.cacheHD = wallet
        } else {
            wallet = this.cacheSingleton || new AvaSingletonWallet(keypair)
            this.cacheSingleton = wallet
        }
        this.type = type
        this.wallet = wallet
    }
}
