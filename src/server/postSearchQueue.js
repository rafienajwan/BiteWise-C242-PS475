const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs').promises;
const path = require('path');

const db = new Firestore();
const collection = db.collection('foodMenu');

async function pushFoodData(request, h) {
    const file = request.payload.file;
    const filePath = path.join(__dirname, file.hapi.filename);

    try {
        console.log('Saving the file to the server...');
        await fs.writeFile(filePath, file._data);
        console.log(`File saved successfully at ${filePath}`);

        console.log('Reading and parsing the JSON file...');
        const fileContent = await fs.readFile(filePath, 'utf8');
        const foodData = JSON.parse(fileContent);
        console.log('JSON file parsed successfully.');

        const batch = db.batch();
        let documentCount = 0;

        console.log('Starting to process food data...');
        for (const [foodName, foodDetailsArray] of Object.entries(foodData)) {
            const sanitizedFoodName = foodName.replace(/[\/\s]/g, '_');
            if (Array.isArray(foodDetailsArray)) {
                foodDetailsArray.forEach(foodDetails => {
                    const docRef = collection.doc(sanitizedFoodName);
                    batch.set(docRef, { ...foodDetails });
                    console.log(`Uploading document: ${sanitizedFoodName} with details: ${JSON.stringify(foodDetails)}`);
                    documentCount++;
                });
            } else {
                const docRef = collection.doc(sanitizedFoodName);
                batch.set(docRef, { ...foodDetailsArray });
                console.log(`Uploading document: ${sanitizedFoodName} with details: ${JSON.stringify(foodDetailsArray)}`);
                documentCount++;
            }
        }

        console.log('Committing the batch...');
        await batch.commit();
        console.log(`All documents added to Firestore. Total documents uploaded: ${documentCount}`);

        console.log('Cleaning up the file...');
        await fs.unlink(filePath);
        console.log(`File cleaned up successfully at ${filePath}`);

        return h.response({ status: 'success', message: `Data added successfully. Total documents uploaded: ${documentCount}` }).code(200);
    } catch (error) {
        console.error('Error adding documents to Firestore:', error);
        return h.response({ status: 'error', message: 'Failed to add data' }).code(500);
    }
}

module.exports = { pushFoodData };
