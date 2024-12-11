const { Firestore } = require('@google-cloud/firestore');
 
async function getData(id) {
    // get specific data from firestore using userId
    const db = new Firestore();
    const profileCollection = db.collection('users');
    const querySnapshot = await profileCollection.where('userId', '==', id).get();

    if (querySnapshot.empty) {
        console.log('No matching documents.');
        return null;
    }

    let documentData = null;
    querySnapshot.forEach(doc => {
        documentData = doc.data();
    });

    console.log('Document data:', documentData);
    return documentData;
}

async function getAllData() {
    // get all data from firestore
    const db = new Firestore();
    const profileCollection = db.collection('users');
    const querySnapshot = await profileCollection.get();

    if (querySnapshot.empty) {
        console.log('No users found.');
        return [];
    }

    const allData = [];
    querySnapshot.forEach(doc => {
        allData.push({ id: doc.id, ...doc.data() });
    });

    console.log('All document data:', allData);
    return allData;
}

module.exports = { getData, getAllData };