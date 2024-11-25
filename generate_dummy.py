import json
import random
from datetime import datetime, timedelta

# Nama makanan dummy
food_names = [
    "Nasi Goreng", "Ayam Bakar", "Sate Ayam", "Mie Goreng", "Bakso",
    "Soto Ayam", "Gado-Gado", "Rendang", "Pecel Lele", "Tahu Goreng",
    "Tempe Bacem", "Lontong Sayur", "Nasi Uduk", "Rawon", "Capcay",
    "Es Cendol", "Kolak Pisang", "Kerupuk", "Martabak", "Pempek",
    "Sop Buntut", "Opor Ayam", "Kwetiau", "Dimsum", "Seblak",
    "Gudeg", "Ayam Geprek", "Ikan Bakar", "Sate Kambing", "Nasi Kuning",
    "Bubur Ayam", "Es Teler", "Nasi Liwet", "Ayam Penyet", "Tongseng",
    "Bakmi Jawa", "Sambal Goreng Ati", "Nasi Campur", "Ikan Goreng", "Udang Balado",
    "Cah Kangkung", "Siomay", "Es Doger", "Donat", "Pisang Goreng",
    "Roti Bakar", "Serabi", "Puding", "Kue Cubit", "Es Kelapa"
]

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
    # Generate data makanan acak
    food_name = random.choice(food_names)
    calories = round(random.uniform(100, 700), 2)
    protein = round(random.uniform(5, 50), 2)
    fat = round(random.uniform(2, 30), 2)
    carbs = round(random.uniform(10, 80), 2)

    # Generate tanggal dan waktu
    random_datetime = random_date(start_date, end_date)
    date_str = random_datetime.strftime("%Y-%m-%d")
    time_str = random_datetime.strftime("%H:%M:%S")

    # Format data makanan
    food_data = {
        "food_name": food_name,
        "calories": calories,
        "protein": protein,
        "fat": fat,
        "carbs": carbs,
        "time": time_str
    }

    # Tambahkan ke data tracker_memory
    if date_str not in dummy_data:
        dummy_data[date_str] = []
    dummy_data[date_str].append(food_data)

# Simpan data dummy ke file JSON
output_file = "result/tracker_memory.json"
with open(output_file, "w") as json_file:
    json.dump(dummy_data, json_file, indent=4)

print(f"Data dummy berhasil disimpan ke {output_file}")
