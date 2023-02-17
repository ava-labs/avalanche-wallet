/// <reference types="@cypress/grep" />;
import { Interception } from 'cypress/types/net-stubbing'

declare global {
    type WalletAccessType = 'privateKey' | 'mnemonic'
    namespace Cypress {
        interface Chainable {
            changeNetwork(network?: string): Chainable<Element>
            accessWallet(type: WalletAccessType, keyName?: string): Chainable<Element>
            switchToWalletApp(): Chainable<Element>
            switchToWalletFunctionTab(func: string): Chainable<Element>
            /**
             * combo of commands in sequence:
             * - cy.visit('/')
             * - cy.get(...) to setup header component aliases
             * - cy.switchToWalletApp()
             * - cy.changeNetwork()
             * - cy.accessWallet()
             * @param walletAccessType 'privateKey' or 'mnemonic'
             * @param keyName Default: 'privateKey'
             * @param network Default: 'Columbus'
             */
            loginWalletWith(
                walletAccessType: WalletAccessType,
                keyName?: string,
                network?: string
            ): Chainable<Element>
            /**
             * recursively call `cy.wait` command until the `untilFunc` return success(TRUE), suitable for polling requests
             *
             * @param alias the alias of the intercept to wait
             * @param untilFunc callback function called inside `.then` of `cy.wait` to determine if need to continue to wait
             * @returns boolean TRUE if the until condition matched
             * @example cy.waitUntil('@intercept', (intercept) => intercept.response.result === 'success')
             */
            waitUntil(
                alias: string,
                untilFunc: (intercept: Interception) => boolean
            ): Chainable<Element>
        }
    }
}
