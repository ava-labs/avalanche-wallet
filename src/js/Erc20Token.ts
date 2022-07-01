import { TokenListToken } from '@/store/modules/assets/types'
import { web3 } from '@/evm'
import { BN } from '@c4tplatform/camino'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'

import ERC20Abi from '@/abi/IERC20.json'

class Erc20Token {
    data: TokenListToken
    contract: any
    balanceRaw: string
    balanceBN: BN
    balanceBig: Big

    constructor(tokenData: TokenListToken) {
        this.data = tokenData
        this.balanceRaw = '0'
        this.balanceBN = new BN('0')
        this.balanceBig = Big(0)

        //@ts-ignore
        var tokenInst = new web3.eth.Contract(ERC20Abi, tokenData.address)
        this.contract = tokenInst
    }

    // Returns a new instance of the token, given only the erc20 address
    static fromAddress(address: string) {
        //@ts-ignore
        var tokenInst = new web3.eth.Contract(ERC20Abi, address)
        console.log(tokenInst)
    }

    createTransferTx(to: string, amount: BN) {
        return this.contract.methods.transfer(to, amount.toString())
    }

    async updateBalance(address: string) {
        let bal = await this.contract.methods.balanceOf('0x' + address).call()
        this.balanceRaw = bal
        this.balanceBN = new BN(bal)
        this.balanceBig = bnToBig(this.balanceBN, parseInt(this.data.decimals as string))
    }
}

export default Erc20Token
