const tf = require('@tensorflow/tfjs-node');
const inputError = require('../../exceptions/InputError');

async function predictPFC(model, data) {
    try {
        // Convert data to a 2D tensor
        const inputTensor = tf.tensor2d(data, [data.length, data[0].length]);
        // Perform prediction
        const prediction = model.predict(inputTensor);
        // Convert prediction to array
        const pfcArray = prediction.dataSync();
        return Array.from(pfcArray);
    } catch (error) {
        console.error('Error in predictPFC:', error);
        throw new inputError('Error predicting PFC', 500);
    }
}

module.exports = predictPFC;