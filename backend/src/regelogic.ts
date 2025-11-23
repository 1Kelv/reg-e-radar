// src/regelogic.ts

import { DisputeRow, ClassifiedDispute } from './types';

// Normalise various truthy formats into a real boolean
function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

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
  const isUS =
    typeof row.country === 'string' &&
    row.country.trim().toUpperCase() === 'US';

  const usConsumer = isUS || toBool((row as any).isUSConsumer);
  const cardOrEFT = toBool((row as any).isCardOrEFT);

  const fraudFlag = toBool((row as any).isFraudOrUnauthorised);
  const fraudReason =
    typeof row.disputeReason === 'string' &&
    row.disputeReason.toLowerCase().includes('fraud');
  const unauthReason =
    typeof row.disputeReason === 'string' &&
    row.disputeReason.toLowerCase().includes('unauthorised');

  const isFraudOrUnauthorised = fraudFlag || fraudReason || unauthReason;

  const has3DS = toBool((row as any).has3DS);
  const ipMatch = toBool((row as any).ipDeviceMatch);
  const avsMatch = toBool((row as any).avsMatch);
  const aniMatch = toBool((row as any).aniMatch);
  const kycDone = isKycComplete((row as any).kycStatus);

  const ageDays = daysBetween(
    (row as any).transactionDate,
    (row as any).disputeDate
  );
  const within60Days = ageDays !== null ? ageDays <= 60 : false;

  const reasons: string[] = [];

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
  if (!kycDone) {
    reasons.push('KYC not completed at the time of the dispute.');
  }
  if (!has3DS) {
    reasons.push('3DS authentication not present or not confirmed.');
  }

  // Simple rule: if core criteria meet, mark as Reg E; otherwise mark as not
  const meetsRegE =
    usConsumer && cardOrEFT && isFraudOrUnauthorised && within60Days;

  const regEStatus = (meetsRegE
    ? 'MEETS_REG_E'
    : 'DOES_NOT_APPLY') as ClassifiedDispute['regEStatus'];

  const internalNoteParts: string[] = [
    `Country: ${row.country || 'Unknown'}`,
    `dispute reason: ${row.disputeReason || 'Unknown'}`,
    `fraud/unauthorised: ${isFraudOrUnauthorised ? 'Yes' : 'No'}`,
    `card/EFT: ${cardOrEFT ? 'Yes' : 'No'}`,
    `days between transaction and dispute: ${ageDays ?? 'Unknown'}`
  ];

  if (reasons.length) {
    internalNoteParts.push(
      `Case ${meetsRegE ? 'meets' : 'does not meet'} internal criteria for Reg E. Reasons: ${reasons.join(
        ' '
      )}`
    );
  }

  const internalNote = internalNoteParts.join('. ');

  const checkoutNote = meetsRegE
    ? 'This dispute meets our internal criteria for Reg E. We are challenging the chargeback accordingly.'
    : 'This dispute does not meet our internal criteria for Reg E, for example due to country, dispute reason or timing. We are providing this information for context and still challenging the chargeback where appropriate.';

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
