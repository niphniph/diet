import { useCallback, useMemo, useState } from 'react';
import { questionnaireInitialAnswers, calculateQuestionnairePlan } from '../utils/questionnairePlan';

const optionTranslations = {
  // Gender
  'Female': 'opt_female',
  'Male': 'opt_male',
  'Other': 'opt_other',
  'Prefer not to say': 'opt_other',

  // Main Goal
  'Lose weight': 'opt_lose_weight',
  'Gain weight': 'opt_gain_weight',
  'Maintain weight': 'opt_maintain_weight',
  'Build muscle': 'opt_build_muscle',
  'Eat healthier': 'opt_eat_healthier',

  // Activity Level
  'Sedentary': 'opt_sedentary',
  'Lightly active': 'opt_lightly_active',
  'Moderately active': 'opt_moderately_active',
  'Very active': 'opt_very_active',

  // Diet Preference
  'No preference': 'opt_no_preference',
  'Balanced': 'opt_balanced',
  'High protein': 'opt_high_protein',
  'Low carb': 'opt_low_carb',
  'Vegetarian': 'opt_vegetarian',
  'Vegan': 'opt_vegan',

  // Target Plan Type
  'Meal plan only': 'opt_meal_plan_only',
  'Workout plan only': 'opt_workout_plan_only',
  'Meal + workout bundle': 'opt_meal_workout_bundle',

  // Cooking Time Preference
  '10–15 minutes': 'opt_10_15_minutes',
  '20–30 minutes': 'opt_20_30_minutes',
  '45+ minutes': 'opt_45_minutes',

  // Budget Preference
  'Low budget': 'opt_low_budget',
  'Medium budget': 'opt_medium_budget',
  'Flexible budget': 'opt_flexible_budget',

  // Food Scanner Goal
  'Track calories': 'opt_track_calories',
  'Track macros': 'opt_track_macros',
  'Improve food quality': 'opt_improve_food_quality',
  'Weight control': 'opt_weight_control',

  // Macro Tracking Preference
  'Automatic': 'opt_automatic',
  'Manual': 'opt_manual',
  'Both': 'opt_both',

  // Progress Tracking Preference
  'Weight': 'opt_weight',
  'Calories': 'opt_calories',
  'Workouts': 'opt_workouts',
  'Streaks': 'opt_streaks',
  'All of them': 'opt_all_of_them',

  // Daily Accomplishment Goal
  'Drink enough water': 'opt_drink_enough_water',
  'Hit calories': 'opt_hit_calories',
  'Hit protein': 'opt_hit_protein',
  'Complete workout': 'opt_complete_workout',
  'Follow meal plan': 'opt_follow_meal_plan'
};

const cmToFtIn = (cm) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet: feet || 5, inches: inches || 0 };
};

const ftInToCm = (feet, inches) => {
  const totalInches = (parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0);
  return Math.round(totalInches * 2.54);
};

