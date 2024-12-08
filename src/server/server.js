require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const InputError = require('../exceptions/InputError');
const loadPFCModel = require('../services/pfcModel/loadPFCModel');

(async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000, // Use PORT environment variable or default to 3000
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

    try {
        // Load the PFC model and attach it to server.app
        const pfcModel = await loadPFCModel();
        server.app.model = pfcModel;
        console.log('PFC Model loaded and attached to server');
    } catch (error) {
        console.error('Failed to load PFC model:', error);
        process.exit(1); // Exit if the model can't be loaded
    }
    
    server.route(routes);

    server.ext('onPreResponse', function (request, h) {
        const response = request.response;
        if (response.isBoom) {
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