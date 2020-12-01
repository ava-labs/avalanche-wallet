var router = require('express').Router()
const { prices } = require('./prices')

router.get('/price', function (req, res) {
    res.json(prices)
})

module.exports = router
