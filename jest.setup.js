const util = require('util')
const crypto = require('crypto')
window.crypto = crypto.webcrypto

window.TextEncoder = util.TextEncoder
window.TextDecoder = util.TextDecoder
