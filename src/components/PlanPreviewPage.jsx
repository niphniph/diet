

const PlanPreviewPage = ({ calculatedPlan, questionnaireAnswers, isSubscribed, onUnlock, onRecalculate, onDashboard }) => {
  if (!calculatedPlan) {
    return (
      <div className="container plan-preview-page">
        <div className="card empty-state">
          <span className="material-symbols-outlined text-primary">assignment</span>
          <h2>No plan calculated yet</h2>
          <p className="text-muted">Answer the questionnaire first so NutriPlan can calculate your preview.</p>
          <button className="btn btn-primary" onClick={onRecalculate}>Calculate My Plan</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container plan-preview-page">
      <div className="preview-hero">
        <span className="material-symbols-outlined text-primary">workspace_premium</span>
        <div>
          <h2>Your personalized NutriPlan is ready.</h2>
          <p className="text-muted">
            Subscribe to unlock the full meal plan, scanner tools, progress insights, and daily recommendations.
          </p>
        </div>
      </div>

      <div className="preview-stats-grid">
        <div className="card preview-stat">
          <span>Estimated Daily Calories</span>
          <strong>{calculatedPlan.calories}</strong>
          <p className="text-muted">Based on your goal, age, activity, height, and weight.</p>
        </div>
        <div className="card preview-stat">
          <span>Protein</span>
          <strong>{calculatedPlan.macros?.proteinGrams || 0}g</strong>
          <p className="text-muted">Target for recovery, fullness, and lean mass.</p>
        </div>
        <div className="card preview-stat">
          <span>Carbs</span>
          <strong>{calculatedPlan.macros?.carbsGrams || 0}g</strong>
          <p className="text-muted">Energy target matched to your plan.</p>
        </div>
        <div className="card preview-stat">
          <span>Fat</span>
          <strong>{calculatedPlan.macros?.fatGrams || 0}g</strong>
          <p className="text-muted">Balanced support for hormones and satiety.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card preview-card">
          <h3>Recommended Focus</h3>
          <p>{calculatedPlan.recommendedFocus}</p>
          <div className="mini-stats">
            <span>{calculatedPlan.mealsPerDay} meals per day</span>
            <span>{calculatedPlan.workoutFrequency} workouts per week</span>
            <span>{questionnaireAnswers?.waterIntakeGoal || 2}L water goal</span>
            <span>{questionnaireAnswers?.sleepHours || 7}h sleep target</span>
          </div>
        </div>

        <div className="card preview-card locked-detail-card">
          <span className="material-symbols-outlined text-primary">lock</span>
          <h3>Locked Full Plan Preview</h3>
          <ul className="subscription-list">
            {calculatedPlan.lockedDetails.map((detail) => (
              <li key={detail}><span className="material-symbols-outlined text-primary">lock</span>{detail}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card preview-message-card">
        <h3>Personalized Message</h3>
        <p className="text-muted">{calculatedPlan.personalizedMessage}</p>
        <div className="preview-actions">
          <button className="btn btn-outline" onClick={onRecalculate}>Recalculate My Plan</button>
          {isSubscribed ? (
            <button className="btn btn-primary" onClick={onDashboard}>Go to Dashboard</button>
          ) : (
            <button className="btn btn-primary" onClick={onUnlock}>Unlock Full Plan</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanPreviewPage;
