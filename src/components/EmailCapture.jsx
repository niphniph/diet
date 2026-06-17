import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const APP_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '') || '/diet';

const EmailCapture = ({ onSubmit, selectedPlanType, currentLanguage, t }) => {
  const [email, setEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendError, setEmailSendError] = useState('');
  const [emailSentSuccessfully, setEmailSentSuccessfully] = useState(false);

  const validateEmail = (e) => {
    return String(e)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!email) {
      setEmailSendError(t('emailRequiredError') || 'Email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setEmailSendError(t('emailInvalidError') || 'Invalid email address.');
      return;
    }

    setEmailSendError('');
    setIsSendingEmail(true);
    setEmailSentSuccessfully(false);

    const normalizedEmail = email.trim().toLowerCase();
    const sessionId = "LOCKED_" + Math.random().toString(36).substr(2, 9).toUpperCase();

    try {
      let isSuccess = false;

      // Insert directly into public.mailing_list
      const { error: insertError } = await supabase
        .from('mailing_list')
        .insert([{
          email: normalizedEmail,
          full_name: null,
          source: 'diet_unlock_link',
          consent: true,
          consent_at: new Date().toISOString()
        }]);

      if (insertError) {
        // PostgreSQL duplicate key code or duplicate warning
        if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('already exists')) {
          isSuccess = true;
        } else {
          throw insertError;
        }
      } else {
        isSuccess = true;
      }

      if (isSuccess) {
        setEmailSentSuccessfully(true);
        setIsSendingEmail(false);
        
        // Wait briefly for the user to read the success text, then proceed
        setTimeout(() => {
          onSubmit(normalizedEmail, sessionId, false);
        }, 1500);
      }
    } catch (err) {
      console.error("[EmailCapture] Supabase insertion failed:", err);
      setEmailSendError(err.message || 'Failed to save email. Please try again.');
      setIsSendingEmail(false);
    }
  };

  const handleContinueWithoutEmail = () => {
    const fallbackEmail = email || "customer@example.com";
    const sessionId = "LOCKED_" + Math.random().toString(36).substr(2, 9).toUpperCase();
    onSubmit(fallbackEmail, sessionId, true);
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '500px', width: '100%', margin: '0 auto', textAlign: 'center', padding: '2.5rem' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '3.5rem', fontVariationSettings: "'FILL' 1", marginBottom: '1.25rem' }}>mark_email_read</span>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '1rem', lineHeight: '1.3' }}>
            {t('emailTitle') || 'Unlock Your Plan'}
          </h2>
          <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.5' }}>
            {t('emailSubtitle') || 'Enter your email to receive your personalized nutrition & workout plan links.'}
          </p>
        </div>

        {emailSentSuccessfully ? (
          <div className="animate-fade-in" style={{
            padding: '1.25rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(107, 251, 154, 0.1)',
            border: '1px solid rgba(107, 251, 154, 0.3)',
            color: 'var(--color-primary)',
            fontSize: '1.05rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined">check_circle</span>
              <span>{t('emailSavedSuccess') || 'Email saved successfully.'}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-col gap-3">
            <div>
              <input
                type="email"
                className="form-control"
                placeholder={currentLanguage === 'en' ? "Enter your email" : "შეიყვანეთ ელ-ფოსტა"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '1rem 1.5rem', fontSize: '1.125rem', textAlign: 'center' }}
                disabled={isSendingEmail}
              />
              {emailSendError && (
                <p className="text-danger" style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--color-error)', lineHeight: '1.4' }}>
                  {emailSendError}
                </p>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block animate-pulse" 
              style={{ padding: '1rem', fontSize: '1.125rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                  {t('btnSending') || 'Saving...'}
                </>
              ) : (
                t('btnSendMyUnlockLink') || 'Send My Unlock Link'
              )}
            </button>
          </form>
        )}

        {/* Fallback button: displayed continuously unless email is saved successfully */}
        {!emailSentSuccessfully && (
          <button
            type="button"
            className="btn btn-outline btn-block animate-fade-in"
            style={{ padding: '1rem', fontSize: '1.125rem', marginTop: '1rem', borderColor: 'rgba(255, 255, 255, 0.15)' }}
            onClick={handleContinueWithoutEmail}
            disabled={isSendingEmail}
          >
            {t('btnContinueWithoutEmail') || 'Continue without email'}
          </button>
        )}

        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '1.75rem', opacity: 0.7 }}>
          {t('emailPrivacy') || 'We respect your privacy and never sell or share your personal data.'}
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default EmailCapture;
