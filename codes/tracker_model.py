import json
import random
from datetime import datetime, timedelta

# Path ke file
user_data_path = "result/user_data.json"
food_data_path = "codes/food_data.json"
tracker_memory_path = "result/tracker_memory.json"

# Load user data
with open(user_data_path, "r") as f:
    user_data = json.load(f)

# Load food data
with open(food_data_path, "r") as f:
    food_data = json.load(f)

# Membuat mapping nama pengguna dan email
user_email_map = {user["name"]: user["email"] for user in user_data}
user_names = list(user_email_map.keys())

# Membuat mapping nama makanan ke data nutrisinya
food_nutrition_map = {food["name"]: food for food in food_data}

# Fungsi untuk menghasilkan tanggal acak
def random_date(start_date, end_date):
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    random_time = timedelta(minutes=random.randint(0, 1440))
    return start_date + timedelta(days=random_days) + random_time

# Tanggal awal dan akhir untuk data dummy
start_date = datetime.strptime("2024-01-01", "%Y-%m-%d")
end_date = datetime.strptime("2024-11-22", "%Y-%m-%d")

# Membuat 50 data dummy
dummy_data = {}
for _ in range(50):
    # Pilih makanan secara acak dari food_data
    food_item = random.choice(food_data)
    food_name = food_item["name"]
    calories_per_100g = food_item["calories"]
    protein_per_100g = food_item["proteins"]
    fat_per_100g = food_item["fat"]
    carbs_per_100g = food_item["carbohydrate"]

    # Generate berat makanan acak
    weight_in_grams = random.randint(50, 300)

    # Hitung nutrisi berdasarkan berat makanan
    calories = round((calories_per_100g / 100) * weight_in_grams, 2)
    protein = round((protein_per_100g / 100) * weight_in_grams, 2)
    fat = round((fat_per_100g / 100) * weight_in_grams, 2)
    carbs = round((carbs_per_100g / 100) * weight_in_grams, 2)

    # Pilih user acak
    user_name = random.choice(user_names)
    email = user_email_map[user_name]

    # Generate tanggal dan waktu
    random_datetime = random_date(start_date, end_date)
    date_str = random_datetime.strftime("%Y-%m-%d")
    time_str = random_datetime.strftime("%H:%M:%S")

    # Format data makanan
    food_entry = {
        "user_name": user_name,
        "email": email,
        "food_name": food_name,
        "weight_in_grams": weight_in_grams,
        "calories": calories,
        "protein": protein,
        "fat": fat,
        "carbs": carbs,
        "time": time_str
    }

    # Tambahkan ke data tracker_memory
    if date_str not in dummy_data:
        dummy_data[date_str] = []
    dummy_data[date_str].append(food_entry)

# Simpan data dummy ke file JSON
with open(tracker_memory_path, "w") as json_file:
    json.dump(dummy_data, json_file, indent=4)

print(f"Data dummy berhasil disimpan ke {tracker_memory_path}")
