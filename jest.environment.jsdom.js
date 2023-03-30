const JsdomEnvironment = require('jest-environment-jsdom').default

export default class CustomJsdomEnvironment extends JsdomEnvironment {
    constructor(config, context) {
        super(config, context)
        this.global.Uint8Array = Uint8Array
    }
}
