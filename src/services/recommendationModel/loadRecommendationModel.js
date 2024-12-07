const tf = require('@tensorflow/tfjs-node');
 
async function loadRecommendationModel() {
    return tf.loadGraphModel(process.env.RECOMMENDATION_MODEL_URL);
}
 
module.exports = loadRecommendationModel;