const tf = require('@tensorflow/tfjs-node');
const inputError = require('../../exceptions/InputError');

async function predictGoals(model, data) {
    try {
        // Convert data to a 2D tensor
        const inputTensor = data.reshape([-1, 4]);
        // Perform prediction
        const prediction = model.predict(inputTensor);
        // Convert prediction to array
        const goalsArray = prediction.dataSync();
        return Array.from(goalsArray);
    } catch (error) {
        console.error('Error in predictGoals:', error);
        throw new inputError('Error predicting Goals', 500);
    }
}

module.exports = predictGoals;