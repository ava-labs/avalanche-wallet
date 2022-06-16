import { web3 } from '@/evm'
import ERC721Abi from '@openzeppelin/contracts/build/contracts/ERC721Enumerable.json'
import { ERC721TokenInput } from '@/store/modules/assets/modules/types'
import axios from 'axios'

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
            const metadata = await this.contract.methods.supportsInterface(ERC721MetadataID).call()
            const enumerable = await this.contract.methods
                .supportsInterface(ERC721EnumerableID)
                .call()
            this.canSupport = metadata && enumerable
        } catch (err) {
            this.canSupport = false
        }
    }

    async getBalance(address: string) {
        return await this.contract.methods.balanceOf(address).call()
    }

    async getAllTokensIds(address: string): Promise<string[]> {
        if (!this.canSupport) return []

        const bal = await this.getBalance(address)
        const res = []
        for (let i = 0; i < bal; i++) {
            const tokenId = await this.contract.methods.tokenOfOwnerByIndex(address, i).call()
            res.push(tokenId)
        }
        return res
    }

    async getAllTokenData(address: string) {
        const ids = await this.getAllTokensIds(address)

        const res = []
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i]
            const data = await this.getTokenURI(parseInt(id))
            res.push(data)
        }
        return res
    }

    createTransferTx(from: string, to: string, id: string) {
        return this.contract.methods.transferFrom(from, to, id)
    }

    async getTokenURI(id: number) {
        if (this.tokenCache[id]) return this.tokenCache[id]
        const data = await this.contract.methods.tokenURI(id).call()
        this.tokenCache[id] = data
        return data
    }

    async getTokenURIData(id: number): Promise<any> {
        //Check cache
        if (this.uriDataCache[id]) return this.uriDataCache[id]
        const uri = await this.getTokenURI(id)
        if (!uri) return null
        const res = (await axios.get(uri)).data
        //Save to cache
        this.uriDataCache[id] = res
        return res
    }
}

export default ERC721Token
