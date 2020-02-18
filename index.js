const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// const morgan = require('morgan');
const path = require('path');

const app = express();

// app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());

// app.get('/', (req, res) => {
//     res.json({
//         message: 'Behold The MEVN Stack!'
//     });
// });


app.use (function (req, res, next) {
    if (req.secure) {
        // request was via https, so do no special handling
        // console.log("request by HTTPS");
        next();
    } else {
        // request was via http, so redirect to https
        // console.log("redirect HTTPS");
        res.redirect('https://' + req.headers.host + req.url);
    }
});


app.use(express.static('dist'));



// app.get('*', (req, res) => {
//     console.log("GETTIN");
//     // console.log(req);
//     res.json({
//         message: 'Behold The MEVN Stack!'
//     });
//     // res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
// });

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});