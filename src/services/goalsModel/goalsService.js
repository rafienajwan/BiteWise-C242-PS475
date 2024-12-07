const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictGoals(model, data) {
    try {
        // persiapan input tensor dengan input user weight, height, dan target_weight
        const input = tf.tensor2d([data.weight, data.height, data.target_weight], [1, 3]);
        
        // prediksi target goals
        const output = await model.predict(input);
        
        // konversi output ke string
        const goals = output.dataSync()[0].toString();
        
        return goals;
    } catch (error) {
        throw new InputError(error.message);
    }
}

module.exports = predictGoals;