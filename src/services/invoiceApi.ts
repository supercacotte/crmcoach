/**
 * Invoice reminder API service.
 * Replace stubs with real backend endpoints when available.
 */
export type ReminderRequest = {
  invoiceIds: number[];
  templateId: string;
  preview?: boolean;
};

export type ReminderResult = {
  successIds: number[];
  failedIds: number[];
};

export async function sendInvoiceReminders(req: ReminderRequest): Promise<ReminderResult> {
  // TODO: Replace with real API call, e.g.:
  // const res = await fetch('/api/invoices/remind', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(req) });
  // if (!res.ok) throw new Error('Failed to send reminders');
  // return await res.json();

  // Simulated network latency + simple success
  await new Promise(r => setTimeout(r, 900));
  return {
    successIds: req.invoiceIds,
    failedIds: [],
  };
}
