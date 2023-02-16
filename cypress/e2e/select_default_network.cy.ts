import { expect } from 'chai'
import '@cypress/xpath'

let networkTesteds: any = []

describe('Basic Functionality', () => {
    before(() => {
        cy.visit('/')
    })

    it('has access/create wallet options', async () => {
        await processSelectNetwork()
    })
})

async function processSelectNetwork() {
    let stableNetwork = false
    while (!stableNetwork) {
        cy.wait(8000)
        stableNetwork = await verifyNetwork()
        cy.log(networkTesteds)
    }
    cy.log('Process Network Selected Finished')
    return
}

function verifyNetwork(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        cy.contains('Something went wrong, Please Try Again!')
            .should((_) => {})
            .then(($element) => {
                if (!($element || []).length) {
                    resolve(true)
                } else {
                    executeChangeNetwork().then((resolved) => {
                        resolve(resolved)
                    })
                }
            })
    })
}

function executeChangeNetwork(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        cy.get('.css-1nt3z7i > .MuiInputBase-root > .MuiSelect-select').click()
        networkSelectVerify().then((btnSelector: any) => {
            if (btnSelector != null && btnSelector != undefined) {
                cy.get(btnSelector).click()
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}

function networkSelectVerify() {
    return new Promise((resolve, reject) => {
        cy.get('.MuiList-root.MuiList-padding.MuiMenu-list.css-oz8p8s')
            .children()
            .each(($row: any) => {
                cy.get($row)
                    .invoke('text')
                    .then((textRow) => {
                        if (textRow != 'Add Custom Network') {
                            if (!networkTesteds.some((text) => text == textRow)) {
                                cy.get($row)
                                    .invoke('attr', 'aria-selected')
                                    .then((val: any) => {
                                        if (val == 'false') {
                                            resolve($row)
                                        } else {
                                            networkTesteds.push(textRow)
                                        }
                                    })
                            }
                        } else {
                            resolve(null)
                        }
                    })
            })
    })
}
