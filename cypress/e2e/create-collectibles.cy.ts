import { expect } from 'chai'
import '@cypress/xpath'
import { changeNetwork, accessWallet, addKopernikusNetwork } from '../utils/utils'
import { testBuildNFT } from '../tests/buildNft'

describe('Wallet Access Mnemonic', () => {
    before(() => {
        cy.visit('/')
    })

    beforeEach(() => {

        //Address Chains
        cy.intercept('POST', '**/v2/addressChains', (req) => {
            let addressChains1 = {
                addressChains: {
                    columbus1apuapxnxt4vpn0l2xm6ygynnn6nqu3c6hl6v4j: [
                        '28Pp3JZJBABUmFQcC9ZXPjuDS6WVX8LeQP9y3DvpCXGiNiTQFV',
                    ],
                },
            }
            req.reply({
                statusCode: 200,
                body: addressChains1,
            })
        }).as('getAddressChains')

        //C Chain Intercepts
        cy.intercept('POST', '**/ext/bc/C/rpc', (req) => {
            if (req.body.method === 'eth_blockNumber') {
                let blockNumber = {
                    jsonrpc: '2.0',
                    id: req.body.id,
                    result: '0x1a5a1b',
                }
                req.reply({
                    statusCode: 200,
                    body: blockNumber,
                });
                req.alias = 'eth_blockNumber'
            }
            else if(req.body.method == 'eth_call')
            {
                let bodyReplace = {"jsonrpc":"2.0","id":req.body.id,"result":"0x0000000000000000000000000000000000000000000000000000000000000000"};

                req.reply({
                    statusCode: 200,
                    body: bodyReplace,
                });
                req.alias = 'eth_call';
            }
        });

        //X Chain Intercepts
        cy.intercept('POST', '**/ext/bc/X', (req) => {
            if(req.body.method == 'avm.getAssetDescription')
            {
                let bodyAsset = {
                    "jsonrpc": "2.0",
                    "result": {
                        "assetID": "o8seyjX6WupqJ1CE8CeaozK13kqVgc4DFvdvc4crfacLFBauW",
                        "name": "Camino",
                        "symbol": "CAM",
                        "denomination": "9"
                    },
                    "id": req.body.id
                }

                req.reply({
                    statusCode: 200,
                    body: bodyAsset,
                })

                req.alias = 'avmGetAssetDescription';
            }
            else if (req.body.method == 'avm.getUTXOs') {
                let initialUTXOs = {
                    "jsonrpc": "2.0",
                    "result": {
                        "numFetched": "1",
                        "utxos": [
                            "0x00006e6022992e47a93c2079efa6af06e63b854a54dbb3f0ffe426aa68091d86c8c90000000168c1c17ef684ee4260d1c7ab95fe5222dfd7fa60f3363051dae558072101df9b0000000700000004a817c80000000000000000000000000100000001e879d09a665d5819bfea36f44412739ea60e471a453b39f0"
                        ],
                        "endIndex": {
                            "address": "X-columbus17tvh99zxg7navpdvw7vswzpdnu8nx56zudw6qd",
                            "utxo": "5RjMDYiNeYiHYGZ77o5EB5i2DoY3bwpwFEbsH6PWP83W821Fz"
                        },
                        "encoding": "hex"
                    },
                    "id": req.body.id
                }

                req.reply({
                    statusCode: 200,
                    body: initialUTXOs,
                });

                req.alias = 'avmGetUtxos';
            }
        });

        //P Chain Intercepts
        // cy.intercept('POST', '**/ext/bc/P', (req) => {
        //     if (req.body.method === 'platform.getCurrentValidators') {
        //         let bodyValidators = {
        //             "jsonrpc": "2.0",
        //             "result": {
        //                 "validators": [
        //                     {
        //                         "txID": "2b7jaJ3Q2vUrYAxiB8LUztMwVHhjcDfjypb4S3qkd47zjJS7k1",
        //                         "startTime": "1671724189",
        //                         "endTime": "1677574828",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-4XqSrKztRE1LVXZR8sSkTmAEmARXc2BBy",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1gf9sa0ct8653xtax9jhl5yd3ezsjrxyy5z5kxx"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "1.0000",
        //                         "connected": true,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "ga3DFHiC2mMXxxbeUfMJQExc5dLz942EAReEhfYFSz5X7Yoec",
        //                         "startTime": "1676385760",
        //                         "endTime": "1678200684",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-MBDnqRTVMnagv8pLS1GK3yaSCUi3JBPEZ",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1qn8gtteu8qkppqvjzjwtaa5nth974y88zrr0wv"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "0.9787",
        //                         "connected": true,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "22fGriMQQq9R8CgXPyevzrYHKypFhiq1sU1AfJkFjwaXFRKMCo",
        //                         "startTime": "1647388800",
        //                         "endTime": "1678924800",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-PGHYeLVkU6ZVQEu8CuRBk6pQ2NJNAuzZ4",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1m4nr983lhd4p4nfsqk3a6a9mejugnn73ju0gav"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "20.0000",
        //                         "uptime": "0.9998",
        //                         "connected": true,
        //                         "delegators": [
        //                             {
        //                                 "txID": "UWSDtzgLwTQTftYYBDAcpbBaiDoCGtPMyGikEDEppwCLoS4jT",
        //                                 "startTime": "1661807576",
        //                                 "endTime": "1678924800",
        //                                 "stakeAmount": "25000000000",
        //                                 "nodeID": "NodeID-PGHYeLVkU6ZVQEu8CuRBk6pQ2NJNAuzZ4",
        //                                 "rewardOwner": {
        //                                     "locktime": "0",
        //                                     "threshold": "1",
        //                                     "addresses": [
        //                                         "P-columbus1z06vt88eavhxjeejalusgh0fkr2ktqnhft0hse"
        //                                     ]
        //                                 },
        //                                 "potentialReward": "0"
        //                             }
        //                         ]
        //                     },
        //                     {
        //                         "txID": "AD5RtWjjTkMLo8p9VqEy699uWkbnVd5ZbrTakphMaEAid7GhR",
        //                         "startTime": "1649178783",
        //                         "endTime": "1680714783",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-FYop57er5AYfcZKcoLUMXFTGjxggmBvpR",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1vfrl5haks2dkhxvktfyl5pvpu4x6dw3ngjxpku"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "3.1400",
        //                         "uptime": "0.9997",
        //                         "connected": true,
        //                         "delegators": [
        //                             {
        //                                 "txID": "Yfez4TuTVTmAFg5KXEdfB5Gsjmdvrm3a4atKKvL93VmqeFRZ6",
        //                                 "startTime": "1661807591",
        //                                 "endTime": "1680714783",
        //                                 "stakeAmount": "45000000000",
        //                                 "nodeID": "NodeID-FYop57er5AYfcZKcoLUMXFTGjxggmBvpR",
        //                                 "rewardOwner": {
        //                                     "locktime": "0",
        //                                     "threshold": "1",
        //                                     "addresses": [
        //                                         "P-columbus1z06vt88eavhxjeejalusgh0fkr2ktqnhft0hse"
        //                                     ]
        //                                 },
        //                                 "potentialReward": "0"
        //                             }
        //                         ]
        //                     },
        //                     {
        //                         "txID": "D1eriVQx3BiSU4GtCqxdv2vmcriPwuN16Q3xhEHTxeddBBiMp",
        //                         "startTime": "1654184328",
        //                         "endTime": "1685720328",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-PMLp8p4NBRVAD1dqQ57xwbNBv9f9bHk1Q",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1lhpcx50x2j806e7795jfp0uhzfqfkht6fn3u2l"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "0.9998",
        //                         "connected": true,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "2URFh5knSJjXDuZUPsPYwAXuDgSGPS7VSH3yMCDpQDzopfofRX",
        //                         "startTime": "1656603633",
        //                         "endTime": "1688139633",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-Q5NogyWLfp6Rwv1MAzNZY5QmfN7rvVFrM",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus15vafx62xahnx7auh6487vsk4umdu228xpjgpnl"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "0.7485",
        //                         "connected": false,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "JAP5MthC6iZynASRp1KHQ81LeB7ZqPX8ZRUGeun7E21HYoJA1",
        //                         "startTime": "1661789165",
        //                         "endTime": "1693325165",
        //                         "stakeAmount": "8000000000000",
        //                         "nodeID": "NodeID-L8593DTU4W9UGbHmXRKgQzPNdfbLLFBCi",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1adea8hp837g6w5h86q08jg4lhfp4zz4uesrgjk"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "10.0000",
        //                         "uptime": "0.1970",
        //                         "connected": false,
        //                         "delegators": [
        //                             {
        //                                 "txID": "2QBuCLqAT62HLxq19nafkapEF4poSWJJuUJBou4omKPtzMpWp8",
        //                                 "startTime": "1661803378",
        //                                 "endTime": "1693325165",
        //                                 "stakeAmount": "50000000000",
        //                                 "nodeID": "NodeID-L8593DTU4W9UGbHmXRKgQzPNdfbLLFBCi",
        //                                 "rewardOwner": {
        //                                     "locktime": "0",
        //                                     "threshold": "1",
        //                                     "addresses": [
        //                                         "P-columbus1zxhnqmy4u3j07767wj23xnr6k9tzmhptmyfmlm"
        //                                     ]
        //                                 },
        //                                 "potentialReward": "0"
        //                             }
        //                         ]
        //                     },
        //                     {
        //                         "txID": "2V3ZwyMWMYNxZR7jJeXmDaCRuxMyK6QjCEpdctA61RxXP2Rpyx",
        //                         "startTime": "1665641842",
        //                         "endTime": "1697177842",
        //                         "stakeAmount": "2050000000000",
        //                         "nodeID": "NodeID-4Qge1kPiV8og7f7GJLb6setPR6naLrojq",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus18n5knuyzta3g673qn7zngn75vzuaz6uqcr7q0j"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "1.0000",
        //                         "connected": true,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "2a5XT9iN4uE6iSHYjurMX79x3F4mWR6y5WA2KYKQ6fQp4JhSU6",
        //                         "startTime": "1667763499",
        //                         "endTime": "1699299499",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-94EsMW3uMtxxykc3uQpKGDnsYMkLjqiSm",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1d93cc46r8m9ydz82st3jqq9ztpj2lqsgl2rcv5"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "1.0000",
        //                         "connected": true,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "N1Wja7EN4LHVVzS2eCBK2JNVGEZJpJQJ68gLcbYVTte5z4py5",
        //                         "startTime": "1668032615",
        //                         "endTime": "1699568615",
        //                         "stakeAmount": "499004996000000",
        //                         "nodeID": "NodeID-LE9dWcedwgwDfokErNt93z2ontfr5YRcx",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus19ajmqnh63v00snhgdyyelvjx8yhlrxrq6v6qmv"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "1.0000",
        //                         "connected": true,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "s2XJUNhccpw4WNTcNretDkbrGyyoNsio5BoUmXYzgzE2MGzz2",
        //                         "startTime": "1668084210",
        //                         "endTime": "1699620210",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-GrdLbqHL6cPUxHtd8PyN7oTSuvsX2PLjp",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1m26zn945x24u3jkfguthwxhssjpyzpxv56p290"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "1.0000",
        //                         "connected": true,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "ScTfBggNBFv4D3ndzeBByfRJqcoLSzmZvMmTiVqN3yqCQKtKM",
        //                         "startTime": "1669104621",
        //                         "endTime": "1700640621",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-DsZJu18SWnJs3oWvJ84bEWteDigfYwd9A",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1xngsqmvgpvaplgljjh9eqq30hfdtcnc4mcf6j2"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "0.0000",
        //                         "connected": false,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "fJ1p6qq5cVU1dhwQJy3Pm5ZVGw2f5mvtQ5AouciTrdzC6WPUh",
        //                         "startTime": "1669113056",
        //                         "endTime": "1700649056",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-24RssHBR9W4sipvEcYFDhes8UuZtQTTwJ",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus104jfgvcaryjn86n0umdkvhtvwwe2vllwupfr3e"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "0.0000",
        //                         "connected": false,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "sXip4TstvzBLPWG1i5SVwmmJsgrsxAdmS1X3WwZwMNB7NZMY",
        //                         "startTime": "1669628870",
        //                         "endTime": "1701164870",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-Agt1Y1kXfdP3EQX1LZSvuXNNDwWJ6fZJ5",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus17hcmjzhezm3c4jgkje82xusm99qmselelrldmv"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "0.7738",
        //                         "connected": false,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "bijJpU1MiWiX8yYWBu8by7SW7tMpsT9VXLsiYg8vuSPNh5gf1",
        //                         "startTime": "1670576098",
        //                         "endTime": "1701421376",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-CzzXJECYhJMj7mdL95nPtZbE47xWnKeAY",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1853pqwpfvzyt8h4dn0af8rqqwg4fsmnq8dxl78"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "0.9995",
        //                         "connected": true,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "5o4HAwTqpX1UcYYky1TCC2bXcg3vMPuGypXDhnGo3MwpwkCgT",
        //                         "startTime": "1669900603",
        //                         "endTime": "1701436603",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-JU8ZkyC3YjLGXnX9j36eactFHd4NRjXnB",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1y4hwrdpydtkqnlg3puw8ahz7vrqgy7cxswthny"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "0.0000",
        //                         "connected": false,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "mC3ioRaHqk6HcuceBKhmDku3ZKw8BJqtU3ZewFmnoA5C53kxw",
        //                         "startTime": "1671016112",
        //                         "endTime": "1702552112",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-J6oKqp45bzVnekFPbhZpn8aM1tKgDTyF6",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1gdsz53ked84snz0zxqjrl72hf2z4meeh42vryq"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "0.2624",
        //                         "connected": false,
        //                         "delegators": null
        //                     },
        //                     {
        //                         "txID": "2LdJ3zCzbf4K3BXCWm2wxW2k3wJqjLNmyDW1y7AkZCJiFt1ATv",
        //                         "startTime": "1673240705",
        //                         "endTime": "1704776705",
        //                         "stakeAmount": "2000000000000",
        //                         "nodeID": "NodeID-NdWph5Qv2g4ak4vJN9Rxm5L2aDGCZamKd",
        //                         "rewardOwner": {
        //                             "locktime": "0",
        //                             "threshold": "1",
        //                             "addresses": [
        //                                 "P-columbus1hrjryahx3w8tzpkg4zlsl4xe45xu9ufujqkee6"
        //                             ]
        //                         },
        //                         "potentialReward": "0",
        //                         "delegationFee": "2.0000",
        //                         "uptime": "0.0000",
        //                         "connected": false,
        //                         "delegators": null
        //                     }
        //                 ]
        //             },
        //             "id": req.body.id
        //         }

        //         req.reply({
        //             statusCode: 200,
        //             body: bodyValidators,
        //         });
        //         req.alias = 'platformGetCurrentValidators'
        //     }
        // });
        
    })

    it('create collectibles family', () => {
        addKopernikusNetwork(cy)
        accessWallet(cy, 'mnemonic')

        cy.wait('@getAddressChains',{timeout: 30000});
        cy.wait('@eth_blockNumber',{timeout: 30000});
        cy.wait('@avmGetAssetDescription',{timeout: 30000});
        cy.wait('@avmGetUtxos',{timeout: 30000});

        cy.get('.refresh > button > .v-icon').click()
        cy.get('[data-cy="wallet_studio"]').click()
        cy.get('#wallet_router > div.menu > div > div:nth-child(1) > button').click()
        cy.get('[style="flex-grow: 1;"] > input').type('Test2')
        cy.get('.symbol > input').type('TES')
        cy.get('.refresh > button > .v-icon').click()
        cy.get('.button_secondary').click();
        cy.wait('@avmGetUtxos',{timeout: 30000});

    })
})
