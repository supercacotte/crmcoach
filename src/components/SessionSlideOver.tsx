
import React from "react";
import {
  X, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle,
  FileText, ArrowRightCircle, PencilLine, Mail, Plus, Repeat, Link as LinkIcon, Video
} from "lucide-react";
import EmailTab from './EmailTab';

type SessionStatus = "scheduled" | "completed" | "cancelled" | "no_show";
type SessionType = "individual" | "group" | "discovery";

export interface SessionSlideOverData {
  id: number;
  clientId: number;
  clientName: string;
  date: string;      // yyyy-mm-dd
  time: string;      // hh:mm
  duration: number;  // minutes
  status: SessionStatus;
  type: SessionType;
  notes?: string;
  objectives?: string[];
  outcomes?: string;
  nextSteps?: string;
  meetingUrl?: string;
}

interface SessionSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionSlideOverData | null;
  onUpdate: (patch: Partial<SessionSlideOverData>) => void;
  onGenerateInvoice: () => void;
  onCreateNextSession: (base: { date: string; time: string; duration: number }) => void;
  onSendRecap: () => void;
}

const statusBadge = (s: SessionStatus) => {
  const base = "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full";
  switch (s) {
    case "scheduled": return `${base} bg-blue-100 text-blue-800`;
    case "completed": return `${base} bg-green-100 text-green-800`;
    case "cancelled": return `${base} bg-gray-100 text-gray-800`;
    case "no_show":   return `${base} bg-red-100 text-red-800`;
    default:          return `${base} bg-gray-100 text-gray-800`;
  }
};

const SessionSlideOver: React.FC<SessionSlideOverProps> = ({
  isOpen, onClose, session, onUpdate, onGenerateInvoice, onCreateNextSession, onSendRecap
}) => {
  if (!isOpen || !session) return null;

  const isCompleted = session.status === "completed";
  const hasMeeting = !!session.meetingUrl;

  return (
    <div className="fixed inset-0 z-[60] flex" aria-modal="true" role="dialog">
      {/* backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* panel */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-gray-200 overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{session.clientName}</h3>
            <div className="mt-1 flex items-center flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
              <span className={statusBadge(session.status)}>{session.status}</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {new Date(session.date).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4" /> {session.time} • {session.duration}min
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasMeeting && (
              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs"
                title="Ouvrir le lien visio"
              >
                <Video className="w-4 h-4" />
                Rejoindre
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Fermer le panneau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* content */}
        <div className="p-4 space-y-6">
          {/* Actions rapides */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdate({ status: "completed" })}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
            >
              <CheckCircle2 className="w-4 h-4" /> Terminer
            </button>
            <button
              onClick={() => onUpdate({ status: "cancelled" })}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
            >
              <XCircle className="w-4 h-4" /> Annuler
            </button>
            <button
              onClick={() => onUpdate({ status: "no_show" })}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
            >
              <AlertTriangle className="w-4 h-4" /> No-show
            </button>
            <button
              onClick={() => onGenerateInvoice()}
              disabled={!isCompleted}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${
                isCompleted
                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
              title={isCompleted ? "Générer une facture" : "Disponible après 'Terminée'"}
            >
              <FileText className="w-4 h-4" /> Facturer
            </button>
          </div>

          {/* Lien visio */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Lien visio (Meet / Zoom)
            </h4>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://meet.google.com/… ou https://zoom.us/j/…"
                defaultValue={session.meetingUrl ?? ""}
                onBlur={(e) => onUpdate({ meetingUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              {session.meetingUrl && (
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
                >
                  <Video className="w-4 h-4" /> Ouvrir
                </a>
              )}
            </div>
          </div>

          {/* Reprogrammation rapide */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Repeat className="w-4 h-4" /> Reprogrammer
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                defaultValue={session.date}
                onChange={(e) => onUpdate({ date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="time"
                defaultValue={session.time}
                onChange={(e) => onUpdate({ time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Notes rapides */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <PencilLine className="w-4 h-4" /> Notes
            </h4>
            <textarea
              defaultValue={session.notes ?? ""}
              onBlur={(e) => onUpdate({ notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Notes de séance…"
            />
          </div>

          {/* Prochaines étapes & Récap client */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Prochaines étapes</h4>
            <textarea
              defaultValue={session.nextSteps ?? ""}
              onBlur={(e) => onUpdate({ nextSteps: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Actions à réaliser par le client d’ici la prochaine séance…"
            />
            <div className="flex gap-2">
              <button
                onClick={onSendRecap}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
              >
                <Mail className="w-4 h-4" /> Envoyer le récap au client
              </button>
              <button
                onClick={() => onCreateNextSession({ date: session.date, time: session.time, duration: session.duration })}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
              >
                <Plus className="w-4 h-4" /> Créer prochaine séance
              </button>
            </div>
          </div>

          {/* Lien vers la fiche Client */}
          <a
            href={`#/clients/${session.clientId}`}
            className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline"
          >
            Voir la fiche client <ArrowRightCircle className="w-4 h-4" />
          </a>

          {/* Emails (liés au client) */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Emails</h4>
            <EmailTab clientEmail={`${session.clientName.split(' ').join('.').toLowerCase()}@example.com`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSlideOver;
