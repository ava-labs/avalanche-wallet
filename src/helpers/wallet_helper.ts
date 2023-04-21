import { ava, bintools } from '@/AVA'
import {
    UTXO as PlatformUTXO,
    UTXOSet as PlatformUTXOSet,
} from '@c4tplatform/caminojs/dist/apis/platformvm/utxos'
import { UnsignedTx } from '@c4tplatform/caminojs/dist/apis/platformvm'
import { UTXO as AVMUTXO } from '@c4tplatform/caminojs/dist/apis/avm/utxos'
import { AmountOutput } from '@c4tplatform/caminojs/dist/apis/avm'
import { WalletType } from '@/js/wallets/types'

import { BN, Buffer } from '@c4tplatform/caminojs/dist'
import {
    buildCreateNftFamilyTx,
    buildEvmTransferErc20Tx,
    buildEvmTransferERCNftTx,
    buildEvmTransferNativeTx,
    buildMintNftTx,
} from '@/js/TxHelper'
import { PayloadBase } from '@c4tplatform/caminojs/dist/utils'
import { ITransaction } from '@/components/wallet/transfer/types'

import { web3 } from '@/evm'
import Erc20Token from '@/js/Erc20Token'
import { getStakeForAddresses } from '@/helpers/utxo_helper'
import ERCNftToken from '@/js/ERCNftToken'
import { OutputOwners } from '@c4tplatform/caminojs/dist/common'
import { GetValidatorsResponse } from '@/store/modules/platform/types'
import { MultisigWallet } from '@/js/wallets/MultisigWallet'
import { ValidatorRaw } from '@/components/misc/ValidatorList/types'
import { SignatureError } from '@c4tplatform/caminojs/dist/common'
import { ChainIdType } from '@/constants'
import { bnToBig } from '@/helpers/helper'

class WalletHelper {
    static async getStake(wallet: WalletType): Promise<BN> {
        let addrs = wallet.getAllAddressesP()
        return await getStakeForAddresses(addrs)
    }

    static async createNftFamily(
        wallet: WalletType,
        name: string,
        symbol: string,
        groupNum: number
    ) {
        let fromAddresses = wallet.getDerivedAddresses()
        let changeAddress = wallet.getChangeAddressAvm()

        let minterAddress = wallet.getCurrentAddressAvm()

        let utxoSet = wallet.utxoset

        let unsignedTx = await buildCreateNftFamilyTx(
            name,
            symbol,
            groupNum,
            fromAddresses,
            minterAddress,
            changeAddress,
            utxoSet
        )

        let signed = await wallet.signX(unsignedTx)
        return await ava.XChain().issueTx(signed)
    }

    static async mintNft(
        wallet: WalletType,
        mintUtxo: AVMUTXO,
        payload: PayloadBase,
        quantity: number
    ) {
        let ownerAddress = wallet.getCurrentAddressAvm()
        let changeAddress = wallet.getChangeAddressAvm()

        let sourceAddresses = wallet.getDerivedAddresses()

        let utxoSet = wallet.utxoset
        let tx = await buildMintNftTx(
            mintUtxo,
            payload,
            quantity,
            ownerAddress,
            changeAddress,
            sourceAddresses,
            utxoSet
        )
        let signed = await wallet.signX(tx)
        return await ava.XChain().issueTx(signed)
    }

    static async issueBatchTx(
        wallet: WalletType,
        chainId: ChainIdType,
        orders: (ITransaction | AVMUTXO)[],
        addr: string,
        memo: Buffer | undefined
    ): Promise<string> {
        if (chainId === 'P') {
            if (orders.length !== 1 || !(orders[0] as ITransaction).asset)
                throw new Error('Can only process 1 fungible order')
            const order = orders[0] as ITransaction
            return await this.platformBaseTx(wallet, order.amount, addr, memo ?? Buffer.alloc(0))
        }

        let unsignedTx = await wallet.buildUnsignedTransaction(orders, addr, memo)
        const tx = await wallet.signX(unsignedTx)
        const txId: string = await ava.XChain().issueTx(tx)

        return txId
    }

