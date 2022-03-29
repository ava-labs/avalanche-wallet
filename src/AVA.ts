import { KeyChain as AVMKeyChain, AVMAPI } from 'avalanche/dist/apis/avm'
import { InfoAPI } from 'avalanche/dist/apis/info'
import Avalanche from 'avalanche'
//@ts-ignore
import BinTools from 'avalanche/dist/utils/bintools'
import { EVMAPI } from 'avalanche/dist/apis/evm'
import { TestNetworkID } from 'avalanche/dist/utils'

// Connect to TestNet by default
// Doesn't really matter how we initialize, it will get changed by the network module later
let ip: string = 'path.to.nowhere'
let port: number = 0
let protocol: string = 'http'
let network_id: number = TestNetworkID
let bintools: BinTools = BinTools.getInstance()
let ava: Avalanche = new Avalanche(ip, port, protocol, network_id)

let avm: AVMAPI = ava.XChain()
let cChain: EVMAPI = ava.CChain()
let pChain = ava.PChain()
let infoApi: InfoAPI = ava.Info()
let keyChain: AVMKeyChain = avm.keyChain()

function isValidAddress(addr: string) {
    try {
        let res = bintools.stringToAddress(addr)
        return true
    } catch (err) {
        return false
    }
}

export { ava, avm, pChain, cChain, infoApi, bintools, isValidAddress, keyChain }
