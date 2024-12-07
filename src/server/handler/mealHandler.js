const searchMeal = require('../../services/diary/meals/searchMeal');
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

// Handler to search for a meal by name
async function searchMealHandler(request, h) {
    let { mealName } = request.params;
    mealName = mealName.trim().replace(/\s+/g, '_'); // Replace spaces with underscores

    // Fetch the meal from Firestore
    const meal = await searchMeal(mealName);
    if (!meal) {
        return h.response({ error: 'Meal not found' }).code(404);
    }

    return h.response(meal).code(200);
}

// Handler to get meal details by ID
async function getMealDetailsHandler(request, h) {
    const { mealId } = request.params;
    const mealRef = firestore.collection('foodMenu').doc(mealId);
    const doc = await mealRef.get();

    if (!doc.exists) {
        return h.response({ error: 'Meal not found' }).code(404);
    }

    return h.response(doc.data()).code(200);
}

// Handler to add a meal component to the user's profile
async function addMealComponentHandler(request, h) {
    const { mealId } = request.params;
    const { grams, postToProfile } = request.payload;

    // Fetch the meal from Firestore
    const mealRef = firestore.collection('foodMenu').doc(mealId);
    const doc = await mealRef.get();

    if (!doc.exists) {
        console.log('Meal not found'); // Debugging line
        return h.response({ error: 'Meal not found' }).code(404);
    }

    const meal = doc.data();
    console.log(`Found meal: ${JSON.stringify(meal)}`); // Debugging line

    // Calculate nutrients based on user input
    const nutrients = {
        calories: (grams / 100) * meal.food_description.calories,
        fat: (grams / 100) * meal.food_description.fat,
        carbs: (grams / 100) * meal.food_description.carbs,
        protein: (grams / 100) * meal.food_description.protein
    };

    // Optionally post to profile data
    if (postToProfile) {
        const userProfileRef = firestore.collection('documents').doc(request.auth.credentials.userId);
        await userProfileRef.update({
            wantedMenu: {
                mealName: meal.name,
                grams,
                nutrients
            }
        });

        // Push the wanted menu into a new sub-collection called "meals component" inside "meals" collection as a data of one of the documents inside "documents" collection
        const mealsComponentRef = userProfileRef.collection('documents').doc('data').collection('meals').doc('mealData').collection('meals component');
        await mealsComponentRef.add({
            mealId: mealId,
            mealName: meal.name,
            food_description: meal.food_description,
            grams,
            nutrients,
            timestamp: Firestore.FieldValue.serverTimestamp()
        });
    }

    return h.response({ mealName: meal.name, grams, nutrients }).code(200);
}

module.exports = { searchMealHandler, getMealDetailsHandler, addMealComponentHandler };