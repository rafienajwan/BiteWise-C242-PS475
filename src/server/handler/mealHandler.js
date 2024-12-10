const searchMeal = require('../../services/diary/meals/searchMeal');
const extractNutrientValues = require('../../services/diary/meals/nutrientValues');
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

// Handler to get all food data
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

// Handler to add a meal component to the user's profile
async function addMealComponentHandler(request, h) {
    const { userId, mealId } = request.params;
    const { grams, postToProfile } = request.payload;
    let { mealName } = request.payload;

    // Replace spaces with underscores in mealName
    mealName = mealName.trim().replace(/\s+/g, '_');

    console.log(`Fetching meal with ID: ${mealId}`); // Debugging line

    try {
        // Fetch the meal from Firestore
        const mealRef = firestore.collection('foodMenu').doc(mealId);
        const doc = await mealRef.get();

        if (!doc.exists) {
            console.log('Meal not found'); // Debugging line
            return h.response({ error: 'Meal not found' }).code(404);
        }

        const meal = doc.data();
        console.log(`Found meal: ${JSON.stringify(meal)}`); // Debugging line

        // Ensure food_description fields are present and extract numeric values
        const foodDescription = meal.food_description || '';
        const { calories, fat, carbs, protein } = extractNutrientValues(foodDescription);

        console.log(`Parsed food description: calories=${calories}, fat=${fat}, carbs=${carbs}, protein=${protein}`); // Debugging line

        // Calculate nutrients based on user input
        const nutrients = {
            calories: (grams / 100) * calories,
            fat: (grams / 100) * fat,
            carbs: (grams / 100) * carbs,
            protein: (grams / 100) * protein
        };

        console.log(`Calculated nutrients: ${JSON.stringify(nutrients)}`); // Debugging line

        // Ensure all required fields are defined
        if (!mealName) {
            console.error('Meal name is undefined'); // Debugging line
            return h.response({ error: 'Meal name is undefined' }).code(400);
        }

        // Optionally post to profile data
        if (postToProfile) {
            const userProfileRef = firestore.collection('users').doc(userId);
            const userDoc = await userProfileRef.get();

            if (!userDoc.exists) {
                console.log('User document not found, creating new document'); // Debugging line
                await userProfileRef.set({ wantedMenu: {} }); // Create the document if it does not exist
            }

            // Create the update object with nested path
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

            // Update specific component without overwriting others
            await userProfileRef.update(updateData);
        }

        return h.response({ mealName: mealName, grams, nutrients }).code(200);
    } catch (error) {
        console.error('Error adding meal component:', error); // Debugging line
        return h.response({ error: 'An internal server error occurred' }).code(500);
    }
}

// Handler to manually add a meal component to the user's profile and foodMenu collection
async function addManualMealComponentHandler(request, h) {
    const { userId } = request.params;
    const { mealName, foodComponentName, grams, calories, carbs, fat, protein } = request.payload;

    // Replace spaces with underscores in mealName and foodComponentName
    const formattedMealName = mealName.trim().replace(/\s+/g, '_');
    const formattedFoodComponentName = foodComponentName.trim().replace(/\s+/g, '_');

    console.log(`Adding manual meal component for userId: ${userId}`); // Debugging line

    try {
        // Create the meal component data
        const mealComponentData = {
            grams,
            calories,
            carbs,
            fat,
            protein,
            timestamp: new Date()
        };

        // Add the meal component to the user's profile
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

        // Add the meal component to the foodMenu collection
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

    // Replace spaces with underscores in mealName and componentName
    const formattedMealName = mealName.trim().replace(/\s+/g, '_');
    const formattedComponentName = componentName.trim().replace(/\s+/g, '_');

    console.log(`Deleting component: ${formattedComponentName} from meal: ${formattedMealName} for user: ${userId}`); // Debugging line

    try {
        const userProfileRef = firestore.collection('users').doc(userId);
        const userDoc = await userProfileRef.get();

        if (!userDoc.exists) {
            console.log('User not found'); // Debugging line
            return h.response({ error: 'User not found' }).code(404);
        }

        const userData = userDoc.data();
        const mealData = userData.wantedMenu || {};

        // Check if the meal and component exist
        if (!mealData[formattedMealName] || !mealData[formattedMealName][formattedComponentName]) {
            console.log('Meal or component not found'); // Debugging line
            return h.response({ error: 'Meal or component not found' }).code(404);
        }

        // Delete the component
        delete mealData[formattedMealName][formattedComponentName];

        // If the meal is now empty, delete the meal
        if (Object.keys(mealData[formattedMealName]).length === 0) {
            delete mealData[formattedMealName];
        }

        await userProfileRef.update({ wantedMenu: mealData });

        console.log('Component deleted successfully'); // Debugging line
        return h.response({ message: 'Component deleted successfully' }).code(200);
    } catch (error) {
        console.error('Error deleting component:', error); // Debugging line
        return h.response({ error: 'An internal server error occurred' }).code(500);
    }
}

async function deleteMealHandler(request, h) {
    const { userId, mealName } = request.params;

    // Replace spaces with underscores in mealName
    const formattedMealName = mealName.trim().replace(/\s+/g, '_');

    console.log(`Deleting meal for user: ${userId}, mealName: ${formattedMealName}`); // Debugging line

    try {
        const userProfileRef = firestore.collection('users').doc(userId);
        const userDoc = await userProfileRef.get();

        if (!userDoc.exists) {
            console.log('User not found'); // Debugging line
            return h.response({ error: 'User not found' }).code(404);
        }

        const userData = userDoc.data();
        const mealData = userData.wantedMenu || {};

        // Check if the meal exists
        if (!mealData[formattedMealName]) {
            console.log('Meal not found'); // Debugging line
            return h.response({ error: 'Meal not found' }).code(404);
        }

        // Delete the entire meal
        const updatePath = `wantedMenu.${formattedMealName}`;
        const updateData = {
            [updatePath]: Firestore.FieldValue.delete()
        };

        console.log(`Update path: ${updatePath}`); // Debugging line
        console.log(`Update data: ${JSON.stringify(updateData)}`); // Debugging line

        await userProfileRef.update(updateData);
        console.log('Meal deleted successfully'); // Debugging line
        return h.response({ message: 'Meal deleted successfully' }).code(200);
    } catch (error) {
        console.error('Error deleting meal:', error); // Debugging line
        return h.response({ error: 'An internal server error occurred' }).code(500);
    }
}

module.exports = { searchMealHandler, getMealDetailsHandler, getAllFoodDataHandler, addMealComponentHandler, getMealHandler, deleteComponentMealHandler, deleteMealHandler, addManualMealComponentHandler };