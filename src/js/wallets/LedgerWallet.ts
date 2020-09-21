// import AppBtc from "@ledgerhq/hw-app-btc";
//@ts-ignore
import AppAvax from "@obsidiansystems/hw-app-avalanche";

import {Buffer, BN} from "avalanche";
import HDKey from 'hdkey';
import {ava, avm, bintools, pChain} from "@/AVA";
var bippath = require('bip32-path')
import createHash from "create-hash";
import store from '@/store';

import {AssetAmountDestination, UTXO, UTXOSet as AVMUTXOSet} from "avalanche/dist/apis/avm/utxos";
import {UTXOSet as PlatformUTXOSet} from "avalanche/dist/apis/platformvm/utxos";
import {AvaWalletCore} from "@/js/wallets/IAvaHdWallet";
import {ITransaction} from "@/components/wallet/transfer/types";
import {
    OperationTx,
    SelectCredentialClass,
    TransferableInput, TransferableOperation,
    TransferableOutput,
    Tx as AVMTx,
    UnsignedTx as AVMUnsignedTx
} from "avalanche/dist/apis/avm";

import {
    ImportTx, StakeableLockOut,
    Tx as PlatformTx,
    UnsignedTx as PlatformUnsignedTx
} from "avalanche/dist/apis/platformvm";

import {Credential, SigIdx, Signature, StandardTx, StandardUnsignedTx} from "avalanche/dist/common";
import {getPreferredHRP} from "avalanche/dist/utils";
import {HdWalletCore} from "@/js/wallets/HdWalletCore";
import {WalletType} from "@/store/types";

class LedgerWallet extends HdWalletCore implements AvaWalletCore {
    app: AppAvax;
    type: WalletType;
    constructor(app: AppAvax, hdkey: HDKey) {
        super(hdkey)
        this.app = app;
        this.type = 'ledger';
    }

    static async fromApp(app: AppAvax){
        let res = await app.getWalletExtendedPublicKey("44'/9000'/0'");

        let hd = new HDKey();
            hd.publicKey = res.public_key;
            hd.chainCode = res.chain_code;

        return new LedgerWallet(app, hd);
    }

