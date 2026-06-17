

const LandingPage = ({ onStart, t }) => {
  return (
    <>
      <main style={{ paddingBottom: '8rem' }}>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-blur-container">
            <div className="hero-blur-circle"></div>
          </div>
          
          <div className="hero-content">
            <div className="hero-pill">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>eco</span>
              {t('landingBadge')}
            </div>
            
            <h2 className="hero-headline" style={{ lineHeight: '1.25' }}>
              {t('landingTitle')}
            </h2>
            
            <p className="hero-subtitle text-muted">
              {t('landingSubtitle')}
            </p>
            
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={onStart}>
                {t('btnCreateMyPlan')}
                <span className="material-symbols-outlined" style={{ marginLeft: '0.5rem' }}>arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Feature Highlights (Bento Grid) */}
        <section className="bento-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="bento-header">
            <h3 style={{ fontSize: '2rem' }}>{t('landingF1')}</h3>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
              {t('landingF1Desc')}
            </p>
          </div>
          
          <div className="bento-grid">
            {/* Bento Item 1: Macros */}
            <div className="bento-item bento-item-large">
              <div className="bento-blur"></div>
              <div className="bento-content">
                <span className="material-symbols-outlined bento-icon" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
                <h4 className="bento-title">{t('landingF2')}</h4>
                <p className="text-muted" style={{ maxWidth: '450px' }}>
                  {t('landingF2Desc')}
                </p>
              </div>
              <div className="bento-image-container bento-image-large">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtePBDDLL-oLDyaawzR3g-Vby8rtPzg2YY1rgBtNCGnltqZO5Eyu7v5U0eW_MdUZJEVZ_PoxcV4C9jIwOBihqkCWJ03pnZDaaVQtW8eRaVHyJBFcPB-1ri-QmKsfRnUrI3PM0p4PT4JogqN66iOkdKOxnSnihZ1WpTp1ibMAJZZPXQpCLnWSwzNcFthHfK9_8H8racmZ3AS7eTNyV5NWJ8YQcSZ5GfCmYka_mZ1qg4ZE-lTjPLNwZ13RWwOqOZvbYbTtZmq4pmcV4" 
                  alt="Healthy salmon bowl" 
                  className="bento-image"
                />
              </div>
            </div>

            {/* Bento Item 2: Sourcing */}
            <div className="bento-item">
              <div className="bento-content">
                <span className="material-symbols-outlined bento-icon" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                <h4 className="bento-title">{t('landingF3')}</h4>
                <p className="text-muted">
                  {t('landingF3Desc')}
                </p>
              </div>
              <div className="bento-image-container bento-image-small">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlHVY7I0BCMPk816YJgW6zNqZwQET3JBhpOkswg5w-rfa9gvigMGC_Vv4Ojh2MfMsZpUiWpdK1BQ5jvyERxqNPL9Cctfhlc_jDN0JOHC4K_n7XoVO3qQUid2TG5csXlvSgfKSbLkmEGgoQX1_fm8G00hUHtThttAocn2x-syCx3R7MdtQ7l-Z_po4gpK8oMNiUuDbANvgr2FO2-Mh_qL5s1X1h_Z2FjVr_pd7x1KBuHrojiqprZwQ794zAFzHznji8nHx5DfWIEEY" 
                  alt="Fresh organic produce" 
                  className="bento-image"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="bottom-nav">
        <button className="bottom-nav-item active" onClick={onStart}>
          <span className="material-symbols-outlined bottom-nav-icon" style={{ fontVariationSettings: "'FILL' 1" }}>event_note</span>
          <span className="bottom-nav-label">{t('home') === 'Home' ? 'Plan' : 'გეგმა'}</span>
        </button>
        <button className="bottom-nav-item" onClick={onStart}>
          <span className="material-symbols-outlined bottom-nav-icon">restaurant</span>
          <span className="bottom-nav-label">{t('home') === 'Home' ? 'Meals' : 'კერძები'}</span>
        </button>
        <button className="bottom-nav-item" onClick={onStart}>
          <span className="material-symbols-outlined bottom-nav-icon">analytics</span>
          <span className="bottom-nav-label">{t('home') === 'Home' ? 'Stats' : 'სტატისტიკა'}</span>
        </button>
        <button className="bottom-nav-item" onClick={onStart}>
          <span className="material-symbols-outlined bottom-nav-icon">workspace_premium</span>
          <span className="bottom-nav-label">{t('home') === 'Home' ? 'Premium' : 'პრემიუმი'}</span>
        </button>
      </nav>
    </>
  );
};

export default LandingPage;
