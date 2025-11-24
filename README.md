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

# RegE Radar

Quick checker for Checkout chargebacks – one dispute at a time.

## Table of Contents
- [How to Run the Project Locally](#how-to-run-the-project-locally)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Using RegE Radar](#using-rege-radar)
- [Audit History](#audit-history)

---

## How to Run the Project Locally

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (comes with Node)
- **Git**

---

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/1Kelv/reg-e-radar.git
cd reg-e-radar
```

#### 2. Start the Backend (API + Reg E Logic)

Open your first terminal window:
```bash
cd backend
npm install          # first time only
npm run dev          # starts API on http://localhost:4000
```

> **Note:** Leave this terminal window open while you use the app.

The backend exposes:
- **POST** `/api/classify` – runs the Reg E check for a dispute
- **GET** `/api/history` – returns the stored audit history

#### 3. Start the Frontend (React UI)

Open a **second** terminal window:
```bash
cd reg-e-radar/frontend
npm install          # first time only
npm run dev          # starts UI, usually http://localhost:5173
```

---

## Using RegE Radar

1. **Open the app** in your browser using the URL shown in the frontend terminal (e.g., `http://localhost:5173`)

2. **Fill in the Dispute details** on the left side:
   - ARN
   - Customer name
   - Transaction and dispute dates
   - Checklist flags (US-based consumer, card/EFT, fraud, 3DS, etc.)

3. **Click "Run Reg E check"** to see:
   - ✅ Reg E status (applies / does not apply / needs review)
   - 📋 Reasoning bullets
   - 📝 Internal note
   - 📄 Checkout evidence note

4. **Switch themes** using the ☀️ / 🌙 toggle in the header to switch between light and dark mode

5. **Copy the Checkout note** by clicking the "Copy note" button to paste it directly into the Checkout portal

---

## Audit History

Every time you run a check, the backend appends an entry to:
```
backend/data/audit-log.json
```

Each record includes:
- ARN
- Customer name
- Reg E status
- Dispute reason
- Transaction and dispute dates
- Timestamp

### Future Features

This audit log will power upcoming features like:
- 📊 A **History tab** in the UI
- 📥 **CSV export** (e.g., "show me all Checkout Reg E chargebacks for last month")

---

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite

**Backend:**
- Node.js + Express
- Custom Reg E classification logic

---

## Project Structure
```
reg-e-radar/
├── frontend/          # React UI
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── ...
│   └── package.json
│
├── backend/           # Express API
│   ├── data/
│   │   └── audit-log.json
│   ├── src/
│   │   └── ...
│   └── package.json
│
└── README.md
```

---

## Contributing

This is an internal tool for NALA's Fraud Operations team. If you'd like to suggest improvements or report issues, please reach out to the team.

---

## License

Internal use only - NALA FinTech

---

**Built with ❤️ by the NALA Fraud Ops Team**

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




