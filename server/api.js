var router = require('express').Router();
const {prices} = require('./prices');


router.get('/price', function (req, res) {
    res.send(prices)
});

module.exports = router;
