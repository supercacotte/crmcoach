
/**
 * Email service (stubs) — replace with real API calls to your backend.
 * Supports Gmail & Outlook via backend OAuth and webhooks.
 */

export type EmailAccount = {
  provider: 'gmail' | 'outlook';
  email: string;
  connectedAt: string;
  autoSync: boolean;
};

export type EmailMessage = {
  id: string;
  threadId: string;
  from: { address: string; name?: string };
  to: { address: string; name?: string }[];
  cc?: { address: string; name?: string }[];
  date: string;
  subject: string;
  snippet?: string;
  bodyHtml?: string;
  bodyText?: string;
  attachments?: { id: string; name: string; size: number }[];
};

export type EmailThread = {
  id: string;
  subject: string;
  lastMessageAt: string;
  participants: string[];
  messages: EmailMessage[];
};

export async function getConnectedAccounts(): Promise<EmailAccount[]> {
  // TODO: fetch from backend
  return JSON.parse(localStorage.getItem('email.accounts') || '[]');
}

export async function setAutoSync(provider: 'gmail'|'outlook', enabled: boolean) {
  const accs = await getConnectedAccounts();
  const idx = accs.findIndex(a => a.provider === provider);
  if (idx >= 0) { accs[idx].autoSync = enabled; localStorage.setItem('email.accounts', JSON.stringify(accs)); }
  return true;
}

export async function disconnectAccount(provider: 'gmail'|'outlook') {
  const accs = (await getConnectedAccounts()).filter(a => a.provider !== provider);
  localStorage.setItem('email.accounts', JSON.stringify(acccs));
  return true;
}

export async function connectAccount(provider: 'gmail'|'outlook'): Promise<EmailAccount> {
  // In real world, redirect to /oauth/{provider}/start then backend saves tokens.
  // Here we simulate a successful connection.
  const accs = await getConnectedAccounts();
  const email = provider === 'gmail' ? 'demo.coach@gmail.com' : 'coach.demo@contoso.com';
  const account = { provider, email, connectedAt: new Date().toISOString(), autoSync: true };
  const existing = accs.find(a => a.provider === provider);
  let next = accs;
  if (existing) {
    next = accs.map(a => a.provider===provider ? account : a);
  } else {
    next = [...accs, account];
  }
  localStorage.setItem('email.accounts', JSON.stringify(next));
  return account as EmailAccount;
}

export async function listThreadsForClient(clientEmail: string): Promise<EmailThread[]> {
  // TODO: call backend search by participant
  // For demo, return mocked threads
  const now = new Date();
  return [
    {
      id: 't1',
      subject: 'Suivi de séance et prochaines étapes',
      lastMessageAt: now.toISOString(),
      participants: [clientEmail, 'demo.coach@gmail.com'],
      messages: [
        {
          id: 'm1',
          threadId: 't1',
          from: { address: clientEmail, name: 'Client' },
          to: [{ address: 'demo.coach@gmail.com', name: 'Coach' }],
          date: new Date(now.getTime()-864e5).toISOString(),
          subject: 'Suivi de séance et prochaines étapes',
          snippet: 'Merci pour la séance d’hier…',
          bodyText: 'Merci pour la séance d’hier, je vais travailler sur les exercices.',
        },
        {
          id: 'm2',
          threadId: 't1',
          from: { address: 'demo.coach@gmail.com', name: 'Coach' },
          to: [{ address: clientEmail, name: 'Client' }],
          date: now.toISOString(),
          subject: 'Suivi de séance et prochaines étapes',
          snippet: 'Voici le récap et les exercices…',
          bodyText: 'Voici le récap et les exercices à réaliser cette semaine.',
        }
      ]
    }
  ];
}

export async function sendEmail(params: {
  from?: string;
  to: string[];
  cc?: string[];
  subject: string;
  html?: string;
  text?: string;
  replyToThreadId?: string;
}): Promise<{ id: string }> {
  // TODO: backend send (Gmail/Graph)
  await new Promise(r => setTimeout(r, 500));
  return { id: 'msg_' + Math.random().toString(36).slice(2) };
}
