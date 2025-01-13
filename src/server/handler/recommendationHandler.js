const tf = require('@tensorflow/tfjs-node'); // Ensure TensorFlow is required
const { Firestore } = require('@google-cloud/firestore');
const predictRecommendation = require('../../services/recommendationModel/recommendationService'); // Import the recommendation service

const firestore = new Firestore();

// Define the activity level map
const activity_map = {
    "sedentary": 1.2,
    "light": 1.375,
    "average": 1.55,
    "active": 1.55,
    "very_active": 1.725
};

function calculateDailyCalories(weight, height, gender, activityLevel) {
    const bmi = weight / ((height / 100) ** 2);
    const baseCalories = gender === "male" ? 2000 : 1800;

    const activityFactors = {
        "sedentary": 1.2,
        "light": 1.375,
        "average": 1.55,
        "active": 1.55,
        "very_active": 1.725
    };

    const activityFactor = activityFactors[activityLevel] || 1.2;

    return baseCalories * activityFactor;
}

function getTimeOfDayFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();

    if (hour >= 1 && hour < 9) {
        return "breakfast";
    } else if (hour >= 9 && hour < 17) {
        return "lunch";
    } else {
        return "dinner";
    }
}

function parseFoodDescription(description) {
    const regex = /Calories:\s*([\d.]+)kcal\s*\|\s*Fat:\s*([\d.]+)g\s*\|\s*Carbs:\s*([\d.]+)g\s*\|\s*Protein:\s*([\d.]+)g/;
    const match = description.match(regex);
    if (match) {
        return {
            calories: parseFloat(match[1]) || 0,
            fat: parseFloat(match[2]) || 0,
            carbohydrate: parseFloat(match[3]) || 0,
            proteins: parseFloat(match[4]) || 0
        };
    }
    return {
        calories: 0,
        fat: 0,
        carbohydrate: 0,
        proteins: 0
    };
}

async function getFoodNutritionMap() {
    const foodDataRef = firestore.collection('foodMenu');
    const snapshot = await foodDataRef.get();

    if (snapshot.empty) {
        console.log('No food data found');
        return {};
    }

    const foodNutritionMap = {};
    snapshot.forEach(doc => {
        const data = doc.data();
        const nutrition = parseFoodDescription(data.food_description);
        foodNutritionMap[doc.id] = nutrition;
    });

    return foodNutritionMap;
}

async function getUserLogData(userId) {
    // Fetch user log data for the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsAgoISO = threeMonthsAgo.toISOString().split('T')[0];

    const userProfileRef = firestore.collection('users').doc(userId);
    const userDoc = await userProfileRef.get();

    if (!userDoc.exists) {
        throw new Error('User not found');
    }

    const userData = userDoc.data();
    const wantedMenu = userData.wantedMenu || {};

    let totalCalories = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalProteins = 0;

    for (const mealName in wantedMenu) {
        const mealComponents = wantedMenu[mealName];
        for (const componentName in mealComponents) {
            const component = mealComponents[componentName];
            const componentDate = component.timestamp.toDate().toISOString().split('T')[0];
            if (componentDate >= threeMonthsAgoISO) {
                if (component.calories == null || component.carbs == null || component.fat == null || component.protein == null) {
                    console.error(`Missing nutrient data for component: ${componentName} in meal: ${mealName}`);
                    console.error(`Component data: ${JSON.stringify(component)}`);
                } else {
                    totalCalories += component.calories;
                    totalCarbs += component.carbs;
                    totalFats += component.fat;
                    totalProteins += component.protein;
                }
            }
        }
    }

    return {
        totalCalories: Math.round(totalCalories),
        totalCarbs: Math.round(totalCarbs),
        totalFats: Math.round(totalFats),
        totalProteins: Math.round(totalProteins)
    };
}

