// Helper function to extract numeric values from a formatted string
function extractNutrientValues(description) {
    const nutrients = {
        calories: 0,
        fat: 0,
        carbs: 0,
        protein: 0
    };

    const regex = /Calories:\s*([\d.]+)kcal\s*\|\s*Fat:\s*([\d.]+)g\s*\|\s*Carbs:\s*([\d.]+)g\s*\|\s*Protein:\s*([\d.]+)g/;
    const match = description.match(regex);

    if (match) {
        nutrients.calories = parseFloat(match[1]);
        nutrients.fat = parseFloat(match[2]);
        nutrients.carbs = parseFloat(match[3]);
        nutrients.protein = parseFloat(match[4]);
    }

    return nutrients;
}

module.exports = extractNutrientValues;