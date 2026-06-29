const tf = require('../tensorflow');
const inputError = require('../../exceptions/InputError');

async function predictPFC(model, data) {
    try {
        const inputTensor = tf.tensor2d(data, [data.length, data[0].length]);
        const prediction = model.predict(inputTensor);
        const pfcArray = prediction.dataSync();
        return Array.from(pfcArray);
    } catch (error) {
        console.error('Error in predictPFC:', error);
        throw new inputError('Error predicting PFC', 500);
    }
}

module.exports = predictPFC;
