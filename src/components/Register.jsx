// src/components/Register.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { addUser, setCurrentUser, seedDemoUsers, getAllUsers } from '../utils/localStorage';

const Register = ({ onRegisterSuccess, t }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    seedDemoUsers();
  }, []);

  const handleToggleMode = (mode) => {
    setIsLogin(mode);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        // 1. Sign in with Supabase Auth
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

        if (signInError) throw signInError;
        if (!signInData?.user) throw new Error('Failed to sign in. Please try again.');

        // 2. Fetch profile from database to check email verification status and load user plans
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, is_email_verified, user_data, questionnaire_answers, calculated_plan, meal_plan, workout_plan, subscription_data, target_calories, macros, tdee, selected_plan_type')
          .eq('id', signInData.user.id)
          .maybeSingle();

        if (profileError) {
          console.warn('Profile fetch error:', profileError);
        }

        const isEmailVerified = profile?.is_email_verified ?? false;
        const dbFullName = profile?.full_name || normalizedEmail.split('@')[0];

        // 3. Synchronize local storage user profile to support local-only features
        const users = getAllUsers();
        const existingIndex = users.findIndex(
          (u) => u.id === signInData.user.id || u.email.toLowerCase() === normalizedEmail
        );
        const [firstName, ...lastNameParts] = dbFullName.split(' ');
        const lastName = lastNameParts.join(' ') || 'Member';
        const username = normalizedEmail.split('@')[0];

        if (existingIndex === -1) {
          addUser({
            id: signInData.user.id,
            username: username || signInData.user.id,
            firstName: firstName || 'NutriPlan',
            lastName: lastName,
            email: normalizedEmail,
            friends: [],
            weightEntries: []
          }, { setAsCurrent: true });
        } else {
          // If the profile user exists, update local storage state to match ID and username
          const existing = users[existingIndex];
          existing.id = signInData.user.id;
          setCurrentUser(existing.username);
        }

        // 4. Trigger success callback
        if (onRegisterSuccess) {
          onRegisterSuccess(normalizedEmail, isEmailVerified, profile);
        }
      } else {
        // --- REGISTRATION LOGIC ---
        // 1. Validate matching passwords
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        // 2. Check if email already registered in the profiles table
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (checkError) {
          console.warn('Profile check error:', checkError);
        }

        if (existingProfile) {
          throw new Error('This email is already registered. Please log in instead.');
        }

        // 3. Create user in Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
        });

        if (signUpError) throw signUpError;
        if (!signUpData?.user) throw new Error('SignUp succeeded but user details were not returned.');

        // 4. Insert user record into public.profiles
        const { error: profileInsertError } = await supabase
          .from('profiles')
          .insert([{
            id: signUpData.user.id,
            email: normalizedEmail,
            full_name: fullName,
            is_email_verified: false
          }]);

        if (profileInsertError) throw profileInsertError;

        // 5. Handle mailing list if marketing consent is checked
        if (marketingConsent) {
          const { error: mailingError } = await supabase
            .from('mailing_list')
            .insert([{
              email: normalizedEmail,
              full_name: fullName,
              source: 'diet_register',
              consent: true,
              consent_at: new Date().toISOString()
            }]);

          if (mailingError) {
            // If duplicate email, treat as success, otherwise warn
            if (mailingError.code !== '23505' && !mailingError.message?.includes('duplicate') && !mailingError.message?.includes('already exists')) {
              console.warn('Mailing list insertion failed:', mailingError);
            }
          }
        }

        // 6. Trigger sending verification code via Edge Function
        const user = signUpData.user;
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke("send-activation-code", {
          body: {
            email: normalizedEmail,
            user_id: user.id
          }
        });

        if (edgeError || (edgeData && edgeData.error)) {
          const errMsg = edgeError?.message || (edgeData && edgeData.error) || 'Failed to send activation email.';
          throw new Error(errMsg);
        }

        // 7. Create user in local storage to support local-only features
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ') || 'Member';
        const username = normalizedEmail.split('@')[0];

        addUser({
          id: user.id,
          username: username || user.id,
          firstName: firstName || 'NutriPlan',
          lastName: lastName,
          email: normalizedEmail,
          friends: [],
          weightEntries: []
        }, { setAsCurrent: true });

        setSuccess(t('emailSentSuccessfully') || 'Email sent successfully.');

        // 8. Trigger success callback (unverified by default)
        if (onRegisterSuccess) {
          setTimeout(() => {
            onRegisterSuccess(normalizedEmail, false, null, password);
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
        {/* Tab Selection */}
        <div 
          className="flex justify-center" 
          style={{ 
            marginBottom: '2rem', 
            borderBottom: '1px solid var(--color-border)',
            gap: '1.5rem' 
          }}
        >
          <button
            type="button"
            className={`btn-sm ${!isLogin ? 'text-primary' : 'text-muted'}`}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              paddingBottom: '0.75rem',
              borderBottom: !isLogin ? '3px solid var(--color-primary)' : '3px solid transparent',
              transition: 'var(--transition)'
            }}
            onClick={() => handleToggleMode(false)}
          >
            {t('registerTitle') || 'Register'}
          </button>
          <button
            type="button"
            className={`btn-sm ${isLogin ? 'text-primary' : 'text-muted'}`}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              paddingBottom: '0.75rem',
              borderBottom: isLogin ? '3px solid var(--color-primary)' : '3px solid transparent',
              transition: 'var(--transition)'
            }}
            onClick={() => handleToggleMode(true)}
          >
            {t('loginTitle') || 'Login'}
          </button>
        </div>

        {/* Title */}
        <h2 className="text-center" style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-family-headline)' }}>
          {isLogin ? (t('loginHeadline') || 'Welcome Back') : (t('registerHeadline') || 'Create Account')}
        </h2>
        
        {/* Error Alert */}
        {error && (
          <div 
            className="alert" 
            style={{ 
              backgroundColor: 'var(--color-danger-bg)', 
              color: 'var(--color-danger)', 
              border: '1px solid rgba(255, 180, 171, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
          >
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div 
            className="alert" 
            style={{ 
              backgroundColor: 'rgba(77, 224, 130, 0.1)', 
              color: 'var(--color-primary)', 
              border: '1px solid rgba(77, 224, 130, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
          >
            {success}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="flex-col gap-3">
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">{t('fullName') || 'Full Name'}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-control"
                placeholder="e.g. John Doe"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">{t('email') || 'Email Address'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="e.g. john@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">{t('password') || 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">{t('confirmPassword') || 'Confirm Password'}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label className="checkbox-label" style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    disabled={loading}
                  />
                  <span>{t('marketingConsentText') || 'I agree to receive personalized meal plan tips and updates.'}</span>
                </label>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}
            disabled={loading}
          >
            {loading && (
              <span 
                className="material-symbols-outlined animate-spin" 
                style={{ fontSize: '1.25rem', animation: 'spin 1s linear infinite' }}
              >
                progress_activity
              </span>
            )}
            <span>
              {isLogin 
                ? (loading ? (t('loggingInBtn') || 'Logging In...') : (t('loginBtn') || 'Login')) 
                : (loading ? (t('registeringBtn') || 'Registering...') : (t('registerBtn') || 'Register'))
              }
            </span>
          </button>
        </form>
      </div>
      
      {/* Styles for loader spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;
