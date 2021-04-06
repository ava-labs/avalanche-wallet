/*
The base wallet class used for common functionality
*/
import { BN } from 'avalanche'
import { UTXOSet as AVMUTXOSet } from 'avalanche/dist/apis/avm'
import { UTXOSet as PlatformUTXOSet } from 'avalanche/dist/apis/platformvm'
var uniqid = require('uniqid')

class WalletCore {
    id: string

    utxoset: AVMUTXOSet
    platformUtxoset: PlatformUTXOSet
    stakeAmount: BN

    isFetchUtxos: boolean
    isInit: boolean

    constructor() {
        this.id = uniqid()
        this.utxoset = new AVMUTXOSet()
        this.platformUtxoset = new PlatformUTXOSet()
        this.stakeAmount = new BN(0)

        this.isInit = false
        this.isFetchUtxos = false
    }
}
export { WalletCore }
