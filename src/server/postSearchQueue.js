const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs').promises;
const path = require('path');

const db = new Firestore();
const collection = db.collection('foodMenu');

async function pushFoodData(request, h) {
    const file = request.payload.file; // Assuming the file is sent with the key 'file'
    const filePath = path.join(__dirname, file.hapi.filename);

    try {
        // Save the file to the server
        await fs.writeFile(filePath, file._data);

        // Read and parse the JSON file
        const fileContent = await fs.readFile(filePath, 'utf8');
        const foodData = JSON.parse(fileContent);

        // Use Firestore batch to handle multiple writes
        const batch = db.batch();
        for (const [foodName, foodDetailsArray] of Object.entries(foodData)) {
            // Sanitize the foodName to be a valid Firestore document ID
            const sanitizedFoodName = foodName.replace(/[\/\s]/g, '_');
            if (Array.isArray(foodDetailsArray)) {
                foodDetailsArray.forEach(foodDetails => {
                    const docRef = collection.doc(sanitizedFoodName);
                    batch.set(docRef, { ...foodDetails });
                });
            } else {
                const docRef = collection.doc(sanitizedFoodName);
                batch.set(docRef, { ...foodDetailsArray });
            }
        }

        // Commit the batch
        await batch.commit();
        console.log('All documents added to Firestore');

        // Clean up the file after processing
        await fs.unlink(filePath);

        return h.response({ status: 'success', message: 'Data added successfully' }).code(200);
    } catch (error) {
        console.error('Error adding documents to Firestore:', error);
        return h.response({ status: 'error', message: 'Failed to add data' }).code(500);
    }
}

module.exports = { pushFoodData };