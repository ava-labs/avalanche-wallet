import { AbiItem, Contract, web3 } from '@/evm'
import IERC721Abi from '@/abi/IERC721MetaData.json'
import IERC1155Abi from '@/abi/IERC1155MetaData.json'
import { ERCNftBalance, ERCNftTokenInput } from '@/store/modules/assets/modules/types'
import axios from 'axios'

interface TokenDataCache {
    [index: number]: string
}

interface URIDataCache {
    [index: number]: string
}

const ERC721ID = '0x80ac58cd'
const ERC721MetadataID = '0x5b5e139f'
const ERC1155ID = '0xd9b67a26'

const ERC721_TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const ERC1155_TRANSFER_SINGLE = '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62'
const ERC1155_TRANSFER_BATCH = '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb'

const ERC721_TRANSFER_INPUT = IERC721Abi.find((e) => e.name === 'Transfer')?.inputs ?? []
const ERC1155_TRANSFER_SINGLE_INPUT =
    IERC1155Abi.find((e) => e.name === 'TransferSingle')?.inputs ?? []
const ERC1155_TRANSFER_BATCH_INPUT =
    IERC1155Abi.find((e) => e.name === 'TransferBatch')?.inputs ?? []

class ERCNftToken {
    contract?: Contract
    data: ERCNftTokenInput
    tokenCache: TokenDataCache = {}
    uriDataCache: URIDataCache = {}
    canSupport = false

    constructor(data: ERCNftTokenInput) {
        this.data = data
    }

    async updateSupports() {
        try {
            if (!this.data.type) {
                // assume ERC721 first
                this.contract = new web3.eth.Contract(IERC721Abi as AbiItem[], this.data.address)
                if (await this.contract.methods.supportsInterface(ERC721ID).call()) {
                    this.canSupport = await this.contract.methods
                        .supportsInterface(ERC721MetadataID)
                        .call()

                    if (this.canSupport) {
                        this.data.type = 'ERC721'
                    }
                } else if (await this.contract.methods.supportsInterface(ERC1155ID).call()) {
                    this.contract = new web3.eth.Contract(
                        IERC1155Abi as AbiItem[],
                        this.data.address
                    )

                    this.canSupport = true
                    this.data.type = 'ERC1155'
                }
            } else {
                this.contract = new web3.eth.Contract(
                    (this.data.type === 'ERC1155' ? IERC1155Abi : IERC721Abi) as AbiItem[],
                    this.data.address
                )
                this.canSupport = true
            }
        } catch (err) {
            this.canSupport = false
        }
    }

    static updateNftActivity = async (
        address: string,
        tokens: ERCNftToken[],
        fromBlock: number
    ): Promise<boolean> => {
        const topicAddress =
            address.substring(0, 2) + '000000000000000000000000' + address.substring(2)
        const collector: Map<string, Set<string>> = new Map()
        const topics0 = [[ERC1155_TRANSFER_SINGLE, ERC1155_TRANSFER_BATCH], ERC721_TRANSFER]
        const topics2 = [null, topicAddress]
        const addresses: string[][] = [[], []]
        tokens.forEach((t) => {
            collector.set(t.data.address, new Set(t.data.ercTokenIds))
            if (t.data.type === 'ERC1155') addresses[0].push(t.data.address)
            else if (t.data.type === 'ERC721') addresses[1].push(t.data.address)
        })
        for (let i = 0; i < 2; ++i) {
            if (addresses[i].length === 0) continue

            const logs = await web3.eth.getPastLogs({
                address: addresses[i],
                fromBlock,
                topics: [
                    topics0[i],
                    null,
                    i == 0 ? null : topicAddress,
                    i == 1 ? null : topicAddress,
                ],
            })
            for (const log of logs) {
                let entry = collector.get(log.address)
                if (entry) {
                    let parserInput
                    switch (log.topics[0]) {
                        case ERC1155_TRANSFER_SINGLE:
                            parserInput = ERC1155_TRANSFER_SINGLE_INPUT
                            break
                        case ERC1155_TRANSFER_BATCH:
                            parserInput = ERC1155_TRANSFER_BATCH_INPUT
                            break
                        default:
                            parserInput = ERC721_TRANSFER_INPUT
                    }
                    const parsed = web3.eth.abi.decodeLog(
                        parserInput,
                        log.data,
                        log.topics.slice(1)
                    )
                    if (parsed.tokenId) entry.add(parsed.tokenId)
                    else if (parsed.id) entry.add(parsed.id)
                    else for (const id of parsed.ids) entry.add(id)
                }
            }
        }
        let changed = false
        tokens.forEach((t) => {
            const entry = collector.get(t.data.address)
            if (entry && entry.size != t.data.ercTokenIds.length) {
                t.data.ercTokenIds = [...entry.values()]
                changed = true
            }
        })
        return changed
    }

    async getAllTokensIds(address: string): Promise<ERCNftBalance[]> {
        if (!this.canSupport || this.data.ercTokenIds.length == 0) return []
        let res: ERCNftBalance[] = []

        if (this.contract)
            try {
                if (this.data.type === 'ERC1155') {
                    const balances = await this.contract.methods
                        .balanceOfBatch(
                            Array(this.data.ercTokenIds.length).fill(address),
                            this.data.ercTokenIds
                        )
                        .call()
                    balances.forEach((s: string, i: number) => {
                        res.push({
                            tokenId: this.data.ercTokenIds[i],
                            quantity: parseInt(s),
                        })
                    })
                } else {
                    for (const token of this.data.ercTokenIds) {
                        try {
                            res.push({
                                tokenId: token,
                                quantity:
                                    (
                                        await this.contract?.methods.ownerOf(token).call()
                                    ).toLowerCase() === address
                                        ? 1
                                        : 0,
                            })
                        } catch (err) {
                            if (
                                err.message.includes(
                                    'Returned error: execution reverted: ERC721: invalid token ID'
                                )
                            ) {
                                res.push({
                                    tokenId: token,
                                    quantity: 0,
                                })
                            } else {
                                console.error(err)
                            }
                        }
                    }
                }
            } catch (e) {
                console.error(e)
            }
        return res
    }

    async getAllTokenData(address: string): Promise<string[]> {
        const res = []
        const ids = await this.getAllTokensIds(address)
        if (this.data.type === 'ERC1155') {
            for (const tid of ids) res.push(await this.getTokenURI(parseInt(tid.tokenId)))
        } else {
            for (const tid of ids) res.push(await this.getTokenURI(parseInt(tid.tokenId)))
        }
        return res
    }

    createTransferTx(from: string, to: string, id: string) {
        return this.contract
            ? this.data.type === 'ERC1155'
                ? this.contract.methods.safeTransferFrom(from, to, id, 1, '0x')
                : this.contract.methods.transferFrom(from, to, id)
            : undefined
    }

    async getTokenURI(id: number) {
        if (this.tokenCache[id]) return this.tokenCache[id]
        if (!this.contract) return undefined

        let data =
            this.data.type === 'ERC1155'
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

    static toChecksumAddress(address: string): string {
        return web3.utils.toChecksumAddress(address)
    }
}

export default ERCNftToken