const validateQuestion = (question, answers, label) => {
  const value = answers[question.field];

  if (question.type === 'options' && !value) {
    return label('validation_choose_option', 'Choose one option to continue.');
  }

  if (question.type === 'text' && !String(value || '').trim()) {
    return label('validation_enter_answer', 'Enter an answer. Type none if this does not apply.');
  }

  if (question.field === 'age') {
    const age = Number.parseFloat(value);
    if (Number.isNaN(age) || age < 13 || age > 100) {
      return label('validation_age_range', 'Enter a realistic age between 13 and 100.');
    }
  }

  if (question.type === 'heightValue') {
    const unit = answers.heightUnit;
    if (unit === 'ft') {
      const feet = Number.parseFloat(answers.heightFeet);
      const inches = answers.heightInches === '' ? 0 : Number.parseFloat(answers.heightInches);
      if (Number.isNaN(feet) || feet < 3 || feet > 8 || Number.isNaN(inches) || inches < 0 || inches > 11) {
        return label('validation_height_ft', 'Enter a realistic height between 3 and 8 feet, with inches from 0 to 11.');
      }
    } else {
      const height = Number.parseFloat(answers.heightValue || answers.height);
      if (Number.isNaN(height) || height < 100 || height > 230) {
        return label('validation_height_cm', 'Enter a realistic height between 100 and 230 cm.');
      }
    }
  }

  if (question.type === 'weightValue') {
    const weight = Number.parseFloat(value);
    const unit = answers[question.unitField];
    const min = unit === 'lbs' ? 77 : 35;
    const max = unit === 'lbs' ? 660 : 300;
    if (Number.isNaN(weight) || weight < min || weight > max) {
      const isCurrent = question.field === 'currentWeightValue';
      if (isCurrent) {
        return unit === 'lbs'
          ? label('validation_weight_lbs_current', 'Enter a realistic current weight between 77 and 660 lbs.')
          : label('validation_weight_kg_current', 'Enter a realistic current weight between 35 and 300 kg.');
      } else {
        return unit === 'lbs'
          ? label('validation_weight_lbs_goal', 'Enter a realistic goal weight between 77 and 660 lbs.')
          : label('validation_weight_kg_goal', 'Enter a realistic goal weight between 35 and 300 kg.');
      }
    }
  }

  if (question.field === 'mealsPerDay') {
    const meals = Number.parseFloat(value);
    if (Number.isNaN(meals) || meals < 1 || meals > 8) {
      return label('validation_meals_range', 'Meals per day must be between 1 and 8.');
    }
  }

  if (question.field === 'workoutFrequency') {
    const workouts = Number.parseFloat(value);
    if (Number.isNaN(workouts) || workouts < 0 || workouts > 14) {
      return label('validation_workouts_range', 'Workout frequency must be between 0 and 14 sessions per week.');
    }
  }

  if (question.field === 'waterIntakeGoal') {
    const water = Number.parseFloat(value);
    if (Number.isNaN(water) || water < 0.5 || water > 8) {
      return label('validation_water_range', 'Water goal must be between 0.5 and 8 liters.');
    }
  }

  if (question.field === 'sleepHours') {
    const sleep = Number.parseFloat(value);
    if (Number.isNaN(sleep) || sleep < 3 || sleep > 14) {
      return label('validation_sleep_range', 'Sleep must be between 3 and 14 hours.');
    }
  }

  return '';
};