async function recommendFood(userId, timeOfDay, request) {
    console.log(`Fetching user data for userId: ${userId}`);
    const userProfileRef = firestore.collection('users').doc(userId);
    const userDoc = await userProfileRef.get();

    if (!userDoc.exists) {
        throw new Error('User not found');
    }

    const userData = userDoc.data();
    console.log('User data retrieved:', userData);

    const weight = parseFloat(userData.weight);
    const height = parseFloat(userData.tall);
    const dailyCalories = calculateDailyCalories(weight, height, userData.gender, userData.activeLevel);
    console.log(`Calculated daily calories: ${dailyCalories}`);

    // Calorie allocation based on time of day
    let calorieAllocation;
    if (timeOfDay === "breakfast") {
        calorieAllocation = dailyCalories * 0.22;
    } else if (timeOfDay === "lunch") {
        calorieAllocation = dailyCalories * 0.31;
    } else if (timeOfDay === "dinner") {
        calorieAllocation = dailyCalories * 0.35;
    } else {
        console.error(`Invalid time of day: ${timeOfDay}`);
        throw new Error("Invalid time of day (breakfast, lunch, dinner)");
    }
    console.log(`Calorie allocation for ${timeOfDay}: ${calorieAllocation}`);

    // Fetch user log data for the last 3 months
    console.log('Fetching user log data for the last 3 months...');
    const logData = await getUserLogData(userId);
    console.log('User log data retrieved:', logData);

    // Fetch food nutrition data from Firestore
    console.log('Fetching food nutrition data from Firestore...');
    const foodNutritionMap = await getFoodNutritionMap();
    console.log('Food nutrition data retrieved:', foodNutritionMap);

    const recommendations = [];

    for (const [foodName, foodInfo] of Object.entries(foodNutritionMap)) {
        // Predict portion weight
        const inputData = [weight, height, dailyCalories, logData.totalCalories, logData.totalProteins, logData.totalFats, logData.totalCarbs];
        console.log('Input data for tensor:', inputData);
        if (inputData.includes(undefined)) {
            console.error('Input data contains undefined values:', inputData);
            throw new Error('Input data contains undefined values');
        }
        const portionWeightTensor = tf.tensor2d([inputData], [1, 7]);
        const portionWeightPrediction = await predictRecommendation(request.server.app.recommendationModel, portionWeightTensor);
        let portionWeight = portionWeightPrediction[0];

        if (portionWeight < 50 || portionWeight > 500) {
            continue;
        }

        const calculatedCalories = (foodInfo.calories / 100) * portionWeight;
        const calculatedProteins = (foodInfo.proteins / 100) * portionWeight;
        const calculatedFat = (foodInfo.fat / 100) * portionWeight;
        const calculatedCarbs = (foodInfo.carbohydrate / 100) * portionWeight;

        recommendations.push({
            food_name: foodName,
            portion_weight: Math.round(portionWeight * 10) / 10,
            calories: Math.round(calculatedCalories * 10) / 10,
            protein: Math.round(calculatedProteins * 10) / 10,
            fat: Math.round(calculatedFat * 10) / 10,
            carbs: Math.round(calculatedCarbs * 10) / 10,
            difference: Math.abs(calculatedCalories - calorieAllocation)
        });
    }

    // Sort recommendations by the difference in calories and take the top 5
    recommendations.sort((a, b) => a.difference - b.difference);
    const topRecommendations = recommendations.slice(0, 5);

    console.log('Generated top 5 recommendations:', topRecommendations);
    return topRecommendations;
}

async function predictRecommendationHandler(request, h) {
    const { userId } = request.params; // Expect userId in the params
    console.log(`Received Recommendation prediction request for userId: ${userId}`);

    try {
        // Fetch user data from Firestore
        console.log('Fetching user data from Firestore...');
        const userProfileRef = firestore.collection('users').doc(userId);
        const userDoc = await userProfileRef.get();

        if (!userDoc.exists) {
            console.log('User not found');
            return h.response({ error: 'User not found' }).code(404);
        }
        const userData = userDoc.data();
        console.log('User data retrieved:', userData);

        // Determine the time of day from the timestamp in user data
        const timestamp = userData.timestamp; // Assuming the timestamp field is named 'timestamp'
        const timeOfDay = getTimeOfDayFromTimestamp(timestamp);
        console.log(`Time of day from timestamp: ${timeOfDay}`);

        // Recommend food based on the time of day
        const recommendations = await recommendFood(userId, timeOfDay, request);
        console.log(`Recommendations: ${JSON.stringify(recommendations)}`);

        // Return the recommended foods
        return h.response({ recommendations }).code(200);

    } catch (error) {
        console.error('Error in predictRecommendationHandler:', error);
        return h.response({ error: 'An internal server error occurred' }).code(500);
    }
}

module.exports = { predictRecommendationHandler };