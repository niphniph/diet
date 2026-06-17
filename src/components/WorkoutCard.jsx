
const WorkoutCard = ({ daySplit, onReplaceExercise, t }) => {
  const langCode = t('home') === 'Home' ? 'en' : 'ka';

  const translateGoal = (goalStr) => {
    if (langCode === 'ka') {
      const lower = String(goalStr).toLowerCase();
      if (lower.includes('upper')) return 'ზედა ტანი';
      if (lower.includes('lower')) return 'ქვედა ტანი';
      if (lower.includes('push')) return 'ბიძგები (Push)';
      if (lower.includes('pull')) return 'წევები (Pull)';
      if (lower.includes('legs')) return 'ფეხები';
      if (lower.includes('full body')) return 'სრული სხეული';
      if (lower.includes('rest')) return 'დასვენება';
      return goalStr;
    }
    return goalStr;
  };

  const translateEquipment = (eq) => {
    if (langCode === 'ka') {
      const lower = String(eq).toLowerCase();
      if (lower.includes('dumbbell')) return 'ჰანტელები';
      if (lower.includes('barbell')) return 'შტანგა';
      if (lower.includes('bodyweight')) return 'საკუთარი წონა';
      if (lower.includes('band')) return 'რეზინები';
      if (lower.includes('gym') || lower.includes('machine')) return 'ტრენაჟორები';
      return eq;
    }
    return eq;
  };

  if (daySplit.isRest) {
    return (
      <div className="card animate-fade-in text-center" style={{ marginBottom: '2rem', padding: '3.5rem 2rem' }}>
        <span className="material-symbols-outlined text-primary animate-pulse" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>spa</span>
        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.55rem', color: 'var(--color-primary)' }}>
          {langCode === 'en' ? daySplit.name : 'აქტიური აღდგენის დღე'}
        </h4>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <span className="badge" style={{ backgroundColor: 'rgba(107, 251, 154, 0.1)', color: 'var(--color-primary)', border: '1px solid rgba(107, 251, 154, 0.3)', padding: '0.4rem 1rem' }}>
            {t('restDayBadge')}
          </span>
        </div>
        <p className="text-muted" style={{ lineHeight: '1.6', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
          {t('restDayDesc')}
        </p>
      </div>
    );
  }

  const displayGoal = Array.isArray(daySplit.goal) 
    ? daySplit.goal.map(g => translateGoal(g)).join(' • ') 
    : translateGoal(daySplit.goal);

  return (
    <div className="card animate-fade-in" style={{ marginBottom: '2rem', padding: '2rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary)' }}>
            {langCode === 'en' ? daySplit.name : daySplit.name.replace('Day', 'დღე')}
          </h4>
          <span className="badge mt-2" style={{ display: 'inline-block' }}>{displayGoal}</span>
        </div>
      </div>
      
      <div className="flex-col gap-4">
        {daySplit.exercises && daySplit.exercises.map((exercise, idx) => (
          <div key={idx} style={{ padding: '1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h5 style={{ margin: 0, fontSize: '1.15rem' }}>{exercise.name}</h5>
              <div className="flex gap-2">
                <span className="badge badge-secondary" style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  {translateEquipment(exercise.equipmentRequired)}
                </span>
                {exercise.replacements && exercise.replacements.length > 0 && (
                  <button 
                    className="btn btn-outline btn-sm animate-pulse" 
                    onClick={() => onReplaceExercise(daySplit.id, idx)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>swap_horiz</span>
                    {t('btnSwapExercise')}
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '1.25rem' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sets')}</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.15rem', color: 'var(--color-text)' }}>{exercise.sets}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('reps')}</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.15rem', color: 'var(--color-text)' }}>{exercise.reps}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('rest')}</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.15rem', color: 'var(--color-text)' }}>{exercise.rest}</div>
              </div>
            </div>
            
            <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.6' }}>
              <strong style={{ color: 'var(--color-text)' }}>{t('instructions')}:</strong> {exercise.instructions}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutCard;
