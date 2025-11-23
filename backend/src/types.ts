// src/types.ts

export type RegEStatus = 'APPLIES' | 'DOES_NOT_APPLY' | 'NEEDS_REVIEW';

// One dispute row coming from Zazu / Checkout after cleaning
export interface DisputeRow {
  arn: string;                // ARN from Checkout
  customerName: string;       // Name from the chargeback form if available

  country: string;            // e.g. "US"
  isUSConsumer: boolean;      // explicit tick / derived flag

  disputeReason: string;      // e.g. "Fraud / unauthorised"
  isUnauthorised: boolean;    // fraud/unauthorised tick

  isCardOrEft: boolean;       // card-based or EFT tick

  transactionDate: string;    // ISO string "2025-11-01"
  disputeDate: string;        // ISO string "2025-11-20"

  // Reg E checklist checkboxes:
  has3ds: boolean;            // 3DS authentication
  avsMatch: boolean | null;   // AVS check (true/false/null)
  ipDeviceMatch: boolean | null; // IP/device match
  aniMatch: boolean | null;   // ANI result
  kycCompleted: boolean;      // KYC status
}

export interface ClassifiedDispute extends DisputeRow {
  regEStatus: RegEStatus;
  reasons: string[];      // why it applied / didn’t
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
