import { RecipeDatabase } from './RecipeDatabase';

const PORTION_LIMITS = {
  "Cucumbers": 200, "Tomatoes": 200, "Spinach": 100, "Cabbage": 100, "Broccoli": 150, "Carrots": 150, "Bell Peppers": 150, "Mushrooms": 150, "Onions": 100,
  "White Rice": 220, "Brown Rice": 220, "Buckwheat": 220, "Pasta": 200, "Quinoa": 200, "Bulgur": 200, "Potatoes": 250, "Sweet Potatoes": 250,
  "Oats": 80,
  "Whole Wheat Bread": 60, "Rye Bread": 60, "Lavash": 80, "Corn Tortillas": 90, "Roti": 90,
  "Eggs": 150,
  "Chicken Breast": 220, "Chicken Thigh": 220, "Turkey Breast": 220,
  "Salmon": 220, "Tuna (Canned)": 150, "Fish": 220, "Shrimp": 200,
  "Beef (Lean)": 180,
  "Black Beans": 250, "Kidney Beans": 250, "Lentils": 250, "Chickpeas": 250,
  "Tofu": 200, "Tempeh": 200, "Edamame": 150,
  "Greek Yogurt": 300, "Matsoni": 300, "Quark": 300, "Cottage Cheese": 250,
  "Nuts (Mixed)": 30, "Peanut Butter": 25,
  "Olive Oil": 15, "Sunflower Oil": 15,
  "Apples": 200, "Bananas": 150, "Berries": 150, "Oranges": 200,
  "Avocado": 150, "Cheese": 50, "Paneer": 150, "Milk": 300, "Soy Milk": 300, "Almond Milk": 300
};

const getPortionLimit = (foodName) => {
  return PORTION_LIMITS[foodName] || 150; 
};

// Fallback sides to add if a meal caps out on portions but needs more calories
const FALLBACK_SIDES = [
  { name: "Olive Oil", category: "Fats", calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, max: 15 },
  { name: "Nuts (Mixed)", category: "Fats", calories_per_100g: 607, protein_per_100g: 20, carbs_per_100g: 21, fat_per_100g: 54, max: 30 },
  { name: "Apples", category: "Fruits", calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2, max: 150 },
  { name: "Whole Wheat Bread", category: "Grains", calories_per_100g: 247, protein_per_100g: 13, carbs_per_100g: 41, fat_per_100g: 3.4, max: 40 }
];

const isRecipeAllowed = (recipe, user) => {
  if (user.allergies && user.allergies.length > 0) {
    for (let allergy of user.allergies) {
      if (recipe.allergy_tags.includes(allergy.toLowerCase())) return false;
    }
  }
  if (user.diet && user.diet !== 'anything') {
    if (!recipe.diet_tags.includes(user.diet)) return false;
  }
  return true;
};

const scoreRecipe = (recipe, user) => {
  let score = 0;
  
  if (user.country && recipe.country_tags.includes(user.country.toLowerCase())) score += 50;
  if (user.city && recipe.city_or_region_tags.includes(user.city.toLowerCase())) score += 20;
  
  // Cuisine style matching
  if (user.cuisineStyle) {
    const style = user.cuisineStyle.toLowerCase();
    if (recipe.cuisine_tags.includes(style)) score += 40;
    
    // "Local" mapping logic
    if (style.includes('local') && user.country && recipe.country_tags.includes(user.country.toLowerCase())) {
      score += 30;
    }
  }
  
  if (user.budget && recipe.budget_level === user.budget) score += 20;
  
  return score + Math.random(); // Add slight randomness for variety
};

