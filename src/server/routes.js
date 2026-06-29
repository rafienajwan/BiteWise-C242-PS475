const { getAllFoodDataHandler, searchMealHandler, getMealDetailsHandler, addMealComponentHandler, addManualMealComponentHandler, getMealHandler, deleteComponentMealHandler, deleteMealHandler } = require('./handler/mealHandler');
const { addUserHandler, getUserHandler, editUserHandler, editWaterValueHandler, getWaterValueHandler, getAllUsersHandler } = require('./handler/userHandler');
const { predictPFCHandler, getPFCHandler } = require('./handler/pfcHandler');
const { predictGoalsHandler, getGoalsHandler } = require('./handler/goalsHandler');
const { getNutrientTrackerHandler } = require('./handler/trackerHandler');
const { pushFoodData } = require('./postSearchQueue');

const routes = [
    {
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            try {
                return 'Welcome to the Bitewise API!';
            } catch (error) {
                console.error('Error handling root route:', error);
                return h.response({ error: 'An internal server error occurred' }).code(500);
            }
        }
    },
    {
        method: 'POST',
        path: '/user',
        handler: addUserHandler
    },
    {
        method: 'GET',
        path: '/user/{userId}',
        handler: getUserHandler
    },
    {
        method: 'PUT',    
        path: '/user/{userId}',
        handler: editUserHandler
    },
    {
        method: 'GET',    
        path: '/user/{userId}/waterValue',
        handler: getWaterValueHandler
    },
    {
        method: 'PUT',    
        path: '/user/{userId}/waterValue',
        handler: editWaterValueHandler
    },
    {
        method: 'GET',    
        path: '/user',
        handler: getAllUsersHandler
    },
    {
        method: 'POST',
        path: '/postfood',
        options: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 10485760,
            }
        },
        handler: pushFoodData
    },
    {
        method: 'GET',
        path: '/search',
        handler: getAllFoodDataHandler
    },
    {
        method: 'GET',
        path: '/search/{mealName}',
        handler: searchMealHandler
    },
    {
        method: 'GET',
        path: '/meal/{mealId}',
        handler: getMealDetailsHandler
    },
    {
        method: 'POST',
        path: '/user/{userId}/meal/{mealId}/add',
        options: {
            payload: {
                maxBytes: 10485760,
            }
        },
        handler: addMealComponentHandler
    },
    {
        method: 'POST',
        path: '/user/{userId}/meal/add',
        options: {
            payload: {
                maxBytes: 10485760,
            }
        },
        handler: addManualMealComponentHandler
    },
    {
        method: 'GET',
        path: '/user/{userId}/meal',
        handler: getMealHandler
    },
    {
        method: 'DELETE',
        path: '/user/{userId}/meal/{mealName}/{componentName}',
        handler: deleteComponentMealHandler
    },
    {
        method: 'DELETE',
        path: '/user/{userId}/meal/{mealName}',
        handler: deleteMealHandler
    },
    {
        method: 'GET',
        path: '/user/{userId}/nutrientTracker',
        handler: getNutrientTrackerHandler
    },
    {
        method: 'POST',
        path: '/user/{userId}/pfc',
        handler: predictPFCHandler
    },
    {
        method: 'GET',
        path: '/user/{userId}/pfc',
        handler: getPFCHandler
    },
    {
        method: 'POST',
        path: '/user/{userId}/goals',
        handler: predictGoalsHandler
    },
    {
        method: 'GET',
        path: '/user/{userId}/goals',
        handler: getGoalsHandler
    },
    {
        method: '*',
        path: '/{any*}',
        handler: (request, h) => {
            return h.response({ error: 'Not Found' }).code(404);
        }
    }
];

module.exports = routes;
