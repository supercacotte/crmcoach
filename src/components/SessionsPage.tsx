import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Clock, User, Plus, Search, Filter, CheckCircle, XCircle, Target, MessageSquare, FileText, CreditCard, Users, TrendingUp } from 'lucide-react';
import { Client } from '../types/Client';
import CreateInvoiceModal from './CreateInvoiceModal';
import SummaryBanner from './SummaryBanner';
import KpiBanner from './KpiBanner';
import SessionSlideOver from './SessionSlideOver';


interface Session {
  id: number;
  clientId: number;
  clientName: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  type: 'individual' | 'group' | 'discovery';
  notes?: string;
  objectives?: string[];
  outcomes?: string;
  nextSteps?: string;

  meetingUrl?: string;}

interface SessionsPageProps {
  clients: Client[];
  sessions?: any[];
  onUpdateSessions?: (sessions: any[]) => void;
}

const SessionsPage: React.FC<SessionsPageProps> = ({ clients, sessions: externalSessions = [], onUpdateSessions }) => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 1,
      clientId: 1,
      clientName: 'Sophie Laurent',
      date: '2024-01-25',
      time: '14:00',
      duration: 60,
      status: 'scheduled',
      type: 'individual',
      objectives: ['Travailler sur la confiance en réunion', 'Préparer la présentation de demain'],
    },
    {
      id: 2,
      clientId: 2,
      clientName: 'Thomas Rousseau',
      date: '2024-01-28',
      time: '10:00',
      duration: 60,
      status: 'scheduled',
      type: 'individual',
      objectives: ['Définir les étapes de la reconversion', 'Identifier les obstacles'],
    },
    {
      id: 3,
      clientId: 1,
      clientName: 'Sophie Laurent',
      date: '2024-01-18',
      time: '14:00',
      duration: 60,
      status: 'completed',
      type: 'individual',
      objectives: ['Développer l\'assertivité', 'Techniques de communication'],
      outcomes: 'Excellente séance, Sophie a pratiqué plusieurs techniques d\'assertivité. Elle se sent plus confiante.',
      nextSteps: 'Pratiquer les techniques apprises en situation réelle, préparer des exemples pour la prochaine séance',
      notes: 'Sophie montre de réels progrès dans sa capacité à s\'affirmer. À continuer sur cette voie.',
    },
    {
      id: 4,
      clientId: 2,
      clientName: 'Thomas Rousseau',
      date: '2024-01-21',
      time: '10:00',
      duration: 60,
      status: 'completed',
      type: 'individual',
      objectives: ['Clarifier la vision professionnelle', 'Explorer les options de formation'],
      outcomes: 'Thomas a une vision plus claire de son projet. Il souhaite se diriger vers le marketing digital.',
      nextSteps: 'Rechercher des formations en marketing digital, contacter des professionnels du secteur',
      notes: 'Motivation en hausse, projet se précise. Thomas est prêt à passer à l\'action.',
    },
  ]);

  // Fusionner les séances externes avec les séances locales
  React.useEffect(() => {
    if (externalSessions.length > 0) {
      setSessions(prevSessions => {
        const existingIds = prevSessions.map(s => s.id);
        const newSessions = externalSessions.filter(s => !existingIds.includes(s.id));
        return [...prevSessions, ...newSessions];
      });
    }
  }, [externalSessions]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [sessionForInvoice, setSessionForInvoice] = useState<Session | null>(null);


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'no_show': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredSessions = useMemo(() => sessions.filter(session => {
    const matchesSearch = session.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    const matchesType = filterType === 'all' || session.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  }), [sessions, searchTerm, filterStatus, filterType]);

  const upcomingSessions = useMemo(() => sessions.filter(s => s.status === 'scheduled').slice(0, 3), [sessions]);
  const completedThisWeek = useMemo(() => sessions.filter(s => s.status === 'completed').length, [sessions]);
  const totalScheduled = useMemo(() => sessions.filter(s => s.status === 'scheduled').length, [sessions]);
  const activeClients = useMemo(() => clients.filter(c => c.status === 'active').length, [clients]);

  // Calculate KPI data
  const getKpiData = useCallback(() => [
    {
      label: 'Séances Planifiées',
      value: totalScheduled,
      icon: Calendar,
      color: 'blue' as const,
      tooltip: 'Nombre de séances à venir'
    },
    {
      label: 'Cette Semaine',
      value: completedThisWeek,
      icon: CheckCircle,
      color: 'green' as const,
      tooltip: 'Séances terminées cette semaine'
    },
    {
      label: 'Clients Actifs',
      value: activeClients,
      icon: Users,
      color: 'purple' as const,
      tooltip: 'Clients avec un statut actif'
    },
    {
      label: 'Total Séances',
      value: sessions.length,
      icon: Target,
      color: 'orange' as const,
      tooltip: 'Nombre total de séances'
    }
  ], [totalScheduled, completedThisWeek, activeClients, sessions.length]);

  const handleGenerateInvoice = (session: Session) => {
    setSessionForInvoice(session);
    setIsCreateInvoiceModalOpen(true);
  };

  const handleCreateInvoice = (newInvoice: any) => {
    // Logique de création de facture
    console.log('Facture créée pour la séance:', sessionForInvoice, newInvoice);
    alert(`Facture ${newInvoice.invoiceNumber} créée pour la séance avec ${sessionForInvoice?.clientName}`);
    setIsCreateInvoiceModalOpen(false);
    setSessionForInvoice(null);
  };


  // Patch selected session state (status/date/time/notes/nextSteps/meetingUrl)
  const patchSelectedSession = (patch: Partial<Session>) => {
    if (!selectedSession) return;
    setSessions(prev => prev.map(s => (s.id === selectedSession.id ? { ...s, ...patch } : s)));
    setSelectedSession(prev => (prev ? { ...(prev as Session), ...patch } : prev));
    onUpdateSessions?.(sessions ? [...sessions] : []);
  };

  const openInvoiceFromSlideOver = () => {
    if (!selectedSession) return;
    handleGenerateInvoice(selectedSession);
  };

  const handleCreateNextSession = (base: { date: string; time: string; duration: number }) => {
    if (!selectedSession) return;
    const next = new Date(base.date);
    next.setDate(next.getDate() + 7);
    const newS: Session = {
      id: Math.max(0, ...sessions.map(s => s.id)) + 1,
      clientId: selectedSession.clientId,
      clientName: selectedSession.clientName,
      date: next.toISOString().slice(0,10),
      time: base.time,
      duration: base.duration,
      status: 'scheduled',
      type: selectedSession.type,
      meetingUrl: selectedSession.meetingUrl
    };
    setSessions(prev => [newS, ...prev]);
  };

  const handleSendRecap = () => {
    if (!selectedSession) return;
    // TODO: integrate email service; for now, simple UX stub
    alert(`Récap envoyé à ${selectedSession.clientName}`);
  };

  return (
    <div className="bg-white min-h-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Séances de Coaching</h2>
            <p className="text-sm text-gray-500 mt-1">Gérez vos séances et suivez les progrès</p>
          </div>
          <button 
            aria-label="Créer une nouvelle séance" onClick={() => alert('Fonctionnalité de création de séance à venir')}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nouvelle Séance</span>
            <span className="sm:hidden">Nouvelle</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              aria-label="Rechercher par client" placeholder="Rechercher par client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">Tous les statuts</option>
              <option value="scheduled">Planifiées</option>
              <option value="completed">Terminées</option>
              <option value="cancelled">Annulées</option>
              <option value="no_show">Absences</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">Tous les types</option>
              <option value="individual">Individuelles</option>
              <option value="group">Groupes</option>
              <option value="discovery">Découverte</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* KPI Banner */}
      <KpiBanner
        items={getKpiData()}
        dense={false}
      />
      
      <div className="flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 p-6 min-h-0 overflow-y-auto">
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div onClick={() => { setSelectedSession(session); setIsSlideOverOpen(true); }} className="cursor-pointer">
                  <SummaryBanner
                    type="session"
                    data={{
                      name: session.clientName,
                      date: session.date,
                      time: session.time,
                      duration: `${session.duration}min`,
                      sessionType: TYPE_LABELS[session.type],
                      status: session.status,
                      assignedCoach: 'Coach assigné', meetingUrl: (session as any).meetingUrl // surfacer dans SummaryBanner si supporté
                    }}
                  />
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1">{STATUS_LABELS[session.status]}</span>
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      {TYPE_LABELS[session.type]}
                    </span>
                  </div>
                  
                  {session.status === 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateInvoice(session);
                      }}
                      className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-xs font-medium"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Facturer
                    </button>
                  )}
                </div>
                
                {session.objectives && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Objectifs:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {session.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <Target className="w-3 h-3 mr-2 mt-0.5 text-gray-400" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {session.outcomes && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Résultats:</h4>
                    <p className="text-sm text-gray-600">{session.outcomes}</p>
                  </div>
                )}
                
                {session.nextSteps && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Prochaines étapes:</h4>
                    <p className="text-sm text-gray-600">{session.nextSteps}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 p-4 sm:p-6 min-h-0 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaines Séances</h3>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{session.clientName}</h4>
                  <span className="text-xs text-blue-600 font-medium">{TYPE_LABELS[session.type]}</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {session.time} ({session.duration}min)
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedSession && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails de la Séance</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedSession.clientName}</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>
                    <strong>Date:</strong> {new Date(selectedSession.date).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Heure:</strong> {selectedSession.time}
                  </div>
                  <div>
                    <strong>Durée:</strong> {selectedSession.duration} minutes
                  </div>
                  <div>
                    <strong>Type:</strong> {TYPE_LABELS[selectedSession.type]}
                  </div>
                  <div>
                    <strong>Statut:</strong> {statusLabels[selectedSession.status]}
                  </div>
                </div>
                
                {selectedSession.notes && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Notes:</h5>
                    <p className="text-sm text-gray-600">{selectedSession.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      

      <SessionSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        session={selectedSession}
        onUpdate={patchSelectedSession}
        onGenerateInvoice={openInvoiceFromSlideOver}
        onCreateNextSession={handleCreateNextSession}
        onSendRecap={handleSendRecap}
      />

      {/* Modal de création de facture */}
      {sessionForInvoice && (
        <CreateInvoiceModal
          isOpen={isCreateInvoiceModalOpen}
          onClose={() => {
            setIsCreateInvoiceModalOpen(false);
            setSessionForInvoice(null);
          }}
          client={clients.find(c => c.name === sessionForInvoice.clientName)}
          sessions={[{
            id: sessionForInvoice.id,
            clientId: clients.find(c => c.name === sessionForInvoice.clientName)?.id || 0,
            date: sessionForInvoice.date,
            type: sessionForInvoice.type,
            duration: sessionForInvoice.duration,
            status: 'completed',
            description: `Séance ${TYPE_LABELS[sessionForInvoice.type]} - ${sessionForInvoice.duration}min`
          }]}
          onCreateInvoice={handleCreateInvoice}
        />
      )}
    </div>
  );
};

export default SessionsPage;