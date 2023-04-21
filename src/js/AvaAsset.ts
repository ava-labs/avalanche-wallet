// Manages BigNumber and Ava conversion and arithmetic
import { BN } from '@c4tplatform/caminojs/dist'
import Big from 'big.js'

class AvaAsset {
    id: string
    name: string
    symbol: string
    denomination: number
    amount: BN
    amountLocked: BN
    // Native asset P chain, Wallet Staking
    amountExtra: BN
    amountExtraLocked: BN
    private readonly pow: Big
    constructor(id: string, name: string, symbol: string, denomination: number) {
        this.id = id
        this.name = name
        this.symbol = symbol
        this.denomination = denomination
        this.amount = new BN(0, 10)
        this.amountLocked = new BN(0, 10)
        this.amountExtra = new BN(0, 10)
        this.amountExtraLocked = new BN(0, 10)
        this.pow = Big(10).pow(denomination)
    }

    addBalance(val: BN): void {
        this.amount = this.amount.add(val)
    }

    addBalanceLocked(val: BN): void {
        this.amountLocked = this.amountLocked.add(val)
    }

    addExtra(val: BN): void {
        this.amountExtra = this.amountExtra.add(val)
    }

    addExtraLocked(val: BN): void {
        this.amountExtraLocked = this.amountExtraLocked.add(val)
    }

    resetBalance() {
        this.amount = new BN(0, 10)
        this.amountLocked = new BN(0, 10)
        this.amountExtra = new BN(0, 10)
        this.amountExtraLocked = new BN(0, 10)
    }

    getAmount(locked: boolean = false): Big {
        if (!locked) {
            return Big(this.amount.toString(10)).div(this.pow)
        } else {
            return Big(this.amountLocked.toString(10)).div(this.pow)
        }
    }

    getAmountBN(locked: boolean = false): BN {
        if (!locked) {
            return this.amount
        } else {
            return this.amountLocked
        }
    }

    getTotalAmount(): BN {
        return this.amount.add(this.amountLocked).add(this.amountExtra).add(this.amountExtraLocked)
    }

    toStringTotal(): string {
        let big: Big = Big(this.getTotalAmount().toString(10)).div(this.pow)
        return big.toLocaleString(this.denomination)
    }

    toString() {
        let big: Big = Big(this.amount.toString(10)).div(this.pow)
        return big.toLocaleString(this.denomination)
    }
}

export default AvaAsset
