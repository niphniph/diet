

const Header = ({
  currentView,
  currentUser,
  hasUserData,
  hasActiveSubscription,
  setCurrentView,
  onDashboardTab,
  onResetApp,
  onLogout,
  currentLanguage,
  onLanguageChange,
  t
}) => {
  const goHome = (event) => {
    event.preventDefault();
    if (hasUserData) {
      setCurrentView('dashboard', 'overview');
      onDashboardTab?.('overview');
    } else {
      setCurrentView('landing');
    }
  };

  const goDashboard = (event, tab = 'overview') => {
    event.preventDefault();
    onDashboardTab?.(tab);
    setCurrentView('dashboard', tab);
  };

  return (
    <header className="header">
      <div className="container header-container">
        <a href="/diet" className="logo" aria-label="Go to NutriPlan dashboard" onClick={goHome}>
          <span className="material-symbols-outlined logo-icon">eco</span>
          <span>NutriPlan Global</span>
        </a>

        <nav className="nav-links" aria-label="Diet app navigation">
          <a
            href="/diet"
            className={`nav-link ${currentView === 'landing' ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault();
              setCurrentView('landing');
            }}
          >
            {t('home')}
          </a>

          <a
            href="/diet/dashboard"
            className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={(event) => goDashboard(event, 'overview')}
          >
            {t('dashboard')}
          </a>

          <a href="/diet/meal-plan" className="nav-link" onClick={(event) => goDashboard(event, 'meals')}>
            {t('nav_meal_plan')}
          </a>

          <a href="/diet/food-scanner" className="nav-link" onClick={(event) => goDashboard(event, 'scanner')}>
            {t('nav_food_scanner')}
          </a>

          <a href="/diet/progress" className="nav-link" onClick={(event) => goDashboard(event, 'progress_insights')}>
            {t('nav_progress')}
          </a>

          <a
            href="/diet/friends"
            className={`nav-link ${currentView === 'friends' ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault();
              setCurrentView('friends');
            }}
          >
            {t('nav_friends')}
          </a>

          <a
            href="/diet/leaderboard"
            className={`nav-link ${currentView === 'leaderboard' ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault();
              setCurrentView('leaderboard');
            }}
          >
            {t('nav_leaderboard')}
          </a>

          <a
            href="/diet/subscription"
            className={`nav-link ${currentView === 'paywall' ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault();
              setCurrentView('paywall');
            }}
          >
            {t('nav_subscription')}
          </a>

          <a
            href="/diet/terms"
            className={`nav-link ${currentView === 'terms' ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault();
              setCurrentView('terms');
            }}
          >
            {t('nav_terms')}
          </a>

          {!currentUser && (
            <button className="btn btn-outline btn-sm" onClick={() => setCurrentView('register')}>
              {t('nav_login_register')}
            </button>
          )}

          {hasActiveSubscription && onResetApp && (
            <button className="btn btn-outline btn-sm" onClick={onResetApp}>
              {t('createNewPlan')}
            </button>
          )}

          {currentUser && (
            <button className="btn btn-danger btn-sm" onClick={onLogout}>
              {t('nav_logout')}
            </button>
          )}

          <div className="language-switcher" aria-label="Language selector">
            <button
              type="button"
              className={currentLanguage === 'en' ? 'active' : ''}
              onClick={() => onLanguageChange('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={currentLanguage === 'ka' ? 'active' : ''}
              onClick={() => onLanguageChange('ka')}
            >
              KA
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
