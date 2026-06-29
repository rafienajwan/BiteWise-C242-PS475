const crypto = require('crypto');
const storeData = require('../../services/storeData');
const { getData, getAllData } = require('../../services/getData');

async function addUserHandler(request, h) {
    const userId = crypto.randomBytes(16).toString('hex');
    const { goal, gender, activeLevel, tall, weight, age } = request.payload;
    const waterValue = 0;
    
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
    const userData = await getData(userId);
    if (!userData) {
        return h.response({
            status: 'fail',
            message: 'User not found'
        }).code(404);
    }

    userData.goal = request.payload.goal;
    userData.gender = request.payload.gender;
    userData.activeLevel = request.payload.activeLevel;
    userData.tall = request.payload.tall;
    userData.weight = request.payload.weight;
    userData.age = request.payload.age;

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
    const userData = await getData(userId);
    if (!userData) {
        return h.response({
            status: 'fail',
            message: 'User not found'
        }).code(404);
    }

    userData.waterValue = request.payload.waterValue;

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
    const userData = await getData(userId);
    if (!userData) {
        return h.response({
            status: 'fail',
            message: 'User not found'
        }).code(404);
    }

    const response = h.response({
        status: 'success',
        data: userData.waterValue
    })
    response.code(200);
    return response;
}

async function getAllUsersHandler(request, h) {
    try {
        const users = await getAllData();

        if (users.length === 0) {
            console.log('No users found');
            return h.response({ error: 'No users found' }).code(404);
        }

        return h.response(users).code(200);
    } catch (error) {
        console.error('Error fetching users:', error);
        return h.response({ error: 'Failed to fetch users' }).code(500);
    }
}

module.exports = { addUserHandler, getUserHandler, editUserHandler, editWaterValueHandler, getWaterValueHandler, getAllUsersHandler };
