const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

async function searchMeal(mealName) {
    console.log(`Searching for meal: "${mealName}"`); // Debugging line
    const mealRef = firestore.collection('foodMenu').doc(mealName.trim());
    const doc = await mealRef.get();
    
    if (!doc.exists) {
        console.log('No matching documents.');
        return null;
    }

    console.log(`Found meal: "${mealName}"`); // Debugging line
    return doc.data();
}

module.exports = searchMeal;