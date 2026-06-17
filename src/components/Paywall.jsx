import { useState } from 'react';

const PLAN_PRICES = {
  nutrition_only: { seven_day: '9.99', thirty_day: '19.99' },
  workout_only: { seven_day: '9.99', thirty_day: '19.99' },
  nutrition_workout_bundle: { seven_day: '16.99', thirty_day: '33.99' }
};

const initialCheckoutForm = {
  cardholderName: '',
  cardNumber: '',
  expiryDate: '',
  cvc: '',
  billingEmail: '',
  acceptedDigitalTerms: false
};

const Paywall = ({
  onPaymentSuccess,
  onSubscriptionChange,
  onResetApp,
  onOpenTerms,
  selectedPlanType,
  subscriptionData,
  currentUser,
  t
}) => {
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState(initialCheckoutForm);
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [isCompletingPayment, setIsCompletingPayment] = useState(false);
  const [message, setMessage] = useState('');
  const prices = PLAN_PRICES[selectedPlanType] || PLAN_PRICES.nutrition_workout_bundle;
  const activeSubscription = subscriptionData?.hasActiveSubscription && ['paid', 'demo_active'].includes(subscriptionData.paymentStatus);
  const label = (key, fallback) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const getPlanTitle = (duration) => {
    const durationLabel = duration === 'seven_day' ? label('plan7Day', '7-Day Active Plan') : label('plan30Day', '30-Day Premium Plan');
    if (selectedPlanType === 'nutrition_only') return `${durationLabel} - ${label('nutritionPlan', 'Nutrition Plan')}`;
    if (selectedPlanType === 'workout_only') return `${durationLabel} - ${label('workoutPlan', 'Workout Program')}`;
    return `${durationLabel} - ${label('completePlan', 'Complete Plan')}`;
  };

  const getDurationDays = (duration) => duration === 'thirty_day' ? 30 : 7;

  const getBenefits = () => [
    'Full premium dashboard access',
    'Meal plans, macro tracking, scanner tools, and progress insights',
    selectedPlanType === 'nutrition_only' ? 'Nutrition planning workflow' : selectedPlanType === 'workout_only' ? 'Workout tracking workflow' : 'Nutrition and workout bundle workflow',
    'Cancel future renewals anytime'
  ];

  const openCheckout = (duration) => {
    setMessage('');
    setCheckoutErrors({});
    const selected = {
      duration,
      name: getPlanTitle(duration),
      price: prices[duration],
      days: getDurationDays(duration),
      benefits: getBenefits()
    };
    localStorage.setItem('pendingSelectedPlan', JSON.stringify(selected));
    setCheckoutForm(initialCheckoutForm);
    setCheckoutPlan(selected);
  };

  const updateCheckoutField = (field, value) => {
    setCheckoutForm((prev) => ({ ...prev, [field]: value }));
    setCheckoutErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateCheckout = () => {
    const errors = {};
    if (!checkoutForm.cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required.';
    }
    
    const cleanedCard = checkoutForm.cardNumber.replace(/\s/g, '');
    if (!cleanedCard) {
      errors.cardNumber = 'Card number is required.';
    } else if (!/^\d{16}$/.test(cleanedCard)) {
      errors.cardNumber = 'Card number must be exactly 16 digits.';
    }
    
    const expiry = checkoutForm.expiryDate.trim();
    if (!expiry) {
      errors.expiryDate = 'Expiry date is required.';
    } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry)) {
      errors.expiryDate = 'Expiry must be in MM/YY format.';
    }
    
    const cvc = checkoutForm.cvc.trim();
    if (!cvc) {
      errors.cvc = 'CVC is required.';
    } else if (!/^\d{3,4}$/.test(cvc)) {
      errors.cvc = 'CVC must be 3 or 4 digits.';
    }
    
    const email = checkoutForm.billingEmail.trim();
    if (!email) {
      errors.billingEmail = 'Billing email is required.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      errors.billingEmail = 'Enter a valid email address.';
    }
    
    if (!checkoutForm.acceptedDigitalTerms) {
      errors.acceptedDigitalTerms = 'You must agree to the Terms and Policies to continue.';
    }
    return errors;
  };

  const completeSubscription = async (event) => {
    event.preventDefault();
    const errors = validateCheckout();
    setCheckoutErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsCompletingPayment(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));

    const now = new Date();
    const renewalDate = new Date(now);
    renewalDate.setDate(now.getDate() + checkoutPlan.days);

    const subscription = {
      paymentStatus: 'demo_active',
      hasActiveSubscription: true,
      subscriptionActive: true,
      selectedPlan: checkoutPlan.name,
      selectedPlanPrice: checkoutPlan.price,
      selectedSubscription: checkoutPlan.duration,
      subscriptionDurationDays: checkoutPlan.days,
      subscriptionDate: now.toISOString(),
      subscriptionStartDate: now.toISOString(),
      renewalDate: renewalDate.toISOString(),
      subscriptionEndDate: renewalDate.toISOString(),
      userId: currentUser || 'guest',
      cancelAtPeriodEnd: false,
      billing: {
        recurring: true,
        autoRenews: true,
        provider: 'mock_checkout',
        localPlaceholder: true,
        billingEmail: checkoutForm.billingEmail.trim()
      },
      acceptedTermsAt: now.toISOString()
    };

    onPaymentSuccess(subscription);
    setIsCompletingPayment(false);
    setCheckoutPlan(null);
    setCheckoutForm(initialCheckoutForm);
    setMessage('Subscription activated successfully.');
  };

  const handleCancelRenewal = () => {
    if (!subscriptionData) return;
    const updated = {
      ...subscriptionData,
      cancelAtPeriodEnd: true,
      billing: {
        ...(subscriptionData.billing || {}),
        autoRenews: false
      }
    };
    onSubscriptionChange?.(updated);
    setMessage('Your subscription will remain active until the end of the current period.');
  };

  const renderActiveSubscription = () => (
    <div className="card subscription-active-card">
      <div>
        <span className="material-symbols-outlined text-primary">verified</span>
        <h3>Premium Active</h3>
        <p className="text-muted">Current Plan: {subscriptionData.selectedPlan || getPlanTitle(subscriptionData.selectedSubscription || 'seven_day')}</p>
        <p className="text-muted">Next Renewal: {subscriptionData.renewalDate || subscriptionData.subscriptionEndDate ? new Date(subscriptionData.renewalDate || subscriptionData.subscriptionEndDate).toLocaleDateString() : 'Active'}</p>
        {subscriptionData.cancelAtPeriodEnd && (
          <p className="alert alert-warning">Your subscription will remain active until the end of the current period.</p>
        )}
      </div>
      {!subscriptionData.cancelAtPeriodEnd && (
        <button className="btn btn-outline" onClick={handleCancelRenewal}>
          Cancel Renewal
        </button>
      )}
    </div>
  );

  const renderPlanCard = (duration, featured = false) => {
    const price = prices[duration];
    const isCurrentPlan = activeSubscription && subscriptionData?.selectedSubscription === duration;

    return (
      <div className="card subscription-card" data-featured={featured ? 'true' : 'false'}>
        {featured && <div className="subscription-badge">Best Value</div>}
        <h3>{getPlanTitle(duration)}</h3>
        <div className="subscription-price">${price}</div>
        <p className="text-muted">
          {duration === 'thirty_day' ? '30-day recurring digital access.' : '7-day recurring digital access.'}
        </p>
        <ul className="subscription-list">
          {getBenefits().map((benefit) => (
            <li key={benefit}><span className="material-symbols-outlined text-primary">check_circle</span> {benefit}</li>
          ))}
          <li><span className="material-symbols-outlined text-primary">check_circle</span> Digital access is non-refundable once the period starts</li>
        </ul>
        <button
          type="button"
          className={`btn ${isCurrentPlan ? 'btn-secondary' : 'btn-primary'} btn-block subscription-action-btn`}
          onClick={() => !isCurrentPlan && openCheckout(duration)}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? label('currentPlan', 'Current Plan') : `${label('subscribeUpgrade', 'Subscribe / Upgrade')} - $${price}`}
        </button>
      </div>
    );
  };

  return (
    <div className="container subscription-page">
      <div className="text-center animate-fade-in subscription-hero">
        <span className="material-symbols-outlined text-primary">workspace_premium</span>
        <h2>{t('paywallTitle')}</h2>
        <p className="text-muted">{t('paywallSubtitle')}</p>
        {onResetApp && (
          <button className="btn btn-outline btn-sm" onClick={onResetApp}>
            {t('createNewPlan')}
          </button>
        )}
      </div>

      {activeSubscription && renderActiveSubscription()}

      <div className="card subscription-terms-callout">
        <h3>Recurring Billing Notice</h3>
        <p>
          NutriPlan Global subscriptions renew automatically. This local checkout stores a demo subscription until real Stripe or PayPal credentials are connected.
          Already started digital subscription periods are not refunded.
        </p>
        <button className="btn btn-outline btn-sm" onClick={onOpenTerms}>Read Terms & Policies</button>
      </div>

      {message && <div className="alert alert-success text-center">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        {renderPlanCard('seven_day')}
        {renderPlanCard('thirty_day', true)}
      </div>

      <div className="card subscription-disclaimer">
        <h4>{t('disclaimerTitle')}</h4>
        <p className="text-muted">{t('disclaimerText')}</p>
      </div>

      {checkoutPlan && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
          <form className="card checkout-modal" onSubmit={completeSubscription}>
            <div className="checkout-header">
              <div>
                <h3 id="checkout-title">Checkout</h3>
                <p className="text-muted">{checkoutPlan.name}</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setCheckoutPlan(null)} aria-label="Close checkout">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="checkout-summary">
              <div>
                <span className="text-muted">Price</span>
                <strong>${checkoutPlan.price}</strong>
              </div>
              <div>
                <span className="text-muted">Billing Period</span>
                <strong>{checkoutPlan.days} days</strong>
              </div>
            </div>

            <ul className="subscription-list checkout-benefits">
              {checkoutPlan.benefits.map((benefit) => (
                <li key={benefit}><span className="material-symbols-outlined text-primary">check_circle</span> {benefit}</li>
              ))}
            </ul>

            <div className="checkout-grid">
              <label>
                Cardholder Name
                <input className="form-control" value={checkoutForm.cardholderName} onChange={(e) => updateCheckoutField('cardholderName', e.target.value)} />
                {checkoutErrors.cardholderName && <span className="field-error">{checkoutErrors.cardholderName}</span>}
              </label>
              <label>
                Billing Email
                <input className="form-control" type="email" value={checkoutForm.billingEmail} onChange={(e) => updateCheckoutField('billingEmail', e.target.value)} />
                {checkoutErrors.billingEmail && <span className="field-error">{checkoutErrors.billingEmail}</span>}
              </label>
              <label className="checkout-full">
                Card Number
                <input className="form-control" inputMode="numeric" placeholder="4242 4242 4242 4242" value={checkoutForm.cardNumber} onChange={(e) => updateCheckoutField('cardNumber', e.target.value)} />
                {checkoutErrors.cardNumber && <span className="field-error">{checkoutErrors.cardNumber}</span>}
              </label>
              <label>
                Expiry Date
                <input className="form-control" placeholder="MM/YY" value={checkoutForm.expiryDate} onChange={(e) => updateCheckoutField('expiryDate', e.target.value)} />
                {checkoutErrors.expiryDate && <span className="field-error">{checkoutErrors.expiryDate}</span>}
              </label>
              <label>
                CVC
                <input className="form-control" inputMode="numeric" placeholder="123" value={checkoutForm.cvc} onChange={(e) => updateCheckoutField('cvc', e.target.value)} />
                {checkoutErrors.cvc && <span className="field-error">{checkoutErrors.cvc}</span>}
              </label>
            </div>

            <label className="checkout-agreement">
              <input
                type="checkbox"
                checked={checkoutForm.acceptedDigitalTerms}
                onChange={(e) => updateCheckoutField('acceptedDigitalTerms', e.target.checked)}
              />
              <span>I agree to Terms and Policies and understand that digital access is non-refundable once the subscription period starts.</span>
            </label>
            {checkoutErrors.acceptedDigitalTerms && <span className="field-error">{checkoutErrors.acceptedDigitalTerms}</span>}

            <div className="checkout-actions">
              <button className="btn btn-outline" type="button" onClick={() => setCheckoutPlan(null)} disabled={isCompletingPayment}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={isCompletingPayment}>
                {isCompletingPayment ? 'Activating Subscription...' : 'Complete Subscription'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Paywall;
