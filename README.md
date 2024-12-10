# BiteWise

BiteWise is a cloud-based application designed to help users manage their daily food intake and nutrition with features such as food search, nutrition recommendations, calorie tracking, and personalized goal setting.

## Key Features

1. **Food Search**  
   - Search for meals by name and retrieve relevant nutritional information stored in Firestore.

2. **Nutrition Management**  
   - Manage meal nutrition data and use it for further analysis or reporting.

3. **Goal and Target Tracking**  
   - Set and monitor daily calorie and nutrition goals.

4. **Food Recommendations**  
   - Provide personalized meal or diet recommendations based on user data.

5. **Calorie Calculation**  
   - Calculate daily calorie consumption using Firestore for data storage and Google App Engine F2 for processing.

6. **User Data Management**  
   - Store and retrieve user-specific data for personalized features.

7. **Cloud Integration with Firestore**  
   - Leverage Google Firestore for real-time data storage and retrieval.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/BiteWise.git

2. Navigate to the project directory
   ```bash
   cd BiteWise

3. Install dependencies:
   ```bash
   npm install

4. Run the application:
   ```bash
   npm start

## Using the Calorie Calculation Feature
This feature calculates daily calorie intake based on meals logged by users, using Firestore as the database and Google App Engine F2 for backend processing.
```bash
npm install @google-cloud/firestore
```

### Steps to Run the Function
1. **Import the Function:**
   Make sure the function `calculateCalories` is imported from the appropriate file.
   ```javascript
   const calculateCalories = require('./calculateCalories');

2. **Execute the Function: Replace exampleUserId with the actual user ID from your Firestore database.**
This feature calculates daily calorie intake based on meals logged by users, using Firestore as the database and Google App Engine F2 for backend processing. 
```javascript
(async () => {
    const userId = 'exampleUserId'; // Replace with a valid user ID
    const result = await calculateCalories(userId);
    console.log('Total Calories:', result.totalCalories);
})();
```

3. **Run the Script: Save the script in a file, e.g., app.js, and execute it using Node.js:**
```bash
node app.js
```

### Example Output

If the user has logged meals, you will see output similar to the following:
```yaml
Calculating calories for user: exampleUserId
Total calories consumed: 1500
```
If no meals are logged for the user, you will see:
```yaml
Calculating calories for user: exampleUserId
No meals found for this user.
Total calories consumed: 0
```
## API Documentation

#### Search for Meals
Endpoint: /api/search-meal
Method: GET
Example:
```bash
curl -X GET "https://api.bitewise.com/search-meal?name=Nasi%20Goreng"
```
#### Log User Meal

Endpoint: /api/log-meal
Method: POST
Body:
```json
{
  "userId": "exampleUserId",
  "mealName": "Nasi Goreng",
  "calories": 500
}
```
#### Calculate Calories
Endpoint: /api/calculate-calories
Method: GET
Example:
```bash
curl -X GET "https://api.bitewise.com/calculate-calories?userId=exampleUserId"
```

#### - **Calorie Calculation Feature** : Added specific instructions for implementing and running the calorie calculation using Firestore and App Engine F2.

#### - **Example Outputs**: Provided realistic outputs for better clarity.

#### - **API Documentation**: Added REST API examples for key operations like searching meals, logging meals, and calculating calories.
