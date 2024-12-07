require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const InputError = require('../exceptions/InputError');
// const loadGoalsModel = require('../services/goalsModel/loadGoalsModel');

(async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
              origin: ['*'],
            },
            payload: {
                maxBytes: 10485760, // 10 MB limit
            }
        },
    });

    // const goalsModel = await loadGoalsModel();
    // server.app.model = goalsModel;
    
    server.route(routes);

    server.ext('onPreResponse', function (request, h) {
        const response = request.response;

        if (response instanceof InputError) {
            const newResponse = h.response({
                status: 'fail',
                message: `${response.message}`
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        if (response.isBoom) {
            const newResponse = h.response({
                status: 'fail',
                message: response.output.payload.message
            });
            newResponse.code(response.output.statusCode);
            return newResponse;
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();