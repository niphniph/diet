export const RecipeDatabase = [
  // ==========================================
  // GEORGIAN
  // ==========================================
  {
    id: "georgia_matsoni_oats",
    meal_name: "Matsoni with oats, banana, and walnuts",
    country_tags: ["georgia"],
    city_or_region_tags: ["tbilisi", "batumi", "kutaisi"],
    cuisine_tags: ["georgian", "local"],
    diet_tags: ["balanced", "vegetarian"],
    budget_level: "low",
    availability_tags: ["supermarket", "local_market"],
    meal_type: ["breakfast", "snack"],
    allergy_tags: ["dairy", "gluten", "nuts"],
    base_ingredients: [
      { name: "Matsoni", amount: 200, category: "Dairy", calories_per_100g: 65, protein_per_100g: 4, carbs_per_100g: 4, fat_per_100g: 3.5 },
      { name: "Oats", amount: 50, category: "Grains", calories_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66, fat_per_100g: 6.9 },
      { name: "Bananas", amount: 100, category: "Fruits", calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fat_per_100g: 0.3 },
      { name: "Nuts (Mixed)", amount: 15, category: "Fats", calories_per_100g: 607, protein_per_100g: 20, carbs_per_100g: 21, fat_per_100g: 54 }
    ],
    instructions: "Mix Matsoni and oats in a bowl. Top with sliced bananas and walnuts.",
    prep_time: "5 mins"
  },
  {
    id: "georgia_beans_veg",
    meal_name: "Lobio (Beans) with vegetables and corn tortillas",
    country_tags: ["georgia"],
    city_or_region_tags: ["tbilisi", "kutaisi"],
    cuisine_tags: ["georgian", "local", "vegetarian_local"],
    diet_tags: ["balanced", "vegetarian", "vegan", "budget"],
    budget_level: "low",
    availability_tags: ["supermarket", "local_market"],
    meal_type: ["lunch", "dinner"],
    allergy_tags: [],
    base_ingredients: [
      { name: "Kidney Beans", amount: 200, category: "Protein", calories_per_100g: 127, protein_per_100g: 8.7, carbs_per_100g: 22.8, fat_per_100g: 0.5 },
      { name: "Onions", amount: 50, category: "Vegetables", calories_per_100g: 40, protein_per_100g: 1.1, carbs_per_100g: 9.3, fat_per_100g: 0.1 },
      { name: "Tomatoes", amount: 100, category: "Vegetables", calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 },
      { name: "Sunflower Oil", amount: 10, category: "Fats", calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 },
      { name: "Corn Tortillas", amount: 60, category: "Grains", calories_per_100g: 218, protein_per_100g: 6, carbs_per_100g: 45, fat_per_100g: 2.9 } // Substituting Mchadi
    ],
    instructions: "Sauté onions in sunflower oil. Add beans and tomatoes, stew until tender. Serve with corn tortillas (as a Mchadi substitute).",
    prep_time: "20 mins"
  },
  {
    id: "georgia_chicken_buckwheat",
    meal_name: "Chicken with buckwheat and cucumber-tomato salad",
    country_tags: ["georgia"],
    city_or_region_tags: ["tbilisi", "batumi"],
    cuisine_tags: ["georgian", "local", "high_protein_local"],
    diet_tags: ["balanced", "high_protein"],
    budget_level: "medium",
    availability_tags: ["supermarket", "local_market"],
    meal_type: ["lunch", "dinner"],
    allergy_tags: [],
    base_ingredients: [
      { name: "Chicken Breast", amount: 150, category: "Protein", calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6 },
      { name: "Buckwheat", amount: 100, category: "Grains", calories_per_100g: 343, protein_per_100g: 13.2, carbs_per_100g: 71.5, fat_per_100g: 3.4 },
      { name: "Cucumbers", amount: 100, category: "Vegetables", calories_per_100g: 15, protein_per_100g: 0.7, carbs_per_100g: 3.6, fat_per_100g: 0.1 },
      { name: "Tomatoes", amount: 100, category: "Vegetables", calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 },
      { name: "Sunflower Oil", amount: 10, category: "Fats", calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 }
    ],
    instructions: "Grill or pan-fry chicken. Boil buckwheat. Mix cucumber and tomato with sunflower oil for salad.",
    prep_time: "25 mins"
  },

  // ==========================================
  // ITALIAN / MEDITERRANEAN
  // ==========================================
  {
    id: "italy_pasta_tuna",
    meal_name: "Controlled portion pasta with tuna and tomato",
    country_tags: ["italy"],
    city_or_region_tags: ["milan", "rome"],
    cuisine_tags: ["italian", "mediterranean"],
    diet_tags: ["balanced", "mediterranean"],
    budget_level: "low",
    availability_tags: ["supermarket"],
    meal_type: ["lunch", "dinner"],
    allergy_tags: ["gluten", "fish"],
    base_ingredients: [
      { name: "Pasta", amount: 80, category: "Grains", calories_per_100g: 131, protein_per_100g: 5, carbs_per_100g: 25, fat_per_100g: 1.1 },
      { name: "Tuna (Canned)", amount: 100, category: "Protein", calories_per_100g: 130, protein_per_100g: 28, carbs_per_100g: 0, fat_per_100g: 1 },
      { name: "Tomatoes", amount: 150, category: "Vegetables", calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 },
      { name: "Olive Oil", amount: 10, category: "Fats", calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 }
    ],
    instructions: "Boil pasta until al dente. In a pan, lightly fry tomatoes in olive oil, then add canned tuna. Toss pasta into the sauce.",
    prep_time: "15 mins"
  },
  {
    id: "italy_fish_salad",
    meal_name: "White fish with olive oil and fresh salad",
    country_tags: ["italy"],
    city_or_region_tags: ["naples", "sicily"],
    cuisine_tags: ["italian", "mediterranean"],
    diet_tags: ["balanced", "low_carb", "high_protein"],
    budget_level: "medium",
    availability_tags: ["supermarket", "local_market"],
    meal_type: ["lunch", "dinner"],
    allergy_tags: ["fish"],
    base_ingredients: [
      { name: "Salmon", amount: 150, category: "Protein", calories_per_100g: 208, protein_per_100g: 20, carbs_per_100g: 0, fat_per_100g: 13 },
      { name: "Spinach", amount: 100, category: "Vegetables", calories_per_100g: 23, protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4 },
      { name: "Tomatoes", amount: 100, category: "Vegetables", calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 },
      { name: "Olive Oil", amount: 15, category: "Fats", calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 },
      { name: "Whole Wheat Bread", amount: 40, category: "Grains", calories_per_100g: 247, protein_per_100g: 13, carbs_per_100g: 41, fat_per_100g: 3.4 }
    ],
    instructions: "Bake or pan-sear the fish. Serve alongside fresh spinach and tomatoes dressed with olive oil, with bread on the side.",
    prep_time: "20 mins"
  },

  // ==========================================
  // JAPANESE / ASIAN
  // ==========================================
  {
    id: "japan_rice_egg_seaweed",
    meal_name: "Rice bowl with egg, miso, and seaweed",
    country_tags: ["japan"],
    city_or_region_tags: ["tokyo", "kyoto"],
    cuisine_tags: ["japanese", "asian", "local"],
    diet_tags: ["balanced", "vegetarian"],
    budget_level: "low",
    availability_tags: ["supermarket"],
    meal_type: ["breakfast", "lunch"],
    allergy_tags: ["eggs", "soy"],
    base_ingredients: [
      { name: "White Rice", amount: 150, category: "Grains", calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3 },
      { name: "Eggs", amount: 100, category: "Protein", calories_per_100g: 143, protein_per_100g: 13, carbs_per_100g: 0.7, fat_per_100g: 9.5 },
      { name: "Seaweed", amount: 10, category: "Vegetables", calories_per_100g: 43, protein_per_100g: 3.1, carbs_per_100g: 9.1, fat_per_100g: 0.6 },
      { name: "Miso Paste", amount: 15, category: "Spices", calories_per_100g: 199, protein_per_100g: 12, carbs_per_100g: 25, fat_per_100g: 6 }
    ],
    instructions: "Serve cooked rice topped with a soft-boiled or raw egg (if safe) and seaweed. Make a quick broth with miso paste.",
    prep_time: "10 mins"
  },
  {
    id: "japan_tofu_stirfry",
    meal_name: "Tofu stir-fry with broccoli and rice",
    country_tags: ["japan", "china", "south korea"],
    city_or_region_tags: ["tokyo"],
    cuisine_tags: ["japanese", "asian", "vegetarian_local"],
    diet_tags: ["balanced", "vegan", "vegetarian"],
    budget_level: "low",
    availability_tags: ["supermarket"],
    meal_type: ["lunch", "dinner"],
    allergy_tags: ["soy", "gluten"],
    base_ingredients: [
      { name: "Tofu", amount: 150, category: "Protein", calories_per_100g: 76, protein_per_100g: 8, carbs_per_100g: 1.9, fat_per_100g: 4.8 },
      { name: "Broccoli", amount: 150, category: "Vegetables", calories_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 6.6, fat_per_100g: 0.4 },
      { name: "White Rice", amount: 120, category: "Grains", calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3 },
      { name: "Soy Sauce", amount: 15, category: "Spices", calories_per_100g: 53, protein_per_100g: 8, carbs_per_100g: 4.9, fat_per_100g: 0.1 },
      { name: "Sunflower Oil", amount: 10, category: "Fats", calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 }
    ],
    instructions: "Pan-fry cubed tofu and broccoli in oil. Add soy sauce. Serve over steamed white rice.",
    prep_time: "15 mins"
  },

  // ==========================================
  // GERMAN / EUROPEAN
  // ==========================================
  {
    id: "germany_quark_apple",
    meal_name: "Quark with oats and apple",
    country_tags: ["germany", "austria"],
    city_or_region_tags: ["berlin", "munich"],
    cuisine_tags: ["german", "european", "local"],
    diet_tags: ["balanced", "vegetarian"],
    budget_level: "low",
    availability_tags: ["supermarket"],
    meal_type: ["breakfast", "snack"],
    allergy_tags: ["dairy", "gluten"],
    base_ingredients: [
      { name: "Quark", amount: 200, category: "Dairy", calories_per_100g: 73, protein_per_100g: 12, carbs_per_100g: 3, fat_per_100g: 0.2 },
      { name: "Oats", amount: 50, category: "Grains", calories_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66, fat_per_100g: 6.9 },
      { name: "Apples", amount: 150, category: "Fruits", calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2 }
    ],
    instructions: "Mix quark with oats. Dice the apple and stir it in.",
    prep_time: "5 mins"
  },
  {
    id: "germany_rye_eggs",
    meal_name: "Rye bread with boiled eggs and vegetables",
    country_tags: ["germany"],
    city_or_region_tags: ["berlin", "hamburg"],
    cuisine_tags: ["german", "european"],
    diet_tags: ["balanced", "vegetarian"],
    budget_level: "low",
    availability_tags: ["supermarket"],
    meal_type: ["breakfast", "lunch"],
    allergy_tags: ["eggs", "gluten"],
    base_ingredients: [
      { name: "Rye Bread", amount: 100, category: "Grains", calories_per_100g: 259, protein_per_100g: 9, carbs_per_100g: 48, fat_per_100g: 3.3 },
      { name: "Eggs", amount: 100, category: "Protein", calories_per_100g: 143, protein_per_100g: 13, carbs_per_100g: 0.7, fat_per_100g: 9.5 },
      { name: "Tomatoes", amount: 100, category: "Vegetables", calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 },
      { name: "Cucumbers", amount: 100, category: "Vegetables", calories_per_100g: 15, protein_per_100g: 0.7, carbs_per_100g: 3.6, fat_per_100g: 0.1 }
    ],
    instructions: "Boil the eggs to your preference. Serve on thick slices of rye bread with fresh tomatoes and cucumbers on the side.",
    prep_time: "10 mins"
  },

  // ==========================================
  // USA / AMERICAN FITNESS
  // ==========================================
  {
    id: "usa_turkey_bowl",
    meal_name: "Turkey rice bowl with avocado",
    country_tags: ["usa", "uk", "canada"],
    city_or_region_tags: ["new york", "los angeles"],
    cuisine_tags: ["american_fitness", "international", "high_protein_local"],
    diet_tags: ["balanced", "high_protein"],
    budget_level: "medium",
    availability_tags: ["supermarket"],
    meal_type: ["lunch", "dinner"],
    allergy_tags: [],
    base_ingredients: [
      { name: "Turkey Breast", amount: 150, category: "Protein", calories_per_100g: 135, protein_per_100g: 30, carbs_per_100g: 0, fat_per_100g: 1 },
      { name: "Brown Rice", amount: 120, category: "Grains", calories_per_100g: 111, protein_per_100g: 2.6, carbs_per_100g: 23, fat_per_100g: 0.9 },
      { name: "Broccoli", amount: 100, category: "Vegetables", calories_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 6.6, fat_per_100g: 0.4 },
      { name: "Avocado", amount: 50, category: "Fats", calories_per_100g: 160, protein_per_100g: 2, carbs_per_100g: 8.5, fat_per_100g: 14.7 }
    ],
    instructions: "Cook ground or diced turkey breast. Serve over brown rice with steamed broccoli and sliced avocado.",
    prep_time: "20 mins"
  },
  {
    id: "usa_oats_pb",
    meal_name: "Oatmeal with peanut butter and berries",
    country_tags: ["usa", "uk"],
    city_or_region_tags: [],
    cuisine_tags: ["american_fitness", "international"],
    diet_tags: ["balanced", "vegetarian", "vegan"],
    budget_level: "low",
    availability_tags: ["supermarket"],
    meal_type: ["breakfast", "snack"],
    allergy_tags: ["nuts", "gluten"],
    base_ingredients: [
      { name: "Oats", amount: 60, category: "Grains", calories_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66, fat_per_100g: 6.9 },
      { name: "Peanut Butter", amount: 20, category: "Fats", calories_per_100g: 588, protein_per_100g: 25, carbs_per_100g: 20, fat_per_100g: 50 },
      { name: "Berries", amount: 100, category: "Fruits", calories_per_100g: 57, protein_per_100g: 0.7, carbs_per_100g: 14, fat_per_100g: 0.3 }
    ],
    instructions: "Cook oats with water or milk. Stir in peanut butter and top with fresh or frozen berries.",
    prep_time: "10 mins"
  },

  // ==========================================
  // INDIAN
  // ==========================================
  {
    id: "india_dal_rice",
    meal_name: "Dal (Lentils) with rice",
    country_tags: ["india"],
    city_or_region_tags: ["delhi", "mumbai"],
    cuisine_tags: ["indian", "local", "vegetarian_local"],
    diet_tags: ["balanced", "vegetarian", "vegan", "budget"],
    budget_level: "low",
    availability_tags: ["supermarket", "local_market"],
    meal_type: ["lunch", "dinner"],
    allergy_tags: [],
    base_ingredients: [
      { name: "Lentils", amount: 120, category: "Protein", calories_per_100g: 116, protein_per_100g: 9, carbs_per_100g: 20, fat_per_100g: 0.4 },
      { name: "White Rice", amount: 100, category: "Grains", calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3 },
      { name: "Onions", amount: 50, category: "Vegetables", calories_per_100g: 40, protein_per_100g: 1.1, carbs_per_100g: 9.3, fat_per_100g: 0.1 },
      { name: "Tomatoes", amount: 50, category: "Vegetables", calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 },
      { name: "Sunflower Oil", amount: 10, category: "Fats", calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 }
    ],
    instructions: "Boil lentils with turmeric. In a separate pan, temper onions, tomatoes, and spices in oil, then mix into lentils. Serve over rice.",
    prep_time: "25 mins"
  },
  {
    id: "india_roti_paneer",
    meal_name: "Roti with Paneer and vegetables",
    country_tags: ["india"],
    city_or_region_tags: ["delhi"],
    cuisine_tags: ["indian", "local"],
    diet_tags: ["balanced", "vegetarian"],
    budget_level: "medium",
    availability_tags: ["supermarket", "local_market"],
    meal_type: ["lunch", "dinner"],
    allergy_tags: ["dairy", "gluten"],
    base_ingredients: [
      { name: "Paneer", amount: 100, category: "Dairy", calories_per_100g: 321, protein_per_100g: 25, carbs_per_100g: 3.4, fat_per_100g: 25 },
      { name: "Roti", amount: 90, category: "Grains", calories_per_100g: 297, protein_per_100g: 9.7, carbs_per_100g: 56, fat_per_100g: 3.7 },
      { name: "Spinach", amount: 100, category: "Vegetables", calories_per_100g: 23, protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4 },
      { name: "Tomatoes", amount: 50, category: "Vegetables", calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 }
    ],
    instructions: "Sauté paneer cubes with spinach and tomatoes in spices. Serve hot with whole wheat Roti.",
    prep_time: "20 mins"
  },

  // ==========================================
  // TURKEY / MIDDLE EAST
  // ==========================================
  {
    id: "turkey_eggs_veg",
    meal_name: "Menemen (Eggs with vegetables)",
    country_tags: ["turkey", "middle_east"],
    city_or_region_tags: ["istanbul"],
    cuisine_tags: ["turkish", "mediterranean", "local"],
    diet_tags: ["balanced", "vegetarian", "low_carb"],
    budget_level: "low",
    availability_tags: ["supermarket", "local_market"],
    meal_type: ["breakfast", "lunch"],
    allergy_tags: ["eggs"],
    base_ingredients: [
      { name: "Eggs", amount: 150, category: "Protein", calories_per_100g: 143, protein_per_100g: 13, carbs_per_100g: 0.7, fat_per_100g: 9.5 },
      { name: "Tomatoes", amount: 150, category: "Vegetables", calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 },
      { name: "Bell Peppers", amount: 100, category: "Vegetables", calories_per_100g: 31, protein_per_100g: 1, carbs_per_100g: 6, fat_per_100g: 0.3 },
      { name: "Olive Oil", amount: 10, category: "Fats", calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 },
      { name: "Whole Wheat Bread", amount: 40, category: "Grains", calories_per_100g: 247, protein_per_100g: 13, carbs_per_100g: 41, fat_per_100g: 3.4 }
    ],
    instructions: "Sauté diced peppers and tomatoes in olive oil until soft. Crack eggs over the mix and scramble lightly. Serve with a slice of bread.",
    prep_time: "15 mins"
  },
  {
    id: "turkey_chicken_bulgur",
    meal_name: "Grilled chicken with bulgur and salad",
    country_tags: ["turkey", "middle_east"],
    city_or_region_tags: ["istanbul"],
    cuisine_tags: ["turkish", "mediterranean"],
    diet_tags: ["balanced", "high_protein"],
    budget_level: "medium",
    availability_tags: ["supermarket", "local_market"],
    meal_type: ["lunch", "dinner"],
    allergy_tags: ["gluten"],
    base_ingredients: [
      { name: "Chicken Breast", amount: 150, category: "Protein", calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6 },
      { name: "Bulgur", amount: 80, category: "Grains", calories_per_100g: 83, protein_per_100g: 3.1, carbs_per_100g: 18.6, fat_per_100g: 0.2 },
      { name: "Cucumbers", amount: 100, category: "Vegetables", calories_per_100g: 15, protein_per_100g: 0.7, carbs_per_100g: 3.6, fat_per_100g: 0.1 },
      { name: "Tomatoes", amount: 100, category: "Vegetables", calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 },
      { name: "Olive Oil", amount: 10, category: "Fats", calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 }
    ],
    instructions: "Grill seasoned chicken. Cook bulgur. Mix cucumber and tomato with olive oil. Serve together.",
    prep_time: "20 mins"
  },

  // ==========================================
  // GENERIC INTERNATIONAL (Fallbacks)
  // ==========================================
  {
    id: "intl_chicken_rice_broccoli",
    meal_name: "Classic Chicken, Rice, and Broccoli",
    country_tags: ["global"],
    city_or_region_tags: [],
    cuisine_tags: ["international", "american_fitness", "high_protein_local", "local"],
    diet_tags: ["balanced", "high_protein"],
    budget_level: "medium",
    availability_tags: ["supermarket"],
    meal_type: ["lunch", "dinner"],
    allergy_tags: [],
    base_ingredients: [
      { name: "Chicken Breast", amount: 150, category: "Protein", calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6 },
      { name: "White Rice", amount: 120, category: "Grains", calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3 },
      { name: "Broccoli", amount: 100, category: "Vegetables", calories_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 6.6, fat_per_100g: 0.4 },
      { name: "Olive Oil", amount: 5, category: "Fats", calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 }
    ],
    instructions: "Roast or pan-fry chicken. Steam broccoli. Serve with rice and a light drizzle of oil.",
    prep_time: "20 mins"
  },
  {
    id: "intl_greek_yogurt_fruit",
    meal_name: "Greek Yogurt with mixed fruit and nuts",
    country_tags: ["global"],
    city_or_region_tags: [],
    cuisine_tags: ["international", "european", "american_fitness"],
    diet_tags: ["balanced", "vegetarian", "high_protein"],
    budget_level: "medium",
    availability_tags: ["supermarket"],
    meal_type: ["breakfast", "snack"],
    allergy_tags: ["dairy", "nuts"],
    base_ingredients: [
      { name: "Greek Yogurt", amount: 200, category: "Dairy", calories_per_100g: 59, protein_per_100g: 10, carbs_per_100g: 3.6, fat_per_100g: 0.4 },
      { name: "Apples", amount: 100, category: "Fruits", calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2 },
      { name: "Nuts (Mixed)", amount: 15, category: "Fats", calories_per_100g: 607, protein_per_100g: 20, carbs_per_100g: 21, fat_per_100g: 54 }
    ],
    instructions: "Serve Greek yogurt in a bowl topped with diced fruit and mixed nuts.",
    prep_time: "5 mins"
  }
];
