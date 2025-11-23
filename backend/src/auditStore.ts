// src/auditStore.ts

import fs from 'fs';
import path from 'path';
import { AuditEntry } from './types';

const dataDir = path.join(__dirname, '..', 'data');
const auditFile = path.join(dataDir, 'audit-log.json');

function ensureFileExists() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(auditFile)) {
    fs.writeFileSync(auditFile, '[]', 'utf8');
  }
}

export function getAuditEntries(): AuditEntry[] {
  ensureFileExists();
  const raw = fs.readFileSync(auditFile, 'utf8').trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as AuditEntry[];
    }
    return [];
  } catch {
    return [];
  }
}

export function appendAuditEntries(newEntries: AuditEntry[]): void {
  ensureFileExists();
  const existing = getAuditEntries();
  const combined = [...existing, ...newEntries];
  fs.writeFileSync(auditFile, JSON.stringify(combined, null, 2), 'utf8');
}
