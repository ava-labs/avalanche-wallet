import { makeKeyfile, readKeyFile } from '../src/js/Keystore'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'

import { Buffer } from 'buffer/'
import { KeyFile, KeyFileDecrypted } from '../src/js/IKeystore'
import { Avalanche } from 'avalanche'

import { KeyPair as AVMKeyPair, KeyChain as AVMKeyChain } from 'avalanche/dist/apis/avm'

const chain_id: string = 'GJABrZ9A6UQFpwjPU8MDxDd8vuyRoDVeDAXc694wJ5t3zEkhU'
const ip: string = 'localhost'
const port: string = '9650'
const protocol: string = 'http'
const network_id: string = '12345'
const avalanche: Avalanche = new Avalanche(
    ip,
    parseInt(port),
    protocol,
    parseInt(network_id),
    chain_id
)
const avm = avalanche.XChain()

// A 2.0 and 3.0 Keystore version of the same keys
// Password is: 111111111

const KEYFILE_2 = `{"version":"2.0","salt":"2SjQXSMR87tBvYqbkwTFL61gEdwR","pass_hash":"2NJf6rqPshCU69hMkPEMBLBZLfBKshHy68cWgNY7kNmAM988Qt","keys":[{"key":"C8JG3QvhF9XUiXMyAmQoTfTkWg5UySMPKeCrkGH8u67HrqStNtBxZyDxLY6NrSS8k51Fg3V","iv":"Fc8Xyxmhd2X55sgjy4aTxN","address":"X-EAZkJNdFBjVQQ7zS81hWCnRHfMKf3vpYH"},{"key":"p52F7MGpyicfG2c7RXuKKKpUE7X9qjLX7qx2ju3mei58jU4vCxRQpjcR6RvSKbozphMT1s8","iv":"N6fYr5gT4TJfB6Tzs9oLMN","address":"X-7r1aDs2jiJHr1reFfLFzzKrprZruXVzqM"}]}`
const KEYFILE_3 = `{"version":"3.0","salt":"kwkVtmPkafnwWbp65nYs2z9cQeN","pass_hash":"2gid7yJzvyg2Mz4HUJLh3jvgumpDJmRu2PBopqHYacVjwisp1g","keys":[{"key":"PiLrcsSBZ1fBE9v3axsHycfhta6NwMf56qqGKgxswr4VSNGL3kZUQG8YCCRG2q7QDN8y5mp","iv":"L7MojgHmudo2WpbMCdfgCg","address":"X-7r1aDs2jiJHr1reFfLFzzKrprZruXVzqM"},{"key":"uDvvzSQQxkFGhYUvDcRFmWtKbqJEZ8swKgMx7Ba3eWUoTMaikvV2oD2jUFzaS35WdP8rtqF","iv":"AN8nLnaK84rfoKXtxm6evy","address":"X-EAZkJNdFBjVQQ7zS81hWCnRHfMKf3vpYH"},{"key":"g1AcoW7iXtiui87GVy466NkkHsGfQRRptfVLyboBUDtMart1NktRLfzZDxhVifBvU2Vxtzi","iv":"U3VZnEr8HgiD3rcNW6Abko","address":"X-7r1aDs2jiJHr1reFfLFzzKrprZruXVzqM"}],"warnings":["This address listed in this file is for internal wallet use only. DO NOT USE THIS ADDRESS"]}`
const KEYFILE_4 = `{"version":"4.0","salt":"UWLRsfsyjY51E1s8CVa7cvvMHMz","pass_hash":"M6mzyfS4i4bKBxXQZFuQ6BsRnMSVMe7GnBd1HTmVLi2jcscPA","keys":[{"key":"s2RScHaFr6nr3JQkb8wNBbAPAWiGNkZRRmbUYY2tnxhCpdTgnHLyTDHXN4mdfEV4fVwFcMP","iv":"A6jQMX7e6doGS6wVvdLzA"}]}`
const KEYFILE_5 = `{"version":"5.0","salt":"TEUQMGR1XdHs5wb4SVSA7LriUhR","pass_hash":"avkdK9YFLn1zfZjvBsB9ipKRzfqr4rvqBryVosB6NUgFiv9kd","keys":[{"key":"5jVaPDgXd9nm3DF6XWSbvpGFKVd5yujnYekQCoK4evkoMBAWNz7Nc7YVKYUc6RQJiPy47rh1kfc2uydapEuVieN51eeHRATGqQP4Rj5wjN1xwKVgEsxvGeAytMevbYE9L2y4nCPyHvVcPQB66d7B5kdgYv3N7QVd3K284skjfGsZbZAT16vinjkZry8ypdwt2UV7c6WbVFX72BuEAajapn5TdkWCpPHJZgTkVs9utfndxYMW9m","iv":"Ak8DSMKMy4f1RXHSSt15KK"}]}`
// const crypto = require('crypto');

// global.crypto = crypto;
// Object.defineProperty(global.self, 'crypto', {
//    value: {
//       // @ts-ignore
//       getRandomValues: arr => crypto.randomBytes(arr.length)
//    }
// });

describe('Export/Import Keystore', () => {
    const pass: string = 'randompasswordofmine'
    const keyChain: AVMKeyChain = avm.keyChain()

    const key1: AVMKeyPair = keyChain.makeKey()
    // const key1:AVMKeyPair = keyChain.getKey(addr1);

    const key2: AVMKeyPair = keyChain.makeKey()
    // const key2:AVMKeyPair = keyChain.getKey(addr2);

    test('can encrypt/decrypt hd', async () => {
        let mnemonic1 =
            'lamp horror speak web science kingdom gospel switch exile flash copper file powder stereo fever similar worry silent ecology clap step trick assume genre'
        let mnemonic2 =
            'cinnamon embark switch food topic cricket develop tilt champion rough under advice assist layer tell romance stone fringe lava economy friend chase cup laundry'

        const w1: AvaHdWallet = new AvaHdWallet(mnemonic1)
        const w2: AvaHdWallet = new AvaHdWallet(mnemonic2)

        const keyfile: KeyFile = await makeKeyfile([w1, w2], pass)
        const rawData: KeyFileDecrypted = await readKeyFile(keyfile, pass)

        expect(rawData.keys[0].key).toEqual(key1.getPrivateKeyString())
        expect(rawData.keys[1].key).toEqual(key2.getPrivateKeyString())
    })

    test('Can import 2.0', async () => {})

    test('Can import 3.0', async () => {})
})
