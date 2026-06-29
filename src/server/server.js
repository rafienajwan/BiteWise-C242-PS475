require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const InputError = require('../exceptions/InputError');
const loadPFCModel = require('../services/pfcModel/loadPFCModel');
const loadGoalsModel = require('../services/goalsModel/loadGoalsModel');

(async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
              origin: ['*'],
            },
            payload: {
                maxBytes: 10485760,
            }
        },
    });

    try {
        const [pfcModel, goalsModel] = await Promise.all([
            loadPFCModel(),
            loadGoalsModel()
        ]);

        server.app.pfcModel = pfcModel;
        server.app.goalsModel = goalsModel;

        console.log('PFC and Goals models loaded and attached to server');
    } catch (error) {
        console.error('Failed to load required models:', error);
        process.exit(1);
    }

    server.route(routes);

    server.ext('onPreResponse', function (request, h) {
        const response = request.response;
        if (response.isBoom) {
            console.error('Error response:', response);
            if (response instanceof InputError) {
                return h.response({ error: response.message }).code(response.output.statusCode);
            }
            return h.response({ error: 'An internal server error occurred' }).code(500);
        }
        return h.continue;
    });

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
})();