export const generateSingleMeal = (targetCalories, targetMacros, mealType, user, excludeIds = [], preSelectedRecipe = null) => {
  let selectedRecipe = preSelectedRecipe;

  if (!selectedRecipe) {
    // Filter by meal type and allowed
    let validRecipes = RecipeDatabase.filter(r => 
      r.meal_type.includes(mealType) && 
      isRecipeAllowed(r, user) && 
      !excludeIds.includes(r.id)
    );

    // Fallback if no specific matches
    if (validRecipes.length === 0) {
      validRecipes = RecipeDatabase.filter(r => r.meal_type.includes(mealType) && isRecipeAllowed(r, user));
    }
    if (validRecipes.length === 0) {
      validRecipes = RecipeDatabase; // Absolute fallback
    }

    // Score and select best
    const sortedRecipes = validRecipes.sort((a, b) => scoreRecipe(b, user) - scoreRecipe(a, user));
    selectedRecipe = sortedRecipes[0];
  }

  // Calculate base calories of the recipe
  let baseRecipeCals = 0;
  selectedRecipe.base_ingredients.forEach(ing => {
    baseRecipeCals += (ing.amount / 100) * ing.calories_per_100g;
  });

  // Calculate scaling factor to reach target calories
  let scaleFactor = targetCalories / baseRecipeCals;
  
  let finalFoods = [];
  let currentCalories = 0;

  // Scale ingredients and apply caps
  selectedRecipe.base_ingredients.forEach(ing => {
    let desiredAmount = ing.amount * scaleFactor;
    let maxAmount = getPortionLimit(ing.name);
    let finalAmount = Math.min(desiredAmount, maxAmount);
    
    finalFoods.push({ ...ing, amount: Math.round(finalAmount) });
    currentCalories += (finalAmount / 100) * ing.calories_per_100g;
  });

  // If still significantly short on calories due to caps, layer in fallback sides
  let remainingCals = targetCalories - currentCalories;
  let fallbackIndex = 0;
  
  while (remainingCals > 50 && fallbackIndex < FALLBACK_SIDES.length) {
    const side = FALLBACK_SIDES[fallbackIndex];
    
    // Don't add a side if it violates an allergy
    const sideIsAllergen = user.allergies && user.allergies.some(a => {
      if (a === 'nuts' && side.name === 'Nuts (Mixed)') return true;
      if (a === 'gluten' && side.name === 'Whole Wheat Bread') return true;
      return false;
    });

    if (!sideIsAllergen && !finalFoods.find(f => f.name === side.name)) {
      const desiredAmount = (remainingCals / side.calories_per_100g) * 100;
      const actualAmount = Math.min(desiredAmount, side.max);
      
      finalFoods.push({ 
        name: side.name, 
        amount: Math.round(actualAmount), 
        category: side.category, 
        calories_per_100g: side.calories_per_100g, 
        protein_per_100g: side.protein_per_100g, 
        carbs_per_100g: side.carbs_per_100g, 
        fat_per_100g: side.fat_per_100g 
      });
      currentCalories += (actualAmount / 100) * side.calories_per_100g;
    }
    
    remainingCals = targetCalories - currentCalories;
    fallbackIndex++;
  }

  // Sum up final macros
  let tProtein = 0, tCarbs = 0, tFat = 0, tCals = 0;
  finalFoods.forEach(f => {
    tProtein += (f.amount / 100) * f.protein_per_100g;
    tCarbs += (f.amount / 100) * f.carbs_per_100g;
    tFat += (f.amount / 100) * f.fat_per_100g;
    tCals += (f.amount / 100) * f.calories_per_100g;
  });

  // Generate generic swap string
  const proteinSource = finalFoods.find(f => f.category === 'Protein' || f.category === 'Dairy');
  let swaps = "No direct swaps available.";
  if (proteinSource) {
    if (proteinSource.name.includes('Chicken') || proteinSource.name.includes('Turkey')) swaps = `${proteinSource.name} can be replaced with fish, tofu, or lean beef.`;
    if (proteinSource.name.includes('Fish') || proteinSource.name.includes('Salmon')) swaps = `${proteinSource.name} can be replaced with chicken, tofu, or tuna.`;
    if (proteinSource.name.includes('Beans') || proteinSource.name.includes('Lentils')) swaps = `${proteinSource.name} can be replaced with chickpeas or tofu.`;
    if (proteinSource.category === 'Dairy') swaps = `${proteinSource.name} can be replaced with a different plain yogurt or plant-based yogurt.`;
  }

  return {
    id: selectedRecipe.id + "_" + Math.random().toString(36).substr(2, 5),
    recipeId: selectedRecipe.id,
    name: selectedRecipe.meal_name,
    type: mealType,
    foods: finalFoods,
    calories: Math.round(tCals),
    macros: {
      protein: Math.round(tProtein),
      carbs: Math.round(tCarbs),
      fat: Math.round(tFat)
    },
    prepTime: selectedRecipe.prep_time,
    cost: selectedRecipe.budget_level === 'low' ? 'Low' : 'Medium',
    instructions: selectedRecipe.instructions,
    swaps: swaps
  };
};

