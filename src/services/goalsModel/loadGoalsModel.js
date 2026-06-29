const tf = require('../tensorflow');

async function loadGoalsModel() {
    try {
        const modelUrl = process.env.GOALS_MODEL_URL;
        if (!modelUrl) {
            throw new Error('GOALS_MODEL_URL environment variable is required');
        }

        const model = await tf.loadLayersModel(modelUrl);
        return model;
    } catch (error) {
        console.error('Error loading goals model:', error);
        throw error;
    }
}

module.exports = loadGoalsModel;
