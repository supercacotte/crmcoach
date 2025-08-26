import React, { useState } from 'react';
import { Mail, Phone, MapPin, Building, Calendar, Star, Edit2, Trash2, MessageCircle, User, X, Target, TrendingUp, Clock, DollarSign, CreditCard, FileText, Euro, Plus } from 'lucide-react';
import { Client } from '../types/Client';
import CreateInvoiceModal from './CreateInvoiceModal';

interface Session {
  id: number;
  clientId: number;
  date: string;
  duration: number;
  type: string;
  objectives?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Prospect {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'lead' | 'contacted' | 'meeting_scheduled' | 'proposal_sent' | 'negotiation' | 'closed_won' | 'closed_lost';
  tags: string[];
  lastContact: string;
  starred: boolean;
  coachingGoals?: string;
  budget?: string;
  timeline?: string;
  notes?: string;
}


interface ContactDetailProps {
  prospect: Prospect | null;
  client: Client | null;
  sessions?: Session[];
  onClose: () => void;
  onUpdateClient?: (client: Client) => void;
  onCreateSession?: (session: any) => void;
}

const ContactDetail: React.FC<ContactDetailProps> = ({ prospect, client, sessions = [], onClose, onUpdateClient, onCreateSession }) => {
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
  const [isEditingNextSession, setIsEditingNextSession] = useState(false);
  const [nextSessionDate, setNextSessionDate] = useState('');
  const [nextSessionTime, setNextSessionTime] = useState('');

  // Filter upcoming sessions for the current client
  const upcomingSessions = client ? sessions.filter(session => 
    session.clientId === client.id && 
    session.status === 'scheduled' &&
    new Date(session.date) > new Date()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  const getProspectStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-gray-100 text-gray-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'meeting_scheduled': return 'bg-purple-100 text-purple-800';
      case 'proposal_sent': return 'bg-yellow-100 text-yellow-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'closed_won': return 'bg-green-100 text-green-800';
      case 'closed_lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const prospectStatusLabels = {
    lead: 'Prospect',
    contacted: 'Contacté',
    meeting_scheduled: 'RDV Planifié',
    proposal_sent: 'Proposition Envoyée',
    negotiation: 'Négociation',
    closed_won: 'Client Signé',
    closed_lost: 'Perdu'
  };

  const contact = prospect || client;

  const handleEditNextSession = () => {
    if (client?.nextSession) {
      const sessionDateTime = new Date(client.nextSession);
      setNextSessionDate(sessionDateTime.toISOString().split('T')[0]);
      setNextSessionTime(sessionDateTime.toTimeString().slice(0, 5));
    } else {
      setNextSessionDate('');
      setNextSessionTime('');
    }
    setIsEditingNextSession(true);
  };

  const handleSaveNextSession = () => {
    if (client && onUpdateClient && nextSessionDate && nextSessionTime) {
      const newDateTime = `${nextSessionDate}T${nextSessionTime}:00`;
      const updatedClient = {
        ...client,
        nextSession: newDateTime
      };
      onUpdateClient(updatedClient);
      setIsEditingNextSession(false);
    }
  };

  const handleCancelEditSession = () => {
    setIsEditingNextSession(false);
    setNextSessionDate('');
    setNextSessionTime('');
  };

  const handleCreateInvoice = (newInvoice: any) => {
    if (client && onUpdateClient) {
      const updatedClient = {
        ...client,
        billing: {
          ...client.billing,
          invoices: [...client.billing.invoices, newInvoice],
          totalDue: client.billing.totalDue + newInvoice.amount,
        }
      };
      onUpdateClient(updatedClient);
    }
  };

  return (
    <div className={`fixed right-0 top-0 w-full sm:w-80 lg:w-96 bg-white border-l border-gray-100 h-screen overflow-auto transform transition-transform duration-300 ease-in-out z-50 shadow-xl ${
      contact ? 'translate-x-0' : 'translate-x-full'
    }`} style={{position: 'fixed'}}>
      {!contact && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">Sélectionnez un contact pour voir les détails</p>
          </div>
        </div>
      )}
      
      {contact && (
        <>
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            {prospect ? 'Détails du Prospect' : 'Détails du Client'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-start justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg">
              <span className="text-base sm:text-lg font-bold text-white">
                {contact.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words">{contact.name}</h2>
                {contact.starred && (
                  <Star className="w-5 h-5 text-yellow-500 ml-2 fill-current drop-shadow-sm" />
                )}
              </div>
              <p className="text-sm text-gray-600 font-medium break-words">
                {prospect ? prospect.source : client?.coachingProgram}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-sm">
              <Edit2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 hover:shadow-sm">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <span className={`inline-flex px-4 py-1.5 text-sm font-semibold rounded-full shadow-sm ${
            prospect ? getProspectStatusColor(prospect.status) : getClientStatusColor(client!.status)
          }`}>
            {prospect ? prospectStatusLabels[prospect.status] : contact.status}
          </span>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 drawer-content">
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700 font-medium break-all">{contact.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700 font-medium">{contact.phone}</span>
            </div>
            {prospect && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-700 font-medium break-words">Source: {prospect.source}</span>
              </div>
            )}
            {client && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-700 font-medium break-words">Client depuis {new Date(client.startDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        
        {prospect && (
          <>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Informations Coaching</h3>
              <div className="space-y-3">
                {prospect.coachingGoals && (
                  <div className="flex items-start">
                    <Target className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Objectifs</p>
                      <p className="text-sm text-gray-700">{prospect.coachingGoals}</p>
                    </div>
                  </div>
                )}
                {prospect.budget && (
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</p>
                      <p className="text-sm text-gray-700">{prospect.budget}</p>
                    </div>
                  </div>
                )}
                {prospect.timeline && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Durée souhaitée</p>
                      <p className="text-sm text-gray-700">{prospect.timeline}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {client && (
          <>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Programme de Coaching</h3>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm font-semibold text-gray-900 mb-2">{client.coachingProgram}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Progression</span>
                    <span className="text-xs font-medium text-gray-900">{client.sessionsCompleted}/{client.totalSessions} séances</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                      style={{ width: `${(client.sessionsCompleted / client.totalSessions) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Prochaines séances */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Prochaines Séances</h4>
                    <button
                      onClick={() => setIsCreateSessionModalOpen(true)}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded transition-colors"
                      title="Planifier une nouvelle séance"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {upcomingSessions.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingSessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-blue-600 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(session.date).toLocaleDateString('fr-FR')} à {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-xs text-gray-600">{session.type}</p>
                            </div>
                          </div>
                          {isEditingNextSession ? (
                            <div className="flex space-x-1">
                              <button
                                onClick={handleSaveNextSession}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                Sauver
                              </button>
                              <button
                                onClick={handleCancelEditSession}
                                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={handleEditNextSession}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="Modifier cette séance"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Aucune séance planifiée</p>
                      <button
                        onClick={() => setIsCreateSessionModalOpen(true)}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Planifier la première séance
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Ancien affichage de nextSession pour l'édition rapide */}
                {client.nextSession && isEditingNextSession && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Modifier la séance</p>
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          value={nextSessionDate}
                          onChange={(e) => setNextSessionDate(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="time"
                          value={nextSessionTime}
                          onChange={(e) => setNextSessionTime(e.target.value)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex space-x-1 mt-2">
                        <button
                          onClick={handleSaveNextSession}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Sauver
                        </button>
                        <button
                          onClick={handleCancelEditSession}
                          className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Facturation</h3>
              <div className="space-y-4">
                {/* Résumé financier */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Euro className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payé</span>
                      </div>
                      <p className="text-lg font-bold text-green-700">{client.billing.totalPaid.toLocaleString('fr-FR')}€</p>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <CreditCard className="w-4 h-4 text-orange-600 mr-2" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">À Recevoir</span>
                      </div>
                      <p className="text-lg font-bold text-orange-700">{client.billing.totalDue.toLocaleString('fr-FR')}€</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Tarif horaire</span>
                      <span className="text-sm font-semibold text-gray-900">{client.billing.hourlyRate}€/h</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-600">Mode de paiement</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {client.billing.paymentMethod === 'package' ? 'Forfait' : 
                         client.billing.paymentMethod === 'monthly' ? 'Mensuel' : 'Par séance'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dernières factures */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Factures Récentes</h4>
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Voir toutes
                    </button>
                  </div>
                  <div className="space-y-2">
                    {client.billing.invoices.slice(0, 3).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                            <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{invoice.amount.toLocaleString('fr-FR')}€</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status === 'paid' ? 'Payée' :
                             invoice.status === 'sent' ? 'Envoyée' :
                             invoice.status === 'overdue' ? 'En retard' :
                             invoice.status === 'draft' ? 'Brouillon' : 'Annulée'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions de facturation */}
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={() => setIsCreateInvoiceModalOpen(true)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Créer une Facture
                  </button>
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Enregistrer un Paiement
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Objectifs</h3>
              <div className="space-y-2">
                {client.goals.map((goal, index) => (
                  <div key={index} className="flex items-start">
                    <Target className="w-3 h-3 text-blue-500 mr-2 mt-1" />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {contact.tags.map((tag, index) => (
              <span key={index} className="inline-flex px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Notes</h3>
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-700 leading-relaxed">
              {prospect ? 
                (prospect.notes || "Prospect intéressé par le coaching. Prévoir un suivi personnalisé.") :
                (client?.progress || "Client motivé, bons progrès observés.")
              }
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={() => {
              const email = contact.email;
              const subject = prospect ? `Suivi prospect - ${contact.name}` : `Suivi client - ${contact.name}`;
              window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}`, '_blank');
            }}
            className="flex-1 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contacter
          </button>
          <button 
            onClick={() => {
              const phone = contact.phone.replace(/\s/g, '');
              window.open(`tel:${phone}`, '_self');
            }}
            className="flex-1 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
          >
            <Phone className="w-4 h-4 mr-2" />
            Appeler
          </button>
        </div>
      </div>
        </>
      )}
      
      {client && (
        <CreateInvoiceModal
          isOpen={isCreateInvoiceModalOpen}
          onClose={() => setIsCreateInvoiceModalOpen(false)}
          client={client}
          onCreateInvoice={handleCreateInvoice}
        />
      )}
      
      {client && (
        <CreateSessionModal
          isOpen={isCreateSessionModalOpen}
          onClose={() => setIsCreateSessionModalOpen(false)}
          client={client}
          onCreateSession={onCreateSession}
        />
      )}
    </div>
  );
};

// Modal de création de séance
const CreateSessionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onCreateSession: (session: any) => void;
}> = ({ isOpen, onClose, client, onCreateSession }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '60',
    type: 'individual',
    objectives: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSession(formData);
    setFormData({
      date: '',
      time: '',
      duration: '60',
      type: 'individual',
      objectives: '',
      notes: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-2xl">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Séance</h2>
              <p className="text-sm text-gray-600">{client.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée (minutes)</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 heure</option>
                <option value="90">1h30</option>
                <option value="120">2 heures</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="individual">Individuelle</option>
                <option value="group">Groupe</option>
                <option value="discovery">Découverte</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Objectifs de la séance</label>
            <input
              type="text"
              name="objectives"
              value={formData.objectives}
              onChange={handleChange}
              placeholder="Objectif 1, Objectif 2, ..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Notes préparatoires pour la séance..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold"
            >
              Planifier la Séance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactDetail;