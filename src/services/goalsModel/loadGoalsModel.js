const tf = require('@tensorflow/tfjs-node');

async function loadGoalsModel() {
    try {
        const model = await tf.loadLayersModel(process.env.GOALS_MODEL_URL);
        return model;
    } catch (error) {
        console.error('Error loading goals model:', error);
        throw error;
    }
}

module.exports = loadGoalsModel;