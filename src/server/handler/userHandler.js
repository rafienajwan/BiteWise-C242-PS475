const crypto = require('crypto');
const storeData = require('../../services/storeData');
const { getData } = require('../../services/getData');

async function addUserHandler(request, h) {
    // randomize user id using crypto
    const userId = crypto.randomBytes(16).toString('hex');

    // get user data from request payload
    const { goal, gender, activeLevel, tall, weight, age } = request.payload;

    // set waterValue to zero as default
    const waterValue = null;
    
    // save user data to array of object in JSON format
    const userData = {
        userId,
        goal,
        gender,
        activeLevel,
        tall,
        weight,
        age,
        waterValue
    };

    // store data into firestore
    await storeData(userId, userData);

    const response = h.response({
        status: 'success',
        message: 'User added successfully',
        data: {
            userId,
            goal,
            gender,
            activeLevel,
            tall,
            weight,
            age,
            waterValue
        }
    })
    response.code(201);
    return response;
}

async function getUserHandler(request, h) {
    const { userId } = request.params;

    // get user data from firestore
    const userData = await getData(userId);

    if (!userData) {
        return h.response({
            status: 'fail',
            message: 'User not found'
        }).code(404);
    }

    const response = h.response({
        status: 'success',
        data: userData
    })
    response.code(200);
    return response;
    
}

async function editUserHandler(request, h) {
    const { userId } = request.params;

    // get user data from firestore
    const userData = await getData(userId);

    // replace user data with new data from request payload
    userData.goal = request.payload.goal;
    userData.gender = request.payload.gender;
    userData.activeLevel = request.payload.activeLevel;
    userData.tall = request.payload.tall;
    userData.weight = request.payload.weight;
    userData.age = request.payload.age;

    // store data into firestore
    await storeData(userId, userData);

    const response = h.response({
        status: 'success',
        message: 'User edited successfully',
        data: userData
    })
    response.code(200);
    return response;
}

async function editWaterValueHandler(request, h) {
    const { userId } = request.params;

    // get user data from firestore
    const userData = await getData(userId);

    // replace user data with new data from request payload
    userData.waterValue = request.payload.waterValue;

    // store data into firestore
    await storeData(userId, userData);

    const response = h.response({
        status: 'success',
        message: 'Water value edited successfully',
        data: userData
    })
    response.code(200);
    return response;
    
}

async function getWaterValueHandler(request, h) {
    const { userId } = request.params;

    // get user data from firestore
    const userData = await getData(userId);

    const response = h.response({
        status: 'success',
        data: userData.waterValue
    })
    response.code(200);
    return response;
}

module.exports = { addUserHandler, getUserHandler, editUserHandler, editWaterValueHandler, getWaterValueHandler };