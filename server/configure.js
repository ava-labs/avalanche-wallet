const api = require('./api')
const { updatePrices } = require('./prices')

function beforeMiddleware(app) {
    app.use('/api', api)
}

function onListening() {
    updatePrices()
    setInterval(updatePrices, 60000)
}

module.exports = {
    beforeMiddleware,
    onListening,
}
