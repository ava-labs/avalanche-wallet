import { web3 } from '@/evm'
import ERC721Abi from '@openzeppelin/contracts/build/contracts/ERC721.json'
import { ERC721TokenInput } from '@/store/modules/assets/types'

class ERC721Token {
    contractAddress: string
    contract: any
    name = ''
    symbol = ''
    data: ERC721TokenInput

    constructor(data: ERC721TokenInput) {
        this.contractAddress = data.address
        this.name = data.name
        this.symbol = data.symbol
        this.data = data
        //@ts-ignore
        this.contract = new web3.eth.Contract(ERC721Abi.abi, this.contractAddress)
        // this.getMetaData()
    }

    async getBalance(address: string) {
        return await this.contract.methods.balanceOf(address).call()
    }

    async getAllTokensIds(address: string) {
        let bal = await this.getBalance(address)

        let res = []
        for (var i = 0; i < bal; i++) {
            let tokenId = await this.contract.methods.tokenOfOwnerByIndex(address, i).call()
            res.push(tokenId)
        }
        return res
    }

    async getAllTokenData(address: string) {
        let ids = await this.getAllTokensIds(address)

        let res = []
        for (var i = 0; i < ids.length; i++) {
            let id = ids[i]
            let data = await this.contract.methods.tokenURI(id).call()
            res.push(data)
        }
        return res
    }
}

export default ERC721Token
