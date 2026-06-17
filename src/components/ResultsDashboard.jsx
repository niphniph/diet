import { useState, useEffect, useRef } from 'react';
import { getAllUsers, getCurrentUser, getWeightEntries, setWeightEntries as persistWeightEntries, updateUserPerformance } from '../utils/localStorage';
import MealCard from './MealCard';
import GroceryList from './GroceryList';
import WorkoutCard from './WorkoutCard';
import { generateSingleMeal, generateGroceryList } from '../utils/mealGenerator';

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

// Helper to satisfy purity linter rule for Date.now
const getTimestamp = () => Date.now();

const ResultsDashboard = ({ mealPlan = [], workoutPlan, selectedPlanType, setMealPlan, targetCalories, macros, user, tdee, subscriptionData, onCreateNewPlan, activeTab: requestedTab = 'overview', onActiveTabChange, onOpenLeaderboard, t }) => {
  const langCode = t('home') === 'Home' ? 'en' : 'ka';

  // Dynamic Tabs Adaptability
  const getTabs = () => {
    const list = [{ id: 'overview', name: t('overview') }];
    
    if (selectedPlanType === 'nutrition_only') {
      list.push(
        { id: 'meals', name: t('tabMealPlan') },
        { id: 'macros', name: t('macroTracking') },
        { id: 'scanner', name: t('smartFoodScan') },
        { id: 'progress_insights', name: t('progressInsights') },
        { id: 'grocery', name: t('tabGroceryList') }
      );
    } else if (selectedPlanType === 'workout_only') {
      list.push(
        { id: 'workout', name: t('tabWorkoutPlan') },
        { id: 'weight', name: t('weightProgress') },
        { id: 'tools', name: t('tools') },
        { id: 'progress', name: t('tabProgress') }
      );
    } else {
      // bundle
      list.push(
        { id: 'meals', name: t('tabMealPlan') },
        { id: 'workout', name: t('tabWorkoutPlan') },
        { id: 'macros', name: t('macroTracking') },
        { id: 'scanner', name: t('smartFoodScan') },
        { id: 'progress_insights', name: t('progressInsights') },
        { id: 'grocery', name: t('tabGroceryList') },
        { id: 'tools', name: t('tools') }
      );
    }

    return list;
  };

  // Active Tab
  const activeTab = requestedTab;
  const setActiveTab = (tab) => {
    onActiveTabChange?.(tab);
  };

  // Rest Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [initialTime, setInitialTime] = useState(60);
  const timerRef = useRef(null);

  // Set Completion State
  const [completedSets, setCompletedSets] = useState({});

  // Workout Progress State
  const [completedWorkouts, setCompletedWorkouts] = useState(() => {
    const saved = localStorage.getItem('workoutProgress');
    return safeJsonParse(saved, {});
  });

  // Food logs state
  const [foodLogs, setFoodLogs] = useState(() => {
    const saved = localStorage.getItem('foodLogs');
    return safeJsonParse(saved, []);
  });

  // Weight entries state per logged-in user
  const currentUsername = getCurrentUser();
  const [performerRefreshKey, setPerformerRefreshKey] = useState(0);
  const [weightEntries, setWeightEntries] = useState(() => {
    if (!currentUsername) return [];
    return getWeightEntries(currentUsername);
  });

  // Save states
  useEffect(() => {
    localStorage.setItem('foodLogs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  // Persist weight entries when they change
  useEffect(() => {
    if (currentUsername) {
      persistWeightEntries(currentUsername, weightEntries);
    }
  }, [weightEntries, currentUsername]);

  // Sync weight entries reset event
  useEffect(() => {
    const handleWeightReset = () => {
      setWeightEntries([]);
    };
    window.addEventListener('weightProgressReset', handleWeightReset);
    return () => window.removeEventListener('weightProgressReset', handleWeightReset);
  }, []);

  // Timer runner
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            setTimeout(() => {
              alert(langCode === 'en' ? 'Rest time is over! Prepare for your next set.' : 'დასვენების დრო ამოიწურა! მოემზადეთ შემდეგი სეტისთვის.');
            }, 50);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timeLeft, langCode]);

  // Active Days Indexing
  const [viewDay, setViewDay] = useState(1);
  const [viewWorkoutDay, setViewWorkoutDay] = useState(1);

  // Meal replace helper
  const handleReplaceMeal = (dayIndex, mealIndex, mealType) => {
    const mealCals = mealPlan[dayIndex].meals[mealIndex].calories;
    const mealMacros = {
      protein: mealPlan[dayIndex].meals[mealIndex].macros.protein,
      carbs: mealPlan[dayIndex].meals[mealIndex].macros.carbs,
      fat: mealPlan[dayIndex].meals[mealIndex].macros.fat
    };
    const excludeIds = [mealPlan[dayIndex].meals[mealIndex].id.split('_').slice(0, -1).join('_')];
    const newMeal = generateSingleMeal(mealCals, mealMacros, mealType, user, excludeIds);
    const newPlan = [...mealPlan];
    newPlan[dayIndex].meals[mealIndex] = newMeal;
    setMealPlan(newPlan);
  };

  // Exercise replace helper
  const handleReplaceExercise = (dayId, exerciseIndex) => {
    if (!workoutPlan) return;
    const newPlan = { ...workoutPlan };
    const dayIndex = newPlan.days.findIndex(d => d.id === dayId);
    if (dayIndex === -1) return;
    const exercise = newPlan.days[dayIndex].exercises[exerciseIndex];
    if (exercise.replacements && exercise.replacements.length > 0) {
      const repName = exercise.replacements[Math.floor(Math.random() * exercise.replacements.length)];
      const swappedEx = {
        name: repName,
        category: exercise.category,
        primaryMuscles: exercise.primaryMuscles,
        equipmentRequired: 'Alternative',
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest,
        instructions: `Alternative exercise: ${repName}`,
        replacements: [exercise.name]
      };
      newPlan.days[dayIndex].exercises[exerciseIndex] = swappedEx;
      alert(langCode === 'en' ? `Swapped to alternative: ${repName}` : `ჩანაცვლდა ალტერნატივით: ${repName}`);
    }
  };

  // REST TIMER WIDGET HANDLERS
  const startTimer = (secs) => {
    setTimeLeft(secs || initialTime);
    setTimerActive(true);
  };
  const pauseTimer = () => {
    setTimerActive(false);
  };
  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(initialTime);
  };

  // SET COMPLETION LOGGER
  const toggleSetComplete = (exerciseName, setNum) => {
    const key = `${exerciseName}-set-${setNum}`;
    setCompletedSets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // WORKOUT DAY LOGGER
  const logWorkoutComplete = (dayName) => {
    const updated = { ...completedWorkouts, [dayName]: true };
    setCompletedWorkouts(updated);
    localStorage.setItem('workoutProgress', JSON.stringify(updated));
    updateUserPerformance(currentUsername, {
      dailyAccomplishments: 1,
      totalCompletedTasks: 1,
      totalWorkouts: completedWorkouts[dayName] ? 0 : 1
    });
    setPerformerRefreshKey((value) => value + 1);
    alert(langCode === 'en' ? `${dayName} workout logged successfully!` : `${dayName}-ის ვარჯიში წარმატებით ჩაიწერა!`);
  };

  // FOOD SCANNER SIMULATION STATE
  const [scanModeTab, setScanModeTab] = useState('photo'); // 'barcode', 'photo'
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeResult, setBarcodeResult] = useState(null);
  const [barcodeSearchLoading, setBarcodeSearchLoading] = useState(false);
  const [scanMode, setScanMode] = useState('idle'); // 'idle', 'camera', 'upload', 'scanning', 'result'
  const [selectedDashboardDate, setSelectedDashboardDate] = useState(() => {
    const saved = localStorage.getItem('selectedDashboardDate');
    return saved ? saved : new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    localStorage.setItem('selectedDashboardDate', selectedDashboardDate);
  }, [selectedDashboardDate]);

  const handleBarcodeSearch = () => {
    if (!barcodeInput) return;
    setBarcodeSearchLoading(true);
    setTimeout(() => {
      setBarcodeSearchLoading(false);
      if (barcodeInput === '404') {
        setBarcodeResult(null);
        alert(langCode === 'en' ? 'Product not found. You can add it manually.' : 'პროდუქტი ვერ მოიძებნა. შეგიძლიათ დაამატოთ ხელით.');
      } else {
        setBarcodeResult({
          foodName: 'Protein Bar',
          calories: 220,
          protein: 20,
          carbs: 22,
          fat: 8,
          portion: '1 bar',
          brand: 'MockBrand'
        });
      }
    }, 800);
  };

  const handleSaveBarcode = () => {
    if (!barcodeResult) return;
    const newLog = {
      id: 'barcode_' + Date.now(),
      date: selectedDashboardDate,
      mealType: 'snack',
      imagePreview: '',
      foodName: barcodeResult.foodName,
      calories: parseInt(barcodeResult.calories) || 0,
      protein: parseInt(barcodeResult.protein) || 0,
      carbs: parseInt(barcodeResult.carbs) || 0,
      fat: parseInt(barcodeResult.fat) || 0,
      confidence: 'Barcode',
      source: "barcode",
      createdAt: Date.now()
    };
    setFoodLogs(prev => [...prev, newLog]);
    updateUserPerformance(currentUsername, {
      dailyAccomplishments: 1,
      totalCompletedTasks: 1,
      totalCaloriesLogged: newLog.calories,
      streak: streakStats.currentStreak + 1
    });
    setPerformerRefreshKey((value) => value + 1);
    setBarcodeResult(null);
    setBarcodeInput('');
    alert(langCode === 'en' ? 'Barcode item saved successfully!' : 'ბარკოდის პროდუქტი წარმატებით შეინახა!');
    setActiveTab('progress_insights');
  };
  const [scannerProgress, setScannerProgress] = useState(0);
  const [scannedMealName, setScannedMealName] = useState('');
  const [scannedCals, setScannedCals] = useState(520);
  const [scannedProtein, setScannedProtein] = useState(38);
  const [scannedCarbs, setScannedCarbs] = useState(55);
  const [scannedFat, setScannedFat] = useState(16);
  const [scannedType, setScannedType] = useState('lunch');
  const [scannedConfidence, setScannedConfidence] = useState('Medium');
  const [scannedPortion, setScannedPortion] = useState('1 plate (approx 400g)');
  const [scannedImage, setScannedImage] = useState('');

  const foodTemplates = [
    { name: langCode === 'en' ? 'Oatmeal with Almonds & Berries' : 'შვრიის ფაფა ნუშითა და კენკრით', cals: 320, p: 10, c: 54, f: 6, type: 'breakfast', confidence: 'High', portion: '1 bowl (approx 350g)', img: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=400&q=80' },
    { name: langCode === 'en' ? 'Grilled Salmon & Asparagus' : 'ორაგული გრილზე და სატაცური', cals: 480, p: 38, c: 10, f: 28, type: 'dinner', confidence: 'High', portion: '1 fillet + 6 spears', img: 'https://images.unsplash.com/photo-1485962398705-ef6a17c267a0?auto=format&fit=crop&w=400&q=80' },
    { name: langCode === 'en' ? 'Avocado Chicken Wrap' : 'ქათმის რულეტი ავოკადოთი', cals: 420, p: 32, c: 38, f: 12, type: 'lunch', confidence: 'High', portion: '1 wrap (approx 250g)', img: 'https://images.unsplash.com/photo-1626700051175-6518c4793f06?auto=format&fit=crop&w=400&q=80' },
    { name: langCode === 'en' ? 'Greek Yogurt Greek Cup' : 'ბერძნული იოგურტის თასი', cals: 220, p: 20, c: 18, f: 4, type: 'snack', confidence: 'High', portion: '1 cup (approx 200g)', img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80' },
    { name: langCode === 'en' ? 'Chicken rice bowl' : 'ქათამი ბრინჯის თასით', cals: 520, p: 38, c: 55, f: 16, type: 'lunch', confidence: 'Medium', portion: '1 plate (approx 450g)', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' }
  ];

  const handleSimulateScan = async (template) => {
    setScanMode('scanning');
    setScannerProgress(0);
    setScannedImage(template.img || '');

    // Animate progress sweep
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setScannerProgress(prog);
    }, 100);

    try {
      // TODO: Replace this local estimate with a backend AI food-image analysis endpoint.
      const data = {
        success: true,
        foodName: template.name,
        calories: template.cals,
        protein: template.p,
        carbs: template.c,
        fat: template.f,
        confidence: template.confidence,
        portionEstimate: template.portion
      };

      clearInterval(interval);
      setScannerProgress(100);

      setTimeout(() => {
        if (data && data.success) {
          setScannedMealName(data.foodName);
          setScannedCals(data.calories);
          setScannedProtein(data.protein);
          setScannedCarbs(data.carbs);
          setScannedFat(data.fat);
          setScannedConfidence(data.confidence || 'Medium');
          setScannedPortion(data.portionEstimate || '1 plate');
        } else {
          // Local fallback
          setScannedMealName(template.name);
          setScannedCals(template.cals);
          setScannedProtein(template.p);
          setScannedCarbs(template.c);
          setScannedFat(template.f);
          setScannedConfidence(template.confidence);
          setScannedPortion(template.portion);
        }
        setScanMode('result');
      }, 300);

    } catch {
      clearInterval(interval);
      setScannerProgress(100);
      
      setTimeout(() => {
        setScannedMealName(template.name);
        setScannedCals(template.cals);
        setScannedProtein(template.p);
        setScannedCarbs(template.c);
        setScannedFat(template.f);
        setScannedConfidence(template.confidence);
        setScannedPortion(template.portion);
        setScanMode('result');
      }, 300);
    }
  };

  const handleSaveScanLog = () => {
    const today = new Date().toISOString().split('T')[0];
    const newLog = {
      id: 'scan_' + getTimestamp(),
      date: today,
      mealType: scannedType,
      imagePreview: scannedImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      foodName: scannedMealName || (langCode === 'en' ? 'Scanned Food Item' : 'სკანირებული საკვები'),
      calories: parseInt(scannedCals) || 0,
      protein: parseInt(scannedProtein) || 0,
      carbs: parseInt(scannedCarbs) || 0,
      fat: parseInt(scannedFat) || 0,
      confidence: scannedConfidence,
      source: "scanner",
      createdAt: getTimestamp()
    };
    setFoodLogs(prev => [...prev, newLog]);
    updateUserPerformance(currentUsername, {
      dailyAccomplishments: 1,
      totalCompletedTasks: 1,
      totalCaloriesLogged: newLog.calories,
      streak: streakStats.currentStreak + 1
    });
    setPerformerRefreshKey((value) => value + 1);
    alert(langCode === 'en' ? 'Meal logged successfully!' : 'საკვები წარმატებით ჩაიწერა!');
    setScanMode('idle');
    
    // Switch to progress insights immediately so the user can see the food calendar.
    setActiveTab('progress_insights');
    setSelectedCalendarDay(today);
  };

  // CALENDAR CURRENT MONTH/YEAR & MANUAL STATE
  const [calendarDate, setCalendarDate] = useState(new Date());
  const calMonth = calendarDate.getMonth();
  const calYear = calendarDate.getFullYear();

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calYear, calMonth - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarDate(new Date(calYear, calMonth + 1, 1));
  };

  const [manualName, setManualName] = useState('');
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualType, setManualType] = useState('breakfast');
  const [manualCals, setManualCals] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);

  const handleAddManualMeal = (e) => {
    e.preventDefault();
    if (!manualName || !manualCals) {
      alert(langCode === 'en' ? 'Please fill out meal name and calories.' : 'გთხოვთ შეავსოთ საკვების სახელი და კალორიები.');
      return;
    }
    const newLog = {
      id: 'manual_' + getTimestamp(),
      date: manualDate,
      mealType: manualType,
      imagePreview: '',
      foodName: manualName,
      calories: parseInt(manualCals) || 0,
      protein: parseInt(manualProtein) || 0,
      carbs: parseInt(manualCarbs) || 0,
      fat: parseInt(manualFat) || 0,
      confidence: '100% Manual',
      source: "manual",
      createdAt: getTimestamp()
    };
    setFoodLogs(prev => [...prev, newLog]);
    setManualName('');
    setManualCals('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setShowManualForm(false);
    setSelectedCalendarDay(manualDate);
    alert(langCode === 'en' ? 'Meal added manually!' : 'საკვები დაემატა ხელით!');
  };

  const removeMealLog = (id) => {
    if (window.confirm(langCode === 'en' ? 'Are you sure you want to remove this log?' : 'დარწმუნებული ხართ, რომ გსურთ ჩანაწერის წაშლა?')) {
      setFoodLogs(prev => prev.filter(log => log.id !== id));
    }
  };

  // CALENDAR STREAKS & BADGES CALCULATION
  const getStreakStats = () => {
    const loggedDates = [...new Set(foodLogs.map(log => log.date))].sort();
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    const checkDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (loggedDates.includes(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    let lastDate = null;
    loggedDates.forEach(dStr => {
      const d = new Date(dStr);
      if (!lastDate) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(d - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
      lastDate = d;
    });

    return {
      totalLogged: loggedDates.length,
      currentStreak,
      bestStreak: Math.max(maxStreak, currentStreak)
    };
  };

  const streakStats = getStreakStats();
  const allPerformers = performerRefreshKey >= 0 ? getAllUsers().sort((a, b) => Number(b.points || 0) - Number(a.points || 0)) : [];
  const topPerformers = allPerformers.slice(0, 3);
  const currentRank = allPerformers.findIndex((performer) => performer.username === currentUsername || performer.id === currentUsername) + 1;

  // WEIGHT PROGRESS TRACKER STATE & METRICS
  const [newWeight, setNewWeight] = useState('');
  const [weightDate, setWeightDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [weightNote, setWeightNote] = useState('');

  const handleAddWeightEntry = (e) => {
    e.preventDefault();
    if (!newWeight) return;
    const entry = {
      id: 'weight_' + Date.now(),
      date: weightDate,
      weight: parseFloat(newWeight),
      note: weightNote || (langCode === 'en' ? 'Logged weight' : 'წონა ჩაიწერა'),
      createdAt: Date.now()
    };
    
    // Check if entry for today already exists, and if so overwrite it, otherwise append
    const existsIdx = weightEntries.findIndex(e => e.date === entry.date);
    if (existsIdx !== -1) {
      const updated = [...weightEntries];
      updated[existsIdx] = entry;
      setWeightEntries(updated);
    } else {
      setWeightEntries(prev => [...prev, entry]);
    }
    
    setNewWeight('');
    setWeightNote('');
    alert(langCode === 'en' ? 'Weight entry saved successfully!' : 'წონის ჩანაწერი წარმატებით შეინახა!');
  };

  const removeWeightEntry = (id) => {
    if (window.confirm(langCode === 'en' ? 'Delete weight entry?' : 'წავშალოთ წონის ჩანაწერი?')) {
      setWeightEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const goalWeight = user?.goal?.toLowerCase().includes('lose') || String(user?.goal).includes('კლება')
    ? parseFloat(user?.weight || 75) - 5
    : user?.goal?.toLowerCase().includes('gain') || String(user?.goal).includes('მომატება')
      ? parseFloat(user?.weight || 75) + 5
      : parseFloat(user?.weight || 75);

  const getWeightMetrics = () => {
    if (weightEntries.length === 0) {
      return {
        startingWeight: parseFloat(user?.weight || 75),
        currentWeight: parseFloat(user?.weight || 75),
        totalChange: 0,
        weeklyAverage: parseFloat(user?.weight || 75),
        previousWeeklyAverage: parseFloat(user?.weight || 75),
        trend: 'stable',
        trendText: langCode === 'en' ? 'Stable' : 'სტაბილური'
      };
    }

    const sorted = [...weightEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const startingWeight = sorted[0].weight;
    const currentWeight = sorted[sorted.length - 1].weight;
    const totalChange = currentWeight - startingWeight;

    // Filter current week vs previous week
    const now = new Date();
    const startOfCurrentWeek = new Date();
    startOfCurrentWeek.setDate(now.getDate() - 7);
    const startOfPreviousWeek = new Date();
    startOfPreviousWeek.setDate(now.getDate() - 14);

    const currentWeekEntries = sorted.filter(e => {
      const d = new Date(e.date);
      return d >= startOfCurrentWeek && d <= now;
    });

    const previousWeekEntries = sorted.filter(e => {
      const d = new Date(e.date);
      return d >= startOfPreviousWeek && d < startOfCurrentWeek;
    });

    const calcAvg = (entries) => {
      if (entries.length === 0) return 0;
      const sum = entries.reduce((acc, c) => acc + c.weight, 0);
      return sum / entries.length;
    };

    const weeklyAverage = calcAvg(currentWeekEntries) || currentWeight;
    const previousWeeklyAverage = calcAvg(previousWeekEntries) || startingWeight;

    // Trend calculation
    const diff = weeklyAverage - previousWeeklyAverage;
    const isLose = user?.goal?.toLowerCase().includes('lose') || String(user?.goal).includes('კლება');
    const isGain = user?.goal?.toLowerCase().includes('gain') || String(user?.goal).includes('მომატება');

    let trend;
    let trendText;

    if (Math.abs(diff) < 0.25) {
      trend = 'stable';
      if (langCode === 'ka') {
        trendText = 'სტაბილური';
      } else {
        trendText = 'Stable';
      }
    } else if (diff < 0) {
      trend = 'down';
      if (langCode === 'ka') {
        trendText = isLose ? 'კლება (დადებითი!)' : 'კლება';
      } else {
        trendText = isLose ? 'Decreasing (Positive!)' : 'Decreasing';
      }
    } else {
      trend = 'up';
      if (langCode === 'ka') {
        trendText = isGain ? 'მატება (დადებითი!)' : 'მატება';
      } else {
        trendText = isGain ? 'Increasing (Positive!)' : 'Increasing';
      }
    }

    return {
      startingWeight,
      currentWeight,
      totalChange,
      weeklyAverage,
      previousWeeklyAverage,
      trend,
      trendText
    };
  };

  const wMetrics = getWeightMetrics();

  // PREMIUM SVG weight progress chart
  const renderWeightChart = () => {
    if (weightEntries.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
          {langCode === 'en' ? 'No weight entries logged yet.' : 'წონის ჩანაწერები ჯერ არ არის დამატებული.'}
        </div>
      );
    }

    const sorted = [...weightEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const weights = sorted.map(e => parseFloat(e.weight));
    const maxW = Math.max(...weights, goalWeight, parseFloat(user?.weight || 75)) + 2.0;
    const minW = Math.min(...weights, goalWeight, parseFloat(user?.weight || 75)) - 2.0;
    const range = maxW - minW || 1;

    const width = 500;
    const height = 220;
    const paddingX = 40;
    const paddingY = 30;

    const points = sorted.map((entry, idx) => {
      const x = paddingX + (idx / (sorted.length - 1 || 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((parseFloat(entry.weight) - minW) / range) * (height - 2 * paddingY);
      return { x, y, ...entry };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const goalY = height - paddingY - ((goalWeight - minW) / range) * (height - 2 * paddingY);
    const startingY = height - paddingY - ((parseFloat(user?.weight || 75) - minW) / range) * (height - 2 * paddingY);

    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '400px', height: 'auto', display: 'block' }}>
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.1)" />
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          
          <line x1={paddingX} y1={startingY} x2={width - paddingX} y2={startingY} stroke="rgba(255, 255, 255, 0.2)" strokeDasharray="2 2" strokeWidth="1" />
          <text x={paddingX + 5} y={startingY - 6} fill="rgba(255,255,255,0.4)" style={{ fontSize: '9px', fontWeight: 'bold' }}>
            {langCode === 'en' ? 'Start' : 'სტარტი'}: {user?.weight || 75}kg
          </text>

          <line x1={paddingX} y1={goalY} x2={width - paddingX} y2={goalY} stroke="var(--color-tertiary)" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x={width - paddingX - 90} y={goalY - 6} fill="var(--color-tertiary)" style={{ fontSize: '10px', fontWeight: 'bold' }}>
            {langCode === 'en' ? 'Goal' : 'მიზანი'}: {goalWeight.toFixed(1)}kg
          </text>

          {points.length > 1 && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="var(--color-primary)" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ filter: 'drop-shadow(0 2px 10px rgba(107, 251, 154, 0.4))' }} 
            />
          )}

          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5.5" fill="#111316" stroke="var(--color-primary)" strokeWidth="3" />
              <text x={p.x} y={p.y - 12} fill="var(--color-text)" textAnchor="middle" style={{ fontSize: '9.5px', fontWeight: '700', fill: 'var(--color-primary-light)' }}>
                {p.weight}
              </text>
              <text x={p.x} y={height - paddingY + 16} fill="var(--color-text-muted)" textAnchor="middle" style={{ fontSize: '8px', opacity: 0.8 }}>
                {p.date.split('-').slice(1).join('/')}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // MOCK DEMO VIDEO PLAYER POPUP
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [videoProgress] = useState(35);
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioDescription, setAudioDescription] = useState(false);

  // HEALTH TOOLS (BMI / BMR CALC)
  const [toolHeight, setToolHeight] = useState(user?.height || '170');
  const [toolWeight, setToolWeight] = useState(user?.weight || '70');
  const [toolAge, setToolAge] = useState(user?.age || '25');
  const [toolGender, setToolGender] = useState((user?.gender || 'female').toLowerCase());
  const [toolActivity, setToolActivity] = useState('moderate');
  const [bmiResult, setBmiResult] = useState(null);
  const [bmrResult, setBmrResult] = useState(null);
  const [tdeeResult, setTdeeResult] = useState(null);

  const calculateBmiTool = () => {
    const hM = parseFloat(toolHeight) / 100;
    const wKg = user?.weightUnit === 'lbs' ? parseFloat(toolWeight) / 2.20462 : parseFloat(toolWeight);
    if (hM > 0 && wKg > 0) {
      const score = wKg / (hM * hM);
      let cat;
      if (langCode === 'ka') {
        cat = score < 18.5 ? 'წონის ნაკლებობა' : score < 25 ? 'ნორმალური წონა' : score < 30 ? 'ჭარბი წონა' : 'სიმსუქნე';
      } else {
        cat = score < 18.5 ? 'Underweight' : score < 25 ? 'Normal weight' : score < 30 ? 'Overweight' : 'Obese';
      }
      setBmiResult({ score: score.toFixed(1), category: cat });
    }
  };

  const calculateBmrTool = () => {
    const h = parseFloat(toolHeight);
    const w = user?.weightUnit === 'lbs' ? parseFloat(toolWeight) / 2.20462 : parseFloat(toolWeight);
    const a = parseInt(toolAge);
    
    if (h > 0 && w > 0 && a > 0) {
      let bmrVal;
      if (toolGender === 'male') {
        bmrVal = 10 * w + 6.25 * h - 5 * a + 5;
      } else {
        bmrVal = 10 * w + 6.25 * h - 5 * a - 161;
      }

      let multiplier = 1.2;
      if (toolActivity === 'light') multiplier = 1.375;
      else if (toolActivity === 'moderate') multiplier = 1.55;
      else if (toolActivity === 'high') multiplier = 1.725;
      else if (toolActivity === 'very_high') multiplier = 1.9;

      const tdeeVal = bmrVal * multiplier;
      setBmrResult(bmrVal.toFixed(0));
      setTdeeResult(tdeeVal.toFixed(0));
    }
  };

  // Render original progress estimation
  const renderProgressEstimation = () => {
    if (!tdee || !targetCalories) return null;
    const isLose = user?.goal?.toLowerCase().includes('lose') || String(user?.goal).includes('კლება');
    const isGain = user?.goal?.toLowerCase().includes('gain') || String(user?.goal).includes('მომატება');

    if (langCode === 'ka') {
      if (isLose) {
        const dailyDeficit = tdee - targetCalories;
        if (dailyDeficit <= 0) {
          return <p>თქვენი კალორიები შენარჩუნების ან ნამატის დონეზეა. წონის კლება ამ გეგმით ნაკლებად სავარაუდოა.</p>;
        }
        const weeklyLoss = (dailyDeficit * 7 / 7700).toFixed(2);
        const monthlyLoss = (weeklyLoss * 4).toFixed(1);
        return (
          <div>
            <p>თქვენი კალორიული დეფიციტის მიხედვით, სავარაუდოდ დაიკლებთ დაახლოებით <strong>{Math.max(0.2, (weeklyLoss - 0.1).toFixed(1))}–{Math.min((parseFloat(weeklyLoss) + 0.2).toFixed(1), 1.5)} კგ-ს კვირაში</strong>.</p>
            <p>30 დღეში ეს იქნება დაახლოებით <strong>{Math.max(0.8, (monthlyLoss - 0.5).toFixed(1))}–{Math.min((parseFloat(monthlyLoss) + 0.8).toFixed(1), 6)} კგ</strong>.</p>
          </div>
        );
      } else if (isGain) {
        return <p>თქვენი კალორიული ნამატის მიხედვით, სავარაუდოდ მოიმატებთ დაახლოებით <strong>0.2–0.5 კგ-ს კვირაში</strong> კუნთოვანი მასის სახით.</p>;
      } else {
        return <p>ეს გეგმა შექმნილია წონის სტაბილიზაციის, ჯანსაღი კვების ჩვევებისა და ენერგიის მაღალი დონის შესანარჩუნებლად.</p>;
      }
    } else {
      const isLbs = user?.weightUnit === 'lbs';
      const m = isLbs ? 2.20462 : 1;
      const unit = isLbs ? 'lbs' : 'kg';

      if (isLose) {
        const dailyDeficit = tdee - targetCalories;
        if (dailyDeficit <= 0) {
          return <p>Your calories are set to maintenance or surplus. Weight loss may not occur on this plan.</p>;
        }
        const weeklyLossKg = (dailyDeficit * 7 / 7700);
        const monthlyLossKg = weeklyLossKg * 4;
        
        const wMin = Math.max(0.2 * m, (weeklyLossKg - 0.1) * m).toFixed(1);
        const wMax = Math.min((weeklyLossKg + 0.2) * m, 1.5 * m).toFixed(1);
        
        const mMin = Math.max(0.8 * m, (monthlyLossKg - 0.5) * m).toFixed(1);
        const mMax = Math.min((monthlyLossKg + 0.8) * m, 6 * m).toFixed(1);
        
        return (
          <div>
            <p>Based on your estimated calorie deficit, you may lose approximately <strong>{wMin}–{wMax} {unit} per week</strong>.</p>
            <p>In 30 days, this could be around <strong>{mMin}–{mMax} {unit}</strong>.</p>
          </div>
        );
      } else if (isGain) {
        const minG = (0.2 * m).toFixed(1);
        const maxG = (0.5 * m).toFixed(1);
        return <p>Based on your calorie surplus, you may gain approximately <strong>{minG}–{maxG} {unit} per week</strong> of muscle mass.</p>;
      } else {
        return <p>This plan is designed mainly to support stable weight, better eating habits, and consistent energy levels.</p>;
      }
    }
  };

  const groceryList = Array.isArray(mealPlan) ? generateGroceryList(mealPlan) : [];

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      
      {/* Active Subscription Status Banner */}
      {subscriptionData && subscriptionData.hasActiveSubscription && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: 'rgba(107, 251, 154, 0.08)', color: 'var(--color-primary-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid rgba(107, 251, 154, 0.25)' }}>
          <div>
            <strong>{t('activePlan')}:</strong> {subscriptionData.selectedSubscription === 'thirty_day' ? t('plan30Day') : t('plan7Day')}<br />
            {subscriptionData.subscriptionEndDate && <small style={{ color: 'var(--color-text-muted)' }}>{t('validAccess')}: {new Date(subscriptionData.subscriptionEndDate).toLocaleDateString()}</small>}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" onClick={onCreateNewPlan} style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              {t('createNewPlan')}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => alert(langCode === 'en' ? 'Manage Subscription clicked. In production, this opens the Stripe Customer Portal.' : 'გამოწერის მართვა. წარმოებაში ეს გახსნის Stripe Customer Portal-ს.')}>
              {t('manageSub')}
            </button>
          </div>
        </div>
      )}

      {/* Main Title */}
      <div className="text-center animate-fade-in" style={{ marginBottom: '2.5rem' }}>
        <h2>{langCode === 'en' ? 'Your Personalized Wellness Hub' : 'თქვენი პერსონალური მართვის ცენტრი'}</h2>
        <p className="text-muted">{langCode === 'en' ? 'Track macros, log meals, log workouts and weigh-in daily.' : 'აკონტროლეთ მაკროები, ჩაიწერეთ საკვები, ვარჯიშები და წონა ყოველდღიურად.'}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center" style={{ marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'inline-flex', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap', justifyContent: 'center', gap: '4px' }}>
          {getTabs().map(tab => (
            <button
              key={tab.id}
              className="btn"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab.id ? '#111316' : 'var(--color-text-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 1.35rem',
                fontSize: '0.95rem',
                fontWeight: '600',
                border: activeTab === tab.id ? '1px solid var(--color-primary)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap'
              }}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = 'var(--color-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                }
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          {selectedPlanType !== 'workout_only' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
                <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t('dailyCalories')}</div>
                <div style={{ fontSize: '1.65rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{targetCalories || 0}</div>
              </div>
              <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
                <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t('protein')}</div>
                <div style={{ fontSize: '1.65rem', fontWeight: 'bold' }}>{macros?.proteinGrams || 0}{langCode === 'en' ? 'g' : 'გრ'}</div>
              </div>
              <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
                <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t('carbs')}</div>
                <div style={{ fontSize: '1.65rem', fontWeight: 'bold' }}>{macros?.carbsGrams || 0}{langCode === 'en' ? 'g' : 'გრ'}</div>
              </div>
              <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
                <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t('fat')}</div>
                <div style={{ fontSize: '1.65rem', fontWeight: 'bold' }}>{macros?.fatGrams || 0}{langCode === 'en' ? 'g' : 'გრ'}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined">track_changes</span>
                {langCode === 'en' ? "Today's Calorie Balance" : "დღევანდელი კალორიული ბალანსი"}
              </h3>
              
              {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const todayLogs = foodLogs.filter(log => log.date === todayStr);
                const loggedCals = todayLogs.reduce((acc, curr) => acc + curr.calories, 0);
                const remaining = (targetCalories || 2000) - loggedCals;
                const percent = Math.min(100, (loggedCals / (targetCalories || 2000)) * 100);

                return (
                  <div>
                    <div className="flex justify-between items-center mb-2" style={{ fontSize: '1.1rem' }}>
                      <span>{langCode === 'en' ? 'Logged' : 'მიღებული'}: <strong>{loggedCals} kcal</strong></span>
                      <span>{langCode === 'en' ? 'Target' : 'მიზანი'}: <strong>{targetCalories || 2000} kcal</strong></span>
                    </div>
                    
                    <div style={{ height: '10px', backgroundColor: 'var(--color-surface-container-highest)', borderRadius: '5px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                      <div style={{ height: '100%', width: `${percent}%`, backgroundColor: remaining >= 0 ? 'var(--color-primary)' : 'var(--color-danger)', borderRadius: '5px', transition: 'width 0.4s ease' }} />
                    </div>

                    <div className="text-center" style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        {remaining >= 0 ? (langCode === 'en' ? 'Remaining Calories' : 'დარჩენილი კალორია') : (langCode === 'en' ? 'Calories Over Target' : 'კალორიები მიზანს ზემოთ')}
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: remaining >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                        {Math.abs(remaining)} kcal
                      </div>
                    </div>
                    
                    {selectedPlanType !== 'workout_only' && (
                      <button className="btn btn-primary btn-block mt-4" onClick={() => setActiveTab('scanner')}>
                        <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>photo_camera</span>
                        {langCode === 'en' ? 'Scan a Meal to Log' : 'საკვების სკანირება და ლოგი'}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined">insights</span>
                {langCode === 'en' ? "Journey Highlights" : "მოგზაურობის შეჯამება"}
              </h3>
              <div className="flex-col gap-3">
                <div className="flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                  <span>{langCode === 'en' ? 'Logged Weight Entries' : 'ჩაწერილი წონები'}</span>
                  <span style={{ fontWeight: 'bold' }}>{weightEntries.length}</span>
                </div>
                <div className="flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                  <span>{langCode === 'en' ? 'Active Calorie Streak' : 'კვების აქტიური სერია'}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>🔥 {streakStats.currentStreak} {langCode === 'en' ? 'days' : 'დღე'}</span>
                </div>
                <div className="flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                  <span>{langCode === 'en' ? 'Best Calorie Streak' : 'საუკეთესო სერია'}</span>
                  <span style={{ fontWeight: 'bold' }}>🏆 {streakStats.bestStreak} {langCode === 'en' ? 'days' : 'დღე'}</span>
                </div>
                {selectedPlanType !== 'nutrition_only' && (
                  <div className="flex justify-between items-center">
                    <span>{langCode === 'en' ? 'Completed Workouts' : 'დასრულებული ვარჯიშები'}</span>
                    <span style={{ fontWeight: 'bold' }}>✅ {Object.keys(completedWorkouts).length}</span>
                  </div>
                )}
              </div>
              <button className="btn btn-outline btn-block mt-6" onClick={() => setActiveTab(selectedPlanType === 'workout_only' ? 'weight' : 'progress_insights')}>
                <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>show_chart</span>
                {langCode === 'en' ? 'View Weight Trends' : 'წონის ტრენდების ნახვა'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="card top-performers-card animate-fade-in" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <h3 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span className="material-symbols-outlined">leaderboard</span>
            Top Performers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPerformers.map((performer, index) => (
              <div className="leader-mini-row" key={performer.username}>
                <span className="leader-rank">#{index + 1}</span>
                <div>
                  <strong>{performer.firstName} {performer.lastName}</strong>
                  <p className="text-muted">@{performer.username} • {performer.streak} day streak</p>
                </div>
                <span className="text-primary">{performer.points} pts</span>
              </div>
            ))}
          </div>
          <div className="current-rank-note">
            {currentRank > 0 ? `Your current rank: #${currentRank}` : 'Create a profile to join the leaderboard.'}
          </div>
          <button className="btn btn-primary btn-block mt-4" onClick={onOpenLeaderboard}>
            View Full Leaderboard
          </button>
        </div>
      )}

      {/* 2. MEAL PLAN VIEW */}
      {activeTab === 'meals' && selectedPlanType !== 'workout_only' && (
        <div className="animate-fade-in">
          {mealPlan.length > 1 && (
            <div className="flex justify-center gap-2" style={{ marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              {mealPlan.map((day, idx) => (
                <button 
                  key={idx}
                  className={`btn btn-sm ${viewDay === idx + 1 ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '0.5rem 1rem',
                    minWidth: '70px',
                    backgroundColor: viewDay === idx + 1 ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                    color: viewDay === idx + 1 ? '#111316' : 'var(--color-text)'
                  }}
                  onClick={() => setViewDay(idx + 1)}
                >
                  {langCode === 'en' ? `Day ${idx + 1}` : `დღე ${idx + 1}`}
                </button>
              ))}
            </div>
          )}
          
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
              {langCode === 'en' ? `Day ${viewDay} Menu` : `დღე ${viewDay}-ის მენიუ`}
            </h3>
            {Array.isArray(mealPlan[viewDay - 1]?.meals) ? mealPlan[viewDay - 1].meals.map((meal, idx) => (
              <MealCard 
                key={meal.id || idx} 
                meal={meal} 
                onReplace={(m) => handleReplaceMeal(viewDay - 1, idx, m.type)} 
                t={t}
              />
            )) : <p>{t('mealsNotFound')}</p>}
          </div>
        </div>
      )}

      {/* 2. MACRO TRACKING TAB */}
      {activeTab === 'macros' && selectedPlanType !== 'workout_only' && (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {(() => {
            const todayLogs = foodLogs.filter(log => log.date === selectedDashboardDate);
            const consumedCals = todayLogs.reduce((acc, curr) => acc + (curr.calories || 0), 0);
            const consumedProtein = todayLogs.reduce((acc, curr) => acc + (curr.protein || 0), 0);
            const consumedCarbs = todayLogs.reduce((acc, curr) => acc + (curr.carbs || 0), 0);
            const consumedFat = todayLogs.reduce((acc, curr) => acc + (curr.fat || 0), 0);
            
            const tgtCals = targetCalories || 2000;
            const tgtP = macros?.proteinGrams || 150;
            const tgtC = macros?.carbsGrams || 200;
            const tgtF = macros?.fatGrams || 60;
            
            const pctCals = Math.min(100, (consumedCals / tgtCals) * 100);
            const pctP = Math.min(100, (consumedProtein / tgtP) * 100);
            const pctC = Math.min(100, (consumedCarbs / tgtC) * 100);
            const pctF = Math.min(100, (consumedFat / tgtF) * 100);

            return (
              <div className="flex-col gap-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>{t('macroTracking')}</h3>
                  <input type="date" className="form-control" style={{ width: 'auto' }} value={selectedDashboardDate} onChange={e => setSelectedDashboardDate(e.target.value)} />
                </div>
                
                {/* CALORIES CIRCULAR OR MAIN BAR */}
                <div className="card text-center" style={{ padding: '2rem' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Daily Calories</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{consumedCals} / {tgtCals} kcal</div>
                  <div style={{ height: '12px', backgroundColor: 'var(--color-surface-container-highest)', borderRadius: '6px', overflow: 'hidden', margin: '1rem 0' }}>
                    <div style={{ height: '100%', width: `${pctCals}%`, backgroundColor: consumedCals > tgtCals ? 'var(--color-danger)' : 'var(--color-primary)' }} />
                  </div>
                  <div style={{ fontSize: '0.9rem', color: consumedCals > tgtCals ? 'var(--color-danger)' : 'var(--color-primary-light)' }}>
                    {consumedCals > tgtCals ? `${consumedCals - tgtCals} kcal Over Target` : `${tgtCals - consumedCals} kcal Remaining`}
                  </div>
                </div>

                {/* MACRO BARS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[{label: t('protein'), c: consumedProtein, t: tgtP, p: pctP, color: '#3b82f6'},
                    {label: t('carbs'), c: consumedCarbs, t: tgtC, p: pctC, color: '#f59e0b'},
                    {label: t('fat'), c: consumedFat, t: tgtF, p: pctF, color: '#ef4444'}].map((m, i) => (
                    <div key={i} className="card" style={{ padding: '1.5rem' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span style={{ fontWeight: '600' }}>{m.label}</span>
                        <span style={{ fontSize: '0.85rem' }}>{m.c}g / {m.t}g</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--color-surface-container-highest)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <div style={{ height: '100%', width: `${m.p}%`, backgroundColor: m.color }} />
                      </div>
                      <div className="text-right text-muted" style={{ fontSize: '0.75rem' }}>
                        {m.c > m.t ? `${m.c - m.t}g Over` : `${m.t - m.c}g Left`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* LOGGED MEALS */}
                <div className="card" style={{ padding: '2rem' }}>
                  <div className="flex justify-between items-center mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
                    <h4 style={{ margin: 0 }}>Logged Meals</h4>
                    <button className="btn btn-primary btn-sm" onClick={() => {
                      setManualDate(selectedDashboardDate);
                      setSelectedCalendarDay(selectedDashboardDate);
                      setShowManualForm(true);
                      setActiveTab('progress_insights');
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', marginRight: '4px' }}>add</span>
                      {t('addMealManually')}
                    </button>
                  </div>
                  {todayLogs.length === 0 ? (
                    <div className="text-center text-muted" style={{ padding: '1rem 0' }}>
                      No meals logged today. Scan food or add a meal manually.
                    </div>
                  ) : (
                    <div className="flex-col gap-3">
                      {todayLogs.map(log => (
                        <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div>
                            <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--color-primary-light)' }}>{log.foodName}</strong>
                            <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                              <span style={{ textTransform: 'capitalize' }}>{log.mealType}</span> • {log.calories} kcal • {log.protein || 0}g P • {log.carbs || 0}g C • {log.fat || 0}g F
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-tertiary)', marginTop: '4px' }}>Source: {log.source}</div>
                          </div>
                          <button className="btn btn-danger btn-sm" onClick={() => removeMealLog(log.id)}>Delete</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. SMART FOOD SCANNER */}
      {activeTab === 'scanner' && selectedPlanType !== 'workout_only' && (
        <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
          
          <div className="flex justify-center gap-2 mb-6">
            <button className={`btn ${scanModeTab === 'barcode' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setScanModeTab('barcode')}>
              <span className="material-symbols-outlined" style={{ marginRight: '6px' }}>barcode_scanner</span>
              {t('barcodeScanner')}
            </button>
            <button className={`btn ${scanModeTab === 'photo' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setScanModeTab('photo')}>
              <span className="material-symbols-outlined" style={{ marginRight: '6px' }}>photo_camera</span>
              {t('foodPhotoScanner')}
            </button>
          </div>

          {scanModeTab === 'barcode' && (
            <div className="card text-center" style={{ padding: '2.5rem' }}>
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', display: 'inline-block' }}>barcode_reader</span>
              <h3>{t('barcodeScanner')}</h3>
              <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Scan a product's barcode to quickly log its nutritional information.
              </p>
              
              <div className="flex gap-2 justify-center mb-6">
                <button className="btn btn-primary" onClick={() => alert(langCode === 'en' ? 'Camera barcode detection not supported on this device. Please enter manually.' : 'კამერით სკანირება არ არის მხარდაჭერილი ამ მოწყობილობაზე.')}>
                  <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>qr_code_scanner</span>
                  {t('scanBarcode')}
                </button>
              </div>

              <div className="form-group mb-6 text-left">
                <label className="form-label">{t('enterBarcodeManually')}</label>
                <div className="flex gap-2">
                  <input type="text" className="form-control" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} placeholder="e.g. 1234567890 (use '404' to test not found)" />
                  <button className="btn btn-secondary" onClick={handleBarcodeSearch} disabled={barcodeSearchLoading}>
                    {barcodeSearchLoading ? '...' : t('searchProduct')}
                  </button>
                </div>
              </div>

              {barcodeResult && (
                <div className="text-left animate-fade-in" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--color-primary-light)' }}>{barcodeResult.foodName}</h4>
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>{barcodeResult.brand} • {barcodeResult.portion}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div><label className="text-muted" style={{fontSize: '0.75rem'}}>Cals</label><input type="number" className="form-control" value={barcodeResult.calories} onChange={e => setBarcodeResult({...barcodeResult, calories: e.target.value})} /></div>
                    <div><label className="text-muted" style={{fontSize: '0.75rem'}}>Protein</label><input type="number" className="form-control" value={barcodeResult.protein} onChange={e => setBarcodeResult({...barcodeResult, protein: e.target.value})} /></div>
                    <div><label className="text-muted" style={{fontSize: '0.75rem'}}>Carbs</label><input type="number" className="form-control" value={barcodeResult.carbs} onChange={e => setBarcodeResult({...barcodeResult, carbs: e.target.value})} /></div>
                    <div><label className="text-muted" style={{fontSize: '0.75rem'}}>Fat</label><input type="number" className="form-control" value={barcodeResult.fat} onChange={e => setBarcodeResult({...barcodeResult, fat: e.target.value})} /></div>
                  </div>

                  <button className="btn btn-primary btn-block" onClick={handleSaveBarcode}>{t('saveToFoodLog')}</button>
                </div>
              )}
            </div>
          )}

          {scanModeTab === 'photo' && (
            <div className="card text-center" style={{ padding: '2.5rem' }}>
              
            {scanMode === 'idle' && (
              <div>
                <span className="material-symbols-outlined text-primary animate-pulse" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', display: 'inline-block' }}>photo_camera</span>
                <h3>{t('smartFoodScan')}</h3>
                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                  Take a photo or upload an image to estimate calories, macros, and log your meal.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="btn btn-primary" onClick={() => setScanMode('camera')}>
                    <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>videocam</span>
                    {t('openCamera')}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setScanMode('upload')}>
                    <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>upload_file</span>
                    {t('uploadFoodPhoto')}
                  </button>
                </div>
              </div>
            )}

            {scanMode === 'camera' && (
              <div className="animate-fade-in text-center">
                <div style={{
                  width: '100%',
                  height: '280px',
                  backgroundColor: '#000',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid rgba(255,255,255,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '180px',
                    height: '180px',
                    border: '2.5px dashed var(--color-primary)',
                    borderRadius: 'var(--radius-md)',
                    position: 'absolute',
                    boxShadow: '0 0 30px rgba(107, 251, 154, 0.25)',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span className="material-symbols-outlined text-muted" style={{ fontSize: '3rem', opacity: 0.2 }}>flat_ware</span>
                  <div className="text-muted" style={{ position: 'absolute', bottom: '12px', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                    [ MOCK LIVE CAMERA VIEW ]
                  </div>
                </div>

                <p style={{ marginBottom: '1.5rem', fontWeight: '500' }}>Select a mock food template to analyze:</p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {foodTemplates.map((t, idx) => (
                    <button key={idx} className="btn btn-secondary btn-sm" onClick={() => handleSimulateScan(t)}>
                      {t.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 justify-center">
                  <button className="btn btn-outline" onClick={() => setScanMode('idle')}>
                    {langCode === 'en' ? 'Cancel' : 'გაუქმება'}
                  </button>
                </div>
              </div>
            )}

            {scanMode === 'upload' && (
              <div className="animate-fade-in text-center">
                <div style={{
                  border: '2px dashed rgba(255, 255, 255, 0.15)',
                  padding: '3rem 2rem',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '1.5rem',
                  backgroundColor: 'rgba(255,255,255,0.01)'
                }}>
                  <span className="material-symbols-outlined text-muted" style={{ fontSize: '3rem', marginBottom: '1rem' }}>cloud_upload</span>
                  <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Drag and drop or select a template to upload:</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {foodTemplates.map((t, idx) => (
                      <button key={idx} className="btn btn-secondary btn-sm" onClick={() => handleSimulateScan(t)}>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn btn-outline" onClick={() => setScanMode('idle')}>
                  {langCode === 'en' ? 'Cancel' : 'გაუქმება'}
                </button>
              </div>
            )}

            {scanMode === 'scanning' && (
              <div className="animate-fade-in text-center" style={{ padding: '2.5rem 0' }}>
                <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: '4rem', marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }}>sync</span>
                <h3>{t('analyzeFood')}...</h3>
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>AI is estimating portion volume and macronutrients...</p>
                <div style={{ height: '6px', width: '100%', maxWidth: '300px', backgroundColor: 'var(--color-surface-container-highest)', borderRadius: '3px', margin: '0 auto', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${scannerProgress}%`, backgroundColor: 'var(--color-primary)', transition: 'width 0.15s ease' }} />
                </div>
              </div>
            )}

            {scanMode === 'result' && (
              <div className="animate-fade-in text-left">
                <div className="flex justify-between items-center mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>⚡ Scan Analysis Result</h3>
                  <span className="badge" style={{ backgroundColor: 'rgba(107, 251, 154, 0.1)', color: 'var(--color-primary)' }}>Portion: {scannedPortion} • Match: {scannedConfidence}</span>
                </div>

                {scannedImage && (
                  <div style={{ width: '100%', height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <img src={scannedImage} alt="Food analysis preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Food Item Name</label>
                  <input type="text" className="form-control" value={scannedMealName} onChange={e => setScannedMealName(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Meal Type</label>
                  <select className="form-control" value={scannedType} onChange={e => setScannedType(e.target.value)}>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6">
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Cals (kcal)</label>
                    <input type="number" className="form-control" value={scannedCals} onChange={e => setScannedCals(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Protein (g)</label>
                    <input type="number" className="form-control" value={scannedProtein} onChange={e => setScannedProtein(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Carbs (g)</label>
                    <input type="number" className="form-control" value={scannedCarbs} onChange={e => setScannedCarbs(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Fat (g)</label>
                    <input type="number" className="form-control" value={scannedFat} onChange={e => setScannedFat(e.target.value)} />
                  </div>
                </div>

                <p className="text-muted" style={{ fontSize: '0.82rem', lineHeight: '1.4', fontStyle: 'italic', marginBottom: '2rem' }}>
                  ⚠️ Food scan estimates are approximate. Review and edit values before saving.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button className="btn btn-secondary" onClick={() => setScanMode('idle')}>
                    Scan Again
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveScanLog}>
                    {t('saveToFoodLog')}
                  </button>
                </div>
              </div>
            )}
            
            </div>
          )}

        </div>
      )}

      {/* 4. FOOD CALENDAR (PART OF PROGRESS INSIGHTS) */}
      {activeTab === 'progress_insights' && selectedPlanType !== 'workout_only' && (
        <div className="animate-fade-in" style={{ marginBottom: '4rem', maxWidth: '800px', margin: '0 auto' }}>
          
          <h3 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span className="material-symbols-outlined">calendar_month</span>
            {t('foodCalendar')}
          </h3>
          
          {/* Streak Stats Card Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
              <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t('loggedDays')}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{streakStats.totalLogged}</div>
            </div>
            <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
              <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t('currentStreak')}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>🔥 {streakStats.currentStreak}</div>
            </div>
            <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
              <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t('bestStreak')}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🏆 {streakStats.bestStreak}</div>
            </div>
            <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
              <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Average Calories</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-light)' }}>
                {(() => {
                  const currentMonthLogs = foodLogs.filter(log => {
                    const d = new Date(log.date);
                    return d.getMonth() === calMonth && d.getFullYear() === calYear;
                  });
                  const days = [...new Set(currentMonthLogs.map(l => l.date))];
                  if (days.length === 0) return 0;
                  const total = currentMonthLogs.reduce((acc, c) => acc + c.calories, 0);
                  return Math.round(total / days.length);
                })()} kcal
              </div>
            </div>
          </div>

          {/* Month Navigation Title Header */}
          <div className="flex justify-between items-center mb-6">
            <button className="btn btn-secondary btn-sm" onClick={handlePrevMonth}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
              📅 {calendarDate.toLocaleDateString(langCode === 'en' ? 'en-US' : 'ka-GE', { month: 'long', year: 'numeric' })}
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={handleNextMonth}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Grid Cells */}
            <div className="card lg:col-span-2" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                
                {/* Week Day Titles */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => (
                  <div key={i} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--color-text-muted)', paddingBottom: '0.5rem' }}>{wd}</div>
                ))}

                {/* Empty cells before month start */}
                {Array.from({ length: new Date(calYear, calMonth, 1).getDay() }).map((_, idx) => (
                  <div key={`empty-${idx}`} style={{ aspectRatio: '1', opacity: 0.15 }} />
                ))}

                {/* Month Days */}
                {Array.from({ length: new Date(calYear, calMonth + 1, 0).getDate() }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const pad = (n) => String(n).padStart(2, '0');
                  const dateStr = `${calYear}-${pad(calMonth + 1)}-${pad(dayNum)}`;
                  
                  const dayLogs = foodLogs.filter(log => log.date === dateStr);
                  const dayCals = dayLogs.reduce((acc, curr) => acc + curr.calories, 0);

                  const target = targetCalories || 2000;
                  let bg = 'rgba(255,255,255,0.02)';
                  let border = '1px solid rgba(255,255,255,0.05)';
                  let color = 'inherit';

                  // Streak day checks (logged yesterday and today)
                  const prevDate = new Date(calYear, calMonth, dayNum - 1);
                  const prevDateStr = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}-${pad(prevDate.getDate())}`;
                  const hasYesterday = foodLogs.some(log => log.date === prevDateStr);
                  const isStreak = dayCals > 0 && hasYesterday;

                  if (dayCals > 0) {
                    if (dayCals <= target * 0.9) {
                      bg = 'rgba(107, 251, 154, 0.15)'; // Under Target
                      border = '1px solid rgba(107, 251, 154, 0.4)';
                      color = 'var(--color-primary-light)';
                    } else if (dayCals > target * 0.9 && dayCals <= target * 1.1) {
                      bg = 'rgba(107, 251, 154, 0.3)'; // On Target (Green glowing border)
                      border = '1px solid var(--color-primary)';
                      color = 'var(--color-primary)';
                    } else {
                      bg = 'rgba(255, 180, 171, 0.15)'; // Over Target
                      border = '1px solid rgba(255, 180, 171, 0.4)';
                      color = 'var(--color-danger)';
                    }
                  }

                  const isSelected = selectedCalendarDay === dateStr;
                  if (isSelected) {
                    border = '2px solid var(--color-primary-light)';
                  }

                  return (
                    <div 
                      key={dayNum}
                      onClick={() => {
                        setSelectedCalendarDay(dateStr);
                        setShowManualForm(false);
                      }}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '8px',
                        backgroundColor: bg,
                        border: border,
                        color: color,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.15s',
                        position: 'relative'
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{dayNum}</span>
                      {dayLogs.length > 0 && (
                        <span style={{ fontSize: '0.55rem', opacity: 0.85, fontWeight: '700' }}>
                          {dayCals}k ({dayLogs.length})
                        </span>
                      )}
                      {isStreak && (
                        <span style={{ position: 'absolute', top: '2px', right: '4px', fontSize: '0.5rem' }}>🔥</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 justify-between items-center mt-6" style={{ fontSize: '0.8rem', flexWrap: 'wrap' }}>
                <div className="flex gap-2 items-center">
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'inline-block' }} />
                  <span>No logs</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(107, 251, 154, 0.15)', border: '1px solid rgba(107, 251, 154, 0.4)', display: 'inline-block' }} />
                  <span>Under Target</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(107, 251, 154, 0.3)', border: '1px solid var(--color-primary)', display: 'inline-block' }} />
                  <span>On Target</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(255, 180, 171, 0.15)', border: '1px solid rgba(255, 180, 171, 0.4)', display: 'inline-block' }} />
                  <span>Over Target</span>
                </div>
              </div>
            </div>

            {/* Selected day logs / details */}
            <div className="card" style={{ padding: '2rem' }}>
              {selectedCalendarDay ? (
                <div>
                  <h4 style={{ color: 'var(--color-primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
                    📅 {new Date(selectedCalendarDay).toLocaleDateString(langCode === 'en' ? 'en-US' : 'ka-GE', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </h4>

                  {(() => {
                    const dayLogs = foodLogs.filter(log => log.date === selectedCalendarDay);
                    const totalCals = dayLogs.reduce((acc, curr) => acc + curr.calories, 0);
                    const totalP = dayLogs.reduce((acc, curr) => acc + (curr.protein || 0), 0);
                    const totalC = dayLogs.reduce((acc, curr) => acc + (curr.carbs || 0), 0);
                    const totalF = dayLogs.reduce((acc, curr) => acc + (curr.fat || 0), 0);
                    const target = targetCalories || 2000;
                    const diff = totalCals - target;

                    return (
                      <div>
                        {dayLogs.length === 0 ? (
                          <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                            No meals logged yet. Use the Food Scanner or add a meal manually.
                          </p>
                        ) : (
                          <div className="flex-col gap-2 mb-6" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            {dayLogs.map(log => (
                              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <div>
                                  <strong style={{ fontSize: '0.9rem', display: 'block' }}>{log.foodName}</strong>
                                  <small className="text-muted" style={{ textTransform: 'capitalize' }}>
                                    {log.mealType} • {log.calories} kcal
                                  </small>
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={() => removeMealLog(log.id)} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex-col gap-1 mb-6" style={{ padding: '0.75rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="flex justify-between items-center">
                            <span>Total Cals:</span>
                            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{totalCals} / {target} kcal</span>
                          </div>
                          <div className="flex justify-between items-center" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            <span>Difference:</span>
                            <span style={{ color: diff <= 0 ? 'var(--color-primary-light)' : 'var(--color-danger)' }}>
                              {diff <= 0 ? `${Math.abs(diff)} kcal Under` : `${diff} kcal Over`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            <span>Macros:</span>
                            <span>{totalP}g P • {totalC}g C • {totalF}g F</span>
                          </div>
                        </div>

                        {!showManualForm ? (
                          <button className="btn btn-primary btn-block" onClick={() => {
                            setManualDate(selectedCalendarDay);
                            setShowManualForm(true);
                          }}>
                            <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>add</span>
                            {t('addMealManually')}
                          </button>
                        ) : (
                          <form onSubmit={handleAddManualMeal} className="flex-col gap-3 animate-fade-in">
                            <div className="form-group">
                              <label className="form-label">Meal Name</label>
                              <input type="text" className="form-control" value={manualName} onChange={e => setManualName(e.target.value)} placeholder="e.g. Oatmeal" required />
                            </div>
                            
                            <div className="form-group">
                              <label className="form-label">Meal Type</label>
                              <select className="form-control" value={manualType} onChange={e => setManualType(e.target.value)}>
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                              </select>
                            </div>

                            <div className="form-group">
                              <label className="form-label">Date</label>
                              <input type="date" className="form-control" value={manualDate} onChange={e => setManualDate(e.target.value)} required />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Cals</label>
                                <input type="number" className="form-control" value={manualCals} onChange={e => setManualCals(e.target.value)} placeholder="kcal" required />
                              </div>
                              <div>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Protein</label>
                                <input type="number" className="form-control" value={manualProtein} onChange={e => setManualProtein(e.target.value)} placeholder="g" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Carbs</label>
                                <input type="number" className="form-control" value={manualCarbs} onChange={e => setManualCarbs(e.target.value)} placeholder="g" />
                              </div>
                              <div>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Fat</label>
                                <input type="number" className="form-control" value={manualFat} onChange={e => setManualFat(e.target.value)} placeholder="g" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4">
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowManualForm(false)}>
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-primary btn-sm">
                                Save Meal
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center text-muted" style={{ padding: '2rem 0' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>ads_click</span>
                  <p>Select a day on the monthly grid to manage logs.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. WORKOUT PLAN VIEW */}
      {activeTab === 'workout' && selectedPlanType !== 'nutrition_only' && workoutPlan && (
        <div className="animate-fade-in">
          
          {/* REST TIMER WIDGET CARD */}
          <div className="card" style={{ marginBottom: '2.5rem', border: '1px solid rgba(107, 251, 154, 0.15)', padding: '1.75rem' }}>
            <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '2.5rem' }}>timer</span>
                <div>
                  <h4 style={{ margin: 0 }}>Active Rest Timer</h4>
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Maintain set intervals to maximize athletic pacing.</p>
                </div>
              </div>

              {/* Digital Countdown Timer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{
                  fontSize: '2.25rem',
                  fontWeight: '700',
                  color: timerActive ? 'var(--color-primary)' : 'var(--color-text)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  padding: '0.4rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'monospace',
                  border: timerActive ? '1px solid rgba(107, 251, 154, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: timerActive ? 'var(--shadow-glow)' : 'none'
                }}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>

                <div className="flex gap-2">
                  {!timerActive ? (
                    <button className="btn btn-primary btn-sm" onClick={() => startTimer(timeLeft)}>
                      Start Rest Timer
                    </button>
                  ) : (
                    <button className="btn btn-outline btn-sm" onClick={pauseTimer} style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                      Stop Timer
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={resetTimer}>
                    Reset Timer
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Select Intervals */}
            <div className="flex gap-2 justify-start mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', flexWrap: 'wrap' }}>
              <span className="text-muted" style={{ alignSelf: 'center', fontSize: '0.85rem', marginRight: '0.5rem' }}>Quick Sets:</span>
              {[30, 45, 60, 90, 120].map(s => (
                <button
                  key={s}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => {
                    setInitialTime(s);
                    setTimeLeft(s);
                    setTimerActive(true);
                  }}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>

          {workoutPlan.days.length > 1 && (
            <div className="flex justify-center gap-2" style={{ marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              {workoutPlan.days.map((day, idx) => (
                <button 
                  key={idx}
                  className={`btn btn-sm ${viewWorkoutDay === idx + 1 ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '0.5rem 1rem',
                    minWidth: '70px',
                    backgroundColor: viewWorkoutDay === idx + 1 ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                    color: viewWorkoutDay === idx + 1 ? '#111316' : 'var(--color-text)'
                  }}
                  onClick={() => setViewWorkoutDay(idx + 1)}
                >
                  {langCode === 'en' ? `Day ${idx + 1}` : `დღე ${idx + 1}`}
                </button>
              ))}
            </div>
          )}
          
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {workoutPlan.days[viewWorkoutDay - 1] ? (
              <div>
                <WorkoutCard 
                  daySplit={workoutPlan.days[viewWorkoutDay - 1]} 
                  onReplaceExercise={handleReplaceExercise}
                  t={t}
                />

                {!workoutPlan.days[viewWorkoutDay - 1].isRest && (
                  <div className="card" style={{ marginTop: '2rem', padding: '2rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>✅ Active Workout Tracker</h4>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '2rem' }}>Mark each set as complete as you train. When all sets are checked, log your workout completion!</p>

                    <div className="flex-col gap-4">
                      {workoutPlan.days[viewWorkoutDay - 1].exercises.map((ex, exIdx) => {
                        const setsCount = parseInt(ex.sets) || 3;
                        return (
                          <div key={exIdx} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="flex justify-between items-center mb-3">
                              <span style={{ fontWeight: '600' }}>{ex.name}</span>
                              <span className="text-muted" style={{ fontSize: '0.8rem' }}>{ex.sets} Sets • {ex.reps} Reps</span>
                            </div>

                            <div className="flex gap-2">
                              {Array.from({ length: setsCount }).map((_, setIdx) => {
                                const setNum = setIdx + 1;
                                const isChecked = completedSets[`${ex.name}-set-${setNum}`] || false;
                                return (
                                  <button
                                    key={setIdx}
                                    onClick={() => toggleSetComplete(ex.name, setNum)}
                                    className="btn btn-sm"
                                    style={{
                                      minWidth: '38px',
                                      height: '38px',
                                      borderRadius: '50%',
                                      padding: 0,
                                      border: 'none',
                                      backgroundColor: isChecked ? 'var(--color-primary)' : 'var(--color-surface-bright)',
                                      color: isChecked ? '#111316' : 'var(--color-text)',
                                      fontWeight: 'bold',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s'
                                    }}
                                  >
                                    S{setNum}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button 
                      className="btn btn-primary btn-block mt-8 animate-pulse" 
                      onClick={() => logWorkoutComplete(workoutPlan.days[viewWorkoutDay - 1].name)}
                    >
                      Mark Workout Complete
                    </button>
                  </div>
                )}
              </div>
            ) : <p>{t('workoutsNotFound')}</p>}
          </div>
        </div>
      )}

      {/* 6. WEIGHT PROGRESS VIEW (PART OF PROGRESS INSIGHTS) */}
      {(activeTab === 'weight' || activeTab === 'progress_insights') && (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <h3 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span className="material-symbols-outlined">monitor_weight</span>
            {t('weightTrend')}
          </h3>

          {/* Key Weight stats card row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
              <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Starting Weight</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{wMetrics.startingWeight.toFixed(1)} {user?.weightUnit || 'kg'}</div>
            </div>
            <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
              <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Current Weight</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{wMetrics.currentWeight.toFixed(1)} {user?.weightUnit || 'kg'}</div>
            </div>
            <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
              <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Weekly Average</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-primary-light)' }}>{wMetrics.weeklyAverage.toFixed(1)} {user?.weightUnit || 'kg'}</div>
            </div>
            <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
              <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Trend</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-tertiary)' }}>{wMetrics.trendText}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* SVG Trendline Chart */}
            <div className="md:col-span-2 flex-col">
              <h3 style={{ marginBottom: '1rem' }}>📉 Weight Progress Trendline</h3>
              {renderWeightChart()}
            </div>

            {/* Add Weight Form */}
            <div className="card" style={{ padding: '1.75rem', height: 'fit-content' }}>
              <h4 style={{ color: 'var(--color-primary)', marginBottom: '1.25rem' }}>Add Weight Entry</h4>
              
              <form onSubmit={handleAddWeightEntry} className="flex-col gap-3">
                <div className="form-group">
                  <label className="form-label">Weight ({user?.weightUnit || 'kg'})</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-control" 
                    value={newWeight} 
                    onChange={e => setNewWeight(e.target.value)} 
                    placeholder="e.g. 74.5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={weightDate} 
                    onChange={e => setWeightDate(e.target.value)} 
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Progress Note</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={weightNote} 
                    onChange={e => setWeightNote(e.target.value)} 
                    placeholder="e.g. Feeling lighter"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block mt-2">
                  Add Weight Entry
                </button>
              </form>
            </div>
          </div>

          {/* Weight entries history logs list */}
          <div className="card" style={{ padding: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>📋 Weigh-in History Logs</h4>
            <p className="text-muted" style={{ fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              ℹ️ Daily weight can fluctuate due to water, sleep, food, and hormones. Weekly averages show progress more clearly.
            </p>

            {weightEntries.length === 0 ? (
              <p className="text-center text-muted" style={{ padding: '1.5rem 0' }}>No history logs found.</p>
            ) : (
              <div className="flex-col gap-2" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {[...weightEntries].sort((a,b) => new Date(b.date) - new Date(a.date)).map((entry) => (
                  <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <div className="flex gap-2 items-center">
                        <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary-light)' }}>{entry.weight} {user?.weightUnit || 'kg'}</strong>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{entry.date}</span>
                      </div>
                      <small className="text-muted" style={{ fontStyle: 'italic' }}>{entry.note}</small>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => removeWeightEntry(entry.id)} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 7. GROCERY LIST VIEW */}
      {activeTab === 'grocery' && selectedPlanType !== 'workout_only' && (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {groceryList && Object.keys(groceryList).length > 0 ? (
            <GroceryList groceryList={groceryList} currency={user?.currency || 'USD'} t={t} />
          ) : (
            <div className="card text-center text-muted">
              <p>Grocery list is empty. Please regenerate your meal plan.</p>
            </div>
          )}
        </div>
      )}

      {/* 8. TOOLS TAB */}
      {activeTab === 'tools' && selectedPlanType !== 'nutrition_only' && (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BMI Calculator */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined">health_and_safety</span>
                BMI Calculator
              </h3>
              
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input type="number" className="form-control" value={toolHeight} onChange={e => setToolHeight(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Weight ({user?.weightUnit || 'kg'})</label>
                <input type="number" className="form-control" value={toolWeight} onChange={e => setToolWeight(e.target.value)} />
              </div>

              <button className="btn btn-primary btn-block mt-2" onClick={calculateBmiTool}>
                Calculate BMI
              </button>

              {bmiResult && (
                <div className="animate-fade-in" style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Your BMI Score</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{bmiResult.score}</div>
                  <div style={{ fontWeight: '600' }}>{bmiResult.category}</div>
                </div>
              )}
            </div>

            {/* BMR / TDEE Calculator */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined">bolt</span>
                BMR & TDEE Estimator
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input type="number" className="form-control" value={toolAge} onChange={e => setToolAge(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={toolGender} onChange={e => setToolGender(e.target.value)}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Activity Level</label>
                <select className="form-control" value={toolActivity} onChange={e => setToolActivity(e.target.value)}>
                  <option value="sedentary">Very low (Sedentary)</option>
                  <option value="light">Light activity</option>
                  <option value="moderate">Moderate activity</option>
                  <option value="high">High activity</option>
                  <option value="very_high">Very high activity</option>
                </select>
              </div>

              <button className="btn btn-primary btn-block mt-2" onClick={calculateBmrTool}>
                Estimate Energy Needs
              </button>

              {bmrResult && tdeeResult && (
                <div className="animate-fade-in grid grid-cols-2 gap-2" style={{ marginTop: '1.5rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>BMR</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{bmrResult} kcal</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>TDEE</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{tdeeResult} kcal</div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Premium Video Demo Launcher card */}
          <div className="card text-center" style={{ marginTop: '2rem', padding: '3rem 2rem' }}>
            <span className="material-symbols-outlined text-primary animate-pulse" style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>play_circle</span>
            <h3>Watch Premium App Walkthrough</h3>
            <p className="text-muted" style={{ maxWidth: '500px', margin: '0.5rem auto 2rem auto', fontSize: '0.95rem' }}>
              Learn how to maximize calorie tracking, scan meals correctly, execute rest days, and hit your target goals.
            </p>
            <button className="btn btn-primary" onClick={() => setShowDemoVideo(true)}>
              Watch Demo
            </button>
          </div>
        </div>
      )}

      {/* 9. PROGRESS ESTIMATOR DETAIL TAB */}
      {activeTab === 'progress' && (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card" style={{ borderTop: '4px solid var(--color-primary)', padding: '2.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--color-primary)' }}>{t('tabProgress')}</h3>
            {renderProgressEstimation()}
            
            <hr style={{ margin: '2rem 0', borderColor: 'rgba(255, 255, 255, 0.08)' }} />
            
            <h3 style={{ marginBottom: '1.25rem' }}>Final Plan Summary</h3>
            <p style={{ lineHeight: '1.6', fontSize: '1.05rem' }}>
              {langCode === 'en' ? (
                <>
                  Your target is <strong>{targetCalories || 0} kcal</strong> per day with approximately <strong>{macros?.proteinGrams || 0}g protein</strong>, <strong>{macros?.carbsGrams || 0}g carbs</strong>, and <strong>{macros?.fatGrams || 0}g fat</strong>.
                </>
              ) : (
                <>
                  თქვენი დღიური მიზანია <strong>{targetCalories || 0} კკალ</strong>, კერძოდ დაახლოებით <strong>{macros?.proteinGrams || 0}გრ ცილა</strong>, <strong>{macros?.carbsGrams || 0}გრ ნახშირწყალი</strong>, და <strong>{macros?.fatGrams || 0}გრ ცხიმი</strong>.
                </>
              )}
              <br/>
              <strong>Goal:</strong> {
                langCode === 'en' 
                  ? (user?.goal || 'Maintain / Healthy Lifestyle')
                  : (user?.goal === 'lose' || user?.goal === 'Lose weight' ? 'წონაში კლება' : user?.goal === 'gain' || user?.goal === 'Gain muscle' ? 'კუნთის მომატება' : 'ჯანსაღი ცხოვრების წესი / შენარჩუნება')
              }
            </p>
            
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '1.5rem', fontStyle: 'italic', opacity: 0.7 }}>
              {langCode === 'en' 
                ? 'This estimate is for general guidance only and does not replace advice from a doctor or registered dietitian.'
                : 'ეს შეფასება მხოლოდ საინფორმაციო ხასიათისაა და არ ანაცვლებს ექიმის ან პროფესიონალი კვების სპეციალისტის რეკომენდაციას.'}
            </p>
          </div>
        </div>
      )}

      {/* MOCK VIDEO PLAYER MODAL */}
      {showDemoVideo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{
            maxWidth: '640px',
            width: '100%',
            backgroundColor: 'var(--color-surface-container)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowDemoVideo(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: 'var(--color-text)',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>📺 Premium Video Demonstration</h3>
            
            <div style={{
              width: '100%',
              aspectRatio: '16/9',
              backgroundColor: '#000',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #111316 0%, #1e2023 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem'
              }}>
                <span className={`material-symbols-outlined text-primary ${isPlaying ? 'animate-pulse' : ''}`} style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {isPlaying ? 'graphic_eq' : 'pause_circle'}
                </span>
                
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {isPlaying 
                    ? `Playing walkthrough at ${playbackSpeed}x speed...`
                    : 'Playback Paused'}
                </span>

                {audioDescription && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(107, 251, 154, 0.1)',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--color-primary-light)',
                    maxWidth: '80%'
                  }}>
                    [ Audio Description: Displaying walkthrough dashboard tracking calorie logs ]
                  </div>
                )}
              </div>

              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}>
                <div style={{ height: '100%', width: `${videoProgress}%`, backgroundColor: 'var(--color-primary)' }} />
              </div>
            </div>

            <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" onClick={() => setIsPlaying(!isPlaying)}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setAudioDescription(!audioDescription)} style={{ borderColor: audioDescription ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>audio_file</span>
                </button>
              </div>

              <div className="flex gap-2">
                {[1.0, 1.5, 2.0].map(sp => (
                  <button
                    key={sp}
                    className="btn btn-sm"
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.8rem',
                      backgroundColor: playbackSpeed === sp ? 'var(--color-primary)' : 'var(--color-surface-bright)',
                      color: playbackSpeed === sp ? '#111316' : 'var(--color-text)'
                    }}
                    onClick={() => setPlaybackSpeed(sp)}
                  >
                    {sp}x
                  </button>
                ))}
              </div>
            </div>

            <p className="text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
              ℹ️ Disclaimer: High-speed walkthrough video requires standard active subscription.
            </p>

            <button className="btn btn-primary btn-block mt-4" onClick={() => setShowDemoVideo(false)}>
              Close Walkthrough
            </button>
          </div>
        </div>
      )}

      {/* Embedded CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.02); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default ResultsDashboard;
