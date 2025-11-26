import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import './App.css';

type DisputeForm = {
  arn: string;
  customerName: string;
  country: string;
  isUSConsumer: boolean;
  isCardOrEFT: boolean;
  isFraudOrUnauthorised: boolean;
  has3DS: boolean;
  ipDeviceMatch: boolean;
  avsMatch: boolean;
  aniMatch: boolean;
  kycStatus: string;
  disputeReason: string;
  transactionDate: string;
  disputeDate: string;
};

type ClassifiedDispute = {
  arn: string;
  customerName: string;
  regEStatus: 'APPLIES' | 'DOES_NOT_APPLY' | 'NEEDS_REVIEW';
  reasons: string[];
  internalNote?: string;
  checkoutNote?: string;
};

const initialForm: DisputeForm = {
  arn: '',
  customerName: '',
  country: 'US',
  isUSConsumer: true,
  isCardOrEFT: true,
  isFraudOrUnauthorised: true,
  has3DS: true,
  ipDeviceMatch: true,
  avsMatch: true,
  aniMatch: true,
  kycStatus: 'passed',
  disputeReason: '',
  transactionDate: '',
  disputeDate: '',
};

function App() {
  const [form, setForm] = useState<DisputeForm>(initialForm);
  const [result, setResult] = useState<ClassifiedDispute | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

//how/hide "Back to top" button when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200); // show after ~200px scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTextChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    const start = Date.now();
    const MIN_LOADING_MS = 500;

    try {
      const response = await fetch('http://localhost:4000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: [form] }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error('No result returned from backend.');
      }

      setResult(data.results[0] as ClassifiedDispute);
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while running the Reg E check.',
      );
    } finally {
      const elapsed = Date.now() - start;
      const remaining = MIN_LOADING_MS - elapsed;

      if (remaining > 0) {
        setTimeout(() => setIsLoading(false), remaining);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleClear = () => {
    setForm(initialForm);
    setResult(null);
    setError(null);
  };

  const handleCopyCheckoutNote = async () => {
    if (!result?.checkoutNote) return;

    try {
      await navigator.clipboard.writeText(result.checkoutNote);
      alert('Checkout note copied to clipboard.');
    } catch (err) {
      console.error(err);
      alert('Could not copy note. You can still select and copy it manually.');
    }
  };

    const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };


  const isMeetsRegE = result?.regEStatus === 'APPLIES';

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="title-wrapper">
            <div className="logo-title">
              <svg className="logo" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Radar circles */}
                <circle cx="24" cy="24" r="22" stroke="url(#gradient1)" strokeWidth="1.5" opacity="0.3"/>
                <circle cx="24" cy="24" r="16" stroke="url(#gradient1)" strokeWidth="1.5" opacity="0.5"/>
                <circle cx="24" cy="24" r="10" stroke="url(#gradient1)" strokeWidth="2" opacity="0.7"/>
                
                {/* Center dot */}
                <circle cx="24" cy="24" r="2.5" fill="url(#gradient2)"/>
                
                {/* Scanning line (radar sweep) */}
                <line x1="24" y1="24" x2="24" y2="4" stroke="url(#gradient2)" strokeWidth="2.5" strokeLinecap="round">
                  <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    from="0 24 24"
                    to="360 24 24"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </line>
                
                {/* Detection blips */}
                <circle cx="32" cy="16" r="2" fill="#22d3ee" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="16" cy="30" r="2" fill="#10b981" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                
                {/* Gradients */}
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8"/>
                    <stop offset="50%" stopColor="#22d3ee"/>
                    <stop offset="100%" stopColor="#10b981"/>
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee"/>
                    <stop offset="100%" stopColor="#10b981"/>
                  </linearGradient>
                </defs>
              </svg>
              <h1>RegE Radar</h1>
            </div>
            <p className="subtitle">
              A quick internal checker aligned with <a href="https://www.consumerfinance.gov/rules-policy/regulations/1005/33/">Regulation E</a> to classify Checkout chargebacks and draft consistent notes
            </p>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="card">
          <h2>Dispute details</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field field--full">
                <label htmlFor="arn">ARN</label>
                <input
                  id="arn"
                  name="arn"
                  type="text"
                  placeholder="1234 5678 9012 345678"
                  value={form.arn}
                  onChange={handleTextChange}
                  required
                />
              </div>

              <div className="field field--full">
                <label htmlFor="customerName">Customer name</label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  placeholder="Jane Smith"
                  value={form.customerName}
                  onChange={handleTextChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="country">Country (Must be USA)</label>
                <input
                name="country"
                type="text"
                value="United States"
                disabled
                style={{ cursor: 'not-allowed', opacity: 1.9 }}
              />
              </div>
             
              <div className="field">
                <label htmlFor="transactionDate">Transaction date</label>
                <input
                  id="transactionDate"
                  name="transactionDate"
                  type="date"
                  value={form.transactionDate}
                  onChange={handleTextChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="disputeDate">Dispute date</label>
                <input
                  id="disputeDate"
                  name="disputeDate"
                  type="date"
                  value={form.disputeDate}
                  onChange={handleTextChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="kycStatus">KYC status</label>
                <select
                  id="kycStatus"
                  name="kycStatus"
                  value={form.kycStatus}
                  onChange={handleTextChange}
                >
                  <option value="passed">Passed / completed</option>
                  <option value="complete">Complete</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending / not done</option>
                  <option value="failed">Failed</option>
                  <option value="Unknown">KYC Status Unknown</option>
                </select>
              </div>

              <div className="field field--full">
                <label htmlFor="disputeReason">Dispute reason (free text)</label>
                <textarea
                  id="disputeReason"
                  name="disputeReason"
                  rows={3}
                  value={form.disputeReason}
                  onChange={handleTextChange}
                />
              </div>

              <fieldset className="flags field--full">
                <legend>Checklist flags</legend>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="isUSConsumer"
                    checked={form.isUSConsumer}
                    onChange={handleCheckboxChange}
                  />
                  <span>US-based consumer
                    <span className="help-icon" title="Customer is an individual with an account held at a US bank (not a business or non-US account).">ℹ️</span>
                  </span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="isCardOrEFT"
                    checked={form.isCardOrEFT}
                    onChange={handleCheckboxChange}
                  />
                  <span>Card-based transaction or EFT
                    <span className="help-icon" title="EFT means Electronic Funds Transfer – funds moving from a US consumer bank account via debit card, ATM, or ACH/bank transfer.">ℹ️</span>
                  </span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="isFraudOrUnauthorised"
                    checked={form.isFraudOrUnauthorised}
                    onChange={handleCheckboxChange}
                  />
                  <span>Fraud / unauthorised dispute
                    <span className="help-icon" title="Dispute is marked as fraud or unauthorised by the customer, (not a goods/services or quality complaint)">ℹ️</span>
                  </span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="has3DS"
                    checked={form.has3DS}
                    onChange={handleCheckboxChange}
                  />
                  <span>3DS authentication present
                    <span className="help-icon" title="Transaction used 3D Secure / SCA (e.g. OTP or challenge screen) and the issuer approved the authentication.">ℹ️</span>
                  </span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="ipDeviceMatch"
                    checked={form.ipDeviceMatch}
                    onChange={handleCheckboxChange}
                  />
                  <span>IP / device match
                    <span className="help-icon" title="The IP address and/or device used for the transaction matches the customer's usual location/device.">ℹ️</span>
                  </span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="avsMatch"
                    checked={form.avsMatch}
                    onChange={handleCheckboxChange}
                  />
                  <span>AVS match
                    <span className="help-icon" title="Billing address details (e.g. street and ZIP/postcode) matched the bank's records at authorisation.">ℹ️</span>
                  </span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="aniMatch"
                    checked={form.aniMatch}
                    onChange={handleCheckboxChange}
                  />
                  <span>ANI match
                    <span className="help-icon" title="The phone number used for the transaction matches the customer's usual phone number on file.">ℹ️</span>
                  </span>
                </label>
              </fieldset>

              <div className="actions">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Running check…' : 'Run Reg E check'}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  Clear form
                </button>
              </div>

              {error && (
                <div className="field field--full">
                  <p className="error">⚠️ {error}</p>
                </div>
              )}
            </div>
          </form>
        </section>

        <section className="card">
          <h2>Analysis Result</h2>

          {!result && !error && !isLoading && (
            <p className="muted">
              Fill in the dispute details on the left and run the check to see the Regulation E
              outcome.
            </p>
          )}

          {isLoading && <p className="muted">Checking Reg E criteria…</p>}

          {error && !result && (
            <p className="error">⚠️ {error}</p>
          )}

          {result && (
            <div className="note-block">
              <div className="status-row">
                <div className="arn-label">
                  <span className="arn-title">Customer</span>
                  <span className="arn-value">
                    {result.customerName || 'Customer'}
                  </span>
                </div>

                <div className="arn-label">
                  <span className="arn-title">ARN</span>
                  <span className="arn-value">{result.arn}</span>
                </div>

                <span
                  className={`status-pill ${
                    isMeetsRegE ? 'status-pill--yes' : 'status-pill--no'
                  }`}
                >
                  {isMeetsRegE ? 'Meets Reg E' : 'Does not meet Reg E'}
                </span>
              </div>

              {result.reasons && result.reasons.length > 0 && (
                <div>
                  <h3>Reasoning</h3>
                  <ul>
                    {result.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.internalNote && (
                <div>
                  <h3>Internal note</h3>
                  <p>{result.internalNote}</p>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(result.internalNote || '');
                      alert('Internal note copied to clipboard.');
                    }}
                  >
                    Copy note
                  </button>
                </div>
              )}

              {result.checkoutNote && (
                <div>
                  <h3>Checkout evidence note</h3>
                  <p>{result.checkoutNote}</p>
                  <button
                    type="button"
                    className="secondary"
                    onClick={handleCopyCheckoutNote}
                  >
                    Copy note
                  </button>
                </div>
                
              )}
            </div>
          )}
        </section>
      </main>
      {showScrollTop && (
        <button
          className="scroll-to-top"
          onClick={handleScrollToTop}
          aria-label="Scroll to top"
        >
          ↑ Top
        </button>
      )}
    </div>
  );
}

export default App;