const tf = require('../tensorflow');
const inputError = require('../../exceptions/InputError');

async function predictGoals(model, data) {
    try {
        const inputTensor = data.reshape([-1, 4]);
        const prediction = model.predict(inputTensor);
        const goalsArray = prediction.dataSync();
        return Array.from(goalsArray);
    } catch (error) {
        console.error('Error in predictGoals:', error);
        throw new inputError('Error predicting Goals', 500);
    }
}

module.exports = predictGoals;
