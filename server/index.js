const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
var history = require('connect-history-api-fallback');
const helmet = require("helmet");
const {beforeMiddleware} = require('./configure');
const {updatePrices} = require('./prices');

const app = express();
app.use(helmet());

app.use(cors());
app.use(bodyParser.json());

// For heroku proxy
app.enable('trust proxy');

app.use (function (req, res, next) {
    if (req.secure) {
        // request was via https, so do no special handling
        next();
    } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url);
    }
});
app.use(helmet.xssFilter());
app.use(helmet.frameguard());

// API
beforeMiddleware(app);

app.use(history);



// Serving Static Files
app.use(express.static('dist'));

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});


setInterval(updatePrices, 60000);
