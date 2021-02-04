import { readKeyFile } from '../src/js/Keystore'

// A 2.0 and 3.0 Keystore version of the same keys
// Passwords are: 111111111
const KEYFILE_2 = `{"version":"2.0","salt":"2SjQXSMR87tBvYqbkwTFL61gEdwR","pass_hash":"2NJf6rqPshCU69hMkPEMBLBZLfBKshHy68cWgNY7kNmAM988Qt","keys":[{"key":"C8JG3QvhF9XUiXMyAmQoTfTkWg5UySMPKeCrkGH8u67HrqStNtBxZyDxLY6NrSS8k51Fg3V","iv":"Fc8Xyxmhd2X55sgjy4aTxN","address":"X-EAZkJNdFBjVQQ7zS81hWCnRHfMKf3vpYH"},{"key":"p52F7MGpyicfG2c7RXuKKKpUE7X9qjLX7qx2ju3mei58jU4vCxRQpjcR6RvSKbozphMT1s8","iv":"N6fYr5gT4TJfB6Tzs9oLMN","address":"X-7r1aDs2jiJHr1reFfLFzzKrprZruXVzqM"}]}`
const KEYFILE_3 = `{"version":"3.0","salt":"kwkVtmPkafnwWbp65nYs2z9cQeN","pass_hash":"2gid7yJzvyg2Mz4HUJLh3jvgumpDJmRu2PBopqHYacVjwisp1g","keys":[{"key":"PiLrcsSBZ1fBE9v3axsHycfhta6NwMf56qqGKgxswr4VSNGL3kZUQG8YCCRG2q7QDN8y5mp","iv":"L7MojgHmudo2WpbMCdfgCg","address":"X-7r1aDs2jiJHr1reFfLFzzKrprZruXVzqM"},{"key":"uDvvzSQQxkFGhYUvDcRFmWtKbqJEZ8swKgMx7Ba3eWUoTMaikvV2oD2jUFzaS35WdP8rtqF","iv":"AN8nLnaK84rfoKXtxm6evy","address":"X-EAZkJNdFBjVQQ7zS81hWCnRHfMKf3vpYH"},{"key":"g1AcoW7iXtiui87GVy466NkkHsGfQRRptfVLyboBUDtMart1NktRLfzZDxhVifBvU2Vxtzi","iv":"U3VZnEr8HgiD3rcNW6Abko","address":"X-7r1aDs2jiJHr1reFfLFzzKrprZruXVzqM"}],"warnings":["This address listed in this file is for internal wallet use only. DO NOT USE THIS ADDRESS"]}`
const KEYFILE_4 = `{"version":"4.0","salt":"UWLRsfsyjY51E1s8CVa7cvvMHMz","pass_hash":"M6mzyfS4i4bKBxXQZFuQ6BsRnMSVMe7GnBd1HTmVLi2jcscPA","keys":[{"key":"s2RScHaFr6nr3JQkb8wNBbAPAWiGNkZRRmbUYY2tnxhCpdTgnHLyTDHXN4mdfEV4fVwFcMP","iv":"A6jQMX7e6doGS6wVvdLzA"}]}`
const KEYFILE_5 = `{"version":"5.0","salt":"TEUQMGR1XdHs5wb4SVSA7LriUhR","pass_hash":"avkdK9YFLn1zfZjvBsB9ipKRzfqr4rvqBryVosB6NUgFiv9kd","keys":[{"key":"5jVaPDgXd9nm3DF6XWSbvpGFKVd5yujnYekQCoK4evkoMBAWNz7Nc7YVKYUc6RQJiPy47rh1kfc2uydapEuVieN51eeHRATGqQP4Rj5wjN1xwKVgEsxvGeAytMevbYE9L2y4nCPyHvVcPQB66d7B5kdgYv3N7QVd3K284skjfGsZbZAT16vinjkZry8ypdwt2UV7c6WbVFX72BuEAajapn5TdkWCpPHJZgTkVs9utfndxYMW9m","iv":"Ak8DSMKMy4f1RXHSSt15KK"}]}`
const KEYFILE_6 = `{"version":"6.0","salt":"2NgqFaoYSe5foo8oEtcdB658c7Eb","activeIndex":0,"keys":[{"key":"KJYzUxFzn2EFazvAkfEgkbdJ7L2qeUTG5jTHUa9MunaNZWzNREd1GvYbwbUDdUsEu9Z5vB4kKW6x3farGCjtDHJ6c4nRCEnJKTUmFsBZ6CZqQ4MfXCMBXPvzvvDuv3VhYeE1LkiQHQRhEfKQGVaY282xDRifx3xyeT8ar18LxF3UPDNjX1D1EDLX4bTvbT4cChc8EPj9ufwXrov1y7Fcw3krJ5H87GnkwCZezzTxUeas1eTztZ","iv":"TQei93ehgGWgUKXkLha8Ef","type":"mnemonic"}]}`

const KEY_V2_V3 = '2DvMW4ZsNVdiiBsrEdPBTDr47bTtgr4H8qQKXz2D37YKeTLwDw'
const KEY_V4 = 'jegD9bfh1qYjnyxUgnG92CEyAx7s4iZRgcYatdN2u1qhy1Tbr'
const KEY_V5_V6 =
    'solar ordinary sentence pelican trim ring indicate cake ordinary water size improve impose gentle frown sound know siren sick elder wait govern tortoise unit'

describe('Export/Import Keystore', () => {
    test('can read v2', async () => {
        const data = await readKeyFile(JSON.parse(KEYFILE_2), '111111111')
        expect(data.keys.some(({ key }) => key === KEY_V2_V3)).toBe(true)
    })

    test('can read v3', async () => {
        const data = await readKeyFile(JSON.parse(KEYFILE_3), '111111111')
        expect(data.keys.some(({ key }) => key === KEY_V2_V3)).toBe(true)
    })

    test('can read v4', async () => {
        const data = await readKeyFile(JSON.parse(KEYFILE_4), '111111111')
        expect(data.keys.some(({ key }) => key === KEY_V4)).toBe(true)
    })

    test('can read v5', async () => {
        const data = await readKeyFile(JSON.parse(KEYFILE_5), '111111111')
        expect(data.keys.some(({ key }) => key === KEY_V5_V6)).toBe(true)
    })

    test('can read v6', async () => {
        const data = await readKeyFile(JSON.parse(KEYFILE_6), '111111111')
        expect(data.keys.some(({ key }) => key === KEY_V5_V6)).toBe(true)
    })
})
