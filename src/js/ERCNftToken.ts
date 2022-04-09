import { AbiItem, web3 } from '@/evm'
import IERCNftAbi from '@openzeppelin/contracts/build/contracts/ERC721.json'
import IERC1155Abi from '@openzeppelin/contracts/build/contracts/IERC1155MetadataURI.json'
import { ERCNftBalance, ERCNftTokenInput } from '@/store/modules/assets/modules/types'
import { BN } from 'avalanche'
import axios from 'axios'

interface TokenDataCache {
    [index: number]: string
}

interface URIDataCache {
    [index: number]: string
}

const ERCNftMetadataID = '0x5b5e139f'
const ERCNftEnumerableID = '0x780e9d63'
const INTERFACE_SIGNATURE_ERC1155 = '0xd9b67a26'

class ERCNftToken {
    contract: any
    data: ERCNftTokenInput
    tokenCache: TokenDataCache = {}
    uriDataCache: URIDataCache = {}
    canSupport = false

    constructor(data: ERCNftTokenInput) {
        this.data = { ...data }
        this.updateSupports()
    }

    async updateSupports() {
        try {
            if (this.data.erc1155TokenIds.length > 0) {
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
            this.contract = new web3.eth.Contract(IERCNftAbi.abi as AbiItem[], this.data.address)
            this.data.erc1155TokenIds = []
            let metadata = await this.contract.methods.supportsInterface(ERCNftMetadataID).call()
            let enumerable = await this.contract.methods
                .supportsInterface(ERCNftEnumerableID)
                .call()
            this.canSupport = metadata && enumerable
        } catch (err) {
            this.canSupport = false
            this.contract = undefined
        }
    }

    async getBalance(address: string, tokenId: BN | undefined): Promise<number> {
        try {
            const result = tokenId
                ? await this.contract.methods.balanceOf(address, tokenId).call()
                : await this.contract.methods.balanceOf(address).call()
            return parseInt(result)
        } catch (e) {
            return 0
        }
    }

    async getAllTokensIds(address: string): Promise<ERCNftBalance[]> {
        if (!this.canSupport) return []
        const res = []

        if (this.data.erc1155TokenIds.length > 0) {
            for (let tokenId of this.data.erc1155TokenIds) {
                const bal = await this.getBalance(address, tokenId)
                if (bal > 0) res.push({ tokenId, quantity: bal })
            }
        } else {
            const bal = await this.getBalance(address, undefined)
            for (var i = 0; i < bal; i++) {
                let tokenId = await this.contract.methods.tokenOfOwnerByIndex(address, i).call()
                res.push({ tokenId, quantity: 1 })
            }
        }
        return res
    }

    async getAllTokenData(address: string): Promise<string[]> {
        const res = []
        const ids = await this.getAllTokensIds(address)
        if (this.data.erc1155TokenIds.length > 0) {
            for (const tid of ids) res.push(await this.getTokenURI(parseInt(tid.tokenId)))
        } else {
            for (const tid of ids) res.push(await this.getTokenURI(parseInt(tid.tokenId)))
        }
        return res
    }

    createTransferTx(from: string, to: string, id: string) {
        return this.data.erc1155TokenIds.length > 0
            ? this.contract.methods.safeTransferFrom(from, to, id, 1, '0x')
            : this.contract.methods.transferFrom(from, to, id)
    }

    async getTokenURI(id: number) {
        if (this.tokenCache[id]) return this.tokenCache[id]
        let data =
            this.data.erc1155TokenIds.length > 0
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

export default ERCNftToken
