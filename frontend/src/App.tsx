import { useState, type ChangeEvent, type FormEvent } from 'react';
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
  regStatus: 'MEETS_REG_E' | 'DOES_NOT_APPLY' | string;
  reasons: string[];
  internalNote?: string;
  checkoutNote?: string;
};

const initialForm: DisputeForm = {
  arn: '',
  customerName: 'Jane Smith',
  country: 'US',
  isUSConsumer: true,
  isCardOrEFT: true,
  isFraudOrUnauthorised: true,
  has3DS: true,
  ipDeviceMatch: true,
  avsMatch: true,
  aniMatch: true,
  kycStatus: 'passed',
  disputeReason: 'Fraud',
  transactionDate: '',
  disputeDate: '',
};

function App() {
  const [form, setForm] = useState<DisputeForm>(initialForm);
  const [result, setResult] = useState<ClassifiedDispute | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setIsLoading(false);
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

  const isMeetsRegE = result?.regStatus === 'MEETS_REG_E';

  return (
    <div className="app">
      <header className="app-header">
        <h1>RegE Radar</h1>
        <p className="subtitle">
          Quick checker for Checkout chargebacks – one dispute at a time.
        </p>
      </header>

      <main className="layout">
        {/* Left card – form */}
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
                  value={form.customerName}
                  onChange={handleTextChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleTextChange}
                >
                  <option value="US">US</option>
                  <option value="GB">GB</option>
                  <option value="NG">NG</option>
                  <option value="KE">KE</option>
                  <option value="TZ">TZ</option>
                  <option value="UG">UG</option>
                </select>
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
                  <span>US-based consumer</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="isCardOrEFT"
                    checked={form.isCardOrEFT}
                    onChange={handleCheckboxChange}
                  />
                  <span>Card-based transaction or EFT</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="isFraudOrUnauthorised"
                    checked={form.isFraudOrUnauthorised}
                    onChange={handleCheckboxChange}
                  />
                  <span>Fraud / unauthorised dispute</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="has3DS"
                    checked={form.has3DS}
                    onChange={handleCheckboxChange}
                  />
                  <span>3DS authentication present</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="ipDeviceMatch"
                    checked={form.ipDeviceMatch}
                    onChange={handleCheckboxChange}
                  />
                  <span>IP / device match</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="avsMatch"
                    checked={form.avsMatch}
                    onChange={handleCheckboxChange}
                  />
                  <span>AVS match</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="aniMatch"
                    checked={form.aniMatch}
                    onChange={handleCheckboxChange}
                  />
                  <span>ANI match</span>
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

        {/* Right card – result */}
        <section className="card">
          <h2>Result</h2>

          {!result && !error && !isLoading && (
            <p className="muted">
              Fill in the dispute details on the left and run the check to see the Reg E
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
    </div>
  );
}

export default App;
