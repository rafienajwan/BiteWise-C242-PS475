# BiteWise

BiteWise is a cloud-based application designed to help users manage their daily food intake and nutrition with features such as food search, nutrition recommendations, calorie tracking, and personalized goal setting.

## Key Features

1. **Food Search**  
   - Search for meals by name and retrieve relevant nutritional information stored in Firestore.

2. **Nutrition Management**  
   - Manage meal nutrition data and use it for further analysis or reporting.

3. **Goal and Target Tracking**  
   - Set and monitor daily calorie and nutrition goals with estimated timeframes to reach target weight using `/user/{userId}/goals`.

4. **PFC Target Calculation**  
   - Predict personalized daily calorie targets using PFC (Protein, Fat, Carbohydrate) model with `/user/{userId}/pfc`.

5. **Calorie Calculation**  
   - Calculate daily calorie consumption using Firestore for data storage and Google App Engine F2 for processing.

6. **User Data Management**  
   - Store and retrieve user-specific data for personalized features.

7. **Cloud Integration with Firestore**  
   - Leverage Google Firestore for real-time data storage and retrieval.
  
## API Documentation
BiteWise provides various API endpoints that enable integration of features such as user data management, food, nutrition, and Machine Learning-based predictions. 

## API Features

1. **User Management**  
   - Register a new user by providing personal details (goal, gender, activity level, height, weight, and age).  
   - Edit user information or retrieve specific user data.  

2. **Calorie and Nutrition Tracking**  
   - Track daily nutrient intake using the nutrient tracker, which summarizes total calories, carbs, fats, and proteins.  
   - Use the **PFC Prediction API** to calculate daily target calories and nutrients based on user goals.  

3. **Meal Management**  
   - Add meals or specific food components manually or by using pre-defined food data.  
   - Retrieve, edit, or delete meals and their components.  

4. **Water Intake Tracking**  
   - Track and update daily water intake.  

5. **Goal Prediction**  
   - Predict the estimated number of days needed to reach the target weight using the **Goal Prediction API**.  

6. **Food Search and Nutrition Information**  
   - Search for meals by name or ID to retrieve relevant nutritional data such as calories, carbs, fats, and proteins.

7. **Integration with Firestore and ML Models**  
   - Leverage Firestore for data storage and retrieval.  
   - Use machine learning models to personalize recommendations and predictions for users.


### Endpoints:
1. **Welcome Message**  
   - **Endpoint**: `/`  
   - **Method**: `GET`  
   - **Description**: Menampilkan pesan selamat datang untuk memeriksa apakah API aktif.  

2. **User Management**
   - **Endpoint**: `/user`  
     - **Method**: `POST`  
       **Description**: Menambahkan data pengguna baru. Contoh input:  
       ```json
       {
           "goal": "lose weight",
           "gender": "male",
           "activeLevel": "sedentary",
           "tall": "172",
           "weight": "61",
           "age": "20"
       }
       ```  
     - **Method**: `GET`  
       **Description**: Menampilkan daftar semua pengguna yang terdaftar.  

   - **Endpoint**: `/user/{userId}`  
     - **Method**: `GET`  
       **Description**: Menampilkan detail data pengguna tertentu berdasarkan `userId`.  

     - **Method**: `PUT`  
       **Description**: Mengedit data pengguna tertentu. Input sama seperti pada metode `POST`.  

3. **Nutrient Tracker**  
   - **Endpoint**: `/user/{userId}/nutrientTracker`  
     - **Method**: `GET`  
       **Description**: Mengambil semua data yang dibutuhkan untuk melacak nutrisi, termasuk total nutrisi yang dikonsumsi dan target PFC.  

4. **PFC Model (Protein, Fat, Carbohydrate)**  
   - **Endpoint**: `/user/{userId}/pfc`  
     - **Method**: `POST`  
       **Description**: Memprediksi target PFC berdasarkan input target kalori. Contoh input:  
       ```json
       {
           "goal": "69"
       }
       ```  
       Contoh output:  
       ```json
       {
           "calories": 915.79,
           "carbs": 110.27,
           "fats": 27.91,
           "proteins": 77.17,
           "targetGoal": 69
       }
       ```  

5. **Goal Tracking**  
   - **Endpoint**: `/user/{userId}/goals`  
     - **Method**: `POST`  
       **Description**: Menghitung estimasi hari yang dibutuhkan untuk mencapai target berat badan.  
       Contoh output:  
       ```json
       {
           "goals": [
               -1161.69
           ],
           "days_to_goal": 14
       }
       ```  

     - **Method**: `GET`  
       **Description**: Menampilkan estimasi hari berdasarkan `userId`. Contoh output:  
       ```json
       {
           "userId": "393aa575d7aaf951aead7817a33e7192",
           "estimatedDayWeightTargetGoal": 14
       }
       ```

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
