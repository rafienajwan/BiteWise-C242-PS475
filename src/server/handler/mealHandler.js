const searchMeal = require('../../services/diary/meals/searchMeal');
const extractNutrientValues = require('../../services/diary/meals/nutrientValues');
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

async function searchMealHandler(request, h) {
    let { mealName } = request.params;
    mealName = mealName.trim().replace(/\s+/g, '_');

    const meal = await searchMeal(mealName);
    if (!meal) {
        return h.response({ error: 'Meal not found' }).code(404);
    }

    return h.response(meal).code(200);
}

async function getMealDetailsHandler(request, h) {
    const { mealId } = request.params;
    const mealRef = firestore.collection('foodMenu').doc(mealId);
    const doc = await mealRef.get();

    if (!doc.exists) {
        return h.response({ error: 'Meal not found' }).code(404);
    }

    return h.response(doc.data()).code(200);
}

async function getAllFoodDataHandler(request, h) {
    try {
        const foodDataRef = firestore.collection('foodMenu');
        const snapshot = await foodDataRef.get();

        if (snapshot.empty) {
            console.log('No food data found');
            return h.response({ error: 'No food data found' }).code(404);
        }

        const foodData = [];
        snapshot.forEach(doc => {
            foodData.push({ id: doc.id, ...doc.data() });
        });

        return h.response(foodData).code(200);
    } catch (error) {
        console.error('Error fetching food data:', error);
        return h.response({ error: 'Failed to fetch food data' }).code(500);
    }
}

async function addMealComponentHandler(request, h) {
    const { userId, mealId } = request.params;
    const { grams, postToProfile } = request.payload;
    let { mealName } = request.payload;

    mealName = mealName.trim().replace(/\s+/g, '_');

    try {
        const mealRef = firestore.collection('foodMenu').doc(mealId);
        const doc = await mealRef.get();

        if (!doc.exists) {
            return h.response({ error: 'Meal not found' }).code(404);
        }

        const meal = doc.data();

        const foodDescription = meal.food_description || '';
        const { calories, fat, carbs, protein } = extractNutrientValues(foodDescription);

        const nutrients = {
            calories: (grams / 100) * calories,
            fat: (grams / 100) * fat,
            carbs: (grams / 100) * carbs,
            protein: (grams / 100) * protein
        };

        if (!mealName) {
            return h.response({ error: 'Meal name is undefined' }).code(400);
        }

        if (postToProfile) {
            const userProfileRef = firestore.collection('users').doc(userId);
            const userDoc = await userProfileRef.get();

            if (!userDoc.exists) {
                await userProfileRef.set({ wantedMenu: {} });
            }

            const updatePath = `wantedMenu.${mealName}.${mealId}`;
            const updateData = {
                [updatePath]: {
                    grams,
                    calories: nutrients.calories,
                    carbs: nutrients.carbs,
                    fat: nutrients.fat,
                    protein: nutrients.protein,
                    timestamp: Firestore.FieldValue.serverTimestamp()
                }
            };

            await userProfileRef.update(updateData);
        }

        return h.response({ mealName: mealName, grams, nutrients }).code(200);
    } catch (error) {
        console.error('Error adding meal component:', error);
        return h.response({ error: 'An internal server error occurred' }).code(500);
    }
}

async function addManualMealComponentHandler(request, h) {
    const { userId } = request.params;
    const { mealName, foodComponentName, grams, calories, carbs, fat, protein } = request.payload;

    const formattedMealName = mealName.trim().replace(/\s+/g, '_');
    const formattedFoodComponentName = foodComponentName.trim().replace(/\s+/g, '_');

    try {
        const mealComponentData = {
            grams,
            calories,
            carbs,
            fat,
            protein,
            timestamp: new Date()
        };

        const userProfileRef = firestore.collection('users').doc(userId);
        const userDoc = await userProfileRef.get();

        if (!userDoc.exists) {
            console.log('User not found');
            return h.response({ error: 'User not found' }).code(404);
        }

        const userData = userDoc.data();
        const wantedMenu = userData.wantedMenu || {};

        if (!wantedMenu[formattedMealName]) {
            wantedMenu[formattedMealName] = {};
        }

        wantedMenu[formattedMealName][formattedFoodComponentName] = mealComponentData;

        await userProfileRef.update({ wantedMenu });

        const foodMenuRef = firestore.collection('foodMenu').doc(formattedFoodComponentName);
        await foodMenuRef.set({
            food_description: `Calories: ${calories}kcal | Fat: ${fat}g | Carbs: ${carbs}g | Protein: ${protein}g`
        });

        console.log('Meal component added successfully');
        return h.response({ message: 'Meal component added successfully' }).code(200);
    } catch (error) {
        console.error('Error adding meal component:', error);
        return h.response({ error: 'Failed to add meal component' }).code(500);
    }
}

async function getMealHandler(request, h) {
    const { userId } = request.params;
    const userProfileRef = firestore.collection('users').doc(userId);
    const userDoc = await userProfileRef.get();

    if (!userDoc.exists) {
        return h.response({ error: 'User not found' }).code(404);
    }

    const userData = userDoc.data();
    const mealData = userData.wantedMenu || {};

    return h.response(mealData).code(200);
}

async function deleteComponentMealHandler(request, h) {
    const { userId, mealName, componentName } = request.params;

    const formattedMealName = mealName.trim().replace(/\s+/g, '_');
    const formattedComponentName = componentName.trim().replace(/\s+/g, '_');

    try {
        const userProfileRef = firestore.collection('users').doc(userId);
        const userDoc = await userProfileRef.get();

        if (!userDoc.exists) {
            return h.response({ error: 'User not found' }).code(404);
        }

        const userData = userDoc.data();
        const mealData = userData.wantedMenu || {};

        if (!mealData[formattedMealName] || !mealData[formattedMealName][formattedComponentName]) {
            return h.response({ error: 'Meal or component not found' }).code(404);
        }

        delete mealData[formattedMealName][formattedComponentName];

        if (Object.keys(mealData[formattedMealName]).length === 0) {
            delete mealData[formattedMealName];
        }

        await userProfileRef.update({ wantedMenu: mealData });

        return h.response({ message: 'Component deleted successfully' }).code(200);
    } catch (error) {
        console.error('Error deleting component:', error);
        return h.response({ error: 'An internal server error occurred' }).code(500);
    }
}

async function deleteMealHandler(request, h) {
    const { userId, mealName } = request.params;

    const formattedMealName = mealName.trim().replace(/\s+/g, '_');

    try {
        const userProfileRef = firestore.collection('users').doc(userId);
        const userDoc = await userProfileRef.get();

        if (!userDoc.exists) {
            return h.response({ error: 'User not found' }).code(404);
        }

        const userData = userDoc.data();
        const mealData = userData.wantedMenu || {};

        if (!mealData[formattedMealName]) {
            return h.response({ error: 'Meal not found' }).code(404);
        }

        const updatePath = `wantedMenu.${formattedMealName}`;
        const updateData = {
            [updatePath]: Firestore.FieldValue.delete()
        };

        await userProfileRef.update(updateData);
        return h.response({ message: 'Meal deleted successfully' }).code(200);
    } catch (error) {
        console.error('Error deleting meal:', error);
        return h.response({ error: 'An internal server error occurred' }).code(500);
    }
}

module.exports = { searchMealHandler, getMealDetailsHandler, getAllFoodDataHandler, addMealComponentHandler, getMealHandler, deleteComponentMealHandler, deleteMealHandler, addManualMealComponentHandler };
