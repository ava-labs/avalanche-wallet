import { Interface } from '@ethersproject/abi'
import ERC721Abi from '@openzeppelin/contracts/build/contracts/ERC721.json'
import ERC20Abi from '@openzeppelin/contracts/build/contracts/ERC20.json'
import { BN } from 'ethereumjs-util'

export interface AbiParsed {
    name: string
    params: {
        name: string
        type: string
        value: string
    }[]
}

export const erc20Interface = new Interface(ERC20Abi.abi)
export const erc721Interface = new Interface(ERC721Abi.abi)

export function decodeTxData(data: string, value: BN): AbiParsed {
    const tx = {
        data,
        value: value.toString(),
    }

    const parsed = erc20Interface.parseTransaction(tx) || erc721Interface.parseTransaction(tx)

    return {
        name: parsed.name,
        params: parsed.functionFragment.inputs.map((input, i) => {
            return {
                name: input.name,
                type: input.type,
                value: parsed.args[i],
            }
        }),
    }
}
