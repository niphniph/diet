import { useEffect, useState } from 'react';
import Register from './components/Register';
import VerifyEmail from './components/VerifyEmail';
import { supabase } from './lib/supabaseClient';
import { getCurrentUser, addFriend, addCompetition, saveSubscription, seedDemoUsers, saveUserQuestionnairePlan, getUserQuestionnairePlan, getUserSubscription } from './utils/localStorage';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import PlanTypeSelection from './components/PlanTypeSelection';
import QuizFlow from './components/QuizFlow';
import EmailCapture from './components/EmailCapture';
import Paywall from './components/Paywall';
import UsersDashboard from './components/UsersDashboard';
import CompeteWithFriend from './components/CompeteWithFriend';
import ResultsDashboard from './components/ResultsDashboard';
import TermsPolicies from './components/TermsPolicies';
import FriendsPage from './components/FriendsPage';
import LeaderboardPage from './components/LeaderboardPage';
import QuestionnairePage from './components/QuestionnairePage';
import PlanPreviewPage from './components/PlanPreviewPage';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros } from './utils/nutritionCalculator';
import { generateMealPlan } from './utils/mealGenerator';
import { generateWorkoutPlan } from './utils/workoutGenerator';
import { answersToUserData } from './utils/questionnairePlan';
import { translations } from './utils/translations';
import './index.css';

const APP_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '') || '/diet';

const getInitialRoute = () => {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path.endsWith('/terms')) return { view: 'terms' };
  if (path.endsWith('/subscription')) return { view: 'paywall' };
  if (path.endsWith('/friends')) return { view: 'friends' };
  if (path.endsWith('/leaderboard')) return { view: 'leaderboard' };
  if (path.endsWith('/questionnaire')) return { view: 'questionnaire' };
  if (path.endsWith('/plan-preview')) return { view: 'planPreview' };
  if (path.endsWith('/login') || path.endsWith('/register')) return { view: 'register' };
  if (path.endsWith('/verify-email')) return { view: 'verifyEmail' };
  if (path.endsWith('/meal-plan')) return { view: 'dashboard', tab: 'meals' };
  if (path.endsWith('/food-scanner')) return { view: 'dashboard', tab: 'scanner' };
  if (path.endsWith('/progress')) return { view: 'dashboard', tab: 'progress_insights' };
  if (path.endsWith('/dashboard')) return { view: 'dashboard', tab: 'overview' };
  return { view: 'landing' };
};

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const createDefaultUserData = () => ({
  gender: 'Female',
  age: '30',
  height: '170',
  heightUnit: 'cm',
  weight: '68',
  weightUnit: 'kg',
  goal: 'Lose weight',
  speed: 'Moderate',
  activityLevel: 'Light',
  mealsPerDay: '3 meals',
  snacks: 'Yes',
  diet: 'Anything',
  allergies: ['None'],
  country: 'United States',
  city: 'New York City',
  cuisineStyle: 'International healthy meals',
  budgetLevel: 'medium',
  budgetRangeLabel: '$15-30/day',
  cookingTime: '30 minutes',
  flexibility: 'Balanced',
  planLength: '7-Day Meal Plan'
});

const checkSubscriptionActive = (sub) => {
  if (!sub?.hasActiveSubscription) return false;
  if (!['paid', 'demo_active'].includes(sub.paymentStatus)) return false;
  if (!sub.subscriptionEndDate) return true;
  return new Date(sub.subscriptionEndDate) >= new Date();
};

const saveUserPlansToSupabase = async (userId, plansData) => {
  if (!userId) return;
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        user_data: plansData.userData || null,
        questionnaire_answers: plansData.questionnaireAnswers || null,
        calculated_plan: plansData.calculatedPlan || null,
        meal_plan: plansData.mealPlan || null,
        workout_plan: plansData.workoutPlan || null,
        subscription_data: plansData.subscriptionData || null,
        target_calories: plansData.targetCalories || null,
        macros: plansData.macros || null,
        tdee: plansData.tdee || null,
        selected_plan_type: plansData.selectedPlanType || null
      })
      .eq('id', userId);
    
    if (error) {
      console.error('[Supabase] Failed to save plans:', error);
    } else {
      console.log('[Supabase] Successfully saved plans to database for:', userId);
    }
  } catch (err) {
    console.error('[Supabase] Error saving plans:', err);
  }
};