    static async validate(
        wallet: WalletType,
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        delegationFee: number,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        let utxoSet = wallet.getPlatformUTXOSet()

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        let pAddressStrings = wallet.getAllAddressesP()

        let stakeAmount = amt

        // If reward address isn't given use index 0 address
        if (!rewardAddress) {
            rewardAddress = wallet.getPlatformRewardAddress()
        }

        // For change address use first available on the platform chain
        let changeAddress = wallet.getFirstAvailableAddressPlatform()

        let stakeReturnAddr = wallet.getCurrentAddressPlatform()

        // Convert dates to unix time
        let startTime = new BN(Math.round(start.getTime() / 1000))
        let endTime = new BN(Math.round(end.getTime() / 1000))

        const unsignedTx = await ava.PChain().buildAddValidatorTx(
            utxoSet,
            [stakeReturnAddr],
            pAddressStrings, // from
            [changeAddress], // change
            nodeID,
            startTime,
            endTime,
            stakeAmount,
            [rewardAddress],
            delegationFee
        )

        let tx = await wallet.signP(unsignedTx)
        return await ava.PChain().issueTx(tx)
    }

    static async delegate(
        wallet: WalletType,
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        let utxoSet = wallet.getPlatformUTXOSet()
        const pAddressStrings = wallet.getAllAddressesP()
        const signerAddresses = wallet.getSignerAddresses('P')

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        // If reward address isn't given use index 0 address
        if (!rewardAddress) {
            rewardAddress = wallet.getPlatformRewardAddress()
        }

        let stakeReturnAddr = wallet.getPlatformRewardAddress()

        // For change address use first available on the platform chain
        let changeAddress = wallet.getFirstAvailableAddressPlatform()

        // Convert dates to unix time
        let startTime = new BN(Math.round(start.getTime() / 1000))
        let endTime = new BN(Math.round(end.getTime() / 1000))

        const unsignedTx = await ava.PChain().buildAddDelegatorTx(
            utxoSet,
            [stakeReturnAddr],
            [pAddressStrings, signerAddresses],
            [changeAddress],
            nodeID,
            startTime,
            endTime,
            amt,
            [rewardAddress] // reward address
        )

        const tx = await wallet.signP(unsignedTx)
        return await ava.PChain().issueTx(tx)
    }

    static async getAddressState(address: string): Promise<BN> {
        return await ava.PChain().getAddressStates(address)
    }

    static async getRegisteredNode(address: string): Promise<string> {
        return await ava.PChain().getRegisteredShortIDLink(address)
    }

