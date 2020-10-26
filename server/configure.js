const api = require('./api');


function beforeMiddleware(app){
    app.use('/api', api)
}

module.exports = {
    beforeMiddleware
};
