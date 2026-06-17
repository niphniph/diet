import { useState } from 'react';

const CATEGORY_TRANSLATIONS = {
  ka: {
    'vegetables': 'ბოსტნეული',
    'fruits': 'ხილი',
    'proteins': 'ცილები / ხორცი / თევზი',
    'meat': 'ხორცი',
    'fish': 'თევზი',
    'grains': 'ბურღულეული / ნახშირწყლები',
    'carbs': 'ნახშირწყლები',
    'fats': 'ცხიმები / ზეთები',
    'dairy': 'რძის პროდუქტები',
    'nuts': 'თხილი / თესლეული',
    'seeds': 'თესლეული',
    'other': 'სხვადასხვა'
  }
};

const GroceryList = ({ groceryList, currency, t }) => {
  const [checkedItems, setCheckedItems] = useState({});
  const langCode = t('home') === 'Home' ? 'en' : 'ka';

  const toggleCheck = (category, item) => {
    const key = `${category}-${item}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const translateCategory = (cat) => {
    if (langCode === 'ka') {
      const lower = cat.toLowerCase();
      for (const [key, val] of Object.entries(CATEGORY_TRANSLATIONS.ka)) {
        if (lower.includes(key)) return val;
      }
    }
    return cat;
  };

  const handleCopy = () => {
    let titleText = langCode === 'en' 
      ? "NutriPlan Global - Grocery List\n\n" 
      : "NutriPlan Global - საყიდლების სია\n\n";

    let text = titleText;
    Object.keys(groceryList).forEach(category => {
      text += `${translateCategory(category)}:\n`;
      Object.keys(groceryList[category]).forEach(item => {
        text += `- ${item}: ${groceryList[category][item]}g\n`;
      });
      text += '\n';
    });
    navigator.clipboard.writeText(text);
    
    alert(langCode === 'en' 
      ? 'Grocery list copied to clipboard!' 
      : 'საყიდლების სია კოპირებულია!');
  };

  const categories = Object.keys(groceryList);

  if (categories.length === 0) {
    return (
      <div className="card text-center text-muted" style={{ padding: '2rem' }}>
        {langCode === 'en' ? 'No items in the grocery list yet.' : 'საყიდლების სია ჯერ ცარიელია.'}
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '2rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{t('groceryHeader') || t('tabGroceryList')}</h2>
        <div className="flex gap-2">
          <button 
            className="btn btn-outline btn-sm" 
            onClick={() => setCheckedItems({})}
            style={{ borderColor: 'rgba(255,255,255,0.15)' }}
          >
            {langCode === 'en' ? 'Clear Checks' : 'მონიშვნების წაშლა'}
          </button>
          <button className="btn btn-primary btn-sm animate-pulse" onClick={handleCopy}>
            {langCode === 'en' ? 'Copy List' : 'კოპირება'}
          </button>
        </div>
      </div>
      
      <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>
        {langCode === 'en' 
          ? `Estimated total cost will depend on your local ${currency} prices.` 
          : `სავარაუდო სრული ღირებულება დამოკიდებული იქნება თქვენს ლოკალურ ${currency} ფასებზე.`}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map(category => (
          <div key={category} style={{ marginBottom: '1rem' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)', fontSize: '1.15rem' }}>
              {translateCategory(category)}
            </h3>
            <div className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.keys(groceryList[category]).map(item => {
                const key = `${category}-${item}`;
                const isChecked = checkedItems[key] || false;
                return (
                  <label 
                    key={item} 
                    className="checkbox-label" 
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      opacity: isChecked ? 0.4 : 1, 
                      textDecoration: isChecked ? 'line-through' : 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={() => toggleCheck(category, item)} 
                      style={{
                        cursor: 'pointer',
                        accentColor: 'var(--color-primary)'
                      }}
                    />
                    <span>{item} ({groceryList[category][item]}{t('metricGrams')})</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroceryList;
