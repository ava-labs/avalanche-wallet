import { ava } from '@/AVA'
import { Buffer } from '@c4tplatform/caminojs/dist'
import {
    Configuration,
    ModelMultisigTx,
    ModelMultisigTxOwner,
    MultisigApi,
} from '@c4tplatform/signavaultjs'
import { SignerKeyPair } from '@c4tplatform/caminojs/dist/common'
import createHash from 'create-hash'

const defaultConfig: Configuration = new Configuration({
    basePath: 'http://127.0.0.1:8081/v1',
})

function SignaVault(): MultisigApi {
    let config = defaultConfig
    const api_host = ava.getHost()
    if (api_host.indexOf('.camino.') >= 0) {
        config = new Configuration({
            basePath: 'https://signavault.' + api_host + ':443/v1',
        })
    }
    return new MultisigApi(config)
}

async function SignaVaultTx(alias: string, signer: SignerKeyPair): Promise<ModelMultisigTx[]> {
    const sv = SignaVault()

    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signatureAliasTimestamp = signer
        .sign(
            Buffer.from(
                createHash('sha256')
                    .update(Buffer.from(alias + timestamp))
                    .digest()
            )
        )
        .toString('hex')

    const res = await sv.getAllMultisigTxForAlias(alias, signatureAliasTimestamp, timestamp)
    return res.data
}

export type { ModelMultisigTx, ModelMultisigTxOwner }
export { SignaVault, SignaVaultTx }
