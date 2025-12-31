export function buildPrompt(transcription: string): string {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toISOString();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

  return `You are a meal logging assistant. Parse the following meal description into structured JSON data.

IMPORTANT: You MUST return ONLY valid JSON. Do not include any markdown code blocks, explanations, or additional text. The response must be parseable JSON that matches the schema exactly.

MEAL DESCRIPTION:
"${transcription}"

TASK:
Extract all foods, their portions, and meal information from the description. Parse relative time references into ISO timestamps.

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no code blocks, no explanations). The JSON must match this exact structure:

{
  "meal": {
    "name": "string",
    "description": "string (optional)"
  },
  "foods": [
    {
      "name": "string",
      "portion": {
        "value": number,
        "unit": "g" | "ml" | "oz" | "lb" | "kg" | "count" | "fl oz" | "cup" | "tbsp" | "tsp"
      },
      "servingSize": {
        "value": number,
        "unit": "g" | "ml" | "oz" | "lb" | "kg" | "count" | "fl oz" | "cup" | "tbsp" | "tsp"
      },
      "calories": number (REQUIRED - estimate based on food type and portion),
      "macros": {
        "protein": number (grams, REQUIRED - estimate based on food type),
        "carbs": number (grams, REQUIRED - estimate based on food type),
        "fat": number (grams, REQUIRED - estimate based on food type)
      },
      "micros": {} (optional - include if you have confidence)
    }
  ],
  "date": "YYYY-MM-DD (ISO date, optional, default to ${currentDate})",
  "timestamp": "ISO 8601 timestamp (optional, parse relative times)",
  "notes": "string (optional)"
}

IMPORTANT: You MUST provide nutritional estimates for ALL foods. Use your knowledge of common foods to estimate calories and macros based on the food type and portion size. These estimates are critical for meal tracking.

RULES:
1. PORTION PARSING:
   - Extract exact portions when stated: "2 eggs" → {"value": 2, "unit": "count"}
   - Convert common measurements: "a cup of rice" → {"value": 1, "unit": "cup"}
   - Estimate reasonable portions when vague: "some chicken" → {"value": 150, "unit": "g"}
   - Use standard serving sizes as defaults when missing:
     * Eggs: 1 count = 1 egg
     * Meat/fish: 150-200g per serving
     * Vegetables: 100g per serving
     * Grains: 1 cup cooked = ~200g
     * Fruits: 1 medium piece = 1 count, or 150g
     * Liquids: 1 cup = 240ml, 1 glass = 240ml

2. SERVING SIZE:
   - Set servingSize to the standard serving size for that food type
   - If portion is given, use that as servingSize
   - Common defaults:
     * Chicken breast: {"value": 200, "unit": "g"}
     * Rice (cooked): {"value": 200, "unit": "g"}
     * Eggs: {"value": 1, "unit": "count"}
     * Vegetables: {"value": 100, "unit": "g"}
     * Fruits: {"value": 150, "unit": "g"}

3. TIME PARSING:
   - Current date: ${currentDate}
   - Current time: ${currentTime}
   - Parse relative times:
     * "just ate", "just now" → current timestamp
     * "30 minutes ago" → subtract 30 minutes from current time
     * "an hour ago" → subtract 1 hour from current time
     * "breakfast" → ${currentDate}T08:00:00 (8 AM)
     * "lunch" → ${currentDate}T13:00:00 (1 PM)
     * "dinner" → ${currentDate}T19:00:00 (7 PM)
     * "snack" → current timestamp
     * "earlier today" → ${currentDate}T12:00:00 (noon)
   - If no time mentioned, use current timestamp

4. MEAL NAMING:
   - Use meal type if mentioned: "breakfast", "lunch", "dinner", "snack"
   - Otherwise use descriptive name: "Chicken and Rice", "Protein Shake", etc.
   - Capitalize first letter: "Breakfast", "Lunch", "Chicken and Rice"

5. FOOD NAMES:
   - Use specific names: "chicken breast" not "chicken", "brown rice" not "rice"
   - Keep brand names if mentioned: "Quest protein bar"
   - Normalize common terms: "eggs" → "Egg", "chicken" → "Chicken Breast"

6. NUTRIENTS (REQUIRED):
   - You MUST provide calories and macros (protein, carbs, fat) for EVERY food
   - Use your knowledge of nutrition to estimate based on:
     * Food type (meat, vegetables, grains, fruits, etc.)
     * Portion size
     * Common nutritional profiles
   - Examples:
     * Egg white (1 count): ~17 calories, 3.6g protein, 0.2g carbs, 0.1g fat
     * Chicken breast (100g): ~165 calories, 31g protein, 0g carbs, 3.6g fat
     * Brown rice cooked (100g): ~111 calories, 2.6g protein, 23g carbs, 0.9g fat
     * Toast (1 slice): ~75 calories, 2g protein, 14g carbs, 1g fat
     * Grape jelly (1 tbsp): ~50 calories, 0g protein, 13g carbs, 0g fat
   - Scale estimates based on portion size (e.g., 4 egg whites = 4x the values for 1)
   - Be as accurate as possible - these values are used for meal tracking

7. EDGE CASES:
   - Multiple foods: extract all mentioned foods
   - Vague portions: make reasonable estimates based on context
   - Missing information: use defaults, don't omit required fields
   - Ambiguous foods: choose most common interpretation

EXAMPLES:

Example 1:
Input: "I just had breakfast with 2 eggs, a slice of toast, and some orange juice"
Output:
{
  "meal": {
    "name": "Breakfast",
    "description": null
  },
  "foods": [
    {
      "name": "Egg",
      "portion": {"value": 2, "unit": "count"},
      "servingSize": {"value": 1, "unit": "count"},
      "calories": 140,
      "macros": {"protein": 12, "carbs": 0, "fat": 10},
      "micros": null
    },
    {
      "name": "Toast",
      "portion": {"value": 1, "unit": "count"},
      "servingSize": {"value": 1, "unit": "count"},
      "calories": 75,
      "macros": {"protein": 2, "carbs": 14, "fat": 1},
      "micros": null
    },
    {
      "name": "Orange Juice",
      "portion": {"value": 240, "unit": "ml"},
      "servingSize": {"value": 240, "unit": "ml"},
      "calories": 110,
      "macros": {"protein": 2, "carbs": 26, "fat": 0},
      "micros": null
    }
  ],
  "date": "${currentDate}",
  "timestamp": "${currentTime}",
  "notes": null
}

Example 2:
Input: "Lunch was a chicken breast about 200 grams with a cup of brown rice and steamed broccoli"
Output:
{
  "meal": {
    "name": "Lunch",
    "description": null
  },
  "foods": [
    {
      "name": "Chicken Breast",
      "portion": {"value": 200, "unit": "g"},
      "servingSize": {"value": 200, "unit": "g"},
      "calories": 330,
      "macros": {"protein": 62, "carbs": 0, "fat": 7.2},
      "micros": null
    },
    {
      "name": "Brown Rice",
      "portion": {"value": 200, "unit": "g"},
      "servingSize": {"value": 200, "unit": "g"},
      "calories": 222,
      "macros": {"protein": 5.2, "carbs": 46, "fat": 1.8},
      "micros": null
    },
    {
      "name": "Broccoli",
      "portion": {"value": 100, "unit": "g"},
      "servingSize": {"value": 100, "unit": "g"},
      "calories": 34,
      "macros": {"protein": 2.8, "carbs": 7, "fat": 0.4},
      "micros": null
    }
  ],
  "date": "${currentDate}",
  "timestamp": "${currentDate}T13:00:00.000Z",
  "notes": null
}

Example 3:
Input: "Had a protein shake 30 minutes ago with 2 scoops of whey and a banana"
Output:
{
  "meal": {
    "name": "Protein Shake",
    "description": null
  },
  "foods": [
    {
      "name": "Whey Protein",
      "portion": {"value": 2, "unit": "tbsp"},
      "servingSize": {"value": 1, "unit": "tbsp"},
      "calories": 120,
      "macros": {"protein": 24, "carbs": 3, "fat": 1},
      "micros": null
    },
    {
      "name": "Banana",
      "portion": {"value": 1, "unit": "count"},
      "servingSize": {"value": 1, "unit": "count"},
      "calories": 105,
      "macros": {"protein": 1.3, "carbs": 27, "fat": 0.4},
      "micros": null
    }
  ],
  "date": "${currentDate}",
  "timestamp": "${thirtyMinutesAgo}",
  "notes": null
}

Example 4:
Input: "Dinner: salmon fillet, maybe 6 ounces, with roasted sweet potato and a side salad"
Output:
{
  "meal": {
    "name": "Dinner",
    "description": null
  },
  "foods": [
    {
      "name": "Salmon",
      "portion": {"value": 170, "unit": "g"},
      "servingSize": {"value": 170, "unit": "g"},
      "calories": 290,
      "macros": {"protein": 40, "carbs": 0, "fat": 12},
      "micros": null
    },
    {
      "name": "Sweet Potato",
      "portion": {"value": 200, "unit": "g"},
      "servingSize": {"value": 200, "unit": "g"},
      "calories": 180,
      "macros": {"protein": 4, "carbs": 41, "fat": 0.4},
      "micros": null
    },
    {
      "name": "Salad",
      "portion": {"value": 100, "unit": "g"},
      "servingSize": {"value": 100, "unit": "g"},
      "calories": 15,
      "macros": {"protein": 1, "carbs": 3, "fat": 0.2},
      "micros": null
    }
  ],
  "date": "${currentDate}",
  "timestamp": "${currentDate}T19:00:00.000Z",
  "notes": null
}

Now parse this meal description and return ONLY the JSON (no markdown, no code blocks, no explanations):`;
}
