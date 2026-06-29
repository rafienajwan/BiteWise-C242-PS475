const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

async function searchMeal(mealName) {
    const mealRef = firestore.collection('foodMenu').doc(mealName.trim());
    const doc = await mealRef.get();
    
    if (!doc.exists) {
        console.log('No matching documents.');
        return null;
    }

    return doc.data();
}

module.exports = searchMeal;
