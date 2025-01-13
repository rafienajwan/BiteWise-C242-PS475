const tf = require('@tensorflow/tfjs-node');

async function loadRecommendationModel() {
    try {
        const model = await tf.loadLayersModel(process.env.RECOMMENDATION_MODEL_URL);
        return model;
    } catch (error) {
        console.error('Error loading recommendation model:', error);
        throw error;
    }
}

module.exports = loadRecommendationModel;