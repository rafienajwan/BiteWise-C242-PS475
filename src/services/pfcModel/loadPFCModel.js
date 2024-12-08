const tf = require('@tensorflow/tfjs-node');

async function loadPFCModel() {
    try {
        const model = await tf.loadLayersModel(process.env.PFC_MODEL_URL);
        return model;
    } catch (error) {
        console.error('Error loading goals model:', error);
        throw error;
    }
}

module.exports = loadPFCModel;