const { Firestore } = require('@google-cloud/firestore');
 
async function getData(id) {
    // get specific data from firestore using userId
    const db = new Firestore();
    const profileCollection = db.collection('documents');
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
 
module.exports = { getData };