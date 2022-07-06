import { InfoAPI } from '@c4tplatform/camino/dist/apis/info'
import Avalanche from '@c4tplatform/camino'
//@ts-ignore
import BinTools from '@c4tplatform/camino/dist/utils/bintools'
import { TestNetworkID } from '@c4tplatform/camino/dist/utils'

// Connect to TestNet by default
// Doesn't really matter how we initialize, it will get changed by the network module later
let ip: string = 'path.to.nowhere'
let port: number = 0
let protocol: string = 'http'
let network_id: number = TestNetworkID
let bintools: BinTools = BinTools.getInstance()
let ava: Avalanche = new Avalanche(ip, port, protocol, network_id)
let infoApi: InfoAPI = ava.Info()

function isValidAddress(addr: string) {
    try {
        let res = bintools.stringToAddress(addr)
        return true
    } catch (err) {
        return false
    }
}

export { ava, infoApi, bintools, isValidAddress }
