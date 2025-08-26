
import React from 'react';
import { Mail } from 'lucide-react';
import type { EmailThread } from '../services/emailApi';

interface EmailThreadViewProps {
  thread: EmailThread;
}

const EmailThreadView: React.FC<EmailThreadViewProps> = ({ thread }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <Mail className="w-4 h-4" /> {thread.subject}
      </h4>
      {thread.messages.map(msg => (
        <div key={msg.id} className="border rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">
            <span className="font-medium">{msg.from.name || msg.from.address}</span> — {new Date(msg.date).toLocaleString()}
          </div>
          <div className="text-sm text-gray-900 whitespace-pre-wrap">
            {msg.bodyText || msg.snippet}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailThreadView;
