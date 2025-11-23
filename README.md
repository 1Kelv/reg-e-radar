# RegE Radar

RegE Radar is a small internal tool to help the Fraud Operations team quickly check whether a Checkout chargeback meets **US Reg E** criteria and generate **consistent evidence notes**.

It is designed to reduce mental load during case review, standardise decisions, and speed up drafting internal and Checkout notes.

---

## Features

- 🧮 **Reg E classification logic**
  - Checks country, fraud / unauthorised flags, card/EFT, days between transaction and dispute, and KYC status.
  - Returns a simple outcome: **Meets Reg E** or **Does not meet Reg E**.
- 📝 **Reasoning breakdown**
  - Human-readable bullet points showing _why_ a case does or does not meet Reg E.
- 🧾 **Internal note template**
  - Short, consistent summary for internal systems (e.g. Zazu / case notes).
- 📨 **Checkout evidence note**
  - Pre-formatted wording that can be copy-pasted into Checkout as dispute evidence.
- 🗂 **Audit log**
  - Every run is appended to `backend/data/audit-log.json` with ARN, customer name, Reg E outcome, and timestamp.

---

## 🧱 Tech Stack

| Layer        | Technology              | Purpose                                                                 |
|-------------|-------------------------|-------------------------------------------------------------------------|
| Frontend    | React + TypeScript      | SPA UI for entering dispute details and viewing Reg E classification.   |
|             | Vite                    | Frontend build + dev server for fast HMR and bundling.                  |
|             | Plain CSS               | Custom styling for the dashboard, dark/light mode, and status pills.    |
| Backend     | Node.js                 | Runtime for the API and Reg E classification logic.                     |
|             | Express                 | HTTP server exposing `/api/classify` and `/api/history` endpoints.      |
|             | TypeScript              | Shared types and safer backend logic for disputes + audit entries.      |
| Data layer  | JSON file storage       | Simple `audit-log.json` file used as a lightweight audit history store. |
| Tooling     | npm                     | Dependency management and scripts (`npm run dev`, `npm run build`, etc).|
|             | Git + GitHub            | Version control and remote repository for RegE Radar.                   |


---

## Project structure

```text
reg-e-radar/
  backend/
    src/
      server.ts       # Express API
      regelogic.ts    # Reg E rule logic
      auditStore.ts   # Simple JSON audit log writer
      types.ts        # Shared TypeScript types
    data/
      audit-log.json  # Appended audit entries
    package.json
    tsconfig.json

  frontend/
    src/
      App.tsx         # Main React app / form + result view
      App.css         # Styling
      main.tsx
    index.html
    package.json
    tsconfig.json
    vite.config.ts

Getting started
Prerequisites

Node.js 18+ (Node 20 recommended)

npm

Clone the repository:
git clone https://github.com/1Kelv/reg-e-radar.git
cd reg-e-radar

Backend (API)
cd backend
npm install
npm run dev

That will start the Express server on http://localhost:4000
 by default.

You can sanity-check it with:
curl http://localhost:4000

Expected response:
{ "message": "RegE Radar backend is running." }

Classify endpoint:
POST /api/classify
Content-Type: application/json

Body format" {
  "rows": [
    {
      "arn": "123456789012345678",
      "customerName": "Jane Smith",
      "country": "US",
      "isUSConsumer": true,
      "isCardOrEFT": true,
      "isFraudOrUnauthorised": true,
      "has3DS": true,
      "ipDeviceMatch": true,
      "avsMatch": true,
      "aniMatch": true,
      "kycStatus": "passed",
      "disputeReason": "Fraud",
      "transactionDate": "2025-08-10",
      "disputeDate": "2025-08-12"
    }
  ]
}

Example curl:
curl -X POST http://localhost:4000/api/classify \
  -H "Content-Type: application/json" \
  -d @sample-request.json


Reason shape:
{
  "count": 1,
  "results": [
    {
      "arn": "123456789012345678",
      "customerName": "Jane Smith",
      "regStatus": "MEETS_REG_E",
      "reasons": ["..."],
      "internalNote": "Country: US. dispute reason: Fraud ...",
      "checkoutNote": "This dispute meets our internal criteria for Reg E ..."
    }
  ]
}

Every call also appends a simplified entry to backend/data/audit-log.json.

2. Frontend (React app)

In a separate terminal:
cd frontend
npm install
npm run dev

Vite will start the app on http://localhost:5173
The frontend assumes the backend is available at http://localhost:4000. If you ever change the backend port, update the fetch URL in frontend/src/App.tsx.

Usage

Open http://localhost:5173 in your browser.

Fill in the dispute details:

ARN

Customer name

Country

Transaction date and dispute date

Free-text dispute reason

KYC status

Checklist flags (US consumer, card/EFT, fraud/unauthorised, 3DS, IP/AVS/ANI matches)

Click Run Reg E check.

Review the Result panel:

Status pill: Meets Reg E / Does not meet Reg E

Reasoning bullets

Internal note

Checkout evidence note (with Copy note button)

Live-use notes

This version is an MVP intended to assist analysts, not to replace judgement or legal review.

Logic is opinionated and based on current internal understanding of Reg E; always cross-check with the latest SOPs.

Audit log contains customer identifiers (ARN, name) – treat the backend/data directory as sensitive.

CSV/upload flows are not implemented yet – at the moment everything is entered via the UI or sent as JSON to the API.

Roadmap ideas

Some potential next steps:

🌗 Dark / light mode toggle for people who prefer light mode.  ✅

📥 CSV upload:

Export disputes from Zazu / Hex.

Upload to RegE Radar to pre-fill fields or run batch checks.

👥 More flags:

First-day transaction indicators.

Device history / velocity signals.

📊 Analytics view:

Simple dashboard over the audit log (e.g. Reg E-eligible rate, reasons breakdown).

Licence

Currently treated as an internal tool – no formal OSS (Open-Source Software) licence set yet.




