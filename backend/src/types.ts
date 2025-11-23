// src/types.ts

// How we store the Reg E outcome in the backend
export type RegEStatus = 'MEETS_REG_E' | 'DOES_NOT_APPLY' | 'NEEDS_REVIEW';

// One dispute row coming from the frontend / Zazu / Checkout
export interface DisputeRow {
  arn: string;                 // ARN from Checkout
  customerName: string;        // Name from the chargeback form if available

  country: string;             // e.g. "US"
  isUSConsumer: boolean;       // tickbox

  // Reason + fraud flag
  disputeReason: string;       // e.g. "Fraud / unauthorised"
  isFraudOrUnauthorised: boolean;

  // Card / EFT flag
  isCardOrEFT: boolean;        // card-based or EFT tick

  // Dates
  transactionDate: string;     // "2025-11-01"
  disputeDate: string;         // "2025-11-20"

  // Checklist flags
  has3DS: boolean;             // 3DS authentication present
  avsMatch: boolean;           // AVS match
  ipDeviceMatch: boolean;      // IP/device match
  aniMatch: boolean;           // ANI result
  kycStatus: string;           // raw KYC status text (passed, verified, pending…)
}

// Output of the Reg E classifier
export interface ClassifiedDispute extends DisputeRow {
  regEStatus: RegEStatus;
  reasons: string[];     // why it applied / didn’t
  internalNote: string;
  checkoutNote: string;
}

// Stored audit record
export interface AuditEntry {
  arn: string;
  customerName: string;
  regEStatus: RegEStatus;
  disputeReason: string;
  transactionDate: string;
  disputeDate: string;
  createdAt: string; // ISO timestamp when we processed it
}
