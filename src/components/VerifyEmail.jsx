import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const VerifyEmail = ({ email, password, onBackToLogin, onVerificationSuccess, t }) => {
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [attemptsInfo, setAttemptsInfo] = useState(null);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle digit change
  const handleChange = (e, index) => {
    const val = e.target.value;
    if (/[^0-9]/.test(val)) return;

    const newDigits = [...codeDigits];
    newDigits[index] = val.slice(-1);
    setCodeDigits(newDigits);

    // Auto-focus next input
    if (val && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle keydown for backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!codeDigits[index] && index > 0) {
        const newDigits = [...codeDigits];
        newDigits[index - 1] = '';
        setCodeDigits(newDigits);
        inputRefs[index - 1].current.focus();
      } else if (codeDigits[index]) {
        const newDigits = [...codeDigits];
        newDigits[index] = '';
        setCodeDigits(newDigits);
      }
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setCodeDigits(digits);
    inputRefs[5].current.focus();
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = codeDigits.join('');
    if (code.length !== 6) {
      setError(t('verifyCodePlaceholder') || 'Please enter a 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setAttemptsInfo(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // 1. Fetch code record from public.email_activation_codes with local fallback
      let codeRecord = null;
      try {
        const { data, error: fetchError } = await supabase
          .from('email_activation_codes')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (fetchError) throw fetchError;
        codeRecord = data;
      } catch (err) {
        console.warn('Supabase fetch of activation code failed, checking local fallback:', err.message);
        const localCodes = JSON.parse(localStorage.getItem('localActivationCodes') || '{}');
        const localRecord = localCodes[normalizedEmail];
        if (localRecord) {
          codeRecord = {
            id: localRecord.user_id,
            email: normalizedEmail,
            code: localRecord.code,
            user_id: localRecord.user_id,
            expires_at: localRecord.expires_at,
            attempts: localRecord.attempts
          };
        }
      }

      if (!codeRecord) {
        setError(t('codeExpired') || 'No active verification code found. Please request a new one.');
        setLoading(false);
        return;
      }

      // 2. Check if attempts >= 5
      if (codeRecord.attempts >= 5) {
        setError(t('tooManyAttempts') || 'Too many failed attempts. This code has been blocked. Please request a new code.');
        setLoading(false);
        return;
      }

      // 3. Check expiration
      const now = new Date();
      const expiresAt = new Date(codeRecord.expires_at);
      if (expiresAt < now) {
        setError(t('codeExpired') || 'Code expired. Request a new code.');
        setLoading(false);
        return;
      }

      // 4. Compare code
      if (codeRecord.code === code) {
        // SUCCESS
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ is_email_verified: true })
            .eq('id', codeRecord.user_id);

          if (profileError) throw profileError;
        } catch (err) {
          console.warn('Could not update remote email verification status, proceeding locally:', err.message);
        }

        // Auto-login using password if provided
        if (password) {
          try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password: password
            });
            if (signInError) {
              console.warn('Auto-login failed after verification:', signInError);
            }
          } catch (err) {
            console.warn('Auto-login error:', err);
          }
        }

        // Delete activation code
        try {
          await supabase
            .from('email_activation_codes')
            .delete()
            .eq('id', codeRecord.id);
        } catch (err) {
          console.warn('Could not delete remote activation code, proceeding locally:', err.message);
          const localCodes = JSON.parse(localStorage.getItem('localActivationCodes') || '{}');
          delete localCodes[normalizedEmail];
          localStorage.setItem('localActivationCodes', JSON.stringify(localCodes));
        }

        setSuccess(t('verificationSuccess') || 'Email verified successfully! Redirecting...');
        
        setTimeout(() => {
          if (onVerificationSuccess) {
            onVerificationSuccess();
          }
        }, 1500);

      } else {
        // FAILURE
        const newAttempts = codeRecord.attempts + 1;
        
        try {
          const { error: updateError } = await supabase
            .from('email_activation_codes')
            .update({ attempts: newAttempts })
            .eq('id', codeRecord.id);

          if (updateError) throw updateError;
        } catch (err) {
          console.warn('Could not update remote attempts counter, updating locally:', err.message);
          const localCodes = JSON.parse(localStorage.getItem('localActivationCodes') || '{}');
          if (localCodes[normalizedEmail]) {
            localCodes[normalizedEmail].attempts = newAttempts;
            localStorage.setItem('localActivationCodes', JSON.stringify(localCodes));
          }
        }

        if (newAttempts >= 5) {
          setError(t('tooManyAttempts') || 'Too many failed attempts. This code has been blocked. Please request a new code.');
        } else {
          setError(t('invalidCode') || 'Invalid verification code. Please check and try again.');
          setAttemptsInfo(5 - newAttempts);
        }
      }

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setError('');
    setSuccess('');
    setAttemptsInfo(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        throw new Error('User session not found. Please log in again.');
      }

      const { data, error: invokeError } = await supabase.functions.invoke('send-activation-code', {
        body: { email: email.trim().toLowerCase(), user_id: userId }
      });

      if (invokeError || (data && data.error)) {
        throw new Error(invokeError?.message || data?.error || 'Failed to resend activation code.');
      }

      setSuccess(t('emailSent') || 'A new verification code has been sent successfully.');
      setCodeDigits(['', '', '', '', '', '']);
      setCooldown(60);
      inputRefs[0].current.focus();

    } catch (err) {
      console.error('Resend error:', err);
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '520px', margin: '4rem auto' }}>
      <div className="card text-center animate-fade-in" style={{ padding: '3rem 2rem', border: '1px solid rgba(107, 251, 154, 0.1)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span 
            className="material-symbols-outlined text-primary" 
            style={{ fontSize: '4.5rem', display: 'inline-block', filter: 'drop-shadow(0 0 10px rgba(107, 251, 154, 0.4))' }}
          >
            mark_email_read
          </span>
        </div>

        <h2 style={{ marginBottom: '1rem', fontFamily: 'var(--font-family-headline)', fontSize: '2rem' }}>
          {t('verifyEmailTitle') || 'Verify Your Email'}
        </h2>
        
        <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.5' }}>
          {t('verifyEmailMessage') || 'We have sent a verification code to your email. Please enter the code below.'}
        </p>

        {email && (
          <div 
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: '600', 
              color: 'var(--color-primary)',
              marginBottom: '2rem',
              wordBreak: 'break-all',
              display: 'inline-block'
            }}
          >
            {email}
          </div>
        )}

        {error && (
          <div 
            className="alert" 
            style={{ 
              backgroundColor: 'rgba(239, 83, 80, 0.1)', 
              color: '#ef5350', 
              border: '1px solid rgba(239, 83, 80, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.95rem',
              fontWeight: '500',
              textAlign: 'center'
            }}
          >
            {error}
            {attemptsInfo !== null && (
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', opacity: 0.8 }}>
                {t('attemptsRemaining').replace('{attempts}', attemptsInfo) || `${attemptsInfo} attempts remaining.`}
              </div>
            )}
          </div>
        )}

        {success && (
          <div 
            className="alert" 
            style={{ 
              backgroundColor: 'rgba(107, 251, 154, 0.1)', 
              color: 'var(--color-primary)', 
              border: '1px solid rgba(107, 251, 154, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.95rem',
              fontWeight: '500',
              textAlign: 'center'
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
            {codeDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength="1"
                pattern="[0-9]*"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={idx === 0 ? handlePaste : undefined}
                disabled={loading || resending}
                style={{
                  width: '52px',
                  height: '62px',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxShadow: digit ? '0 0 8px rgba(107, 251, 154, 0.2)' : 'none',
                  borderColor: digit ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.boxShadow = '0 0 10px rgba(107, 251, 154, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = digit ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.boxShadow = digit ? '0 0 8px rgba(107, 251, 154, 0.2)' : 'none';
                }}
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block animate-pulse"
            style={{ padding: '1rem', fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            disabled={loading || resending || codeDigits.some(d => !d)}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                {t('btnVerifying') || 'Verifying...'}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">verified</span>
                {t('btnVerifyCode') || 'Verify Code'}
              </>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'space-between' }}>
          <button 
            onClick={handleResend}
            className="btn btn-outline"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem', borderColor: 'rgba(255,255,255,0.1)' }}
            disabled={cooldown > 0 || loading || resending}
          >
            {resending ? (
              t('btnResending') || 'Sending...'
            ) : cooldown > 0 ? (
              t('resendCooldown').replace('{seconds}', cooldown) || `Resend in ${cooldown}s`
            ) : (
              t('btnResendCode') || 'Resend Code'
            )}
          </button>

          <button 
            onClick={onBackToLogin} 
            className="btn btn-outline"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem', borderColor: 'rgba(255,255,255,0.1)' }}
            disabled={loading || resending}
          >
            {t('backToLoginBtn') || 'Back to Login'}
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default VerifyEmail;
