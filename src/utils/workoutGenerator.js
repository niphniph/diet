import { ExerciseDatabase } from './ExerciseDatabase';

export const generateWorkoutPlan = (answers) => {
  const daysPerWeek = parseInt(answers.workoutDays) || 3;
  const goal = answers.fitnessGoal || 'Build muscle';
  const level = answers.fitnessLevel || 'Beginner';
  const availableEq = answers.availableEquipment || ['Bodyweight'];
  const unavailableEq = answers.unavailableMachines || [];

  // 7-day template generation incorporating Rest Days
  const weeklyTemplate = getWeeklySchedule(daysPerWeek, goal);
  
  const plan = {
    days: []
  };

  const usedExerciseIds = new Set();

  weeklyTemplate.forEach((daySplit, index) => {
    const isRestDay = daySplit.type === 'rest';
    
    if (isRestDay) {
      plan.days.push({
        id: index + 1,
        dayNumber: index + 1,
        isRest: true,
        name: `Day ${index + 1} — Rest Day`,
        goal: 'Recovery',
        exercises: [],
        description: 'Recovery and rest are critical for muscle tissue repair, nervous system recovery, and overall strength development. Hydrate well, stretch, and focus on high-quality sleep.'
      });
    } else {
      const exercises = getExercisesForSplit(daySplit, availableEq, unavailableEq, level, goal, usedExerciseIds);
      
      let sets = 3;
      if (level.toLowerCase().includes('beginner')) sets = 2;
      else if (level.toLowerCase().includes('advanced')) sets = 4;

      let repRange = '8–12';
      if (goal.toLowerCase().includes('lose') || goal.toLowerCase().includes('weight') || goal.toLowerCase().includes('endurance')) {
        repRange = '12–15';
      } else if (goal.toLowerCase().includes('glute')) {
        repRange = '10–12';
      }

      let restPeriod = '90 seconds';
      if (level.toLowerCase().includes('advanced')) restPeriod = '60 seconds';

      plan.days.push({
        id: index + 1,
        dayNumber: index + 1,
        isRest: false,
        name: `Day ${index + 1} — ${daySplit.name}`,
        goal: daySplit.target.join(', '),
        exercises: exercises.map(ex => ({
          ...ex,
          sets: sets,
          reps: ex.category === 'Cardio' ? '15–20 mins' : repRange,
          rest: ex.category === 'Cardio' ? 'N/A' : restPeriod,
          replacements: getReplacements(ex, availableEq, unavailableEq)
        }))
      });
    }
  });

  return plan;
};

const getWeeklySchedule = (days, goal) => {
  if (days <= 2) {
    return [
      { type: 'active', name: 'Full Body A', target: ['Legs', 'Chest', 'Back', 'Core'] },
      { type: 'rest' },
      { type: 'rest' },
      { type: 'active', name: 'Full Body B', target: ['Legs', 'Shoulders', 'Back', 'Arms'] },
      { type: 'rest' },
      { type: 'rest' },
      { type: 'rest' }
    ];
  } else if (days === 3) {
    if (goal.toLowerCase().includes('glute')) {
      return [
        { type: 'active', name: 'Glutes & Lower Body Focus', target: ['Glutes', 'Legs', 'Core'] },
        { type: 'rest' },
        { type: 'active', name: 'Upper Body Tone', target: ['Chest', 'Back', 'Shoulders'] },
        { type: 'rest' },
        { type: 'active', name: 'Lower Body Strength', target: ['Legs', 'Glutes'] },
        { type: 'rest' },
        { type: 'rest' }
      ];
    }
    return [
      { type: 'active', name: 'Push Focus', target: ['Chest', 'Shoulders', 'Arms'] },
      { type: 'rest' },
      { type: 'active', name: 'Pull Focus', target: ['Back', 'Arms', 'Core'] },
      { type: 'rest' },
      { type: 'active', name: 'Legs Focus', target: ['Legs', 'Glutes'] },
      { type: 'rest' },
      { type: 'rest' }
    ];
  } else if (days === 4) {
    return [
      { type: 'active', name: 'Upper Body Strength', target: ['Chest', 'Back', 'Shoulders'] },
      { type: 'active', name: 'Lower Body Strength', target: ['Legs', 'Glutes', 'Core'] },
      { type: 'rest' },
      { type: 'active', name: 'Upper Body Hypertrophy', target: ['Chest', 'Back', 'Arms'] },
      { type: 'active', name: 'Lower Body Hypertrophy', target: ['Legs', 'Glutes', 'Core'] },
      { type: 'rest' },
      { type: 'rest' }
    ];
  } else {
    // 5-day template
    return [
      { type: 'active', name: 'Push Day', target: ['Chest', 'Shoulders', 'Arms'] },
      { type: 'active', name: 'Pull Day', target: ['Back', 'Arms', 'Core'] },
      { type: 'active', name: 'Legs Day', target: ['Legs', 'Glutes'] },
      { type: 'rest' },
      { type: 'active', name: 'Upper Body Focus', target: ['Chest', 'Back', 'Shoulders'] },
      { type: 'active', name: 'Lower Body Focus', target: ['Legs', 'Glutes', 'Core'] },
      { type: 'rest' }
    ];
  }
};

