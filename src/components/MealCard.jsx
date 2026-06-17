

const MealCard = ({ meal, onReplace, t }) => {
  const langCode = t('home') === 'Home' ? 'en' : 'ka';

  const translateMealType = (type) => {
    if (langCode === 'ka') {
      const lower = String(type).toLowerCase();
      if (lower.includes('breakfast')) return 'საუზმე';
      if (lower.includes('lunch')) return 'სადილი';
      if (lower.includes('dinner')) return 'ვახშამი';
      if (lower.includes('snack')) return 'წახემსება';
      return type;
    }
    return type;
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ textTransform: 'capitalize', margin: 0 }}>
            {translateMealType(meal.type)}: {meal.name}
          </h3>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
            <span style={{ marginRight: '10px' }}>⏱️ {meal.prepTime}</span>
            <span>💰 {meal.cost === 'low' ? (langCode === 'en' ? 'Budget' : 'ბიუჯეტური') : meal.cost === 'medium' ? (langCode === 'en' ? 'Moderate' : 'საშუალო ბიუჯეტი') : (langCode === 'en' ? 'Premium' : 'პრემიუმი')} {langCode === 'en' ? 'Cost' : 'ღირებულება'}</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--color-primary)' }}>
            {meal.calories} {langCode === 'en' ? 'kcal' : 'კკალ'}
          </div>
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            {meal.macros.protein}{langCode === 'en' ? 'g P' : 'გრ ცილა'} • {meal.macros.carbs}{langCode === 'en' ? 'g C' : 'გრ ნახშირწყალი'} • {meal.macros.fat}{langCode === 'en' ? 'g F' : 'გრ ცხიმი'}
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>{langCode === 'en' ? 'Ingredients:' : 'ინგრედიენტები:'}</strong>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          {Array.isArray(meal?.foods) && meal.foods.length > 0 ? meal.foods.map((food, idx) => (
            <li key={idx}>
              {food.amount}{t('metricGrams')} {food.name}
            </li>
          )) : <li>{langCode === 'en' ? 'Ingredients missing' : 'ინგრედიენტები არ არის მითითებული'}</li>}
        </ul>
      </div>
      
      <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <strong>{langCode === 'en' ? 'Recipe:' : 'რეცეპტი:'}</strong>
        <p style={{ marginTop: '0.5rem', lineHeight: '1.5' }}>{meal?.instructions || (langCode === 'en' ? 'Instructions not available.' : 'ინსტრუქცია არ არის ხელმისაწვდომი.')}</p>
      </div>
      
      <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <strong>{langCode === 'en' ? 'Easy swaps:' : 'მარტივი ჩანაცვლება:'}</strong>
        {Array.isArray(meal?.easySwaps) ? (
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            {meal.easySwaps.map((s, i) => <li key={i} style={{ color: 'var(--color-text-muted)' }}>{s}</li>)}
          </ul>
        ) : (
          <p style={{ marginTop: '0.5rem', margin: 0, color: 'var(--color-text-muted)' }}>
            {meal?.swaps || (langCode === 'en' ? 'No swaps available.' : 'ჩანაცვლება არ არის.')}
          </p>
        )}
      </div>
      
      <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <span className="badge">
          {langCode === 'en' ? 'Local Recommendation' : 'ლოკალური რეკომენდაცია'}
        </span>
        <button className="btn btn-outline btn-sm animate-pulse" onClick={() => onReplace(meal)}>
          {t('btnSwapMeal')}
        </button>
      </div>
    </div>
  );
};

export default MealCard;
