import { useState, useEffect } from 'react';
import { COUNTRIES_LIST, getBudgetRanges } from '../utils/countriesData';

const questionImages = {
  gender: {
    src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
    alt: "Inclusive wellness and lifestyle illustration"
  },
  age: {
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
    alt: "Healthy active individual profile"
  },
  height: {
    src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    alt: "Body measurement metrics"
  },
  weight: {
    src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
    alt: "Weight tracking scale"
  },
  goal: {
    src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    alt: "Person setting active wellness goals"
  },
  speed: {
    src: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80",
    alt: "Progress path and journey timeline"
  },
  activityLevel: {
    src: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=600&q=80",
    alt: "Active gym running and physical training"
  },
  mealsPerDay: {
    src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    alt: "Healthy food plates and diet prep"
  },
  snacks: {
    src: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
    alt: "Healthy snacks and berries"
  },
  diet: {
    src: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80",
    alt: "Organic vegetable food bowl"
  },
  allergies: {
    src: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
    alt: "Allergy and healthy eating awareness"
  },
  country: {
    src: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80",
    alt: "Location globes and travel maps"
  },
  city: {
    src: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=600&q=80",
    alt: "Metropolitan city pin location"
  },
  cuisineStyle: {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    alt: "Gourmet culinary dish styling"
  },
  budget: {
    src: "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?auto=format&fit=crop&w=600&q=80",
    alt: "Healthy foods shopping basket"
  },
  cookingTime: {
    src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
    alt: "Quick cooking preparation in kitchen"
  },
  flexibility: {
    src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    alt: "Flexible nutrition swaps selection"
  },
  planLength: {
    src: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
    alt: "Calendar split showing duration selection"
  },
  fitnessGoal: {
    src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    alt: "Athletic body building progress"
  },
  fitnessLevel: {
    src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    alt: "Beginner or advanced gym capabilities"
  },
  workoutDays: {
    src: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
    alt: "Weekly training sessions planner"
  },
  availableEquipment: {
    src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    alt: "Dumbbells and kettlebell fitness gears"
  },
  unavailableMachines: {
    src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    alt: "Weight plates and gym machinery to filter out"
  },
  ready: {
    src: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80",
    alt: "Success and personal trainer consultation"
  }
};

const QuestionVisual = ({ questionId }) => {
  const [imageError, setImageError] = useState(false);
  const imageData = questionImages[questionId];

  if (!imageData || imageError) {
    return (
      <div style={{
        width: '100%',
        height: '180px',
        background: 'linear-gradient(135deg, rgba(107, 251, 154, 0.08) 0%, rgba(30, 32, 35, 0.6) 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <span className="material-symbols-outlined text-primary animate-pulse" style={{ fontSize: '3rem', opacity: 0.6 }}>spa</span>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '180px',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      marginBottom: '1.5rem',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative'
    }}>
      <img
        src={imageData.src}
        alt={imageData.alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        onError={() => setImageError(true)}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(17, 19, 22, 0.8) 0%, transparent 100%)'
      }} />
    </div>
  );
};