    async sign<UnsignedTx extends (AVMUnsignedTx|PlatformUnsignedTx), SignedTx extends (AVMTx|PlatformTx)>(unsignedTx: UnsignedTx, isAVM: boolean = true): Promise<SignedTx>{

        const accountPath = bippath.fromString(`m/44'/9000'/0'`);

        let tx = unsignedTx.getTransaction();
        let txType = tx.getTxType();

        let txbuff = unsignedTx.toBuffer();
        let ins = tx.getIns();


        let operations: TransferableOperation[] = []

        // Try to get operations, it will fail if there are none, ignore and continue
        try{
            operations = (tx as OperationTx).getOperations();
        }catch (e) {console.log(e)}


        let items = ins;
        // If tx type is 17, sign ImportInputs instead
        if(txType===17 || txType===3){
            items = (tx as ImportTx).getImportInputs();
        }
        let chainId = isAVM ? 'X':'P';


        const msg:Buffer = Buffer.from(createHash('sha256').update(txbuff).digest());
        let paths: string[] = [];



        // Collect paths derivation paths for source addresses
        for (let i = 0; i < items.length; i++) {
            let item = items[i];

            let sigidxs: SigIdx[] = item.getInput().getSigIdxs();
            let sources = sigidxs.map(sigidx => sigidx.getSource());
            let addrs:string[] = sources.map(source => {
                let hrp = getPreferredHRP(ava.getNetworkID());
                return  bintools.addressToString(hrp, chainId, source);
            })

            for (let j = 0; j < addrs.length; j++) {
                let srcAddr = addrs[j];
                let pathStr = this.getPathFromAddress(srcAddr); // returns change/index

                paths.push(pathStr)
            }
        }

        // Do the Same for operational inputs, if there are any...
        for(var i=0;i<operations.length;i++){
            let op = operations[i];
            let sigidxs: SigIdx[] = op.getOperation().getSigIdxs();
            let sources = sigidxs.map(sigidx => sigidx.getSource());
            let addrs:string[] = sources.map(source => {
                let hrp = getPreferredHRP(ava.getNetworkID());
                return  bintools.addressToString(hrp, chainId, source);
            })

            for (let j = 0; j < addrs.length; j++) {
                let srcAddr = addrs[j];
                let pathStr = this.getPathFromAddress(srcAddr); // returns change/index

                paths.push(pathStr)
            }
        }

        // Open the ledger modal to block view
        // and ask user to sign with device
        try{
            store.commit('Ledger/openModal',{
                title: `Sign Hash`,
                info: msg.toString('hex').toUpperCase()
            })

            let uniquePaths = paths.filter((val: any, i: number) => {
                return paths.indexOf(val) === i;
            })

            let bip32Paths = uniquePaths.map(path => {
                return bippath.fromString(path, false)
            })

            let sigMap = await this.app.signHash(accountPath, bip32Paths, msg)
            store.commit('Ledger/closeModal')

            const sigs:Credential[] = [];

            for (let i = 0; i < items.length; i++) {
                const sigidxs: SigIdx[] = items[i].getInput().getSigIdxs();
                const cred:Credential = SelectCredentialClass(items[i].getInput().getCredentialID());

                for (let j = 0; j < sigidxs.length; j++) {
                    let pathIndex = i+j;
                    let pathStr = paths[pathIndex];

                    let sigRaw = sigMap.get(pathStr);
                    let sigBuff = Buffer.from(sigRaw);
                    const sig:Signature = new Signature();
                    sig.fromBuffer(sigBuff);
                    cred.addSignature(sig);
                }
                sigs.push(cred);
            }

            for (let i = 0; i < operations.length; i++) {
                let op = operations[i].getOperation();
                const sigidxs: SigIdx[] = op.getSigIdxs();
                const cred:Credential = SelectCredentialClass(op.getCredentialID());

                for (let j = 0; j < sigidxs.length; j++) {
                    let pathIndex = items.length+i+j;
                    let pathStr = paths[pathIndex];

                    let sigRaw = sigMap.get(pathStr);
                    let sigBuff = Buffer.from(sigRaw);
                    const sig:Signature = new Signature();
                    sig.fromBuffer(sigBuff);
                    cred.addSignature(sig);
                }
                sigs.push(cred);
            }

            let signedTx;
            if(isAVM){
                signedTx = new AVMTx((unsignedTx as AVMUnsignedTx), sigs);
            }else{
                signedTx = new PlatformTx((unsignedTx as PlatformUnsignedTx), sigs);
            }
            return signedTx as SignedTx;
        }catch(e){
            store.commit('Ledger/closeModal')
            throw e;
        }
    }

    getPathFromAddress(address: string){
        let externalAddrs = this.externalHelper.getExtendedAddresses();
        let internalAddrs = this.internalHelper.getExtendedAddresses();
        let platformAddrs = this.platformHelper.getExtendedAddresses();

        let extIndex = externalAddrs.indexOf(address);
        let intIndex = internalAddrs.indexOf(address);
        let platformIndex = platformAddrs.indexOf(address);

        if(extIndex >= 0){
            return `0/${extIndex}`
        }else if(intIndex >= 0){
            return `1/${intIndex}`
        }else if(platformIndex >= 0){
            return `0/${platformIndex}`
        }else{
            throw 'Unable to find source address.'
        }
    }

    async issueBatchTx(orders: (ITransaction|UTXO)[], addr: string, memo?: Buffer): Promise<string> {
        let unsignedTx = await this.buildUnsignedTransaction(orders,addr,memo);

        let tx = await this.sign<AVMUnsignedTx, AVMTx>(unsignedTx);
        const txId: string = await avm.issueTx(tx);

        // TODO: Must update index after sending a tx
        // TODO: Index will not increase but it could decrease.
        // TODO: With the current setup this can lead to gaps in index space greater than scan size.
        setTimeout(async () => {
            // Find the new HD index
            this.internalHelper.updateHdIndex()
            this.externalHelper.updateHdIndex()
            this.platformHelper.updateHdIndex()
        }, 2000)

        return txId;
    }

