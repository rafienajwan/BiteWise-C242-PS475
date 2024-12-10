require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const InputError = require('../exceptions/InputError');
const loadPFCModel = require('../services/pfcModel/loadPFCModel');
const loadRecommendationModel = require('../services/recommendationModel/loadRecommendationModel');
const loadGoalsModel = require('../services/goalsModel/loadGoalsModel');

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
        // Load the PFC model and Recommendation model concurrently
        const [pfcModel, recommendationModel, goalsModel] = await Promise.all([
            loadPFCModel(),
            loadRecommendationModel(),
            loadGoalsModel()
        ]);

        // Attach the models to server.app
        server.app.pfcModel = pfcModel;
        server.app.recommendationModel = recommendationModel;
        server.app.goalsModel = goalsModel;

        console.log('PFC, Recommendation, and Goals Model loaded and attached to server');
    } catch (error) {
        console.error('Failed to load models:', error);
        process.exit(1); // Exit if the models can't be loaded
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