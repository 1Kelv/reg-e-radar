# RegE Radar

A small internal tool to help the Fraud Operations team quickly check whether a Checkout
chargeback meets Reg E criteria, and generate consistent evidence notes.

## Features

- Single-dispute checker for Checkout chargebacks
- Simple form for ARN, customer, dates, country and KYC status
- Checklist flags for fraud / unauthorised, US-based consumer, 3DS, IP/device, AVS, ANI
- Clear outcome: **Meets Reg E** / **Does not meet Reg E**
- Reasoning bullets to explain the decision
- Internal note (for our systems) and Checkout evidence note
- Audit log: every run appends a row to `backend/data/audit-log.json`
- Dark / light mode toggle for the UI

## Tech stack

- **Backend:** Node.js, TypeScript, Express
- **Frontend:** React + TypeScript (Vite)
- **Styling:** Vanilla CSS
- **Storage:** JSON audit log file (for prototype only)

## Getting started

### Prerequisites

- Node.js 18+ and npm

### Backend

```bash
cd backend
npm install
npm run dev
