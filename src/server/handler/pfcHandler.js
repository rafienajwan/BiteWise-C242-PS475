const predictPFC = require('../../services/pfcModel/pfcService');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();

const activity_map = {
    "sedentary": 0,
    "light": 1,
    "average": 2,
    "active": 3,
    "very_active": 4
};

async function predictPFCHandler(request, h) {
    const { userId } = request.params;
    const { goal } = request.payload;

    console.log(`Received PFC prediction request for userId: ${userId} with goal: ${goal}`);

    try {
        const userRef = firestore.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log(`User not found: ${userId}`);
            return h.response({ error: 'User not found' }).code(404);
        }

        const userData = userDoc.data();
        const { weight, tall, activeLevel, age } = userData;

        console.log(`User data retrieved: weight=${weight}, tall=${tall}, activeLevel=${activeLevel}, age=${age}`);

        const goalNumber = parseFloat(goal);
        if (isNaN(goalNumber)) {
            console.log(`Invalid goal value: ${goal}`);
            return h.response({ error: 'Invalid goal value' }).code(400);
        }

        if (typeof activeLevel !== 'string') {
            console.log(`Invalid active level type: ${typeof activeLevel}`);
            return h.response({ error: 'Invalid active level type' }).code(400);
        }

        const activeLevelNumber = activity_map[activeLevel.toLowerCase()];
        if (activeLevelNumber === undefined) {
            console.log(`Invalid active level: ${activeLevel}`);
            return h.response({ error: 'Invalid active level' }).code(400);
        }

        console.log(`Mapped active level: ${activeLevel} to ${activeLevelNumber}`);

        const numericData = [weight, tall, goalNumber, activeLevelNumber, age].map(value => parseFloat(value));
        if (numericData.some(isNaN)) {
            console.log('Invalid input data:', numericData);
            return h.response({ error: 'Invalid input data' }).code(400);
        }

        const data = [numericData];
        console.log(`Prepared input data: ${JSON.stringify(data)}`);

        const model = request.server.app.pfcModel;
        if (!model) {
            console.error('Model is not loaded or not attached to server.app');
            return h.response({ error: 'Model is not loaded' }).code(500);
        }

        const pfc = await predictPFC(model, data);
        console.log(`PFC prediction result: ${JSON.stringify(pfc)}`);

        if (!Array.isArray(pfc) || pfc.length < 4) {
            console.error('Invalid prediction result:', pfc);
            return h.response({ error: 'Invalid prediction result' }).code(500);
        }

        const formattedPFC = pfc.map(value => parseFloat(value.toFixed(2)));

        const updateData = {
            wantedPFC: {
                calories: formattedPFC[0],
                carbs: formattedPFC[1],
                fats: formattedPFC[2],
                proteins: formattedPFC[3],
                targetGoal: goalNumber
            }
        };
        await userRef.update(updateData);
        console.log('PFC values and target goal updated successfully in Firestore');

        return h.response({ 
            calories: formattedPFC[0], 
            carbs: formattedPFC[1], 
            fats: formattedPFC[2], 
            proteins: formattedPFC[3], 
            targetGoal: goalNumber 
        }).code(200);

    } catch (error) {
        console.error('Error in predictPFCHandler:', error);
        return h.response({ error: 'An internal server error occurred' }).code(500);
    }
};

async function getPFCHandler(request, h) {
    try {
        const userProfileRef = firestore.collection('users').doc(request.params.userId);
        const userDoc = await userProfileRef.get();

        if (!userDoc.exists) {
            return h.response({ error: 'User not found' }).code(404);
        }

        const userData = userDoc.data();
        const pfcData = userData.wantedPFC || {};

        return h.response(pfcData).code(200);
    } catch (error) {
        console.error('Error getting PFC:', error);
        return h.response({ error: 'An internal server error occurred' }).code(500);
    }
}

module.exports = { predictPFCHandler, getPFCHandler };
