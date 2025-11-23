// src/server.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import { ClassifiedDispute, DisputeRow, AuditEntry } from './types';
import { classifyBatch } from './regelogic';
import { appendAuditEntries, getAuditEntries } from './auditStore';

const app = express();

// Force PORT to be a number for app.listen
const PORT: number = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/', (_req: Request, res: Response): void => {
  res.json({ message: 'RegE Radar backend is running.' });
});

interface ClassifyRequestBody {
  rows: DisputeRow[];
}

app.post('/api/classify', (req: Request, res: Response): void => {
  const body = req.body as ClassifyRequestBody;

  if (!body || !Array.isArray(body.rows)) {
    res.status(400).json({
      error: 'Request body must have a "rows" array.'
    });
    return;
  }

  const results: ClassifiedDispute[] = classifyBatch(body.rows);

  const auditEntries: AuditEntry[] = results.map((r) => ({
    arn: r.arn,
    customerName: r.customerName,
    regEStatus: r.regEStatus,
    disputeReason: r.disputeReason,
    transactionDate: r.transactionDate,
    disputeDate: r.disputeDate,
    createdAt: new Date().toISOString()
  }));

  appendAuditEntries(auditEntries);

  res.json({
    count: results.length,
    results
  });
});

app.get('/api/history', (_req: Request, res: Response): void => {
  const entries = getAuditEntries();

  res.json({
    count: entries.length,
    entries
  });
});

app.listen(PORT, () => {
  console.log(`RegE Radar backend listening on http://localhost:${PORT}`);
});
