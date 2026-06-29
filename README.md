# BiteWise

BiteWise is a cloud-based backend API designed to help users manage daily food intake and nutrition with features such as food search, meal logging, water tracking, calorie tracking, PFC target prediction, and weight-goal estimation.

## Key Features

1. **Food Search**  
   - Search for meals by name and retrieve relevant nutritional information stored in Firestore.

2. **Meal and Nutrition Management**  
   - Manage meal nutrition data, manual meal components, and daily nutrient summaries.

3. **Goal and Target Tracking**  
   - Set and monitor daily calorie and nutrition goals with estimated timeframes to reach target weight using `/user/{userId}/goals`.

4. **PFC Target Calculation**  
   - Predict personalized daily calorie targets using PFC (Protein, Fat, Carbohydrate) model with `/user/{userId}/pfc`.

5. **User Data Management**  
   - Store and retrieve user-specific data for personalized features.

6. **Cloud Integration with Firestore**  
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
   - Use TensorFlow.js models for PFC and goal predictions.

## Machine Learning Model Status

This repository only contains the backend integration code for the machine learning models. The model files are loaded from URLs configured in environment variables:

- `PFC_MODEL_URL`: required. Used by `POST /user/{userId}/pfc`.
- `GOALS_MODEL_URL`: required. Used by `POST /user/{userId}/goals`.

Important limitations:

- The training datasets, training notebooks/scripts, preprocessing/scaling details, model evaluation metrics, and model version history are not included in this repository.
- Because of that, this README cannot honestly claim model accuracy or explain the full training methodology.
- The backend can only describe the runtime inputs and outputs currently used by the API.


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

   - **Endpoint**: `/user/{userId}/waterValue`  
     - **Method**: `GET`  
       **Description**: Mengambil nilai konsumsi air pengguna.  
     - **Method**: `PUT`  
       **Description**: Mengubah nilai konsumsi air pengguna. Contoh input:  
       ```json
       {
           "waterValue": 3
       }
       ```

3. **Food Search and Meal Data**  
   - **Endpoint**: `/search`  
     - **Method**: `GET`  
       **Description**: Mengambil semua data makanan dari koleksi `foodMenu`.  

   - **Endpoint**: `/search/{mealName}`  
     - **Method**: `GET`  
       **Description**: Mencari data makanan berdasarkan nama dokumen makanan. Spasi akan diperlakukan sebagai underscore.  

   - **Endpoint**: `/meal/{mealId}`  
     - **Method**: `GET`  
       **Description**: Mengambil detail makanan berdasarkan ID dokumen di `foodMenu`.  

4. **Meal Logging**  
   - **Endpoint**: `/user/{userId}/meal/{mealId}/add`  
     - **Method**: `POST`  
       **Description**: Menambahkan komponen makanan dari data `foodMenu` ke profil pengguna jika `postToProfile` bernilai `true`.  

   - **Endpoint**: `/user/{userId}/meal/add`  
     - **Method**: `POST`  
       **Description**: Menambahkan komponen makanan manual ke profil pengguna dan menyimpan data nutrisinya ke `foodMenu`.  

   - **Endpoint**: `/user/{userId}/meal`  
     - **Method**: `GET`  
       **Description**: Mengambil daftar meal yang tersimpan pada pengguna.  

   - **Endpoint**: `/user/{userId}/meal/{mealName}/{componentName}`  
     - **Method**: `DELETE`  
       **Description**: Menghapus satu komponen dari meal pengguna.  

   - **Endpoint**: `/user/{userId}/meal/{mealName}`  
     - **Method**: `DELETE`  
       **Description**: Menghapus satu meal beserta komponennya.  

5. **Nutrient Tracker**  
   - **Endpoint**: `/user/{userId}/nutrientTracker`  
     - **Method**: `GET`  
       **Description**: Mengambil semua data yang dibutuhkan untuk melacak nutrisi, termasuk total nutrisi yang dikonsumsi dan target PFC.  

6. **PFC Model (Protein, Fat, Carbohydrate)**  
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

7. **Goal Tracking**  
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

This project is configured for Node.js 18, matching the `nodejs18` runtime in `app.yaml`. The backend tries to use native `@tensorflow/tfjs-node` first, then falls back to `@tensorflow/tfjs` when the native binding is unavailable on the local machine.

1. Clone the repository:
   ```bash
   git clone https://github.com/username/BiteWise.git
   ```

2. Navigate to the project directory
   ```bash
   cd BiteWise
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the application:
   ```bash
   npm start
   ```

5. Configure environment variables:
   ```bash
   PORT=3000
   PFC_MODEL_URL=https://example.com/pfc/model.json
   GOALS_MODEL_URL=https://example.com/goals/model.json
   ```

## Using the Calorie and Nutrient Tracker

The calorie and nutrient tracker is implemented through the API, not through a standalone `calculateCalories` script. The backend reads meal components from the user's `wantedMenu` data in Firestore, sums calories, carbs, fats, and proteins for today's logged meals, then returns the summary together with the user's PFC target.

Example request:

```bash
GET /user/{userId}/nutrientTracker
```

Example response:

```json
{
    "nutrientSummary": {
        "totalCalories": 520,
        "totalCarbs": 61,
        "totalFats": 18,
        "totalProteins": 32
    },
    "targetPFC": {
        "calories": 916,
        "carbs": 110,
        "fats": 28,
        "proteins": 77,
        "targetGoal": 69
    }
}
```