function App() {
  const [initialRoute] = useState(() => getInitialRoute());
  const [selectedPlanType, setSelectedPlanType] = useState(() => {
    return localStorage.getItem('nutriPlanSelectedType') || 'nutrition_workout_bundle';
  });
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [lockedSessionId, setLockedSessionId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sessionId') || localStorage.getItem('nutriPlanLockedSession') || '';
  });
  const [userEmail, setUserEmail] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sessionId')) {
      return localStorage.getItem('nutriPlanEmail') || 'customer@example.com';
    }
    return localStorage.getItem('nutriPlanEmail') || '';
  });
  const [userData, setUserData] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sessionId')) {
      return safeJsonParse(localStorage.getItem('nutriPlanData'), null) || createDefaultUserData();
    }
    return safeJsonParse(localStorage.getItem('nutriPlanData'), null);
  });
  const [mealPlan, setMealPlan] = useState(() => {
    return safeJsonParse(localStorage.getItem('nutriPlanResult'), null);
  });
  const [workoutPlan, setWorkoutPlan] = useState(() => {
    return safeJsonParse(localStorage.getItem('nutriPlanWorkoutResult'), null);
  });
  const [targetCalories, setTargetCalories] = useState(() => {
    return safeJsonParse(localStorage.getItem('nutriPlanCals'), 0);
  });
  const [macros, setMacros] = useState(() => {
    return safeJsonParse(localStorage.getItem('nutriPlanMacros'), null);
  });
  const [tdee, setTdee] = useState(() => {
    return safeJsonParse(localStorage.getItem('nutriPlanTdee'), 0);
  });
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      return getUserQuestionnairePlan(storedUser).questionnaireAnswers || null;
    }
    return null;
  });
  const [calculatedPlan, setCalculatedPlan] = useState(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      return getUserQuestionnairePlan(storedUser).calculatedPlan || null;
    }
    return null;
  });
  const [subscriptionData, setSubscriptionData] = useState(() => {
    const storedUser = getCurrentUser();
    const savedSub = safeJsonParse(localStorage.getItem('nutriPlanSubscription'), null);
    if (storedUser) {
      const userSub = getUserSubscription(storedUser);
      if (userSub) return userSub;
      if (savedSub && savedSub.userId === storedUser) {
        const normalizedSub = { ...savedSub };
        if (normalizedSub.subscriptionEndDate && new Date(normalizedSub.subscriptionEndDate) < new Date()) {
          normalizedSub.hasActiveSubscription = false;
          normalizedSub.paymentStatus = 'expired';
        }
        return normalizedSub;
      }
    } else {
      if (savedSub) {
        const normalizedSub = { ...savedSub };
        if (normalizedSub.subscriptionEndDate && new Date(normalizedSub.subscriptionEndDate) < new Date()) {
          normalizedSub.hasActiveSubscription = false;
          normalizedSub.paymentStatus = 'expired';
        }
        return normalizedSub;
      }
    }
    return null;
  });
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sessionId')) {
      return 'paywall';
    }
    const route = getInitialRoute();
    const storedUser = getCurrentUser();

    if (!storedUser && ['dashboard', 'questionnaire', 'planPreview'].includes(route.view)) {
      return 'register';
    }

    if (route.view === 'landing') {
      const savedSub = safeJsonParse(localStorage.getItem('nutriPlanSubscription'), null);
      const sub = storedUser
        ? (getUserSubscription(storedUser) || (savedSub?.userId === storedUser ? savedSub : null))
        : savedSub;
      if (checkSubscriptionActive(sub)) {
        return 'dashboard';
      }
    }

    return route.view;
  });
  const [continueAfterLogin, setContinueAfterLogin] = useState(() => {
    const storedUser = getCurrentUser();
    const route = getInitialRoute();
    if (!storedUser && ['dashboard', 'questionnaire', 'planPreview'].includes(route.view)) {
      return route.view === 'planPreview' ? 'questionnaire' : route.view;
    }
    return '';
  });
  const [dashboardTab, setDashboardTab] = useState(initialRoute.tab || 'overview');

  const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem('nutriPlanLang') || 'en');
  const t = (key) => translations[currentLanguage]?.[key] || translations.en?.[key] || key;
  const langCode = currentLanguage;

  const isSubscriptionActive = (sub = subscriptionData) => {
    return checkSubscriptionActive(sub);
  };

  const getPathForView = (view, tab = 'overview') => {
    if (view === 'paywall') return `${APP_BASE_PATH}/subscription`;
    if (view === 'terms') return `${APP_BASE_PATH}/terms`;
    if (view === 'friends') return `${APP_BASE_PATH}/friends`;
    if (view === 'leaderboard') return `${APP_BASE_PATH}/leaderboard`;
    if (view === 'questionnaire') return `${APP_BASE_PATH}/questionnaire`;
    if (view === 'planPreview') return `${APP_BASE_PATH}/plan-preview`;
    if (view === 'register') return `${APP_BASE_PATH}/login`;
    if (view === 'verifyEmail') return `${APP_BASE_PATH}/verify-email`;
    if (view === 'dashboard') {
      if (tab === 'meals') return `${APP_BASE_PATH}/meal-plan`;
      if (tab === 'scanner') return `${APP_BASE_PATH}/food-scanner`;
      if (tab === 'progress_insights' || tab === 'progress' || tab === 'weight') return `${APP_BASE_PATH}/progress`;
      return `${APP_BASE_PATH}/dashboard`;
    }
    return APP_BASE_PATH || '/diet';
  };

  const navigateTo = (view, tab) => {
    if (tab) setDashboardTab(tab);
    setCurrentView(view);
    window.history.pushState(null, '', getPathForView(view, tab));
  };

  const generateAndSetPlans = (data = userData) => {
    if (!data) return;

    if (selectedPlanType.includes('nutrition')) {
      const age = parseInt(data.age, 10) || 30;
      let height = parseFloat(data.height) || 170;
      if (data.heightUnit === 'ft') {
        const ft = parseFloat(data.heightFeet) || 0;
        const inch = parseFloat(data.heightInches) || 0;
        height = (ft * 12 + inch) * 2.54;
      }

      let weight = parseFloat(data.weight) || 70;
      if (data.weightUnit === 'lbs') weight = weight / 2.20462;

      const gender = (data.gender || 'Female').toLowerCase();
      const activityMap = { 'Very low': 'sedentary', Light: 'light', Moderate: 'moderate', High: 'active', 'Very high': 'very_active' };
      const goalMap = { 'Lose weight': 'lose', 'Gain muscle': 'gain', 'Maintain weight': 'maintain', 'Build healthier eating habits': 'maintain' };
      const speedMap = { 'Slow and sustainable': 'slow', Moderate: 'moderate', Fast: 'fast' };

      const bmr = calculateBMR(gender, age, height, weight);
      const tdeeValue = calculateTDEE(bmr, activityMap[data.activityLevel] || 'light');
      const cals = calculateTargetCalories(tdeeValue, gender, goalMap[data.goal] || 'maintain', speedMap[data.speed] || 'moderate');
      const dietMap = { Vegetarian: 'vegetarian', Vegan: 'vegan', 'Low carb': 'low_carb', Mediterranean: 'mediterranean' };
      const macs = calculateMacros(cals, dietMap[data.diet] || 'anything');

      setTdee(tdeeValue);
      setTargetCalories(cals);
      setMacros(macs);
      setMealPlan(generateMealPlan(cals, macs, {
        ...data,
        allergies: Array.isArray(data.allergies) ? data.allergies.map((item) => item.toLowerCase()) : []
      }));
    }

    if (selectedPlanType.includes('workout')) {
      setWorkoutPlan(generateWorkoutPlan(data));
    }
  };

  useEffect(() => {
    seedDemoUsers();
    const params = new URLSearchParams(window.location.search);
    if (params.get('sessionId')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_email_verified, user_data, questionnaire_answers, calculated_plan, meal_plan, workout_plan, subscription_data, target_calories, macros, tdee, selected_plan_type')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (profile) {
            setIsEmailVerified(profile.is_email_verified);
            if (profile.meal_plan) setMealPlan(profile.meal_plan);
            if (profile.workout_plan) setWorkoutPlan(profile.workout_plan);
            if (profile.user_data) setUserData(profile.user_data);
            if (profile.questionnaire_answers) setQuestionnaireAnswers(profile.questionnaire_answers);
            if (profile.calculated_plan) setCalculatedPlan(profile.calculated_plan);
            if (profile.target_calories) setTargetCalories(profile.target_calories);
            if (profile.macros) setMacros(profile.macros);
            if (profile.tdee) setTdee(profile.tdee);
            if (profile.selected_plan_type) setSelectedPlanType(profile.selected_plan_type);
            if (profile.subscription_data) {
              setSubscriptionData(profile.subscription_data);
              saveSubscription(profile.subscription_data);
            }
          } else {
            setIsEmailVerified(false);
          }
        } else {
          setIsEmailVerified(true);
        }
      } catch (err) {
        console.error('Error checking initial session:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_email_verified, user_data, questionnaire_answers, calculated_plan, meal_plan, workout_plan, subscription_data, target_calories, macros, tdee, selected_plan_type')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          setIsEmailVerified(profile.is_email_verified);
          if (profile.meal_plan) setMealPlan(profile.meal_plan);
          if (profile.workout_plan) setWorkoutPlan(profile.workout_plan);
          if (profile.user_data) setUserData(profile.user_data);
          if (profile.questionnaire_answers) setQuestionnaireAnswers(profile.questionnaire_answers);
          if (profile.calculated_plan) setCalculatedPlan(profile.calculated_plan);
          if (profile.target_calories) setTargetCalories(profile.target_calories);
          if (profile.macros) setMacros(profile.macros);
          if (profile.tdee) setTdee(profile.tdee);
          if (profile.selected_plan_type) setSelectedPlanType(profile.selected_plan_type);
          if (profile.subscription_data) {
            setSubscriptionData(profile.subscription_data);
            saveSubscription(profile.subscription_data);
          }
        } else {
          setIsEmailVerified(false);
        }
      } else {
        setIsEmailVerified(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Route guard: if logged in but unverified, prevent access to protected screens
  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser && !isEmailVerified && !isAuthLoading) {
      const protectedViews = ['dashboard', 'paywall', 'friends', 'leaderboard', 'questionnaire', 'planPreview'];
      if (protectedViews.includes(currentView)) {
        navigateTo('verifyEmail');
      }
    }
  }, [currentView, isEmailVerified, isAuthLoading]);

  useEffect(() => {
    if (userData) localStorage.setItem('nutriPlanData', JSON.stringify(userData));
    if (subscriptionData) saveSubscription(subscriptionData);
    if (mealPlan) localStorage.setItem('nutriPlanResult', JSON.stringify(mealPlan));
    if (workoutPlan) localStorage.setItem('nutriPlanWorkoutResult', JSON.stringify(workoutPlan));
    if (targetCalories) localStorage.setItem('nutriPlanCals', JSON.stringify(targetCalories));
    if (macros) localStorage.setItem('nutriPlanMacros', JSON.stringify(macros));
    if (tdee) localStorage.setItem('nutriPlanTdee', JSON.stringify(tdee));
    if (selectedPlanType) localStorage.setItem('nutriPlanSelectedType', selectedPlanType);
    if (userEmail) localStorage.setItem('nutriPlanEmail', userEmail);
    if (lockedSessionId) localStorage.setItem('nutriPlanLockedSession', lockedSessionId);
  }, [userData, mealPlan, workoutPlan, targetCalories, macros, tdee, subscriptionData, userEmail, lockedSessionId, selectedPlanType]);

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('nutriPlanLang', lang);
  };

  const handleHeaderNav = (view, tab) => {
    navigateTo(view, tab);
  };

  const handleCalculateMyPlan = () => {
    if (!currentUser) {
      setContinueAfterLogin('questionnaire');
      navigateTo('register');
      return;
    }
    navigateTo('questionnaire');
  };

  const handleGeneratePlansManually = async () => {
    const dataForPlans = userData || createDefaultUserData();
    if (!userData) setUserData(dataForPlans);

    const age = parseInt(dataForPlans.age, 10) || 30;
    let height = parseFloat(dataForPlans.height) || 170;
    if (dataForPlans.heightUnit === 'ft') {
      const ft = parseFloat(dataForPlans.heightFeet) || 0;
      const inch = parseFloat(dataForPlans.heightInches) || 0;
      height = (ft * 12 + inch) * 2.54;
    }
    let weight = parseFloat(dataForPlans.weight) || 70;
    if (dataForPlans.weightUnit === 'lbs') weight = weight / 2.20462;
    const gender = (dataForPlans.gender || 'Female').toLowerCase();
    const activityMap = { 'Very low': 'sedentary', Light: 'light', Moderate: 'moderate', High: 'active', 'Very high': 'very_active' };
    const goalMap = { 'Lose weight': 'lose', 'Gain muscle': 'gain', 'Maintain weight': 'maintain', 'Build healthier eating habits': 'maintain' };
    const speedMap = { 'Slow and sustainable': 'slow', Moderate: 'moderate', Fast: 'fast' };

    const bmr = calculateBMR(gender, age, height, weight);
    const tdeeValue = calculateTDEE(bmr, activityMap[dataForPlans.activityLevel] || 'light');
    const cals = calculateTargetCalories(tdeeValue, gender, goalMap[dataForPlans.goal] || 'maintain', speedMap[dataForPlans.speed] || 'moderate');
    const dietMap = { Vegetarian: 'vegetarian', Vegan: 'vegan', 'Low carb': 'low_carb', Mediterranean: 'mediterranean' };
    const macs = calculateMacros(cals, dietMap[dataForPlans.diet] || 'anything');

    const generatedMeals = selectedPlanType.includes('nutrition')
      ? generateMealPlan(cals, macs, {
          ...dataForPlans,
          allergies: Array.isArray(dataForPlans.allergies) ? dataForPlans.allergies.map((item) => item.toLowerCase()) : []
        })
      : null;

    const generatedWorkout = selectedPlanType.includes('workout')
      ? generateWorkoutPlan(dataForPlans)
      : null;

    setTdee(tdeeValue);
    setTargetCalories(cals);
    setMacros(macs);
    setMealPlan(generatedMeals);
    setWorkoutPlan(generatedWorkout);

    const nextUser = getCurrentUser();
    if (nextUser) {
      const plansData = {
        userData: dataForPlans,
        questionnaireAnswers,
        calculatedPlan,
        mealPlan: generatedMeals,
        workoutPlan: generatedWorkout,
        subscriptionData,
        targetCalories: cals,
        macros: macs,
        tdee: tdeeValue,
        selectedPlanType
      };
      await saveUserPlansToSupabase(nextUser, plansData);
    }
  };

  const handleQuestionnaireComplete = async (answers, plan) => {
    const planUserData = answersToUserData(answers);
    setQuestionnaireAnswers(answers);
    setCalculatedPlan(plan);
    setUserData(planUserData);
    saveUserQuestionnairePlan(currentUser, answers, plan);

    const age = parseInt(planUserData.age, 10) || 30;
    let height = parseFloat(planUserData.height) || 170;
    if (planUserData.heightUnit === 'ft') {
      const ft = parseFloat(planUserData.heightFeet) || 0;
      const inch = parseFloat(planUserData.heightInches) || 0;
      height = (ft * 12 + inch) * 2.54;
    }
    let weight = parseFloat(planUserData.weight) || 70;
    if (planUserData.weightUnit === 'lbs') weight = weight / 2.20462;
    const gender = (planUserData.gender || 'Female').toLowerCase();
    const activityMap = { 'Very low': 'sedentary', Light: 'light', Moderate: 'moderate', High: 'active', 'Very high': 'very_active' };
    const goalMap = { 'Lose weight': 'lose', 'Gain muscle': 'gain', 'Maintain weight': 'maintain', 'Build healthier eating habits': 'maintain' };
    const speedMap = { 'Slow and sustainable': 'slow', Moderate: 'moderate', Fast: 'fast' };

    const bmr = calculateBMR(gender, age, height, weight);
    const tdeeValue = calculateTDEE(bmr, activityMap[planUserData.activityLevel] || 'light');
    const cals = calculateTargetCalories(tdeeValue, gender, goalMap[planUserData.goal] || 'maintain', speedMap[planUserData.speed] || 'moderate');
    const dietMap = { Vegetarian: 'vegetarian', Vegan: 'vegan', 'Low carb': 'low_carb', Mediterranean: 'mediterranean' };
    const macs = calculateMacros(cals, dietMap[planUserData.diet] || 'anything');

    const generatedMeals = selectedPlanType.includes('nutrition')
      ? generateMealPlan(cals, macs, {
          ...planUserData,
          allergies: Array.isArray(planUserData.allergies) ? planUserData.allergies.map((item) => item.toLowerCase()) : []
        })
      : null;

    const generatedWorkout = selectedPlanType.includes('workout')
      ? generateWorkoutPlan(planUserData)
      : null;

    setTdee(tdeeValue);
    setTargetCalories(cals);
    setMacros(macs);
    setMealPlan(generatedMeals);
    setWorkoutPlan(generatedWorkout);

    if (currentUser) {
      const plansData = {
        userData: planUserData,
        questionnaireAnswers: answers,
        calculatedPlan: plan,
        mealPlan: generatedMeals,
        workoutPlan: generatedWorkout,
        subscriptionData,
        targetCalories: cals,
        macros: macs,
        tdee: tdeeValue,
        selectedPlanType
      };
      await saveUserPlansToSupabase(currentUser, plansData);
    }

    if (checkSubscriptionActive(subscriptionData)) {
      navigateTo('dashboard');
    } else {
      navigateTo('planPreview');
    }
  };

  const handleUnlockFullPlan = () => {
    if (activeSubscription) {
      navigateTo('dashboard');
      return;
    }
    if (!calculatedPlan) {
      handleCalculateMyPlan();
      return;
    }
    navigateTo('paywall');
  };

  const handleEmailSubmit = (email, sessionId, bypassEmail) => {
    setUserEmail(email);
    setLockedSessionId(sessionId);
    setSubscriptionData({ paymentStatus: 'unpaid', hasActiveSubscription: false, generatedMealPlanLocked: true });
    if (bypassEmail) {
      setCurrentView('paywall');
    } else {
      setCurrentView('emailSent');
      window.setTimeout(() => setCurrentView('paywall'), 1200);
    }
  };

  const handlePaymentSuccess = async (newSubData) => {
    setSubscriptionData(newSubData);
    saveSubscription(newSubData);
    const dataForPlans = userData || createDefaultUserData();
    if (!userData) setUserData(dataForPlans);
    generateAndSetPlans(dataForPlans);
    
    // Save to remote DB immediately if user is logged in
    const nextUser = getCurrentUser();
    if (nextUser) {
      // Calculate plans synchronously so we don't have to wait for state updates
      const age = parseInt(dataForPlans.age, 10) || 30;
      let height = parseFloat(dataForPlans.height) || 170;
      if (dataForPlans.heightUnit === 'ft') {
        const ft = parseFloat(dataForPlans.heightFeet) || 0;
        const inch = parseFloat(dataForPlans.heightInches) || 0;
        height = (ft * 12 + inch) * 2.54;
      }
      let weight = parseFloat(dataForPlans.weight) || 70;
      if (dataForPlans.weightUnit === 'lbs') weight = weight / 2.20462;
      const gender = (dataForPlans.gender || 'Female').toLowerCase();
      const activityMap = { 'Very low': 'sedentary', Light: 'light', Moderate: 'moderate', High: 'active', 'Very high': 'very_active' };
      const goalMap = { 'Lose weight': 'lose', 'Gain muscle': 'gain', 'Maintain weight': 'maintain', 'Build healthier eating habits': 'maintain' };
      const speedMap = { 'Slow and sustainable': 'slow', Moderate: 'moderate', Fast: 'fast' };
      
      const bmr = calculateBMR(gender, age, height, weight);
      const tdeeValue = calculateTDEE(bmr, activityMap[dataForPlans.activityLevel] || 'light');
      const cals = calculateTargetCalories(tdeeValue, gender, goalMap[dataForPlans.goal] || 'maintain', speedMap[dataForPlans.speed] || 'moderate');
      const dietMap = { Vegetarian: 'vegetarian', Vegan: 'vegan', 'Low carb': 'low_carb', Mediterranean: 'mediterranean' };
      const macs = calculateMacros(cals, dietMap[dataForPlans.diet] || 'anything');
      
      const generatedMeals = selectedPlanType.includes('nutrition')
        ? generateMealPlan(cals, macs, {
            ...dataForPlans,
            allergies: Array.isArray(dataForPlans.allergies) ? dataForPlans.allergies.map((item) => item.toLowerCase()) : []
          })
        : null;
        
      const generatedWorkout = selectedPlanType.includes('workout')
        ? generateWorkoutPlan(dataForPlans)
        : null;

      const plansData = {
        userData: dataForPlans,
        questionnaireAnswers,
        calculatedPlan,
        mealPlan: generatedMeals,
        workoutPlan: generatedWorkout,
        subscriptionData: newSubData,
        targetCalories: cals,
        macros: macs,
        tdee: tdeeValue,
        selectedPlanType
      };
      
      await saveUserPlansToSupabase(nextUser, plansData);
    }
    
    setCurrentView('paymentSuccess');
    window.history.pushState(null, '', `${APP_BASE_PATH}/dashboard`);
    window.setTimeout(() => navigateTo('dashboard'), 1400);
  };

  const handleSubscriptionChange = (updatedSubData) => {
    setSubscriptionData(updatedSubData);
    saveSubscription(updatedSubData);
  };



  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signout warning:', err);
    }
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setSubscriptionData(null);
    localStorage.removeItem('nutriPlanSubscription');
    localStorage.removeItem('subscriptionActive');
    localStorage.removeItem('cancelAtPeriodEnd');
    localStorage.removeItem('selectedPlan');
    localStorage.removeItem('selectedPlanPrice');
    localStorage.removeItem('subscriptionDate');
    localStorage.removeItem('renewalDate');
    navigateTo('register');
  };

  const handleAddFriend = (friendUsername) => {
    if (!currentUser) return;
    addFriend(currentUser, friendUsername);
    setSelectedFriend({});
  };

  const handleCompete = (friendUsername) => {
    if (!currentUser) return;
    addCompetition({
      id: Date.now().toString(),
      user1Id: currentUser,
      user2Id: friendUsername,
      createdAt: new Date().toISOString(),
      status: 'In Process'
    });
    setSelectedFriend({ username: friendUsername });
    setCurrentView('compete');
  };

  const activeSubscription = isSubscriptionActive();
  const showHeader = ['landing', 'planSelection', 'dashboard', 'paywall', 'paymentSuccess', 'register', 'terms', 'usersDashboard', 'compete', 'friends', 'leaderboard', 'questionnaire', 'planPreview', 'verifyEmail'].includes(currentView);

  return (
    <>
      {showHeader && (
        <Header
          currentView={currentView}
          currentUser={currentUser}
          hasUserData={Boolean(userData)}
          hasActiveSubscription={activeSubscription}
          setCurrentView={handleHeaderNav}
          onDashboardTab={setDashboardTab}
          onResetApp={handleCalculateMyPlan}
          onLogout={handleLogout}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          t={t}
        />
      )}

      <main style={{ minHeight: showHeader ? 'calc(100vh - 150px)' : '100vh', padding: showHeader ? '2rem 0' : '0' }}>
        {currentView === 'landing' && <LandingPage onStart={() => navigateTo('planSelection')} t={t} />}
        {currentView === 'planSelection' && <PlanTypeSelection onSelectPlanType={(type) => { setSelectedPlanType(type); setCurrentView('quiz'); }} t={t} />}
        {currentView === 'register' && <Register onRegisterSuccess={(email, verified, dbProfile) => {
          setUserEmail(email);
          setIsEmailVerified(verified);
          const nextUser = getCurrentUser();
          
          if (dbProfile) {
            if (dbProfile.user_data) setUserData(dbProfile.user_data);
            if (dbProfile.questionnaire_answers) setQuestionnaireAnswers(dbProfile.questionnaire_answers);
            if (dbProfile.calculated_plan) setCalculatedPlan(dbProfile.calculated_plan);
            if (dbProfile.meal_plan) setMealPlan(dbProfile.meal_plan);
            if (dbProfile.workout_plan) setWorkoutPlan(dbProfile.workout_plan);
            if (dbProfile.target_calories) setTargetCalories(dbProfile.target_calories);
            if (dbProfile.macros) setMacros(dbProfile.macros);
            if (dbProfile.tdee) setTdee(dbProfile.tdee);
            if (dbProfile.selected_plan_type) setSelectedPlanType(dbProfile.selected_plan_type);
            
            if (dbProfile.subscription_data) {
              setSubscriptionData(dbProfile.subscription_data);
              saveSubscription(dbProfile.subscription_data);
            } else {
              const guestSub = safeJsonParse(localStorage.getItem('nutriPlanSubscription'), null);
              if (guestSub && guestSub.hasActiveSubscription) {
                guestSub.userId = nextUser;
                setSubscriptionData(guestSub);
                saveSubscription(guestSub);
              } else {
                setSubscriptionData(null);
                localStorage.removeItem('nutriPlanSubscription');
                localStorage.removeItem('subscriptionActive');
                localStorage.removeItem('cancelAtPeriodEnd');
                localStorage.removeItem('selectedPlan');
                localStorage.removeItem('selectedPlanPrice');
                localStorage.removeItem('subscriptionDate');
                localStorage.removeItem('renewalDate');
              }
            }

            // Sync guest data if remote profile is empty
            if (!dbProfile.user_data && userData) {
              const plansData = {
                userData,
                questionnaireAnswers,
                calculatedPlan,
                mealPlan,
                workoutPlan,
                subscriptionData: dbProfile.subscription_data || safeJsonParse(localStorage.getItem('nutriPlanSubscription'), null),
                targetCalories,
                macros,
                tdee,
                selectedPlanType
              };
              saveUserPlansToSupabase(nextUser, plansData);
            }
          } else {
            const savedQuestionnaire = getUserQuestionnairePlan(nextUser);
            setQuestionnaireAnswers(savedQuestionnaire.questionnaireAnswers);
            setCalculatedPlan(savedQuestionnaire.calculatedPlan);
            const userSub = getUserSubscription(nextUser);
            if (userSub) {
              setSubscriptionData(userSub);
              saveSubscription(userSub);
            }
          }
          
          if (!verified) {
            navigateTo('verifyEmail');
          } else {
            navigateTo(continueAfterLogin || (userData ? 'dashboard' : 'planSelection'));
          }
          setContinueAfterLogin('');
        }} t={t} />}

        {currentView === 'verifyEmail' && (
          <VerifyEmail 
            email={userEmail} 
            onBackToLogin={handleLogout} 
            onVerificationSuccess={() => {
              setIsEmailVerified(true);
              const nextUser = getCurrentUser();
              if (nextUser) {
                const plansData = {
                  userData,
                  questionnaireAnswers,
                  calculatedPlan,
                  mealPlan,
                  workoutPlan,
                  subscriptionData,
                  targetCalories,
                  macros,
                  tdee,
                  selectedPlanType
                };
                saveUserPlansToSupabase(nextUser, plansData);
              }
              navigateTo('dashboard');
            }}
            t={t} 
          />
        )}

        {currentView === 'usersDashboard' && (
          <UsersDashboard currentUser={currentUser} onAddFriend={handleAddFriend} onCompete={handleCompete} t={t} />
        )}

        {currentView === 'compete' && selectedFriend && (
          <CompeteWithFriend currentUser={currentUser} friendUsername={selectedFriend.username} t={t} />
        )}

        {currentView === 'friends' && (
          <FriendsPage currentUser={currentUser} onRequireLogin={() => navigateTo('register')} />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardPage currentUser={currentUser} onOpenFriends={() => navigateTo('friends')} />
        )}

        {currentView === 'questionnaire' && (
          <QuestionnairePage
            currentUser={currentUser}
            initialAnswers={questionnaireAnswers}
            onSubmit={handleQuestionnaireComplete}
            onRequireLogin={() => {
              setContinueAfterLogin('questionnaire');
              navigateTo('register');
            }}
            t={t}
          />
        )}

        {currentView === 'planPreview' && (
          <PlanPreviewPage
            calculatedPlan={calculatedPlan}
            questionnaireAnswers={questionnaireAnswers}
            isSubscribed={activeSubscription}
            onUnlock={handleUnlockFullPlan}
            onRecalculate={handleCalculateMyPlan}
            onDashboard={() => navigateTo('dashboard')}
          />
        )}

        {currentView === 'quiz' && <QuizFlow onComplete={(data) => { setUserData(data); setCurrentView('emailCapture'); }} selectedPlanType={selectedPlanType} t={t} />}
        {currentView === 'emailCapture' && <EmailCapture onSubmit={handleEmailSubmit} selectedPlanType={selectedPlanType} currentLanguage={currentLanguage} t={t} />}

        {currentView === 'emailSent' && (
          <div className="container flex-col items-center justify-center animate-fade-in status-screen">
            <span className="material-symbols-outlined text-primary animate-pulse">mark_email_read</span>
            <h2>{t('emailSent')}</h2>
            <p className="text-muted">Redirecting to secure checkout...</p>
          </div>
        )}

        {currentView === 'paywall' && (
          <Paywall
            onPaymentSuccess={handlePaymentSuccess}
            onSubscriptionChange={handleSubscriptionChange}
            onResetApp={handleCalculateMyPlan}
            onOpenTerms={() => navigateTo('terms')}
            selectedPlanType={selectedPlanType}
            subscriptionData={subscriptionData}
            currentUser={currentUser}
            t={t}
          />
        )}

        {currentView === 'terms' && <TermsPolicies onBack={() => navigateTo(userData ? 'dashboard' : 'landing')} onSubscribe={handleUnlockFullPlan} />}

        {currentView === 'paymentSuccess' && (
          <div className="container flex-col items-center justify-center animate-fade-in status-screen">
            <span className="material-symbols-outlined text-primary">check_circle</span>
            <h2>{t('paymentSuccessTitle')}</h2>
            <p className="text-muted">{t('paymentSuccessSubtitle')}</p>
            <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>{t('btnGoToDashboard')}</button>
          </div>
        )}

        {currentView === 'dashboard' && activeSubscription && (
          <ResultsDashboard
            mealPlan={mealPlan || []}
            workoutPlan={workoutPlan}
            selectedPlanType={selectedPlanType}
            setMealPlan={setMealPlan}
            targetCalories={targetCalories}
            macros={macros}
            user={userData || createDefaultUserData()}
            tdee={tdee}
            subscriptionData={subscriptionData}
            onCreateNewPlan={handleCalculateMyPlan}
            onGeneratePlans={handleGeneratePlansManually}
            activeTab={dashboardTab}
            onActiveTabChange={(tab) => {
              setDashboardTab(tab);
              window.history.pushState(null, '', getPathForView('dashboard', tab));
            }}
            onOpenLeaderboard={() => navigateTo('leaderboard')}
            t={t}
          />
        )}

        {currentView === 'dashboard' && !activeSubscription && (
          <div className="container locked-preview">
            <span className="material-symbols-outlined text-primary">lock</span>
            <h2>{langCode === 'en' ? 'Premium sections are locked' : 'Plan Locked'}</h2>
            <p className="text-muted">
              Complete a short questionnaire first so NutriPlan can calculate your personalized plan.
            </p>
            <div className="locked-preview-grid">
              {['Overview', 'Meal Plan', 'Food Scanner', 'Macro Tracking', 'Progress Insights'].map((item) => (
                <button className="card locked-feature-card" key={item} onClick={handleCalculateMyPlan}>
                  <span className="material-symbols-outlined text-primary">lock</span>
                  <strong>{item}</strong>
                  <p className="text-muted">Premium access</p>
                  <span className="btn btn-outline btn-sm">Calculate My Plan</span>
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={handleCalculateMyPlan}>Calculate My Plan</button>
          </div>
        )}
      </main>

      {showHeader && (
        <footer className="footer">
          <div className="container">
            <p>NutriPlan Global © {new Date().getFullYear()}</p>
            <button className="footer-link" onClick={() => navigateTo('terms')}>Terms & Policies</button>
            <p className="footer-disclaimer">{t('disclaimerText')}</p>
          </div>
        </footer>
      )}
    </>
  );
}

export default App;
