const { getAllFoodDataHandler, searchMealHandler, getMealDetailsHandler, addMealComponentHandler, addManualMealComponentHandler, getMealHandler, deleteComponentMealHandler, deleteMealHandler } = require('./handler/mealHandler');
const { addUserHandler, getUserHandler, editUserHandler, editWaterValueHandler, getWaterValueHandler } = require('./handler/userHandler');
const { predictPFCHandler, getPFCHandler } = require('./handler/pfcHandler');
const { predictGoalsHandler, getGoalsHandler } = require('./handler/goalsHandler');
// const { predictRecommendationHandler } = require('./handler/recommendationHandler');
const { getNutrientTrackerHandler } = require('./handler/trackerHandler');
const { pushFoodData } = require('./postSearchQueue');
const { pushTrackerMemory } = require('./postTrackerMemory');

const routes = [
    {
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Welcome to the Bitewise API!';
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
        method: 'POST',
        path: '/postfood',
        options: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 10485760, // 10 MB limit
            }
        },
        handler: pushFoodData
    },
    {
        method: 'POST',
        path: '/posttrackermemory',
        options: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 10485760, // 10 MB limit
            }
        },
        handler: pushTrackerMemory
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
                maxBytes: 10485760, // 10 MB limit
            }
        },
        handler: addMealComponentHandler
    },
    {
        method: 'POST',
        path: '/user/{userId}/meal/add',
        options: {
            payload: {
                maxBytes: 10485760, // 10 MB limit
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
    // {
    //     method: 'POST',
    //     path: '/user/{userId}/recommendation',
    //     handler: predictRecommendationHandler
    // },
    // {
    //     method: 'GET',
    //     path: '/user/{userId}/recommendation',
    //     handler: getRecommendationHandler
    // },
];

module.exports = routes;