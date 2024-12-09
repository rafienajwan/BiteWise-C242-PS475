const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

async function getDailyNutrientSummary(userId) {
    const userProfileRef = firestore.collection('users').doc(userId);
    const userDoc = await userProfileRef.get();

    if (!userDoc.exists) {
        throw new Error('User not found');
    }

    const userData = userDoc.data();
    const wantedMenu = userData.wantedMenu || {};
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    let totalCalories = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalProteins = 0;

    for (const mealName in wantedMenu) {
        const mealComponents = wantedMenu[mealName];
        for (const componentName in mealComponents) {
            const component = mealComponents[componentName];
            const componentDate = component.timestamp.toDate().toISOString().split('T')[0];
            if (componentDate === today) {
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

async function getTotalNutrientSummary(userId) {
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
            console.log(`Processing component: ${componentName} in meal: ${mealName}`);
            console.log(`Component data: ${JSON.stringify(component)}`);
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

    console.log(`Total Calories: ${totalCalories}`);
    console.log(`Total Carbs: ${totalCarbs}`);
    console.log(`Total Fats: ${totalFats}`);
    console.log(`Total Proteins: ${totalProteins}`);

    return {
        totalCalories: Math.round(totalCalories),
        totalCarbs: Math.round(totalCarbs),
        totalFats: Math.round(totalFats),
        totalProteins: Math.round(totalProteins)
    };
}

module.exports = { getDailyNutrientSummary, getTotalNutrientSummary };