const isEquipmentAllowed = (reqEquipment, availableEq, unavailableEq) => {
  const req = reqEquipment.toLowerCase();
  const unav = unavailableEq.map(u => u.toLowerCase());
  const av = availableEq.map(a => a.toLowerCase());

  // Check if this equipment is specifically disliked or unwanted
  if (unav.includes(req)) return false;
  if (req === 'leg press' && unav.includes('leg press')) return false;
  if (req === 'smith machine' && unav.includes('smith machine')) return false;
  if (req === 'cable machine' && unav.includes('cable machine')) return false;
  if (req === 'treadmill' && unav.includes('treadmill')) return false;

  // Check if availableEq allows it
  if (av.includes('full gym') || av.includes('gym')) return true;
  
  if (av.includes('bodyweight only') || av.includes('bodyweight')) {
    return req === 'bodyweight';
  }
  
  if (av.includes('resistance bands')) {
    return req === 'bodyweight' || req === 'resistance bands';
  }
  
  if (av.includes('dumbbells only') || av.includes('dumbbells')) {
    return req === 'bodyweight' || req === 'dumbbells' || req === 'bench';
  }

  return req === 'bodyweight';
};

const getExercisesForSplit = (split, availableEq, unavailableEq, level, goal, usedExerciseIds) => {
  let selected = [];
  
  split.target.forEach(muscleGroup => {
    let possible = ExerciseDatabase.filter(ex => 
      (ex.category === muscleGroup || ex.primaryMuscles.includes(muscleGroup)) &&
      isEquipmentAllowed(ex.equipmentRequired, availableEq, unavailableEq) &&
      !usedExerciseIds.has(ex.id)
    );
    
    // Fallback if all matches are used
    if (possible.length === 0) {
      possible = ExerciseDatabase.filter(ex => 
        (ex.category === muscleGroup || ex.primaryMuscles.includes(muscleGroup)) &&
        isEquipmentAllowed(ex.equipmentRequired, availableEq, unavailableEq)
      );
    }
    
    if (possible.length > 0) {
      const chosen = possible[Math.floor(Math.random() * possible.length)];
      selected.push(chosen);
      usedExerciseIds.add(chosen.id);
    }
  });

  // Limit exercises per day based on experience level
  let maxExercises = 5;
  if (level.toLowerCase().includes('beginner')) maxExercises = 3;
  else if (level.toLowerCase().includes('advanced')) maxExercises = 6;

  let finalSelected = [...new Set(selected)].slice(0, maxExercises);

  // Combine strength + cardio for fat loss / weight loss
  if (goal.toLowerCase().includes('lose') || goal.toLowerCase().includes('weight') || goal.toLowerCase().includes('fat')) {
    let cardioList = ExerciseDatabase.filter(ex => 
      ex.category === 'Cardio' && 
      isEquipmentAllowed(ex.equipmentRequired, availableEq, unavailableEq) &&
      !finalSelected.some(fs => fs.id === ex.id)
    );
    if (cardioList.length > 0) {
      const chosenCardio = cardioList[Math.floor(Math.random() * cardioList.length)];
      finalSelected.push(chosenCardio);
    }
  }

  return finalSelected;
};

const getReplacements = (exercise, availableEq, unavailableEq) => {
  if (!exercise.replacements || exercise.replacements.length === 0) return [];
  
  return exercise.replacements.filter(repName => {
    const repEx = ExerciseDatabase.find(e => e.name === repName);
    if (!repEx) return true;
    if (unavailableEq.map(u => u.toLowerCase()).includes(repEx.equipmentRequired.toLowerCase())) return false;
    return isEquipmentAllowed(repEx.equipmentRequired, availableEq, unavailableEq);
  });
};
