

const sections = [
  {
    title: 'Subscription Terms',
    body: 'NutriPlan Global provides paid digital access to personalized nutrition, fitness, tracking, and planning tools for the selected subscription period.'
  },
  {
    title: 'Automatic Recurring Billing',
    body: 'Subscription payments are charged automatically from the card or payment method used at checkout unless the subscription is cancelled before the next renewal date.'
  },
  {
    title: 'No Refund Policy for Digital Subscription',
    body: 'Payments are non-refundable once the subscription period starts because digital access is made available immediately after confirmation.'
  },
  {
    title: 'Cancellation Policy',
    body: 'You can cancel future renewals at any time. Cancellation stops future automatic charges, but already charged subscription periods are not refunded.'
  },
  {
    title: 'User Responsibility',
    body: 'You are responsible for entering accurate profile, health, nutrition, allergy, and activity information and for reviewing generated suggestions before using them.'
  },
  {
    title: 'Nutrition Disclaimer',
    body: 'The app provides general nutrition and wellness guidance only. It is not medical advice and does not replace a doctor, registered dietitian, or qualified healthcare professional.'
  },
  {
    title: 'Privacy/Data Notice',
    body: 'The app may store profile answers, food logs, subscription state, and progress data locally in the browser or through configured services. Do not enter sensitive medical information unless you understand how it is stored.'
  },
  {
    title: 'Contact/Support Placeholder',
    body: 'Support contact placeholder: support@nine13.site. Replace this address with the official support channel before production launch.'
  }
];

const TermsPolicies = ({ onBack, onSubscribe }) => {
  return (
    <div className="container terms-page">
      <div className="terms-header">
        <div>
          <span className="badge">NutriPlan Global</span>
          <h2>Terms & Policies</h2>
          <p className="text-muted">
            Please review these terms before subscribing. They explain recurring billing, cancellation, refunds, nutrition limitations, and data handling.
          </p>
        </div>
        <div className="terms-actions">
          <button className="btn btn-outline" onClick={onBack}>Back</button>
          <button className="btn btn-primary" onClick={onSubscribe}>Subscription</button>
        </div>
      </div>

      <div className="terms-grid">
        {sections.map((section) => (
          <section className="card terms-card" key={section.title}>
            <h3>{section.title}</h3>
            <p className="text-muted">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default TermsPolicies;
