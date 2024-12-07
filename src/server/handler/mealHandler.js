const searchMeal = require('../../services/diary/meals/searchMeal');
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

// Helper function to extract numeric values from a formatted string
function extractNutrientValues(description) {
    const nutrients = {
        calories: 0,
        fat: 0,
        carbs: 0,
        protein: 0
    };

    const regex = /Calories:\s*([\d.]+)kcal\s*\|\s*Fat:\s*([\d.]+)g\s*\|\s*Carbs:\s*([\d.]+)g\s*\|\s*Protein:\s*([\d.]+)g/;
    const match = description.match(regex);

    if (match) {
        nutrients.calories = parseFloat(match[1]);
        nutrients.fat = parseFloat(match[2]);
        nutrients.carbs = parseFloat(match[3]);
        nutrients.protein = parseFloat(match[4]);
    }

    return nutrients;
}

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
    const { userId, mealId } = request.params;
    const { grams, postToProfile, mealName } = request.payload;

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

module.exports = { searchMealHandler, getMealDetailsHandler, addMealComponentHandler };