export const generateMealPlan = (targetCalories, targetMacros, user) => {
  const days = user.planLength?.includes('30') ? 30 : 7;
  const plan = [];
  
  const recipeUseCount = {};
  const proteinHistory = []; // proteinHistory[dayIndex] = Set of proteins used on that day
  const carbHistory = [];    // carbHistory[dayIndex] = Set of carbs used on that day

  const numMeals = parseInt(user.mealsPerDay || 3);
  const mealDistribution = numMeals === 3
    ? [
        { type: 'breakfast', pct: 0.3 },
        { type: 'lunch', pct: 0.4 },
        { type: 'dinner', pct: 0.3 }
      ]
    : numMeals === 4
    ? [
        { type: 'breakfast', pct: 0.25 },
        { type: 'lunch', pct: 0.35 },
        { type: 'dinner', pct: 0.3 },
        { type: 'snack', pct: 0.1 }
      ]
    : [
        { type: 'breakfast', pct: 0.25 },
        { type: 'lunch', pct: 0.3 },
        { type: 'dinner', pct: 0.25 },
        { type: 'snack', pct: 0.1 },
        { type: 'snack', pct: 0.1 }
      ];

  const getMainProtein = (recipe) => {
    const protIng = recipe.base_ingredients.find(ing => ing.category === 'Protein' || ing.category === 'Dairy');
    return protIng ? protIng.name : 'none';
  };

  const getCarbSource = (recipe) => {
    const carbIng = recipe.base_ingredients.find(ing => ing.category === 'Grains' || ing.category === 'Fruits');
    return carbIng ? carbIng.name : 'none';
  };

  for (let d = 0; d < days; d++) {
    const dayMeals = [];
    const dayProteins = new Set();
    const dayCarbs = new Set();

    proteinHistory.push(dayProteins);
    carbHistory.push(dayCarbs);

    for (let m = 0; m < mealDistribution.length; m++) {
      const dist = mealDistribution[m];
      const mealCals = targetCalories * dist.pct;
      const mealMacros = {
        protein: targetMacros.proteinGrams * dist.pct,
        carbs: targetMacros.carbsGrams * dist.pct,
        fat: targetMacros.fatGrams * dist.pct
      };

      // Filter and score candidates
      let candidates = RecipeDatabase.filter(r => 
        r.meal_type.includes(dist.type) && 
        isRecipeAllowed(r, user)
      );

      if (candidates.length === 0) {
        candidates = RecipeDatabase.filter(r => r.meal_type.includes(dist.type));
      }
      if (candidates.length === 0) {
        candidates = RecipeDatabase;
      }

      // STRICT VARIETY CONSTRAINTS:
      // 1. Not repeat more than twice in a 7-day plan (or sliding 7-day window)
      candidates = candidates.filter(r => {
        const count = recipeUseCount[r.id] || 0;
        return count < 2; // Maximum of 2 repetitions in the plan!
      });

      // Reset filters if list is completely starved of candidates
      if (candidates.length === 0) {
        candidates = RecipeDatabase.filter(r => r.meal_type.includes(dist.type) && isRecipeAllowed(r, user));
      }

      // 2. Main proteins must not repeat more than 2 days in a row
      if (d >= 2) {
        const prev1Proteins = proteinHistory[d - 1];
        const prev2Proteins = proteinHistory[d - 2];
        
        const filteredProteins = candidates.filter(r => {
          const prot = getMainProtein(r);
          if (prot === 'none') return true;
          // Disallow if the same protein was eaten on both day d-1 and day d-2
          return !(prev1Proteins.has(prot) && prev2Proteins.has(prot));
        });

        if (filteredProteins.length > 0) {
          candidates = filteredProteins;
        }
      }

      // 3. Carb sources must rotate (must not repeat on consecutive days)
      if (d >= 1) {
        const prevCarbs = carbHistory[d - 1];
        const filteredCarbs = candidates.filter(r => {
          const carb = getCarbSource(r);
          if (carb === 'none') return true;
          return !prevCarbs.has(carb);
        });

        if (filteredCarbs.length > 0) {
          candidates = filteredCarbs;
        }
      }

      // Score and select
      const sorted = candidates.sort((a, b) => scoreRecipe(b, user) - scoreRecipe(a, user));
      const chosenRecipe = sorted[0];

      // Track usage for variety calculations
      recipeUseCount[chosenRecipe.id] = (recipeUseCount[chosenRecipe.id] || 0) + 1;
      
      const chosenProtein = getMainProtein(chosenRecipe);
      if (chosenProtein !== 'none') dayProteins.add(chosenProtein);

      const chosenCarb = getCarbSource(chosenRecipe);
      if (chosenCarb !== 'none') dayCarbs.add(chosenCarb);

      // Generate actual scaled ingredient metrics
      const meal = generateSingleMeal(mealCals, mealMacros, dist.type, user, [], chosenRecipe);
      dayMeals.push(meal);
    }

    plan.push({
      day: d + 1,
      meals: dayMeals
    });
  }

  return plan;
};

export const generateGroceryList = (mealPlan) => {
  const list = {};
  
  mealPlan.forEach(day => {
    day.meals.forEach(meal => {
      meal.foods.forEach(food => {
        if (!list[food.category]) {
          list[food.category] = {};
        }
        if (!list[food.category][food.name]) {
          list[food.category][food.name] = 0;
        }
        list[food.category][food.name] += food.amount;
      });
    });
  });
  
  return list;
};
