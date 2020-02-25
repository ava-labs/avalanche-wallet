
// Manages BigNumber and Ava conversion and arithmetic
import * as BN from 'bn.js';

console.log(BN);

class AvaAsset{
    name: string;
    symbol: string;
    denomination: number;
    bn: BN;
    constructor(name:string, symbol:string, denomination: number){
        this.name = name;
        this.symbol = symbol;
        this.denomination = denomination;
        this.bn = new BN(0, 10);
    }
}


export default AvaAsset;