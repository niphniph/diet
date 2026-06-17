

const PlanTypeSelection = ({ onSelectPlanType, t }) => {
  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="text-center animate-fade-in" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('selectPlanTitle')}</h2>
        <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          {t('selectPlanSubtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 w-full animate-fade-in" style={{ maxWidth: '1000px' }}>
        
        {/* Nutrition Only */}
        <div 
          className="card text-center" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '2rem' }}
          onClick={() => onSelectPlanType('nutrition_only')}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '3rem', marginBottom: '1rem' }}>restaurant</span>
          <h3 style={{ marginBottom: '1rem' }}>{t('planNutrition')}</h3>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            {t('planNutritionDesc')}
          </p>
        </div>

        {/* Workout Only */}
        <div 
          className="card text-center" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '2rem' }}
          onClick={() => onSelectPlanType('workout_only')}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '3rem', marginBottom: '1rem' }}>fitness_center</span>
          <h3 style={{ marginBottom: '1rem' }}>{t('planWorkout')}</h3>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            {t('planWorkoutDesc')}
          </p>
        </div>

        {/* Bundle */}
        <div 
          className="card text-center" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '2rem', border: '2px solid var(--color-primary)', boxShadow: 'var(--shadow-glow)' }}
          onClick={() => onSelectPlanType('nutrition_workout_bundle')}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '3rem', marginBottom: '1rem' }}>bolt</span>
          <h3 style={{ marginBottom: '1rem' }}>{t('planBundle')}</h3>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            {t('planBundleDesc')}
          </p>
        </div>

      </div>
    </div>
  );
};

export default PlanTypeSelection;