    async chainTransfer(amt: BN, sourceChain: string = 'X'): Promise<string> {
        let fee = avm.getTxFee();
        let amtFee = amt.add(fee);

        // EXPORT
        let pId = pChain.getBlockchainID();
        let xId = avm.getBlockchainID();
        let txId;

        if(sourceChain === 'X'){
            let toAddress = this.platformHelper.getCurrentAddress();
            let xChangeAddr = this.internalHelper.getCurrentAddress();
            let fromAddrs = this.getDerivedAddresses()

            let exportTx = await avm.buildExportTx(
                this.utxoset,
                amtFee,
                pId,
                [toAddress],
                fromAddrs,
                [xChangeAddr]
            );

            let tx = await this.sign<AVMUnsignedTx, AVMTx>(exportTx);
            return  avm.issueTx(tx);
        }else if(sourceChain === 'P'){
            let utxoSet = this.platformHelper.utxoSet as PlatformUTXOSet;
            let toAddress = this.externalHelper.getCurrentAddress();
            let pChangeAddr = this.platformHelper.getCurrentAddress();
            let fromAddrs = this.platformHelper.getAllDerivedAddresses();

            // console.log("HEX")
            // console.log("Export to: ", bintools.stringToAddress(toAddress).toString('hex'))
            // console.log("Export from: ",fromAddrs.map((addr)=> {return bintools.stringToAddress(addr).toString('hex')}).join(', '))
            // console.log("Export change: ",bintools.stringToAddress(pChangeAddr).toString('hex'))
            // console.log("bech32")
            // console.log("Export to: ",toAddress)
            // console.log("Export from: ",fromAddrs)
            // console.log("Export change: ",pChangeAddr)
            let exportTx = await pChain.buildExportTx(
                utxoSet,
                amtFee,
                xId,
                [toAddress],
                fromAddrs,
                [pChangeAddr]
            );

            // console.log(exportTx.serialize());
            // console.log(exportTx.serialize('display'));
            // console.log(exportTx.toBuffer().toString('hex'));

            // let tx = exportTx.sign(keychain);
            let tx = await this.sign<PlatformUnsignedTx, PlatformTx>(exportTx, false);
            return  pChain.issueTx(tx);
        }else{
            throw 'Invalid source chain.'
        }
    }

    async delegate(nodeID: string, amt: BN, start: Date, end: Date, rewardAddress?: string): Promise<string> {
        // let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain;
        const utxoSet: PlatformUTXOSet = this.platformHelper.utxoSet as PlatformUTXOSet;
        let pAddressStrings = this.platformHelper.getAllDerivedAddresses();
        let stakeAmount = amt;

        // If reward address isn't given use index 0 address
        if(!rewardAddress){
            rewardAddress = this.getPlatformRewardAddress();
        }

        let stakeReturnAddr = this.getPlatformRewardAddress();

        // For change address use first available on the platform chain
        let changeAddr = this.platformHelper.getFirstAvailableAddress();

        // Convert dates to unix time
        let startTime = new BN(Math.round(start.getTime() / 1000));
        let endTime = new BN(Math.round(end.getTime() / 1000));

        const unsignedTx = await pChain.buildAddDelegatorTx(
            utxoSet,
            [stakeReturnAddr],
            pAddressStrings,
            [changeAddr],
            nodeID,
            startTime,
            endTime,
            stakeAmount,
            [rewardAddress], // reward address
        );

        // console.log(unsignedTx.serialize('display'));
        // console.log(unsignedTx.toBuffer().toString('hex'))

        const tx = await this.sign<PlatformUnsignedTx, PlatformTx>(unsignedTx, false)
        // const tx =  unsignedTx.sign(keychain);

        // console.log(bintools.cb58Encode(tx.toBuffer()));
        //
        // console.log(tx.serialize());
        // console.log(tx.serialize('display'));
        // Update UTXOS
        setTimeout(async () => {
            this.getUTXOs()
        },3000);

        return  pChain.issueTx(tx);
    }