const QuestionnairePage = ({ currentUser, initialAnswers, onSubmit, onRequireLogin, t }) => {
  const label = useCallback((key, fallback) => t ? t(key) : fallback, [t]);

  const questions = useMemo(() => [
    {
      field: 'age',
      title: label('q_age_title', 'How old are you?'),
      helper: label('q_age_helper', 'Age helps NutriPlan estimate your baseline calorie needs.'),
      type: 'number',
      inputProps: { min: 13, max: 100, placeholder: '28' }
    },
    {
      field: 'gender',
      title: label('q_gender_title', 'What is your gender?'),
      helper: label('q_gender_helper', 'This is used only for calorie and macro calculations.'),
      type: 'options',
      options: ['Female', 'Male', 'Other', 'Prefer not to say']
    },
    {
      field: 'heightValue',
      title: label('q_height_title', 'What is your height?'),
      helper: label('q_height_helper', 'Enter your height in centimeters or feet/inches.'),
      type: 'heightValue'
    },
    {
      field: 'currentWeightValue',
      title: label('q_currentWeight_title', 'What is your current weight?'),
      helper: label('q_currentWeight_helper', 'This helps calculate your daily calorie target.'),
      type: 'weightValue',
      unitField: 'currentWeightUnit'
    },
    {
      field: 'goalWeightValue',
      title: label('q_goalWeight_title', 'What is your goal weight?'),
      helper: label('q_goalWeight_helper', 'Use a realistic target that matches your main goal.'),
      type: 'weightValue',
      unitField: 'goalWeightUnit'
    },
    {
      field: 'mainGoal',
      title: label('q_mainGoal_title', 'What is your main goal?'),
      helper: label('q_mainGoal_helper', 'Pick the outcome NutriPlan should prioritize.'),
      type: 'options',
      options: ['Lose weight', 'Gain weight', 'Maintain weight', 'Build muscle', 'Eat healthier']
    },
    {
      field: 'activityLevel',
      title: label('q_activityLevel_title', 'What is your typical daily activity level?'),
      helper: label('q_activityLevel_helper', 'Think about a normal week, not your best week.'),
      type: 'options',
      options: ['Sedentary', 'Lightly active', 'Moderately active', 'Very active']
    },
    {
      field: 'dietPreference',
      title: label('q_dietPreference_title', 'What eating style do you prefer?'),
      helper: label('q_dietPreference_helper', 'Your meal suggestions will respect this preference.'),
      type: 'options',
      options: ['No preference', 'Balanced', 'High protein', 'Low carb', 'Vegetarian', 'Vegan']
    },
    {
      field: 'allergies',
      title: label('q_allergies_title', 'Do you have any food allergies?'),
      helper: label('q_allergies_helper', "Enter any allergies, or type 'None' if you don't have any."),
      type: 'text',
      inputProps: { placeholder: 'None, peanuts, lactose...' }
    },
    {
      field: 'foodsToAvoid',
      title: label('q_foodsToAvoid_title', 'Any foods you want to avoid?'),
      helper: label('q_foodsToAvoid_helper', "Enter foods you dislike or want to exclude, or 'None'."),
      type: 'text',
      inputProps: { placeholder: 'None, pork, mushrooms...' }
    },
    {
      field: 'mealsPerDay',
      title: label('q_mealsPerDay_title', 'How many meals do you prefer to eat per day?'),
      helper: label('q_mealsPerDay_helper', 'Most people do well with 3 to 5 meals.'),
      type: 'number',
      inputProps: { min: 1, max: 8, placeholder: '3' }
    },
    {
      field: 'workoutFrequency',
      title: label('q_workoutFrequency_title', 'How many workouts per week?'),
      helper: label('q_workoutFrequency_helper', 'Include gym sessions, sports, walks, or structured home workouts.'),
      type: 'number',
      inputProps: { min: 0, max: 14, placeholder: '3' }
    },
    {
      field: 'waterIntakeGoal',
      title: label('q_waterIntakeGoal_title', 'What is your water goal (liters per day)?'),
      helper: label('q_waterIntakeGoal_helper', 'Adequate hydration supports metabolic health and digestion.'),
      type: 'number',
      inputProps: { min: 0.5, max: 8, step: 0.1, placeholder: '2' }
    },
    {
      field: 'sleepHours',
      title: label('q_sleepHours_title', 'How many hours do you sleep per night?'),
      helper: label('q_sleepHours_helper', 'Average sleep helps shape recovery and appetite guidance.'),
      type: 'number',
      inputProps: { min: 3, max: 14, step: 0.5, placeholder: '7' }
    },
    {
      field: 'targetPlanType',
      title: label('q_targetPlanType_title', 'Select your target plan focus'),
      helper: label('q_targetPlanType_helper', 'Choose the target template that best aligns with your goals.'),
      type: 'options',
      options: ['Meal plan only', 'Workout plan only', 'Meal + workout bundle']
    },
    {
      field: 'cookingTimePreference',
      title: label('q_cookingTimePreference_title', 'How much time are you willing to spend on cooking?'),
      helper: label('q_cookingTimePreference_helper', 'We will tailor recipes to fit your kitchen routine.'),
      type: 'options',
      options: ['10–15 minutes', '20–30 minutes', '45+ minutes']
    },
    {
      field: 'budgetPreference',
      title: label('q_budgetPreference_title', 'What is your budget preference?'),
      helper: label('q_budgetPreference_helper', 'This affects ingredient cost estimations.'),
      type: 'options',
      options: ['Low budget', 'Medium budget', 'Flexible budget']
    },
    {
      field: 'foodScannerGoal',
      title: label('q_foodScannerGoal_title', 'What is your Food Scanner goal?'),
      helper: label('q_foodScannerGoal_helper', 'How do you plan to use our intelligent scanner tool?'),
      type: 'options',
      options: ['Track calories', 'Track macros', 'Improve food quality', 'Weight control']
    },
    {
      field: 'macroTrackingPreference',
      title: label('q_macroTrackingPreference_title', 'What is your macro tracking preference?'),
      helper: label('q_macroTrackingPreference_helper', 'Select how you would like to track your protein, carbs, and fats.'),
      type: 'options',
      options: ['Automatic', 'Manual', 'Both']
    },
    {
      field: 'progressTrackingPreference',
      title: label('q_progressTrackingPreference_title', 'What is your progress tracking preference?'),
      helper: label('q_progressTrackingPreference_helper', 'Choose which metrics you want to monitor closely.'),
      type: 'options',
      options: ['Weight', 'Calories', 'Workouts', 'Streaks', 'All of them']
    },
    {
      field: 'dailyAccomplishmentGoal',
      title: label('q_dailyAccomplishmentGoal_title', 'What is your daily accomplishment goal?'),
      helper: label('q_dailyAccomplishmentGoal_helper', 'This represents your absolute priority task for each day.'),
      type: 'options',
      options: ['Drink enough water', 'Hit calories', 'Hit protein', 'Complete workout', 'Follow meal plan']
    }
  ], [label]);

  const [answers, setAnswers] = useState(() => {
    const merged = { ...questionnaireInitialAnswers, ...(initialAnswers || {}) };
    // Synchronize legacy height
    if (!merged.heightValue && merged.height) {
      merged.heightValue = merged.height;
    }
    // Synchronize legacy weight
    if (!merged.currentWeightValue && merged.weight) {
      merged.currentWeightValue = merged.weight;
      merged.currentWeightUnit = merged.weightUnit || 'kg';
    }
    if (!merged.goalWeightValue && merged.goalWeight) {
      merged.goalWeightValue = merged.goalWeight;
      merged.goalWeightUnit = merged.goalWeightUnit || 'kg';
    }
    // Pre-populate feet/inches if empty but height value exists
    if (merged.heightUnit === 'ft' && merged.heightValue && (!merged.heightFeet || !merged.heightInches)) {
      const cmVal = parseFloat(merged.heightValue);
      if (!Number.isNaN(cmVal)) {
        const { feet, inches } = cmToFtIn(cmVal);
        merged.heightFeet = feet.toString();
        merged.heightInches = inches.toString();
      }
    }
    return merged;
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');

  const isSummary = stepIndex >= questions.length;
  const currentQuestion = questions[Math.min(stepIndex, questions.length - 1)];
  const progress = Math.round(((isSummary ? questions.length : stepIndex + 1) / questions.length) * 100);

  const summary = useMemo(() => {
    let heightStr = 'Not entered';
    if (answers.heightUnit === 'ft') {
      const ft = answers.heightFeet || '5';
      const inch = answers.heightInches || '0';
      heightStr = `${ft} ft ${inch} in`;
    } else if (answers.heightValue) {
      heightStr = `${answers.heightValue} cm`;
    }

    return {
      goal: answers.mainGoal || answers.goal || 'Not selected',
      height: heightStr,
      currentWeight: answers.currentWeightValue ? `${answers.currentWeightValue} ${answers.currentWeightUnit}` : 'Not entered',
      goalWeight: answers.goalWeightValue ? `${answers.goalWeightValue} ${answers.goalWeightUnit}` : 'Not entered',
      activity: answers.activityLevel || 'Not selected',
      diet: answers.dietPreference || 'Not selected',
      targetPlan: answers.targetPlanType || 'Not selected'
    };
  }, [answers]);

  const update = (field, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'weightUnit') {
        next.currentWeightUnit = value;
        next.goalWeightUnit = value;
      }
      return next;
    });
    setError('');
  };

  const requireLoginIfNeeded = () => {
    if (currentUser) return false;
    onRequireLogin();
    return true;
  };

  const goNext = () => {
    if (requireLoginIfNeeded()) return;

    const nextError = validateQuestion(currentQuestion, answers, label);
    setError(nextError);
    if (nextError) return;

    setStepIndex((index) => Math.min(index + 1, questions.length));
  };

  const goBack = () => {
    setError('');
    setStepIndex((index) => Math.max(index - 1, 0));
  };

  const handleHeightUnitChange = (newUnit) => {
    if (newUnit === answers.heightUnit) return;
    
    if (newUnit === 'ft') {
      const cm = parseFloat(answers.heightValue || answers.height) || 170;
      const { feet, inches } = cmToFtIn(cm);
      setAnswers(prev => ({
        ...prev,
        heightUnit: 'ft',
        heightFeet: feet.toString(),
        heightInches: inches.toString(),
        heightValue: ftInToCm(feet, inches).toString(),
        height: ftInToCm(feet, inches).toString()
      }));
    } else {
      const feet = parseFloat(answers.heightFeet) || 5;
      const inches = parseFloat(answers.heightInches) || 8;
      const cm = ftInToCm(feet, inches);
      setAnswers(prev => ({
        ...prev,
        heightUnit: 'cm',
        heightValue: cm.toString(),
        height: cm.toString()
      }));
    }
    setError('');
  };

  const handleWeightUnitChange = (field, newUnit) => {
    const unitField = field === 'currentWeightValue' ? 'currentWeightUnit' : 'goalWeightUnit';
    if (newUnit === answers[unitField]) return;

    const rawVal = parseFloat(answers[field]);
    if (rawVal) {
      let convertedVal;
      if (newUnit === 'lbs') {
        convertedVal = Math.round(rawVal * 2.20462);
      } else {
        convertedVal = Math.round(rawVal / 2.20462);
      }
      setAnswers(prev => ({
        ...prev,
        [unitField]: newUnit,
        [field]: convertedVal.toString(),
        ...(field === 'currentWeightValue' ? { weight: convertedVal.toString(), weightUnit: newUnit } : { goalWeight: convertedVal.toString() })
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [unitField]: newUnit
      }));
    }
    setError('');
  };

  const calculatePlan = () => {
    if (requireLoginIfNeeded()) return;
    
    // Check all questions for errors
    const firstErrorIndex = questions.findIndex((question) => validateQuestion(question, answers, label));
    if (firstErrorIndex >= 0) {
      setStepIndex(firstErrorIndex);
      setError(validateQuestion(questions[firstErrorIndex], answers, label));
      return;
    }

    onSubmit(answers, calculateQuestionnairePlan(answers));
  };

  const renderOptions = (question) => (
    <div className="question-option-grid">
      {question.options.map((option) => {
        const active = answers[question.field] === option;
        const translatedLabel = optionTranslations[option] ? label(optionTranslations[option], option) : option;
        return (
          <button
            type="button"
            key={option}
            className={`question-option ${active ? 'active' : ''}`}
            aria-pressed={active}
            onClick={() => update(question.field, option)}
          >
            <span>{translatedLabel}</span>
            {active && <span className="material-symbols-outlined option-check-icon">check_circle</span>}
          </button>
        );
      })}
    </div>
  );

  const renderHeightValueInput = () => (
    <div className="measurement-input-group">
      {answers.heightUnit === 'ft' ? (
        <div className="imperial-height-inputs">
          <div className="input-with-label">
            <input
              type="number"
              className="form-control question-input-large"
              value={answers.heightFeet || ''}
              onChange={(e) => {
                const val = e.target.value;
                setAnswers(prev => {
                  const next = { ...prev, heightFeet: val };
                  const feet = parseFloat(val) || 0;
                  const inches = parseFloat(prev.heightInches) || 0;
                  const cm = ftInToCm(feet, inches);
                  next.heightValue = cm.toString();
                  next.height = cm.toString();
                  return next;
                });
                setError('');
              }}
              placeholder="5"
              min="3"
              max="8"
            />
            <span className="input-label-suffix">ft</span>
          </div>
          <div className="input-with-label">
            <input
              type="number"
              className="form-control question-input-large"
              value={answers.heightInches || ''}
              onChange={(e) => {
                const val = e.target.value;
                setAnswers(prev => {
                  const next = { ...prev, heightInches: val };
                  const feet = parseFloat(prev.heightFeet) || 0;
                  const inches = parseFloat(val) || 0;
                  const cm = ftInToCm(feet, inches);
                  next.heightValue = cm.toString();
                  next.height = cm.toString();
                  return next;
                });
                setError('');
              }}
              placeholder="8"
              min="0"
              max="11"
            />
            <span className="input-label-suffix">in</span>
          </div>
        </div>
      ) : (
        <div className="input-with-label">
          <input
            type="number"
            className="form-control question-input-large"
            value={answers.heightValue || ''}
            onChange={(e) => {
              const val = e.target.value;
              setAnswers(prev => ({
                ...prev,
                heightValue: val,
                height: val
              }));
              setError('');
            }}
            placeholder="170"
            min="100"
            max="230"
          />
          <span className="input-label-suffix">cm</span>
        </div>
      )}
      
      <div className="unit-toggle-buttons">
        <button
          type="button"
          className={`unit-btn ${answers.heightUnit === 'cm' ? 'active' : ''}`}
          onClick={() => handleHeightUnitChange('cm')}
        >
          cm
        </button>
        <button
          type="button"
          className={`unit-btn ${answers.heightUnit === 'ft' ? 'active' : ''}`}
          onClick={() => handleHeightUnitChange('ft')}
        >
          ft
        </button>
      </div>
    </div>
  );

  const renderWeightValueInput = (field, unitField) => (
    <div className="measurement-input-group">
      <div className="input-with-label">
        <input
          type="number"
          className="form-control question-input-large"
          value={answers[field] || ''}
          onChange={(e) => {
            const val = e.target.value;
            setAnswers(prev => ({
              ...prev,
              [field]: val,
              ...(field === 'currentWeightValue' ? { weight: val } : { goalWeight: val })
            }));
            setError('');
          }}
          placeholder={answers[unitField] === 'lbs' ? '150' : '70'}
          min={answers[unitField] === 'lbs' ? '77' : '35'}
          max={answers[unitField] === 'lbs' ? '660' : '300'}
        />
        <span className="input-label-suffix">{answers[unitField]}</span>
      </div>

      <div className="unit-toggle-buttons">
        <button
          type="button"
          className={`unit-btn ${answers[unitField] === 'kg' ? 'active' : ''}`}
          onClick={() => handleWeightUnitChange(field, 'kg')}
        >
          kg
        </button>
        <button
          type="button"
          className={`unit-btn ${answers[unitField] === 'lbs' ? 'active' : ''}`}
          onClick={() => handleWeightUnitChange(field, 'lbs')}
        >
          lbs
        </button>
      </div>
    </div>
  );

  const renderInput = (question) => {
    if (question.type === 'options') return renderOptions(question);
    if (question.type === 'heightValue') return renderHeightValueInput();
    if (question.type === 'weightValue') return renderWeightValueInput(question.field, question.unitField);

    return (
      <label className="question-input-wrap">
        {label('your_answer', 'Your answer')}
        <input
          className="form-control question-input-large"
          type={question.type === 'number' ? 'number' : 'text'}
          value={answers[question.field] || ''}
          onChange={(event) => update(question.field, event.target.value)}
          {...(question.inputProps || {})}
        />
      </label>
    );
  };

  return (
    <div className="container questionnaire-page">
      <div className="questionnaire-shell questionnaire-shell-narrow">
        <div className="questionnaire-header">
          <span className="material-symbols-outlined text-primary">calculate</span>
          <div>
            <h2>{label('createNewPlan', 'Calculate My Plan')}</h2>
            <p className="text-muted">
              {label('q_intro_text', 'Complete a short questionnaire first so NutriPlan can calculate your personalized plan.')}
            </p>
          </div>
        </div>

        <div className="question-progress">
          <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
          <span>
            {isSummary ? label('q_step_ready', 'Ready') : `${label('q_step_label', 'Step')} ${stepIndex + 1} ${label('q_step_of', 'of')} ${questions.length}`}
          </span>
        </div>

        <div className="card questionnaire-card single-question-card">
          {!isSummary ? (
            <>
              <span className="pill">
                {label('q_step_label', 'Step')} {stepIndex + 1} {label('q_step_of', 'of')} {questions.length}
              </span>
              <h3>{currentQuestion.title}</h3>
              <p className="text-muted question-helper">{currentQuestion.helper}</p>

              <div className="single-question-body">
                {renderInput(currentQuestion)}
                {error && <span className="field-error question-error">{error}</span>}
              </div>

              <div className="question-actions">
                <button type="button" className="btn btn-outline" onClick={goBack} disabled={stepIndex === 0}>
                  {label('btnBack', 'Back')}
                </button>
                <button type="button" className="btn btn-primary" onClick={goNext}>
                  {stepIndex === questions.length - 1 ? label('q_review_answers', 'Review Answers') : label('q_next', 'Next')}
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="pill">{label('q_summary_title', 'Summary')}</span>
              <h3>{label('q_summary_title', 'Your answers are ready.')}</h3>
              <p className="text-muted question-helper">
                {label('q_summary_helper', 'Review the essentials, then NutriPlan will calculate your personalized preview.')}
              </p>

              <div className="question-summary-grid">
                <div>
                  <span>{label('q_mainGoal_title', 'Goal')}</span>
                  <strong>{optionTranslations[summary.goal] ? label(optionTranslations[summary.goal], summary.goal) : summary.goal}</strong>
                </div>
                <div>
                  <span>{label('q_height_title', 'Height')}</span>
                  <strong>{summary.height}</strong>
                </div>
                <div>
                  <span>{label('q_currentWeight_title', 'Current Weight')}</span>
                  <strong>{summary.currentWeight}</strong>
                </div>
                <div>
                  <span>{label('q_goalWeight_title', 'Goal Weight')}</span>
                  <strong>{summary.goalWeight}</strong>
                </div>
                <div>
                  <span>{label('q_activityLevel_title', 'Activity Level')}</span>
                  <strong>{optionTranslations[summary.activity] ? label(optionTranslations[summary.activity], summary.activity) : summary.activity}</strong>
                </div>
                <div>
                  <span>{label('q_dietPreference_title', 'Diet Preference')}</span>
                  <strong>{optionTranslations[summary.diet] ? label(optionTranslations[summary.diet], summary.diet) : summary.diet}</strong>
                </div>
                <div className="question-full-width" style={{ gridColumn: '1 / -1' }}>
                  <span>{label('q_targetPlanType_title', 'Target Plan Type')}</span>
                  <strong>{optionTranslations[summary.targetPlan] ? label(optionTranslations[summary.targetPlan], summary.targetPlan) : summary.targetPlan}</strong>
                </div>
              </div>

              <div className="question-actions">
                <button type="button" className="btn btn-outline" onClick={() => setStepIndex(0)}>
                  {label('q_btn_edit_answers', 'Edit Answers')}
                </button>
                <button type="button" className="btn btn-primary" onClick={calculatePlan}>
                  {label('q_btn_calculate_plan', 'Calculate My Plan')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;
