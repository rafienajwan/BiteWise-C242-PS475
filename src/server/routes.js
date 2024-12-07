const { searchMealHandler, getMealDetailsHandler, addMealComponentHandler, getMealHandler, deleteComponentMealHandler, deleteMealHandler } = require('./handler/MealHandler');
const { addUserHandler, getUserHandler, editUserHandler, editWaterValueHandler, getWaterValueHandler } = require('./handler/userHandler');
const { pushFoodData } = require('./postSearchQueue');

const routes = [
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
        path: '/search',
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
        method: 'GET',
        path: '/user/{userId}/meal',
        handler: getMealHandler
    },
    // {
    //     method: 'DELETE',
    //     path: '/user/{userId}/meal/{mealName}/{componentName}',
    //     handler: deleteComponentMealHandler
    // },
    // {
    //     method: 'DELETE',
    //     path: '/user/{userId}/meal/{mealName}',
    //     handler: deleteMealHandler
    // }
]

module.exports = routes;