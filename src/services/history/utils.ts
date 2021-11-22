import { Buffer } from 'avalanche'
import urlRegex from 'url-regex'

export default function getMemoFromByteString(memo: string) {
    const memoText = new Buffer(memo, 'base64').toString('utf8')

    // Bug that sets memo to empty string (AAAAAA==) for some tx types
    if (!memoText.length || memo === 'AAAAAA==') return null

    // If memo contains URL do not show memo
    if (urlRegex({ exact: false, strict: false }).test(memoText)) return null
    return memoText
}
