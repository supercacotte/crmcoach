
import React, { useState } from 'react';

interface EmailComposerProps {
  to: string[];
  cc?: string[];
  subject?: string;
  initialBody?: string;
  onSend: (payload: { to: string[]; cc?: string[]; subject: string; html?: string; text?: string }) => Promise<void> | void;
}

const EmailComposer: React.FC<EmailComposerProps> = ({ to, cc = [], subject = '', initialBody = '', onSend }) => {
  const [toField, setToField] = useState(to.join(', '));
  const [ccField, setCcField] = useState(cc.join(', '));
  const [subjectField, setSubjectField] = useState(subject);
  const [body, setBody] = useState(initialBody);
  const [sending, setSending] = useState(false);

  return (
    <div className="border rounded-lg p-3">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
        <label className="sm:col-span-1 text-sm text-gray-600 self-center">À</label>
        <input className="sm:col-span-3 px-3 py-2 border rounded-lg" value={toField} onChange={e=>setToField(e.target.value)} />
        <label className="sm:col-span-1 text-sm text-gray-600 self-center">Cc</label>
        <input className="sm:col-span-3 px-3 py-2 border rounded-lg" value={ccField} onChange={e=>setCcField(e.target.value)} />
        <label className="sm:col-span-1 text-sm text-gray-600 self-center">Objet</label>
        <input className="sm:col-span-3 px-3 py-2 border rounded-lg" value={subjectField} onChange={e=>setSubjectField(e.target.value)} />
      </div>
      <textarea className="w-full px-3 py-2 border rounded-lg min-h-[140px]" value={body} onChange={e=>setBody(e.target.value)} placeholder="Votre message…" />
      <div className="mt-2 flex justify-end">
        <button
          onClick={async ()=>{
            setSending(true);
            await onSend({
              to: toField.split(',').map(s=>s.trim()).filter(Boolean),
              cc: ccField.split(',').map(s=>s.trim()).filter(Boolean),
              subject: subjectField,
              text: body
            });
            setSending(false);
          }}
          disabled={sending}
          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
        >
          {sending ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>
    </div>
  );
};

export default EmailComposer;
