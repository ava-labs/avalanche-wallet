import { AbiItem, web3 } from '@/evm'
import IERC721Abi from '@openzeppelin/contracts/build/contracts/ERC721.json'
import IERC1155Abi from '@openzeppelin/contracts/build/contracts/IERC1155MetadataURI.json'
import { ERC721Balance, ERC721TokenInput } from '@/store/modules/assets/modules/types'
import axios from 'axios'

interface TokenDataCache {
    [index: number]: string
}

interface URIDataCache {
    [index: number]: string
}

const ERC721MetadataID = '0x5b5e139f'
const ERC721EnumerableID = '0x780e9d63'
const INTERFACE_SIGNATURE_ERC1155 = '0xd9b67a26'

class ERC721Token {
    contract: any
    data: ERC721TokenInput
    tokenCache: TokenDataCache = {}
    uriDataCache: URIDataCache = {}
    canSupport = false

    constructor(data: ERC721TokenInput) {
        this.data = { ...data }
        this.updateSupports()
    }

    async updateSupports() {
        try {
            if (this.data.tokenId !== undefined) {
                this.contract = new web3.eth.Contract(
                    IERC1155Abi.abi as AbiItem[],
                    this.data.address
                )
                if (
                    (this.canSupport = await this.contract.methods
                        .supportsInterface(INTERFACE_SIGNATURE_ERC1155)
                        .call())
                ) {
                    return
                }
            }
            this.contract = new web3.eth.Contract(IERC721Abi.abi as AbiItem[], this.data.address)
            this.data.tokenId = undefined
            let metadata = await this.contract.methods.supportsInterface(ERC721MetadataID).call()
            let enumerable = await this.contract.methods
                .supportsInterface(ERC721EnumerableID)
                .call()
            this.canSupport = metadata && enumerable
        } catch (err) {
            this.canSupport = false
            this.contract = undefined
        }
    }

    async getBalance(address: string): Promise<number> {
        try {
            const result =
                this.data.tokenId !== undefined
                    ? await this.contract.methods.balanceOf(address, this.data.tokenId).call()
                    : await this.contract.methods.balanceOf(address).call()
            return parseInt(result)
        } catch (e) {
            return 0
        }
    }

    async getAllTokensIds(address: string): Promise<ERC721Balance[]> {
        if (!this.canSupport) return []

        const bal = await this.getBalance(address)

        if (this.data.tokenId !== undefined) {
            return [{ tokenId: this.data.tokenId.toString(), count: bal }]
        }
        const res = []
        for (var i = 0; i < bal; i++) {
            let tokenId = await this.contract.methods.tokenOfOwnerByIndex(address, i).call()
            res.push({ tokenId, count: 1 })
        }
        return res
    }

    async getAllTokenData(address: string): Promise<string[]> {
        if (this.data.tokenId !== undefined) {
            let bal = await this.getBalance(address)

            const tokenURI = await this.getTokenURI(this.data.tokenId)
            return Array(bal).fill(tokenURI)
        }
        const ids = await this.getAllTokensIds(address)
        const res = []
        for (const tid of ids) res.push(await this.getTokenURI(parseInt(tid.tokenId)))
        return res
    }

    createTransferTx(from: string, to: string, id: string) {
        return this.data.tokenId !== undefined
            ? this.contract.methods.safeTransferFrom(from, to, id, 1, '0x')
            : this.contract.methods.transferFrom(from, to, id)
    }

    async getTokenURI(id: number) {
        if (this.tokenCache[id]) return this.tokenCache[id]
        let data =
            this.data.tokenId !== undefined
                ? await this.contract.methods.uri(id).call()
                : await this.contract.methods.tokenURI(id).call()

        if (data.startsWith('ipfs://')) data = 'https://ipfs.io/ipfs' + data.substring(7)
        this.tokenCache[id] = data
        return data
    }

    async getTokenURIData(id: number): Promise<any> {
        //Check cache
        if (this.uriDataCache[id]) return this.uriDataCache[id]
        const uri: string = await this.getTokenURI(id)
        if (!uri) return null

        const res = (await axios.get(uri)).data
        //Save to cache
        this.uriDataCache[id] = res
        return res
    }
}

export default ERC721Token
