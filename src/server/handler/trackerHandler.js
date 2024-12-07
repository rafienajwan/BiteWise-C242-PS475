const { getDailyNutrientSummary } = require('../../services/diary/nutrientTracker');
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

async function getNutrientTrackerHandler(request, h) {
    const { userId } = request.params;

    try {
        const nutrientSummary = await getDailyNutrientSummary(userId);

        const userProfileRef = firestore.collection('users').doc(userId);
        const userDoc = await userProfileRef.get();

        if (!userDoc.exists) {
            return h.response({ error: 'User not found' }).code(404);
        }

        const userData = userDoc.data();
        const targetPFC = userData.wantedPFC || {};

        // Round the nutrient summary values to the nearest integer
        const roundedNutrientSummary = {
            totalCalories: Math.round(nutrientSummary.totalCalories),
            totalCarbs: Math.round(nutrientSummary.totalCarbs),
            totalFats: Math.round(nutrientSummary.totalFats),
            totalProteins: Math.round(nutrientSummary.totalProteins)
        };

        // Round the target PFC values to the nearest integer
        const roundedTargetPFC = {
            calories: Math.round(targetPFC.calories || 0),
            carbs: Math.round(targetPFC.carbs || 0),
            fats: Math.round(targetPFC.fats || 0),
            proteins: Math.round(targetPFC.proteins || 0),
            targetGoal: Math.round(targetPFC.targetGoal || 0)
        };

        return h.response({
            nutrientSummary: roundedNutrientSummary,
            targetPFC: roundedTargetPFC
        }).code(200);
    } catch (error) {
        console.error('Error getting nutrient tracker:', error);
        return h.response({ error: 'An internal server error occurred' }).code(500);
    }
}

module.exports = { getNutrientTrackerHandler };