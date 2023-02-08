declare namespace Cypress {
  interface Chainable {
    changeNetwork(network?: string): Chainable<Element>
    accessWallet(type: string): Chainable<Element>
    switchToWalletApp(): Chainable<Element>
    switchToWalletFunctionTab(func: string): Chainable<Element>
  }
}