const NUTRITION_QUESTIONS = [
  { id: 'gender', title: "What is your gender?", type: "options", options: ["Female", "Male", "Other"] },
  { id: 'age', title: "What is your age?", type: "input", inputType: "number", placeholder: "e.g., 28" },
  { id: 'height', title: "What is your height?", type: "input", inputType: "number", placeholder: "cm" },
  { id: 'weight', title: "What is your current weight?", type: "input", inputType: "number", placeholder: "kg" },
  { id: 'goal', title: "What is your main nutrition goal?", type: "options", options: ["Lose weight", "Maintain weight", "Gain muscle", "Build healthier eating habits"] },
  { id: 'speed', title: "How fast do you want to progress?", type: "options", options: ["Slow and sustainable", "Moderate", "Fast"] },
  { id: 'activityLevel', title: "What is your daily activity level?", type: "options", options: ["Very low", "Light", "Moderate", "High", "Very high"] },
  { id: 'mealsPerDay', title: "How many meals do you prefer per day?", type: "options", options: ["3 meals", "4 meals", "5 meals"] },
  { id: 'snacks', title: "Do you want snacks included?", type: "options", options: ["Yes", "No"] },
  { id: 'diet', title: "What diet type do you prefer?", type: "options", options: ["Anything", "Vegetarian", "Vegan", "Low carb", "Mediterranean"] },
  { id: 'allergies', title: "Do you have any allergies?", type: "multi-select", options: ["Nuts", "Dairy", "Eggs", "Gluten", "Fish", "Shellfish", "Soy", "None"] },
  { id: 'country', title: "What country are you in?", type: "country-search-select" },
  { id: 'city', title: "What city or region are you in?", type: "city-search-select" },
  { id: 'cuisineStyle', title: "What food style do you prefer?", type: "options", options: ["Local cuisine based on my country", "International healthy meals", "Mediterranean"] },
  { id: 'budget', title: "What is your daily food budget?", type: "budget-currency-select" },
  { id: 'cookingTime', title: "How much time can you spend cooking?", type: "options", options: ["20 minutes", "30 minutes"] },
  { id: 'flexibility', title: "How flexible should your plan be?", type: "options", options: ["Strict and structured", "Balanced", "Flexible with swaps"] },
  { id: 'planLength', title: "Which plan length are you interested in?", type: "options", options: ["7-Day Meal Plan", "30-Day Meal Plan"] }
];

const WORKOUT_QUESTIONS = [
  { id: 'fitnessGoal', title: "What is your main fitness goal?", type: "options", options: ["Lose weight", "Build muscle", "Improve endurance", "Overall health"] },
  { id: 'fitnessLevel', title: "What is your current fitness level?", type: "options", options: ["Beginner", "Intermediate", "Advanced"] },
  { id: 'workoutDays', title: "How many days per week can you train?", type: "options", options: ["2 days", "3 days", "4 days", "5 days"] },
  { id: 'availableEquipment', title: "What equipment do you have access to?", type: "multi-select", options: ["Full Gym", "Dumbbells Only", "Resistance Bands", "Bodyweight Only"] },
  { id: 'unavailableMachines', title: "Which machines or items do you want to avoid?", type: "multi-select", options: ["Leg Press", "Smith Machine", "Cable Machine", "Treadmill", "None"] }
];

