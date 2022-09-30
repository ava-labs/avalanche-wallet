declare module '@obsidiansystems/hw-app-avalanche' {
    import Transport from '@ledgerhq/hw-transport'
    import bippath from 'bip32-path'

    class Avalanche {
        constructor(t: Transport)

        /**
         * Parse and sign a transaction. This is the preferred secure way of signing transactions.
         * @param accountPath
         * @param addressPaths
         * @param tx
         * @param changePath
         */
        signTransaction(
            accountPath: bippath,
            addressPaths: bippath[],
            tx: Buffer,
            changePath: bippath
        ): Promise<{
            hash: Buffer
            signatures: Map<string, Buffer>
        }>

        /**
         * Signs a hash. This is NOT a secure operation. The device will show warning.
         * @param accountPath Ex. `m/44'/9000'/0'`
         * @param addressPaths Addresses you need signatures from. Ex. `0/0`, `0/1` , `0/2` etc..
         * @param hash
         */
        signHash(
            accountPath: bippath,
            addressPaths: bippath[],
            hash: Buffer
        ): Promise<Map<string, Buffer>>

        getWalletExtendedPublicKey(
            path: string
        ): Promise<{
            public_key: Buffer
            chain_code: Buffer
        }>

        getAppConfiguration(): Promise<{
            version: string
            commit: string
            name: 'Avalanche'
        }>

        getWalletAddress(derivation_path: string, hrp: string): Promise<Buffer>

        /**
         * Get the wallet identifier for the Ledger wallet
         *
         * @return a byte string
         * @example
         * console.log((await avalanche.getWalletId()).toString("hex"));
         *
         * 79c46bc3
         */
        getWalletId(): Promise<Buffer>
    }

    export = Avalanche
}