    static async registerNodeTx(
        wallet: WalletType,
        nodePrivateKey: string,
        oldNodeID: string | undefined,
        newNodeID: string | undefined,
        address: string,
        nodeAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string | undefined> {
        let utxoSet = wallet.getPlatformUTXOSet()

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        const pAddressStrings = wallet.getAllAddressesP()
        if (nodeAddress) {
            // Multisig case, put node address as signer in UTx
            pAddressStrings.push(nodeAddress)
        }

        const signerAddresses = wallet.getSignerAddresses('P')

        // For change address use first available on the platform chain
        const changeAddress = wallet.getChangeAddressPlatform()
        const consortiumMemberAuthCredentials: [number, Buffer | string][] = [
            [0, pAddressStrings[0]],
        ]

        const threshold =
            wallet.type === 'multisig' ? (wallet as MultisigWallet)?.keyData?.owner?.threshold : 1

        const unsignedTx = await ava.PChain().buildRegisterNodeTx(
            utxoSet,
            [pAddressStrings, signerAddresses], // from + possible signers
            [changeAddress], // change
            oldNodeID,
            newNodeID,
            address,
            consortiumMemberAuthCredentials,
            undefined, // memo
            undefined, // asOf
            Number(threshold)
        )

        try {
            const tx = await wallet.signP(unsignedTx, [nodePrivateKey])
            return await ava.PChain().issueTx(tx)
        } catch (err) {
            if (err instanceof SignatureError) {
                return undefined
            } else {
                throw err
            }
        }
    }

    static async addValidatorTx(
        wallet: WalletType,
        nodeID: string,
        startTime: BN,
        endTime: BN,
        stakeAmount: BN,
        endTxTime?: number
    ): Promise<string | undefined> {
        const pAddressStrings = wallet.getAllAddressesP()
        const utxoSet = wallet.getPlatformUTXOSet()
        const signerAddresses = wallet.getSignerAddresses('P')
        const threshold =
            wallet.type === 'multisig' ? (wallet as MultisigWallet)?.keyData?.owner?.threshold : 1

        const unsignedTx = await ava
            .PChain()
            .buildAddValidatorTx(
                utxoSet,
                pAddressStrings,
                [pAddressStrings, signerAddresses],
                pAddressStrings,
                nodeID,
                startTime,
                endTime,
                stakeAmount,
                pAddressStrings,
                0,
                undefined,
                1,
                undefined,
                undefined,
                threshold,
                threshold
            )

        try {
            const tx = await wallet.signP(unsignedTx, undefined, endTxTime)
            return await ava.PChain().issueTx(tx)
        } catch (err) {
            console.error(err)
            return
        }
    }

    static async platformBaseTx(
        wallet: WalletType,
        amount: BN,
        toAddress: string,
        memo: Buffer,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        let utxoSet = wallet.getPlatformUTXOSet()

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        const pAddressStrings = wallet.getAllAddressesP()
        const signerAddresses = wallet.getSignerAddresses('P')

        // For change address use first available on the platform chain
        const changeAddress = wallet.getChangeAddressPlatform()

        const threshold =
            wallet.type === 'multisig' ? (wallet as MultisigWallet)?.keyData?.owner?.threshold : 1

        const unsignedTx = await ava.PChain().buildBaseTx(
            utxoSet,
            amount,
            [toAddress],
            [pAddressStrings, signerAddresses], // from + possible signers
            [changeAddress], // change
            memo,
            undefined, // asOf
            undefined, // lockTime
            1, // toThreshold
            threshold // changeThreshold
        )

        let tx = await wallet.signP(unsignedTx)
        return await ava.PChain().issueTx(tx)
    }

    static async getEthBalance(wallet: WalletType) {
        let bal = await web3.eth.getBalance(wallet.ethAddress)
        return new BN(bal)
    }

    static async sendEth(
        wallet: WalletType,
        to: string,
        amount: BN, // in wei
        gasPrice: BN,
        gasLimit: number
    ) {
        let fromAddr = '0x' + wallet.getEvmAddress()

        let tx = await buildEvmTransferNativeTx(fromAddr, to, amount, gasPrice, gasLimit)

        let signedTx = await wallet.signEvm(tx)

        let txHex = signedTx.serialize().toString('hex')
        let hash = await web3.eth.sendSignedTransaction('0x' + txHex)
        return hash.transactionHash
    }

    static async sendErc20(
        wallet: WalletType,
        to: string,
        amount: BN,
        gasPrice: BN,
        gasLimit: number,
        token: Erc20Token
    ) {
        let fromAddr = '0x' + wallet.getEvmAddress()
        let tx = await buildEvmTransferErc20Tx(fromAddr, to, amount, gasPrice, gasLimit, token)

        let signedTx = await wallet.signEvm(tx)
        let txHex = signedTx.serialize().toString('hex')
        let hash = await web3.eth.sendSignedTransaction('0x' + txHex)
        return hash.transactionHash
    }

    static async sendERCNft(
        wallet: WalletType,
        to: string,
        gasPrice: BN,
        gasLimit: number,
        token: ERCNftToken,
        tokenId: string
    ) {
        let fromAddr = '0x' + wallet.getEvmAddress()
        let tx = await buildEvmTransferERCNftTx(fromAddr, to, gasPrice, gasLimit, token, tokenId)
        let signedTx = await wallet.signEvm(tx)
        let txHex = signedTx.serialize().toString('hex')
        let hash = await web3.eth.sendSignedTransaction('0x' + txHex)
        return hash.transactionHash
    }

    static async estimateTxGas(wallet: WalletType, tx: any) {
        let fromAddr = '0x' + wallet.getEvmAddress()
        let estGas = await tx.estimateGas({ from: fromAddr })
        return Math.round(estGas * 1.1)
    }

    static async estimateGas(wallet: WalletType, to: string, amount: BN, token: Erc20Token) {
        let from = '0x' + wallet.getEvmAddress()
        let tx = token.createTransferTx(to, amount)
        let estGas = await tx.estimateGas({
            from: from,
        })
        // Return 10% more
        return Math.round(estGas * 1.1)
    }

    static async findNodeIDInCurrentValidators(nodeID: string): Promise<any> {
        let subnets = await ava.PChain().getSubnets()
        let res = (await ava
            .PChain()
            .getCurrentValidators(subnets[0].ids, [nodeID])) as GetValidatorsResponse
        let validator = res.validators[0]
        return validator
    }

    static async getClaimables(address: string, txID?: string) {
        try {
            let responseClaimable = await ava.PChain().getClaimables([address])
            return responseClaimable
        } catch (e) {
            console.error(e)
        }
    }

    static async buildClaimTx(address: string, amount: BN, activeWallet: WalletType) {
        let addressBufferTest = ava.PChain().parseAddress(address)
        const claimableSigners: [number, Buffer][] = [[0, addressBufferTest]]
        let rewardsOwner = new OutputOwners([addressBufferTest])
        const unsignedTx = await ava.PChain().buildClaimTx(
            //@ts-ignore
            undefined,
            [address],
            [address],
            undefined,
            new BN(0),
            1,
            [],
            [rewardsOwner],
            [amount],
            rewardsOwner,
            new BN(1),
            claimableSigners
        )
        let tx = await activeWallet.signP(unsignedTx)
        return await ava.PChain().issueTx(tx)
    }

    static async findPendingValidator(nodeID: string): Promise<ValidatorRaw> {
        let subnets = await ava.PChain().getSubnets()
        let res = (await ava
            .PChain()
            .getPendingValidators(subnets[0].ids, [nodeID])) as GetValidatorsResponse
        let validator = res.validators[0]
        return validator
    }

    static async buildDepositClaimTx(addresses: string[], wallet: WalletType, depositTxID: string) {
        let utxoSet = wallet.utxoset

        const signerAddresses = wallet.getSignerAddresses('P')

        // For change address use first available on the platform chain
        const changeAddress = wallet.getChangeAddressPlatform()

        let addressBuffer = ava.PChain().parseAddress(addresses[0])

        const claimableSigners: [number, Buffer][] = [[0, addressBuffer]]

        let rewardsOwner = new OutputOwners([addressBuffer])

        const threshold =
            wallet.type === 'multisig' ? (wallet as MultisigWallet)?.keyData?.owner?.threshold : 1

        const unsignedTx = await ava.PChain().buildClaimTx(
            // @ts-ignore
            utxoSet,
            [addresses, signerAddresses],
            [changeAddress],
            undefined, // memo
            new BN(0), // asOf
            Number(threshold),
            [depositTxID],
            [],
            [],
            rewardsOwner,
            [addressBuffer],
            new BN(3)
        )

        try {
            const tx = await wallet.signP(unsignedTx)
            return await ava.PChain().issueTx(tx)
        } catch (err) {
            if (err instanceof SignatureError) {
                return undefined
            } else {
                throw err
            }
        }
    }

    static getUnsignedTxType(utx: string): string {
        let unsignedTx = new UnsignedTx()
        unsignedTx.fromBuffer(Buffer.from(utx, 'hex'))
        return unsignedTx.getTransaction().getTypeName()
    }

    static getToAddressFromUtx(utx: UnsignedTx, msigAlias?: string) {
        const tx = utx.getTransaction()

        const el = tx?.getOuts()?.find((o) => {
            const _address =
                'P' +
                bintools.addressToString(
                    ava.getHRP(),
                    tx?.getBlockchainID().toString(),
                    o?.getAddresses()?.[0]
                )
            return _address !== msigAlias
        })

        if (el) {
            const toAddress = bintools.addressToString(
                ava.getHRP(),
                tx?.getBlockchainID().toString(),
                el?.getAddresses()?.[0]
            )

            return toAddress
        }
    }

    static getTotalAmountFromUtx(utx: UnsignedTx, toAddress: string): number {
        let amount = 0
        const hrp = ava.getHRP()
        const tx = utx.getTransaction()

        for (const out of tx.getOuts()) {
            const output = out?.getOutput() as AmountOutput

            for (const addr of output?.getAddresses()) {
                const hrAddress = bintools.addressToString(
                    hrp,
                    tx?.getBlockchainID().toString(),
                    addr
                )

                if (hrAddress === toAddress) {
                    amount += Number(bnToBig(output?.getAmount(), 9)?.toString())
                }
            }
        }

        return amount
    }
}

export { WalletHelper }
