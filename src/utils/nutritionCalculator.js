export const calculateBMR = (gender, age, height, weight) => {
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    // Other
    bmr = (bmr + 5 + bmr - 161) / 2;
  }
  return bmr;
};

export const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    'very_low': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'high': 1.725,
    'very_high': 1.9
  };
  return bmr * (multipliers[activityLevel] || 1.2);
};

export const calculateTargetCalories = (tdee, gender, goal, speed) => {
  let target = tdee;
  
  if (goal === 'lose') {
    if (speed === 'slow') target -= 250;
    else if (speed === 'moderate') target -= 400;
    else if (speed === 'fast') target -= 600;
  } else if (goal === 'gain') {
    if (speed === 'slow') target += 200;
    else if (speed === 'moderate') target += 350;
    else if (speed === 'fast') target += 500;
  }
  
  // Safety minimums
  const minCalories = gender === 'female' ? 1200 : (gender === 'male' ? 1500 : 1350);
  
  let finalCalories = Math.max(target, minCalories);
  return Math.round(finalCalories / 50) * 50; // Round to nearest 50
};

export const calculateMacros = (calories, dietType) => {
  let pPercent = 0.25;
  let cPercent = 0.45;
  let fPercent = 0.30;
  
  switch(dietType) {
    case 'high_protein':
      pPercent = 0.30; cPercent = 0.40; fPercent = 0.30;
      break;
    case 'low_carb':
      pPercent = 0.35; cPercent = 0.25; fPercent = 0.40;
      break;
    case 'vegan':
      pPercent = 0.25; cPercent = 0.50; fPercent = 0.25;
      break;
    case 'mediterranean':
      pPercent = 0.25; cPercent = 0.45; fPercent = 0.30;
      break;
    default:
      // balanced / anything
      break;
  }
  
  return {
    proteinGrams: Math.round((calories * pPercent) / 4),
    carbsGrams: Math.round((calories * cPercent) / 4),
    fatGrams: Math.round((calories * fPercent) / 9)
  };
};
