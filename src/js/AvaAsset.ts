
// Manages BigNumber and Ava conversion and arithmetic
import BN from 'bn.js';
import Big from 'big.js';

class AvaAsset{
    id: string;
    name: string;
    symbol: string;
    denomination: number;
    amount: BN;
    private readonly pow: Big;
    constructor(id:string, name:string, symbol:string, denomination: number){
        this.id = id;
        this.name = name;
        this.symbol = symbol;
        this.denomination = denomination;
        this.amount = new BN(0, 10);
        this.pow = Big(10).pow(denomination);
    }

    addBalance(val:BN):void{
        this.amount = this.amount.add(val);
    }

    resetBalance(){
        this.amount = new BN(0, 10);
    }

    toString(){
        let big = Big(this.amount.toString(10)).div(this.pow);
        return big.toFixed(this.denomination);
        // return this.bn.toString(10);
    }

    getAmount():Big{
        return Big(this.amount.toString(10)).div(this.pow);
    }
}


export default AvaAsset;
