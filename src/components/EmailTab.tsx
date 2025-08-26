
import React, { useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import EmailThreadView from './EmailThreadView';
import EmailComposer from './EmailComposer';
import { listThreadsForClient, sendEmail, type EmailThread } from '../services/emailApi';

interface EmailTabProps {
  clientEmail: string;
  coachEmail?: string;
}

const EmailTab: React.FC<EmailTabProps> = ({ clientEmail, coachEmail }) => {
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [search, setSearch] = useState('');
  const [activeThread, setActiveThread] = useState<EmailThread | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await listThreadsForClient(clientEmail);
    setThreads(res);
    setActiveThread(res[0] || null);
    setLoading(false);
  };

  useEffect(()=>{ load(); }, [clientEmail]);

  const filtered = threads.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.participants.some(p => p.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Rechercher un thread…"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <button onClick={load} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1 border rounded-lg p-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-sm text-gray-500 p-3">Chargement…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500 p-3">Aucun email</div>
          ) : (
            <ul className="divide-y">
              {filtered.map(t => (
                <li key={t.id}>
                  <button
                    onClick={()=>setActiveThread(t)}
                    className={`w-full text-left p-2 ${activeThread?.id===t.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="text-xs text-gray-500">{new Date(t.lastMessageAt).toLocaleString()}</div>
                    <div className="text-sm font-medium text-gray-900 truncate">{t.subject}</div>
                    <div className="text-xs text-gray-600 truncate">{t.participants.join(', ')}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 border rounded-lg p-3 min-h-[200px]">
          {activeThread ? (
            <EmailThreadView thread={activeThread} />
          ) : (
            <div className="text-sm text-gray-500">Sélectionnez un thread pour l’afficher</div>
          )}

          <div className="mt-4">
            <EmailComposer
              to={[clientEmail]}
              subject={activeThread ? `Re: ${activeThread.subject}` : ''}
              onSend={async payload=>{
                await sendEmail(payload);
                await load();
                alert('Email envoyé');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTab;
