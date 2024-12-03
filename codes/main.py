from fastapi import FastAPI, HTTPException
from tracker_model import calculate_daily_targets, add_food_input, calculate_daily_totals

app = FastAPI()

@app.post("/daily_targets/")
def get_daily_targets(gender: str, weight_kg: float, height_cm: float, age: int, activity_level: str = "sedentary"):
    try:
        result = calculate_daily_targets(gender, weight_kg, height_cm, age, activity_level)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/add_food/")
def add_food(food_name: str, calories: float, protein: float, fat: float, carbs: float):
    try:
        add_food_input(food_name, calories, protein, fat, carbs)
        return {"status": "success", "message": f"Food '{food_name}' added successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/daily_totals/")
def get_daily_totals(date: str):
    try:
        result = calculate_daily_totals(date)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
