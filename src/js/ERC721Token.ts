import { web3 } from '@/evm'
import ERC721Abi from '@openzeppelin/contracts/build/contracts/ERC721.json'
import { ERC721TokenInput } from '@/store/modules/assets/modules/types'
import axios from 'axios'
import { BN } from 'avalanche'

interface TokenDataCache {
    [index: number]: string
}

interface URIDataCache {
    [index: number]: string
}

const ERC721MetadataID = '0x5b5e139f'
const ERC721EnumerableID = '0x780e9d63'

class ERC721Token {
    contractAddress: string
    contract: any
    name = ''
    symbol = ''
    data: ERC721TokenInput
    tokenCache: TokenDataCache = {}
    uriDataCache: URIDataCache = {}
    canSupport = false

    constructor(data: ERC721TokenInput) {
        this.contractAddress = data.address
        this.name = data.name
        this.symbol = data.symbol
        this.data = data
        //@ts-ignore
        this.contract = new web3.eth.Contract(ERC721Abi.abi, this.contractAddress)
        this.updateSupports()
    }

    async updateSupports() {
        try {
            let metadata = await this.contract.methods.supportsInterface(ERC721MetadataID).call()
            let enumerable = await this.contract.methods
                .supportsInterface(ERC721EnumerableID)
                .call()
            this.canSupport = metadata && enumerable
        } catch (err) {
            this.canSupport = false
            // console.error(err)
        }
    }

    async getBalance(address: string) {
        return await this.contract.methods.balanceOf(address).call()
    }

    async getAllTokensIds(address: string): Promise<string[]> {
        if (!this.canSupport) return []

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
            let data = await this.getTokenURI(parseInt(id))
            res.push(data)
        }
        return res
    }

    createTransferTx(from: string, to: string, id: string) {
        return this.contract.methods.transferFrom(from, to, id)
    }

    async getTokenURI(id: number) {
        if (this.tokenCache[id]) return this.tokenCache[id]
        let data = await this.contract.methods.tokenURI(id).call()
        this.tokenCache[id] = data
        return data
    }

    async getTokenURIData(id: number): Promise<any> {
        //Check cache
        if (this.uriDataCache[id]) return this.uriDataCache[id]
        let uri = await this.getTokenURI(id)
        if (!uri) return null
        let res = (await axios.get(uri)).data
        //Save to cache
        this.uriDataCache[id] = res
        return res
    }
}

export default ERC721Token
