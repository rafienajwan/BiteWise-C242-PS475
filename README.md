# BiteWise: Your Health and Nutrition Companion
![hippo](https://github.com/user-attachments/assets/c62a3219-2495-4b61-b5e9-da3b9372c705) { width="250px" height="250px" }

BiteWise is a mobile application developed as part of the **Bangkit 2024 Capstone Project** (Batch 2) with the team ID **BiteWise-C242-PS475**. This app empowers users to manage their nutrition, set health goals, and track their progress towards a healthier lifestyle.

## Team Members

| Member ID       | Name                      | University                                  | Learning Path         | Status  |
|-----------------|---------------------------|---------------------------------------------|-----------------------|---------|
| M296B4KY0061   | Achmad Yusuf Yulestiono   | Universitas Pembangunan Nasional Veteran Jawa Timur | Machine Learning      | Active  |
| M296B4KY3176   | Nabil Ishfaq Febriyanto   | Universitas Pembangunan Nasional Veteran Jawa Timur | Machine Learning      | Active  |
| M296B4KX4342   | Tiara Permata Sari        | Universitas Pembangunan Nasional Veteran Jawa Timur | Machine Learning      | Active  |
| C296B4KX1030   | Deisya Dzakiyyah Rahmawati| Universitas Pembangunan Nasional Veteran Jawa Timur | Cloud Computing       | Active  |
| C296B4KY3591   | Rafie Najwan Anjasmara    | Universitas Pembangunan Nasional Veteran Jawa Timur | Cloud Computing       | Active  |
| A296B4KY3243   | Nandana Wahyu Rizqullah   | Universitas Pembangunan Nasional Veteran Jawa Timur | Mobile Development    | Active  |

---

## Project Brief

**Target Market:**
Our primary audience is individuals aged 18 to 50 who are:
- Health-conscious and tech-savvy.
- Interested in weight management, nutrition, and a balanced lifestyle.
- Following trends like intermittent fasting, plant-based diets, or fitness programs.

**Solution:**
BiteWise provides tools for personalized nutrition tracking, goal-setting, and progress monitoring, making healthy living practical and motivating.

---

## Key Features
- **User Management:** Create and manage user profiles with specific health goals.
- **Nutrition Tracking:** Log meals and track calories, macronutrients, and water intake.
- **Goal Setting:** Predict the time needed to achieve weight targets and set PFC (Protein, Fats, Carbohydrates) goals.
- **Search Database:** Explore various meal options with detailed nutrient data.

---

## API Documentation
BiteWise backend uses RESTful APIs for managing user data and nutrition tracking. Below is a brief overview of the available endpoints:

1. **User Management:**
   - `/user` (POST): Add new users.
   - `/user/{userId}` (GET/PUT): View or update user profiles.

2. **Nutrition Tracking:**
   - `/user/{userId}/meal` (GET): View meals logged by a user.
   - `/user/{userId}/meal/add` (POST): Add meal components manually.
   - `/user/{userId}/nutrientTracker` (GET): Fetch nutrition summary.

3. **Goal Setting:**
   - `/user/{userId}/pfc` (POST): Predict macronutrient targets.
   - `/user/{userId}/goals` (POST/GET): Calculate and view estimated days to goal.

For detailed documentation, see the [BITEWISE API](BITEWISE_API.txt).

---

## Mockup 


![imagessss](https://github.com/user-attachments/assets/93514178-6538-4bb9-b1de-16aac79c3738)

## Getting Started

### Prerequisites
- Python and Tensorflow
- Node.js and npm (for frontend development)
- Javascript (for backend development)
- Cloud services configured (e.g., Firebase, Google Cloud)

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/your-repo/bitewise.git
   ```
2. Navigate to the project directory:
   ```bash
   cd bitewise
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```

---

## Contribution
We welcome contributions! If you'd like to improve this project, feel free to fork the repository and submit a pull request.

---

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

---

## Contact
For questions or feedback, contact us at:
- Achmad Yusuf Yulestiono: yusuf@example.com
- Nabil Ishfaq Febriyanto: nabil@example.com
