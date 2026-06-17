import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros } from './nutritionCalculator';

export const questionnaireInitialAnswers = {
  age: '',
  gender: '',
  heightValue: '',
  heightUnit: 'cm',
  heightFeet: '',
  heightInches: '',
  currentWeightValue: '',
  currentWeightUnit: 'kg',
  goalWeightValue: '',
  goalWeightUnit: 'kg',
  mainGoal: '',
  activityLevel: '',
  dietPreference: '',
  allergies: 'None',
  foodsToAvoid: 'None',
  mealsPerDay: '3',
  workoutFrequency: '3',
  waterIntakeGoal: '2',
  sleepHours: '7',
  targetPlanType: 'Meal + workout bundle',
  cookingTimePreference: '20–30 minutes',
  budgetPreference: 'Medium budget',
  foodScannerGoal: 'Track calories',
  macroTrackingPreference: 'Both',
  progressTrackingPreference: 'All of them',
  dailyAccomplishmentGoal: 'Drink enough water'
};

const goalMap = {
  'Lose weight': 'lose',
  'Gain weight': 'gain',
  'Build muscle': 'gain',
  'Maintain weight': 'maintain',
  'Eat healthier': 'maintain'
};

const activityMap = {
  Sedentary: 'sedentary',
  'Lightly active': 'light',
  'Moderately active': 'moderate',
  'Very active': 'high'
};

const dietMap = {
  Vegetarian: 'vegetarian',
  Vegan: 'vegan',
  'Low carb': 'low_carb',
  'High protein': 'high_protein',
  Balanced: 'anything',
  'No preference': 'anything'
};

export const answersToUserData = (answers) => ({
  gender: answers.gender,
  age: answers.age,
  height: answers.heightValue || answers.height,
  heightUnit: answers.heightUnit,
  heightFeet: answers.heightFeet,
  heightInches: answers.heightInches,
  weight: answers.currentWeightValue || answers.weight,
  weightUnit: answers.currentWeightUnit || answers.weightUnit,
  goalWeight: answers.goalWeightValue || answers.goalWeight,
  goalWeightUnit: answers.goalWeightUnit,
  goal: (answers.mainGoal || answers.goal) === 'Build muscle' ? 'Gain muscle' : (answers.mainGoal || answers.goal || 'Lose weight'),
  speed: 'Moderate',
  activityLevel: (answers.activityLevel === 'Sedentary' || answers.activityLevel === 'Very low') ? 'Very low' : answers.activityLevel === 'Lightly active' ? 'Light' : answers.activityLevel === 'Moderately active' ? 'Moderate' : 'High',
  mealsPerDay: `${answers.mealsPerDay || 3} meals`,
  snacks: 'Yes',
  diet: answers.dietPreference === 'No preference' ? 'Anything' : (answers.dietPreference || 'Anything'),
  allergies: answers.allergies ? answers.allergies.split(',').map((item) => item.trim()).filter(Boolean) : ['None'],
  foodsToAvoid: answers.foodsToAvoid || 'None',
  country: 'United States',
  city: 'New York City',
  cuisineStyle: 'International healthy meals',
  budgetLevel: answers.budgetPreference === 'Low budget' ? 'low' : answers.budgetPreference === 'Flexible budget' ? 'high' : 'medium',
  budget: answers.budgetPreference === 'Low budget' ? 'low' : answers.budgetPreference === 'Flexible budget' ? 'high' : 'medium',
  budgetRangeLabel: answers.budgetPreference === 'Low budget' ? '$10-15/day' : answers.budgetPreference === 'Flexible budget' ? '$30+/day' : '$15-30/day',
  cookingTime: answers.cookingTimePreference || '30 minutes',
  flexibility: 'Balanced',
  planLength: '7-Day Meal Plan',
  workoutFrequency: answers.workoutFrequency || '3',
  waterIntakeGoal: answers.waterIntakeGoal || '2',
  sleepHours: answers.sleepHours || '7',
  
  // Custom questionnaire answers stored on profile
  targetPlanType: answers.targetPlanType || 'Meal + workout bundle',
  cookingTimePreference: answers.cookingTimePreference || '20–30 minutes',
  budgetPreference: answers.budgetPreference || 'Medium budget',
  foodScannerGoal: answers.foodScannerGoal || 'Track calories',
  macroTrackingPreference: answers.macroTrackingPreference || 'Both',
  progressTrackingPreference: answers.progressTrackingPreference || 'All of them',
  dailyAccomplishmentGoal: answers.dailyAccomplishmentGoal || 'Drink enough water',

  // Workout Program mapping fields
  workoutDays: answers.workoutFrequency || '3',
  fitnessGoal: (answers.mainGoal || answers.goal) === 'Build muscle' ? 'Build muscle' : (answers.mainGoal || answers.goal || 'Lose weight'),
  fitnessLevel: 'Intermediate',
  availableEquipment: ['Full Gym'],
  unavailableMachines: []
});

export const calculateQuestionnairePlan = (answers) => {
  const age = parseInt(answers.age, 10);
  let heightCm = parseFloat(answers.heightValue || answers.height);
  if (answers.heightUnit === 'ft') {
    heightCm = ((parseFloat(answers.heightFeet) || 0) * 12 + (parseFloat(answers.heightInches) || 0)) * 2.54;
  }

  let weightKg = parseFloat(answers.currentWeightValue || answers.weight);
  const currentWeightUnit = answers.currentWeightUnit || answers.weightUnit || 'kg';
  if (currentWeightUnit === 'lbs') weightKg = weightKg / 2.20462;

  const gender = (answers.gender || 'Female').toLowerCase();
  const goal = goalMap[answers.mainGoal || answers.goal] || 'maintain';
  const activity = activityMap[answers.activityLevel] || 'light';
  const diet = dietMap[answers.dietPreference] || 'anything';
  
  const bmr = calculateBMR(gender, age || 30, heightCm || 170, weightKg || 70);
  const tdee = calculateTDEE(bmr, activity);
  const calories = calculateTargetCalories(tdee, gender, goal, 'moderate');
  const macros = calculateMacros(calories, diet);
  const mealsPerDay = parseInt(answers.mealsPerDay, 10) || 3;
  const workoutFrequency = parseInt(answers.workoutFrequency, 10) || 3;
  const calorieDelta = Math.round((tdee || calories) - calories);

  const mainGoal = answers.mainGoal || answers.goal;
  const recommendedFocus = mainGoal === 'Build muscle'
    ? 'Higher protein meals with progressive strength training'
    : mainGoal === 'Lose weight'
      ? 'Steady calorie deficit with filling meals and daily logging'
      : mainGoal === 'Gain weight'
        ? 'Calorie surplus with balanced protein and strength sessions'
        : 'Balanced consistency, hydration, sleep, and sustainable meal timing';

  return {
    calories,
    tdee,
    bmr,
    macros,
    mealsPerDay,
    workoutFrequency,
    recommendedFocus,
    calorieDelta,
    personalizedMessage: `Your plan is calibrated for ${(mainGoal || 'your goal').toLowerCase()} with ${mealsPerDay} meals per day, ${workoutFrequency} workouts per week, and a ${(answers.dietPreference || 'balanced').toLowerCase()} eating style.`,
    lockedDetails: [
      'Full 7-day meal plan with grocery list',
      'Smart food scanner and macro tracking',
      'Progress insights and daily recommendations',
      'Workout plan matched to your routine'
    ],
    createdAt: new Date().toISOString()
  };
};