    async importToPlatformChain(): Promise<string> {
        await this.platformHelper.updateHdIndex();
        const utxoSet = await this.platformHelper.getAtomicUTXOs() as PlatformUTXOSet;
        let pAddrs = this.platformHelper.getAllDerivedAddresses();
        // Owner addresses, the addresses we exported to
        let pToAddr = this.platformHelper.getCurrentAddress();


        const unsignedTx = await pChain.buildImportTx(
            utxoSet,
            pAddrs,
            avm.getBlockchainID(),
            [pToAddr],
            [pToAddr],
            [pToAddr],
            undefined,
            undefined,

        );
        const tx = await this.sign<PlatformUnsignedTx, PlatformTx>(unsignedTx, false);

        // Update UTXOS
        setTimeout(async () => {
            await this.getUTXOs()
        },3000);

        return  pChain.issueTx(tx);
    }

    async importToXChain(): Promise<string> {
        const utxoSet = await this.externalHelper.getAtomicUTXOs() as AVMUTXOSet;
        let xUtxoSet = this.getUTXOSet();

        // console.log(utxoSet.getAllUTXOs());
        // console.log(xUtxoSet.getAllUTXOs());

        let externalIndex = this.externalHelper.hdIndex;
        // let xAddrs = this.externalHelper.getAllDerivedAddresses(externalIndex+20);
        let xToAddr = this.externalHelper.getCurrentAddress();
        let externalAddresses = this.externalHelper.getExtendedAddresses();
        let xAddrs = this.getDerivedAddresses();
        // let xToAddr = this.externalHelper.getAllDerivedAddresses(externalIndex+10);


        // console.log("Import to: ",xToAddr)


        // console.log(utxoSet.getAllUTXOs());
        // console.log(xUtxoSet.getAllUTXOs());
        // console.log(xUtxoSet.serialize());
        // console.log(utxoSet.serialize());
        // Owner addresses, the addresses we exported to
        const unsignedTx = await avm.buildImportTx(
            utxoSet,
            externalAddresses,
            pChain.getBlockchainID(),
            [xToAddr],
            externalAddresses,
            [xToAddr],

        );

        // console.log(unsignedTx.toBuffer().toString())


        let tx = await this.sign<AVMUnsignedTx, AVMTx>(unsignedTx);

        // // Update UTXOS
        setTimeout(async () => {
            await this.getUTXOs()
        },3000);

        return avm.issueTx(tx);
    }

    async validate(nodeID: string, amt: BN, start: Date, end: Date, delegationFee: number, rewardAddress?: string): Promise<string> {
        const utxoSet: PlatformUTXOSet = this.platformHelper.utxoSet as PlatformUTXOSet;
        let pAddressStrings = this.platformHelper.getAllDerivedAddresses();

        let stakeAmount = amt;

        // If reward address isn't given use index 0 address
        if(!rewardAddress){
            rewardAddress = this.getPlatformRewardAddress();
        }

        // For change address use first available on the platform chain
        let changeAddress = this.platformHelper.getFirstAvailableAddress();

        // Stake is always returned to address at index 0
        let stakeReturnAddr = this.getPlatformRewardAddress();

        // Convert dates to unix time
        let startTime = new BN(Math.round(start.getTime() / 1000));
        let endTime = new BN(Math.round(end.getTime() / 1000));

        const unsignedTx = await pChain.buildAddValidatorTx(
            utxoSet,
            [stakeReturnAddr],
            pAddressStrings, // from
            [changeAddress], // change
            nodeID,
            startTime,
            endTime,
            stakeAmount,
            [rewardAddress],
            delegationFee,
        );

        // console.log(unsignedTx.serialize('display'));
        // console.log(unsignedTx.toBuffer().toString('hex'))

        let tx = await this.sign<PlatformUnsignedTx, PlatformTx>(unsignedTx, false);

        // console.log(tx.toBuffer().toString('hex'));
        // console.log((tx.serialize()))
        // console.log((tx.serialize('display')))
        // Update UTXOS
        setTimeout(async () => {
            this.getUTXOs()
        },3000);
        return pChain.issueTx(tx);
    }

}

export {LedgerWallet};
