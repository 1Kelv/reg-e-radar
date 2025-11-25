// backend/src/regelogic.ts
import { DisputeRow, ClassifiedDispute, RegEStatus } from './types';

// Normalise various truthy formats into a real boolean
function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;

  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'y' || v === 'yes' || v === 'true' || v === '1';
  }

  return false;
}

function isKycComplete(status?: string): boolean {
  if (!status) return false;
  const v = status.trim().toLowerCase();
  // Treat “passed / complete / completed / verified” as KYC done
  return ['passed', 'complete', 'completed', 'verified'].includes(v);
}

function daysBetween(tx?: string, dispute?: string): number | null {
  if (!tx || !dispute) return null;

  const txDate = new Date(tx);
  const disputeDate = new Date(dispute);

  if (isNaN(txDate.getTime()) || isNaN(disputeDate.getTime())) {
    return null;
  }

  const diffMs = disputeDate.getTime() - txDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function classifyDispute(row: DisputeRow): ClassifiedDispute {
  const country = (row.country || '').trim().toUpperCase();

  // Core flags
  const usConsumer = row.isUSConsumer || country === 'US';
  const cardOrEFT = !!row.isCardOrEFT;

  const reasonText = (row.disputeReason || '').toLowerCase();
  const isFraudOrUnauthorised =
    row.isFraudOrUnauthorised ||
    reasonText.includes('fraud') ||
    reasonText.includes('unauthorised');

  const has3DS = !!row.has3DS;
  const ipMatch = row.ipDeviceMatch ?? null;
  const avsMatch = row.avsMatch ?? null;
  const aniMatch = row.aniMatch ?? null;
  const kycDone = isKycComplete(row.kycStatus);

  const ageDays = daysBetween(row.transactionDate, row.disputeDate);
  const within60Days = ageDays !== null ? ageDays <= 60 : false;

  // Build reasons (for the “Reasoning” + internal note)
  const reasons: string[] = [];

  // Hard Reg E criteria
  if (!usConsumer) {
    reasons.push('Customer not confirmed as US-based.');
  }
  if (!cardOrEFT) {
    reasons.push('Transaction is not marked as card-based or EFT.');
  }
  if (!isFraudOrUnauthorised) {
    reasons.push('Dispute is not flagged as fraud/unauthorised.');
  }
  if (!within60Days) {
    reasons.push('Dispute raised more than 60 days after the transaction.');
  }

  // Soft checks – do NOT block Reg E, but give context
  if (!kycDone) {
    reasons.push('KYC not completed at the time of the dispute.');
  }
  if (!has3DS) {
    reasons.push('3DS authentication not present or not confirmed.');
  }
  if (ipMatch === false) {
    reasons.push('IP / device does not match the cardholder.');
  }
  if (avsMatch === false) {
    reasons.push('AVS check did not match.');
  }
  if (aniMatch === false) {
    reasons.push('ANI check did not match.');
  }

  // --- Core Reg E decision ------------------------------------
// IMPORTANT: 3DS / IP / AVS / ANI do NOT block Reg E;
// they are context for how strong our evidence is.
const meetsRegE =
  usConsumer && cardOrEFT && isFraudOrUnauthorised && within60Days;

const regEStatus: RegEStatus = meetsRegE ? 'APPLIES' : 'DOES_NOT_APPLY';

// --- Internal note -------------------------------------------
const internalNoteParts: string[] = [
  `Country: ${row.country || 'Unknown'}`,
  `dispute reason: ${row.disputeReason || 'Unknown'}`,
  `fraud/unauthorised: ${isFraudOrUnauthorised ? 'Yes' : 'No'}`,
  `card/EFT: ${cardOrEFT ? 'Yes' : 'No'}`,
  `days between transaction and dispute: ${ageDays ?? 'Unknown'}`
];

if (reasons.length) {
  if (regEStatus === 'APPLIES') {
    internalNoteParts.push(
      `Case meets internal criteria for Reg E. Additional checks: ${reasons.join(
        ' '
      )}`
    );
  } else {
    internalNoteParts.push(
      `Case does not meet internal criteria for Reg E. Reasons: ${reasons.join(
        ' '
      )}`
    );
  }
}

const internalNote = internalNoteParts.join('. ');

// --- Checkout evidence note ----------------------------------
const checkoutNote =
  regEStatus === 'APPLIES'
    ? 'This dispute meets our internal criteria for Regulation E. We are challenging the chargeback accordingly.'
    : 'This dispute does not meet our internal criteria for Regulation E, for example due to country, dispute reason or timing. We are providing this information for context and still challenging the chargeback where appropriate.';


  return {
  ...(row as any),
  regEStatus,
  reasons,
  internalNote,
  checkoutNote
} as ClassifiedDispute;

}

export function classifyBatch(rows: DisputeRow[]): ClassifiedDispute[] {
  return rows.map(classifyDispute);
}
