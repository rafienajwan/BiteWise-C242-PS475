const tf = require('@tensorflow/tfjs-node');

async function loadPFCModel() {
    try {
        const model = await tf.loadLayersModel("https://storage.googleapis.com/bitewise-model/PFC_tfjs/model.json");
        return model;
    } catch (error) {
        console.error('Error loading goals model:', error);
        throw error;
    }
}

module.exports = loadPFCModel;