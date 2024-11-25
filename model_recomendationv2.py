import json
from datetime import datetime, timedelta
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense

# Load data makanan
with open("food_data.json", "r") as f:
    food_data = json.load(f)

# Konversi ke dictionary
food_dict = {item["name"]: item for item in food_data}

# Load tracker memory
with open("result/tracker_memory.json", "r") as f:
    tracker_memory = json.load(f)

# Konversi tracker memory ke log list
all_logs = []
for date, entries in tracker_memory.items():
    if isinstance(entries, list):  # Validasi entries adalah list
        for entry in entries:
            if isinstance(entry, dict):  # Validasi entry adalah dict
                entry["date"] = date
                all_logs.append(entry)

# Filter log 1 bulan terakhir
one_month_ago = datetime.now() - timedelta(days=30)
recent_logs = [
    log
    for log in all_logs
    if datetime.fromisoformat(f"{log['date']}T{log['time']}") > one_month_ago
]

# Hitung frekuensi pemanggilan menu
menu_frequency = {}
for log in recent_logs:
    food_name = log.get("food_name")
    if food_name:
        menu_frequency[food_name] = menu_frequency.get(food_name, 0) + 1

# Fungsi rekomendasi
def recommend_meals(user_target_calories, user_target_protein, current_time=None):
    if current_time is None:
        current_time = datetime.now()

    # Tentukan waktu makan dan alokasi kalori
    if current_time.hour < 10:
        meal_time = "Sarapan"
        calorie_allocation = user_target_calories * 0.22
    elif 10 <= current_time.hour < 15:
        meal_time = "Makan Siang"
        calorie_allocation = user_target_calories * 0.31
    else:
        meal_time = "Makan Malam"
        calorie_allocation = user_target_calories * 0.35

    print(f"Waktu makan: {meal_time}, Alokasi kalori: {calorie_allocation:.2f} kcal")

    # Rekomendasi menu
    recommendations = []
    for food_name, details in food_dict.items():
        # Pastikan tidak lebih dari 2 kali
        if menu_frequency.get(food_name, 0) >= 2:
            continue

        # Hitung porsi sesuai alokasi kalori
        calories = details.get("calories", 0)
        if calories <= 0:
            continue

        portion_ratio = calorie_allocation / calories
        portion_weight = portion_ratio * 100  # Dalam gram

        # Pastikan porsi dalam batas wajar (misal 50g - 500g)
        if 50 <= portion_weight <= 500:
            recommendations.append(
                {
                    "food_name": food_name,
                    "portion_weight": round(portion_weight, 1),
                    "calories": round(portion_weight / 100 * calories, 1),
                    "protein": round(portion_weight / 100 * details.get("proteins", 0), 1),
                    "fat": round(portion_weight / 100 * details.get("fat", 0), 1),
                    "carbs": round(portion_weight / 100 * details.get("carbohydrate", 0), 1),
                }
            )

    # Urutkan rekomendasi berdasarkan protein, kemudian kalori
    recommendations.sort(key=lambda x: (-x["protein"], -x["calories"]))
    return recommendations


# TensorFlow Model untuk Vertex AI
def build_tensorflow_model(input_dim):
    model = Sequential([
        Dense(64, activation="relu", input_dim=input_dim),
        Dense(32, activation="relu"),
        Dense(3, activation="softmax")  # Output: 3 kelas (sarapan, siang, malam)
    ])
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    return model


def train_recommendation_model(food_data, tracker_memory):
    # Dataset untuk model rekomendasi
    X = []
    y = []
    for date, entries in tracker_memory.items():
        for entry in entries:
            food_name = entry["food_name"]
            if food_name in food_dict:
                food_info = food_dict[food_name]
                # Input: Nutrisi makanan
                X.append([food_info["calories"], food_info["proteins"], food_info["fat"], food_info["carbohydrate"]])
                # Label: Waktu makan (0: Sarapan, 1: Siang, 2: Malam)
                time = datetime.strptime(entry["time"], "%H:%M:%S").hour
                if time < 10:
                    y.append(0)
                elif 10 <= time < 15:
                    y.append(1)
                else:
                    y.append(2)

    X = np.array(X)
    y = tf.keras.utils.to_categorical(y, num_classes=3)

    # Build dan Train Model
    model = build_tensorflow_model(X.shape[1])
    model.fit(X, y, epochs=10, batch_size=8, verbose=1)
    return model


# Contoh penggunaan rekomendasi
user_target_calories = 2000  # Target kalori harian
user_target_protein = 75  # Target protein harian

recommendations = recommend_meals(user_target_calories, user_target_protein)
print("Rekomendasi menu:")
for rec in recommendations[:5]:  # Batasi 5 rekomendasi
    print(rec)

# Training model TensorFlow
trained_model = train_recommendation_model(food_dict, tracker_memory)

# Simpan model untuk Vertex AI
trained_model.save("models/recommendation_model")
