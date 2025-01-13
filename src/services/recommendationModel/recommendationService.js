const tf = require('@tensorflow/tfjs-node');
const inputError = require('../../exceptions/InputError');

async function predictRecommendation(model, data) {
    try {
        console.log('Received data for prediction:', data);

        // Ensure data is a 2D array with 7 features
        const inputData = Array.isArray(data[0]) ? data : [data];
        if (inputData[0].length !== 7) {
            throw new inputError(`Invalid input data: expected 7 features, but got ${inputData[0].length}`, 400);
        }
        console.log('Formatted input data:', inputData);

        // Convert data to a 2D tensor and reshape to [-1, 7]
        const inputTensor = tf.tensor2d(inputData, [inputData.length, 7]);
        console.log('Input tensor shape:', inputTensor.shape);
        console.log('Input tensor data:', inputTensor.arraySync());

        // Perform prediction
        const prediction = model.predict(inputTensor);
        console.log('Prediction tensor shape:', prediction.shape);
        console.log('Prediction tensor data:', prediction.dataSync());

        // Convert prediction to array
        const recommendationArray = prediction.dataSync();
        console.log('Recommendation array:', recommendationArray);

        return Array.from(recommendationArray);
    } catch (error) {
        console.error('Error in predictRecommendation:', error);
        throw new inputError('Error predicting Recommendation', 500);
    }
}

module.exports = predictRecommendation;