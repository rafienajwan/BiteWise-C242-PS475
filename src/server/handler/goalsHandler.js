const tf = require('@tensorflow/tfjs-node'); // Ensure TensorFlow is required
const { Firestore } = require('@google-cloud/firestore');
const { getTotalNutrientSummary } = require('../../services/diary/nutrientTracker'); // Import the function
const predictGoals = require('../../services/goalsModel/goalsService'); // Import the goals prediction service

const db = new Firestore();

async function predictGoalsHandler(request, h) {
    const { userId } = request.params; // Expect userId in the params
    console.log(`Received Goals prediction request for userId: ${userId}`);

    try {
        // Fetch user data from Firestore
        console.log('Fetching user data from Firestore...');
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            console.log('User not found');
            return h.response({ error: 'User not found' }).code(404);
        }
        const userData = userDoc.data();
        console.log('User data retrieved:', userData);

        // Validate user data
        if (!userData.gender || !userData.weight || !userData.tall || !userData.age || !userData.activeLevel || !userData.wantedPFC || !userData.wantedPFC.targetGoal) {
            console.error('Missing required user data:', userData);
            return h.response({ error: 'Missing required user data' }).code(400);
        }

        // Fetch total nutrient summary using getTotalNutrientSummary function
        console.log('Fetching total nutrient summary...');
        const nutrientSummary = await getTotalNutrientSummary(userId);
        console.log('Nutrient summary retrieved:', nutrientSummary);

        // Prepare input data for the Goals model
        const weight = parseFloat(userData.weight);
        const height = parseFloat(userData.tall);
        const targetGoal = parseFloat(userData.wantedPFC.targetGoal);
        const totalCalories = nutrientSummary.totalCalories;

        // Ensure the input data has 4 features
        const inputData = [weight, height, targetGoal, totalCalories];
        console.log(`Prepared input data for Goals model: ${JSON.stringify(inputData)}`);

        // Access the Goals model from the server instance
        const model = request.server.app.goalsModel;
        if (!model) {
            console.error('Goals model is not loaded or not attached to server.app');
            return h.response({ error: 'Goals model is not loaded' }).code(500);
        }

        // Reshape the input data to match the expected shape for the model
        const inputTensor = tf.tensor2d([inputData]).reshape([-1, 4]);
        console.log(`Reshaped input tensor: ${inputTensor.shape}`);

        // Predict goals using the Goals model
        const goalsPrediction = await predictGoals(model, inputTensor);
        console.log(`Goals prediction result: ${JSON.stringify(goalsPrediction)}`);

        // Validate prediction result
        if (!Array.isArray(goalsPrediction) || goalsPrediction.length === 0) {
            console.error('Invalid goals prediction result:', goalsPrediction);
            return h.response({ error: 'Invalid goals prediction result' }).code(500);
        }

        // Format goals prediction to have a maximum of two decimal places
        const formattedGoalsPrediction = goalsPrediction.map(value => parseFloat(value.toFixed(2)));

        // Calculate days to goal using the formula: abs((current_weight - goal_weight) * 7700 / daily_deficit)
        console.log('Calculating days to goal...');
        const current_weight = parseFloat(userData.weight);
        const goal_weight = parseFloat(userData.wantedPFC.targetGoal);
        const daily_deficit = formattedGoalsPrediction[0]; // Assuming the model predicts the daily deficit
        let days_to_goal = Math.abs((current_weight - goal_weight) * 7700 / daily_deficit);
        console.log(`Calculated Days to Goal: ${days_to_goal}`);

        // Check if the value of days_to_goal is within a reasonable range (e.g., max 365 days)
        if (days_to_goal > 365) {
            days_to_goal = 365; // Cap to 365 days if it's too high
            console.log('Capped days to goal to 365 days');
        }

        // Round up the predicted days to the nearest whole number
        days_to_goal = Math.ceil(days_to_goal);

        // Save the predicted days to Firestore under the user's data
        console.log('Saving predicted days to Firestore...');
        await db.collection('users').doc(userId).update({
            estimatedDayWeightTargetGoal: days_to_goal
        });
        console.log('Predicted days saved to Firestore');

        // Return the predicted goals
        return h.response({ goals: formattedGoalsPrediction, days_to_goal }).code(200);

    } catch (error) {
        console.error('Error in predictGoalsHandler:', error);
        return h.response({ error: 'An internal server error occurred' }).code(500);
    }
}

async function getGoalsHandler(request, h) {
    const { userId } = request.params; // Expect userId in the params
    console.log(`Received request to get goals for userId: ${userId}`);

    try {
        // Fetch user data from Firestore
        console.log('Fetching user data from Firestore...');
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            console.log('User not found');
            return h.response({ error: 'User not found' }).code(404);
        }
        const userData = userDoc.data();
        console.log('User data retrieved:', userData);

        // Check if the estimatedDayWeightTargetGoal field exists
        if (userData.estimatedDayWeightTargetGoal === undefined) {
            console.log('Estimated day weight target goal not found');
            return h.response({ error: 'Estimated day weight target goal not found' }).code(404);
        }

        // Return the estimatedDayWeightTargetGoal
        const response = {
            userId: userData.userId,
            estimatedDayWeightTargetGoal: userData.estimatedDayWeightTargetGoal
        };

        console.log(`Response for user: ${userData.userId}: ${JSON.stringify(response)}`);

        return h.response(response);

    } catch (error) {
        console.error('Error in getGoalsHandler:', error);
        return h.response({ error: 'An internal server error occurred' }).code(500);
    }
}

module.exports = { predictGoalsHandler, getGoalsHandler };
