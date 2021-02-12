import { TokenListToken } from '@/store/modules/assets/types'
import { web3 } from '@/evm'
import { BN } from 'avalanche'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'

// import ERC20Api from '@openzeppelin/c'

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
        // console.log('Created erc20', tokenData.address)

        let abiSig = {
            constant: true,
            inputs: [
                {
                    name: '_owner',
                    type: 'address',
                },
            ],
            name: 'balanceOf',
            outputs: [
                {
                    name: 'balance',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        }

        // let abi = web3.eth.abi.encodeEventSignature(abiSig)
        //@ts-ignore
        var tokenInst = new web3.eth.Contract([abiSig], tokenData.address)
        this.contract = tokenInst
    }

    async updateBalance(address: string) {
        let bal = await this.contract.methods.balanceOf('0x' + address).call()
        this.balanceRaw = bal
        this.balanceBN = new BN(bal)
        this.balanceBig = bnToBig(this.balanceBN, this.data.decimals)
    }
}

export default Erc20Token
