const tf = require('../tensorflow');

async function loadPFCModel() {
    try {
        const modelUrl = process.env.PFC_MODEL_URL;
        if (!modelUrl) {
            throw new Error('PFC_MODEL_URL environment variable is required');
        }

        const model = await tf.loadLayersModel(modelUrl);
        return model;
    } catch (error) {
        console.error('Error loading PFC model:', error);
        throw error;
    }
}

module.exports = loadPFCModel;
