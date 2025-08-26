/**
 * Reminder email templates with simple placeholder interpolation.
 * Placeholders supported:
 *  - {{clientName}}, {{invoiceNumber}}, {{dueAmount}}, {{dueDate}}, {{coachName}}, {{companyName}}
 *  - {{payLink}} (if available)
 */
export type ReminderTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string; // plain text or simple HTML
};

export const defaultReminderTemplate: ReminderTemplate = {
  id: "default",
  name: "Relance douce (par défaut)",
  subject: "Relance facture {{invoiceNumber}} — échéance dépassée",
  body: `Bonjour {{clientName}},\n\n
Nous vous écrivons au sujet de la facture {{invoiceNumber}} d’un montant de {{dueAmount}}, échue le {{dueDate}}.\n
Si le règlement a déjà été effectué, merci d’ignorer ce message. Dans le cas contraire, vous pouvez régler via ce lien : {{payLink}}\n\n
Si besoin, n’hésitez pas à répondre à cet email.\n\n
Bien cordialement,\n
{{coachName}}`
};

export function interpolate(template: ReminderTemplate, data: Record<string,string | number | undefined>) {
  const fill = (s: string) => s.replace(/\{\{(.*?)\}\}/g, (_, k) => String(data[k.trim()] ?? ""));
  return {
    subject: fill(template.subject),
    body: fill(template.body),
  };
}