const QuizFlow = ({ onComplete, selectedPlanType, t }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem('nutriplan_quiz_answers');
    const parsed = saved ? JSON.parse(saved) : {};
    if (!parsed.weightUnit) {
      parsed.weightUnit = 'kg';
    }
    return parsed;
  });

  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const [citySearch, setCitySearch] = useState('');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [isCityManual, setIsCityManual] = useState(false);
  const [manualCityValue, setManualCityValue] = useState('');

  // Dynamically generate the quiz questions based on selected plan type
  const getQuestions = () => {
    let questions;
    if (selectedPlanType === 'nutrition_only') {
      questions = [...NUTRITION_QUESTIONS];
    } else if (selectedPlanType === 'workout_only') {
      const baseStats = NUTRITION_QUESTIONS.filter(q => ['gender', 'age', 'height', 'weight'].includes(q.id));
      questions = [...baseStats, ...WORKOUT_QUESTIONS];
    } else {
      questions = [...NUTRITION_QUESTIONS, ...WORKOUT_QUESTIONS];
    }
    
    // Add final ready screen
    questions.push({ id: 'ready', title: "Are you ready to unlock your personalized plan?", type: "info", text: "Your answers are complete. We’re preparing your secure plan." });
    
    return questions;
  };

  const currentQuestions = getQuestions();

  useEffect(() => {
    localStorage.setItem('nutriplan_quiz_answers', JSON.stringify(answers));
  }, [answers]);

  const handleOptionSelect = (option) => {
    const question = currentQuestions[currentStep];
    if (!question) return;

    setAnswers({ ...answers, [question.id]: option });
    
    // If selecting Fast weight loss, do NOT auto-advance, show the warning first
    if (question.id === 'speed' && option === 'Fast') {
      return;
    }

    setTimeout(() => {
      handleNextSafe();
    }, 300);
  };

  const handleMultiSelect = (option) => {
    const qId = currentQuestions[currentStep].id;
    const currentSelected = answers[qId] || [];
    let newSelected;
    
    if (option === 'None') {
      newSelected = ['None'];
    } else {
      const withoutNone = currentSelected.filter(item => item !== 'None');
      if (withoutNone.includes(option)) {
        newSelected = withoutNone.filter(item => item !== option);
      } else {
        newSelected = [...withoutNone, option];
      }
    }
    
    setAnswers({ ...answers, [qId]: newSelected });
  };

  const handleNextSafe = () => {
    setCurrentStep(curr => {
      const nextStep = curr + 1;
      if (nextStep < currentQuestions.length) {
        return nextStep;
      } else {
        setTimeout(() => onComplete(answers), 0);
        return curr;
      }
    });
  };

  const handleBack = () => {
    setCurrentStep(curr => Math.max(0, curr - 1));
  };

  const question = currentQuestions[currentStep];

  if (!question) {
    setTimeout(() => onComplete(answers), 0);
    return <div className="container text-center" style={{padding: '5rem'}}>Loading...</div>;
  }

  const progressPercent = ((currentStep + 1) / currentQuestions.length) * 100;

  const langCode = t('home') === 'Home' ? 'en' : 'ka';
  const getValidationError = () => {
    if (!question) return '';
    
    if (question.id === 'age') {
      const val = answers.age;
      if (!val) return '';
      const num = parseInt(val);
      if (isNaN(num) || num < 1 || num > 120 || !/^\d+$/.test(val)) {
        return langCode === 'en' ? 'Age must be a whole number between 1 and 120.' : 'ასაკი უნდა იყოს მთელი რიცხვი 1-დან 120-მდე.';
      }
    }
    
    if (question.id === 'height') {
      const unit = answers.heightUnit || 'cm';
      if (unit === 'cm') {
        const val = answers.height;
        if (!val) return '';
        const num = parseFloat(val);
        if (isNaN(num) || num < 50 || num > 300) {
          return langCode === 'en' ? 'Height must be between 50 and 300 cm.' : 'სიმაღლე უნდა იყოს 50-დან 300 სმ-მდე.';
        }
      } else {
        const ftVal = answers.heightFeet;
        const inVal = answers.heightInches || '0';
        if (!ftVal) return '';
        const ft = parseFloat(ftVal);
        const inch = parseFloat(inVal);
        if (isNaN(ft) || ft < 2 || ft > 10 || isNaN(inch) || inch < 0 || inch > 11) {
          return langCode === 'en' ? 'Height must be between 2 and 10 feet (Inches 0 to 11).' : 'სიმაღლე უნდა იყოს 2-დან 10 ფუტამდე (დუიმები 0-დან 11-მდე).';
        }
      }
    }
    
    if (question.id === 'weight') {
      const unit = answers.weightUnit || 'kg';
      const val = answers.weight;
      if (!val) return '';
      const num = parseFloat(val);
      if (unit === 'kg') {
        if (isNaN(num) || num < 10 || num > 500) {
          return langCode === 'en' ? 'Weight must be between 10 and 500 kg.' : 'წონა უნდა იყოს 10-დან 500 კგ-მდე.';
        }
      } else {
        if (isNaN(num) || num < 20 || num > 1100) {
          return langCode === 'en' ? 'Weight must be between 20 and 1100 lbs.' : 'წონა უნდა იყოს 20-დან 1100 ფუნტამდე.';
        }
      }
    }
    
    return '';
  };

  const validationError = getValidationError();
  let isNextDisabled = false;
  if (validationError) {
    isNextDisabled = true;
  } else if (question.type === 'input') {
    const requiredInputs = ['age', 'height', 'weight'];
    if (question.id === 'height') {
      const unit = answers.heightUnit || 'cm';
      if (unit === 'cm') {
        isNextDisabled = !answers.height;
      } else {
        isNextDisabled = !answers.heightFeet;
      }
    } else if (question.id === 'weight') {
      isNextDisabled = !answers.weight;
    } else if (requiredInputs.includes(question.id) && !answers[question.id]) {
      isNextDisabled = true;
    }
  } else if (question.type === 'country-search-select') {
    if (!answers.country) {
      isNextDisabled = true;
    }
  } else if (question.type === 'city-search-select') {
    if (!answers.city) {
      isNextDisabled = true;
    }
  } else if (question.type === 'budget-currency-select') {
    if (!answers.budgetLevel) {
      isNextDisabled = true;
    }
  }

  // Search Logic for Country selector
  const filteredCountries = COUNTRIES_LIST.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Search Logic for City selector
  const selectedCountryObj = COUNTRIES_LIST.find(c => c.name === answers.country);
  const majorCities = selectedCountryObj ? selectedCountryObj.cities : [];
  const citiesWithOptions = [...majorCities, "Other / Type manually"];
  const filteredCities = citiesWithOptions.filter(city => 
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Localized Titles
  const getQuestionTitle = (q) => {
    if (q.id === 'weight') {
      return langCode === 'en' ? "What is your current weight?" : "რა არის თქვენი ამჟამინდელი წონა?";
    }
    if (q.id === 'height') {
      return langCode === 'en' ? "What is your height?" : "რა არის თქვენი სიმაღლე?";
    }
    const key = `q_${q.id}_title`;
    return t(key) !== key ? t(key) : q.title;
  };

  // Localized Option Labels
  const getOptionLabel = (opt) => {
    const normalized = opt.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const key = `opt_${normalized}`;
    return t(key) !== key ? t(key) : opt;
  };

  // UI Language Check
// langCode already defined earlier
  const progressText = langCode === 'en' 
    ? `Question ${currentStep + 1} of ${currentQuestions.length}`
    : `კითხვა ${currentStep + 1} / ${currentQuestions.length}-დან`;

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '2rem', paddingBottom: '4rem' }}>
      
      {/* Progress Bar */}
      <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
        <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          <span>{progressText}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div style={{ height: '6px', backgroundColor: 'var(--color-surface-container-highest)', borderRadius: '3px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              backgroundColor: 'var(--color-primary)', 
              width: `${progressPercent}%`,
              transition: 'width 0.4s ease',
              boxShadow: 'var(--shadow-glow)'
            }}
          />
        </div>
      </div>

      {/* Quiz Card */}
      <div className="card animate-fade-in" key={currentStep} style={{ maxWidth: '600px', width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <QuestionVisual questionId={question.id} />
        <h2 style={{ fontSize: '1.85rem', marginBottom: '2rem', textAlign: 'center', lineHeight: '1.3' }}>
          {getQuestionTitle(question)}
        </h2>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {question.type === 'options' && (
            <div className="flex-col gap-2">
              {question.options.map((opt, idx) => {
                const isSelected = answers[question.id] === opt;
                return (
                  <button
                    key={idx}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      width: '100%', 
                      padding: '1.25rem', 
                      fontSize: '1.125rem',
                      justifyContent: 'flex-start',
                      border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-outline-variant)'
                    }}
                    onClick={() => handleOptionSelect(opt)}
                  >
                    {getOptionLabel(opt)}
                  </button>
                );
              })}

              {/* FAST WEIGHT LOSS WARNING */}
              {question.id === 'speed' && answers.speed === 'Fast' && (
                <div className="animate-fade-in" style={{
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#f59e0b',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.75rem', flexShrink: 0 }}>warning</span>
                    <span>
                      {t('warningFastText')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {question.type === 'multi-select' && (
            <div className="flex-col gap-2">
              <p className="text-muted text-center" style={{ fontSize: '0.875rem', marginTop: '-1rem', marginBottom: '1rem' }}>
                {langCode === 'en' ? 'Select all that apply' : 'მონიშნეთ ყველა შესაბამისი'}
              </p>
              {question.options.map((opt, idx) => {
                const isSelected = (answers[question.id] || []).includes(opt);
                return (
                  <button
                    key={idx}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      width: '100%', 
                      padding: '1.25rem', 
                      fontSize: '1.125rem',
                      justifyContent: 'flex-start',
                      border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-outline-variant)'
                    }}
                    onClick={() => handleMultiSelect(opt)}
                  >
                    <div className="flex justify-between w-full items-center">
                      <span>{getOptionLabel(opt)}</span>
                      {isSelected && <span className="material-symbols-outlined">check_circle</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {question.type === 'input' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {question.id === 'weight' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder={(!answers.weightUnit || answers.weightUnit === 'kg') ? 'kg' : 'lbs'}
                    value={answers.weight || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setAnswers({ ...answers, weight: val });
                      }
                    }}
                    style={{ fontSize: '1.5rem', padding: '1.5rem', textAlign: 'center' }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isNextDisabled) handleNextSafe();
                    }}
                  />
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className={`btn ${(!answers.weightUnit || answers.weightUnit === 'kg') ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        minWidth: '80px',
                        padding: '0.6rem 1.2rem',
                        backgroundColor: (!answers.weightUnit || answers.weightUnit === 'kg') ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                        color: (!answers.weightUnit || answers.weightUnit === 'kg') ? '#111316' : 'var(--color-text)'
                      }}
                      onClick={() => {
                        const currentVal = parseFloat(answers.weight);
                        let newVal = answers.weight || '';
                        if (answers.weightUnit === 'lbs' && currentVal) {
                          newVal = (currentVal / 2.20462).toFixed(1);
                        }
                        setAnswers({ ...answers, weight: newVal, weightUnit: 'kg' });
                      }}
                    >
                      KG
                    </button>
                    <button
                      type="button"
                      className={`btn ${answers.weightUnit === 'lbs' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        minWidth: '80px',
                        padding: '0.6rem 1.2rem',
                        backgroundColor: answers.weightUnit === 'lbs' ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                        color: answers.weightUnit === 'lbs' ? '#111316' : 'var(--color-text)'
                      }}
                      onClick={() => {
                        const currentVal = parseFloat(answers.weight);
                        let newVal = answers.weight || '';
                        if ((!answers.weightUnit || answers.weightUnit === 'kg') && currentVal) {
                          newVal = (currentVal * 2.20462).toFixed(1);
                        }
                        setAnswers({ ...answers, weight: newVal, weightUnit: 'lbs' });
                      }}
                    >
                      LBS
                    </button>
                  </div>
                </div>
              ) : question.id === 'height' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(!answers.heightUnit || answers.heightUnit === 'cm') ? (
                    <input
                      type="number"
                      className="form-control"
                      placeholder="cm"
                      value={answers.height || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                          setAnswers({ ...answers, height: val });
                        }
                      }}
                      style={{ fontSize: '1.5rem', padding: '1.5rem', textAlign: 'center' }}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isNextDisabled) handleNextSafe();
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="ft"
                        value={answers.heightFeet || ''}
                        onChange={(e) => {
                          const ft = e.target.value;
                          if (ft === '' || /^\d*$/.test(ft)) {
                            const inVal = answers.heightInches || '0';
                            const cm = ft ? ((parseFloat(ft) * 12 + parseFloat(inVal)) * 2.54).toFixed(1) : '';
                            setAnswers({ ...answers, heightFeet: ft, height: cm });
                          }
                        }}
                        style={{ fontSize: '1.5rem', padding: '1.5rem', textAlign: 'center', width: '50%' }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isNextDisabled) handleNextSafe();
                        }}
                      />
                      <input
                        type="number"
                        className="form-control"
                        placeholder="in"
                        value={answers.heightInches || ''}
                        onChange={(e) => {
                          const inVal = e.target.value;
                          if (inVal === '' || /^\d*$/.test(inVal)) {
                            const ft = answers.heightFeet || '0';
                            const cm = ft ? ((parseFloat(ft) * 12 + parseFloat(inVal)) * 2.54).toFixed(1) : '';
                            setAnswers({ ...answers, heightInches: inVal, height: cm });
                          }
                        }}
                        style={{ fontSize: '1.5rem', padding: '1.5rem', textAlign: 'center', width: '50%' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isNextDisabled) handleNextSafe();
                        }}
                      />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className={`btn ${(!answers.heightUnit || answers.heightUnit === 'cm') ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        minWidth: '80px',
                        padding: '0.6rem 1.2rem',
                        backgroundColor: (!answers.heightUnit || answers.heightUnit === 'cm') ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                        color: (!answers.heightUnit || answers.heightUnit === 'cm') ? '#111316' : 'var(--color-text)'
                      }}
                      onClick={() => {
                        let newVal = answers.height || '';
                        if (answers.heightUnit === 'ft' && answers.heightFeet) {
                          const ft = parseFloat(answers.heightFeet) || 0;
                          const inVal = parseFloat(answers.heightInches) || 0;
                          newVal = ((ft * 12 + inVal) * 2.54).toFixed(1);
                        }
                        setAnswers({ ...answers, height: newVal, heightUnit: 'cm' });
                      }}
                    >
                      CM
                    </button>
                    <button
                      type="button"
                      className={`btn ${answers.heightUnit === 'ft' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        minWidth: '80px',
                        padding: '0.6rem 1.2rem',
                        backgroundColor: answers.heightUnit === 'ft' ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                        color: answers.heightUnit === 'ft' ? '#111316' : 'var(--color-text)'
                      }}
                      onClick={() => {
                        let ftVal = answers.heightFeet || '';
                        let inVal = answers.heightInches || '';
                        if ((!answers.heightUnit || answers.heightUnit === 'cm') && answers.height) {
                          const totalInches = parseFloat(answers.height) / 2.54;
                          ftVal = Math.floor(totalInches / 12).toString();
                          inVal = Math.round(totalInches % 12).toString();
                        }
                        setAnswers({ ...answers, heightFeet: ftVal, heightInches: inVal, heightUnit: 'ft' });
                      }}
                    >
                      FT/IN
                    </button>
                  </div>
                </div>
              ) : (
                <input
                  type={question.inputType}
                  className="form-control"
                  placeholder={question.placeholder}
                  value={answers[question.id] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (question.id === 'age') {
                      if (val === '' || /^\d*$/.test(val)) {
                        setAnswers({ ...answers, [question.id]: val });
                      }
                    } else {
                      setAnswers({ ...answers, [question.id]: val });
                    }
                  }}
                  style={{ fontSize: '1.5rem', padding: '1.5rem', textAlign: 'center' }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isNextDisabled) handleNextSafe();
                  }}
                />
              )}

              {/* Friendly Tips */}
              {question.id === 'age' && (
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem', textAlign: 'center', opacity: 0.8 }}>
                  💡 {langCode === 'en' ? 'Age must be between 1 and 120 years.' : 'ასაკი უნდა იყოს 1-დან 120 წლამდე.'}
                </p>
              )}
              {question.id === 'height' && (
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem', textAlign: 'center', opacity: 0.8 }}>
                  💡 {langCode === 'en' ? "Most users are between 150-190cm / 4'11\" - 6'3\"." : "მომხმარებელთა უმეტესობა არის 150-190სმ / 4'11\" - 6'3\" შორის."}
                </p>
              )}
              {question.id === 'weight' && (
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem', textAlign: 'center', opacity: 0.8 }}>
                  💡 {langCode === 'en' ? "Most users are between 50-120kg / 110-260lbs." : "მომხმარებელთა უმეტესობა არის 50-120კგ / 110-260ფუნტი შორის."}
                </p>
              )}

              {/* Validation Error Message */}
              {validationError && (
                <p className="animate-fade-in" style={{ color: 'var(--color-danger)', fontSize: '0.88rem', marginTop: '0.5rem', textAlign: 'center', fontWeight: '600' }}>
                  ⚠️ {validationError}
                </p>
              )}
            </div>
          )}

          {/* SEARCHABLE COUNTRY SELECT */}
          {question.type === 'country-search-select' && (
            <div style={{ width: '100%', position: 'relative' }}>
              <div 
                className="form-control" 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '1.25rem',
                  fontSize: '1.125rem',
                  backgroundColor: 'var(--color-surface-container-highest)',
                  border: answers.country ? '1px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                  borderRadius: '8px'
                }}
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
              >
                <span>{answers.country ? answers.country : (langCode === 'en' ? 'Select your country...' : 'აირჩიეთ ქვეყანა...')}</span>
                <span className="material-symbols-outlined">
                  {countryDropdownOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                </span>
              </div>

              {countryDropdownOpen && (
                <div className="animate-fade-in" style={{
                  position: 'absolute',
                  top: '105%',
                  left: 0,
                  right: 0,
                  zIndex: 100,
                  backgroundColor: 'var(--color-surface-container-high)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: '8px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '0.75rem'
                }}>
                  <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-surface-container-high)', padding: '0 0 0.5rem 0', zIndex: 10 }}>
                    <input
                      type="text"
                      placeholder={t('placeholder_search')}
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="form-control"
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        width: '100%',
                        backgroundColor: 'var(--color-surface-container-highest)',
                        border: '1px solid var(--color-outline-variant)'
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((c, idx) => (
                        <button
                          key={idx}
                          className="btn btn-secondary"
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            fontSize: '1rem',
                            justifyContent: 'flex-start',
                            border: 'none',
                            backgroundColor: answers.country === c.name ? 'rgba(107, 251, 154, 0.1)' : 'transparent',
                            color: answers.country === c.name ? 'var(--color-primary)' : 'var(--color-on-surface)'
                          }}
                          onClick={() => {
                            const currency = c.currency || 'USD';
                            setAnswers({ ...answers, country: c.name, currency });
                            setCountryDropdownOpen(false);
                            setCountrySearch('');
                          }}
                        >
                          {c.name}
                        </button>
                      ))
                    ) : (
                      <p className="text-muted text-center" style={{ padding: '1rem' }}>No countries found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEARCHABLE CITY SELECT */}
          {question.type === 'city-search-select' && (
            <div style={{ width: '100%', position: 'relative' }}>
              {!answers.country ? (
                <div className="alert alert-warning text-center" style={{
                  padding: '1.25rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  color: '#f59e0b'
                }}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>lock</span>
                  {langCode === 'en' ? 'Please select your country first.' : 'გთხოვთ ჯერ აირჩიოთ ქვეყანა.'}
                </div>
              ) : !isCityManual ? (
                <>
                  <div 
                    className="form-control" 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '1.25rem',
                      fontSize: '1.125rem',
                      backgroundColor: 'var(--color-surface-container-highest)',
                      border: answers.city ? '1px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                      borderRadius: '8px'
                    }}
                    onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  >
                    <span>{answers.city ? answers.city : (langCode === 'en' ? 'Select your city/region...' : 'აირჩიეთ ქალაქი...')}</span>
                    <span className="material-symbols-outlined">
                      {cityDropdownOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                    </span>
                  </div>

                  {cityDropdownOpen && (
                    <div className="animate-fade-in" style={{
                      position: 'absolute',
                      top: '105%',
                      left: 0,
                      right: 0,
                      zIndex: 100,
                      backgroundColor: 'var(--color-surface-container-high)',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: '8px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '0.75rem'
                    }}>
                      <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-surface-container-high)', padding: '0 0 0.5rem 0', zIndex: 10 }}>
                        <input
                          type="text"
                          placeholder={t('placeholder_search')}
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          className="form-control"
                          style={{
                            padding: '0.75rem',
                            fontSize: '1rem',
                            width: '100%',
                            backgroundColor: 'var(--color-surface-container-highest)',
                            border: '1px solid var(--color-outline-variant)'
                          }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {filteredCities.length > 0 ? (
                          filteredCities.map((city, idx) => (
                            <button
                              key={idx}
                              className="btn btn-secondary"
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                fontSize: '1rem',
                                justifyContent: 'flex-start',
                                border: 'none',
                                backgroundColor: answers.city === city ? 'rgba(107, 251, 154, 0.1)' : 'transparent',
                                color: answers.city === city ? 'var(--color-primary)' : 'var(--color-on-surface)'
                              }}
                              onClick={() => {
                                if (city === "Other / Type manually") {
                                  setIsCityManual(true);
                                  setAnswers({ ...answers, city: '' });
                                } else {
                                  setAnswers({ ...answers, city: city });
                                  setCityDropdownOpen(false);
                                  setCitySearch('');
                                }
                              }}
                            >
                              {city === "Other / Type manually" ? (langCode === 'en' ? "Other / Type manually" : "სხვა / ჩაწერეთ ხელით") : city}
                            </button>
                          ))
                        ) : (
                          <p className="text-muted text-center" style={{ padding: '1rem' }}>No cities found</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t('placeholder_enter_city')}
                    value={manualCityValue}
                    onChange={(e) => {
                      setManualCityValue(e.target.value);
                      setAnswers({ ...answers, city: e.target.value });
                    }}
                    style={{ fontSize: '1.25rem', padding: '1rem 1.5rem', textAlign: 'center' }}
                    autoFocus
                  />
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      setIsCityManual(false);
                      setManualCityValue('');
                      setAnswers({ ...answers, city: '' });
                    }}
                    style={{ alignSelf: 'center', padding: '0.5rem 1rem' }}
                  >
                    {langCode === 'en' ? '← Back to list' : '← უკან სიაში'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* BUDGET & DYNAMIC CURRENCY SELECTOR */}
          {question.type === 'budget-currency-select' && (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span className="badge">
                  {langCode === 'en' ? 'Auto-detected currency:' : 'ავტომატურად ნაპოვნი ვალუტა:'} {answers.currency || 'USD'}
                </span>
                
                <select
                  value={answers.currency || 'USD'}
                  onChange={(e) => setAnswers({ ...answers, currency: e.target.value })}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    backgroundColor: 'var(--color-surface-container-highest)',
                    color: 'var(--color-primary)',
                    border: '1px solid rgba(134, 148, 134, 0.3)'
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="GEL">GEL (GEL)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="TRY">TRY (₺)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="KRW">KRW (₩)</option>
                  <option value="MXN">MXN (Mex$)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>

              <div className="flex-col gap-2">
                {getBudgetRanges(answers.currency || 'USD').map((bRange, idx) => {
                  const isSelected = answers.budgetLevel === bRange.level;
                  return (
                    <button
                      key={idx}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        width: '100%',
                        padding: '1.25rem',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                        justifyContent: 'space-between',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onClick={() => {
                        setAnswers({ 
                          ...answers, 
                          budgetLevel: bRange.level, 
                          budgetRangeLabel: bRange.range, 
                          budget: bRange.range
                        });
                      }}
                    >
                      <span style={{ fontWeight: '600' }}>
                        {bRange.level === 'low' ? (langCode === 'en' ? 'Budget' : 'ბიუჯეტური') : 
                         bRange.level === 'medium' ? (langCode === 'en' ? 'Moderate' : 'საშუალო ბიუჯეტი') : 
                         (langCode === 'en' ? 'Premium' : 'პრემიუმი')}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.9rem' }}>{bRange.range}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {question.type === 'info' && (
            <div className="text-center">
              <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                {langCode === 'en' ? question.text : 'თქვენი პასუხები მიღებულია. ჩვენ ვამზადებთ თქვენს დაცულ გეგმას.'}
              </p>
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        <div className="flex-col" style={{ marginTop: '3rem' }}>
          {isNextDisabled && (
            <p className="text-danger text-center animate-fade-in" style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--color-error)' }}>
              {langCode === 'en' ? 'Please provide a valid answer to continue.' : 'გთხოვთ მიუთითოთ ვალიდური პასუხი გასაგრძელებლად.'}
            </p>
          )}
          <div className="flex justify-between items-center w-full">
            <button 
              className="btn btn-outline" 
              onClick={handleBack}
              style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
            >
              <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>arrow_back</span>
              {t('btnBack')}
            </button>
            
            {(question.type !== 'options' || (question.id === 'speed' && answers.speed === 'Fast')) && (
              <button 
                className="btn btn-primary" 
                onClick={handleNextSafe}
                disabled={isNextDisabled}
              >
                {question.id === 'speed' && answers.speed === 'Fast' ? t('btnAcknowledge') : (langCode === 'en' ? 'Continue' : 'გაგრძელება')}
                <span className="material-symbols-outlined" style={{ marginLeft: '0.5rem' }}>arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default QuizFlow;
