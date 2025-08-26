import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, User, Mail, Phone, Target, X, Calendar as CalendarIcon } from 'lucide-react';
import { Client } from '../types/Client';
import { User as UserType } from '../types/User';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  type: 'client_session' | 'prospect_meeting' | 'call' | 'deadline' | 'reminder';
  attendees?: string[];
  location?: string;
  description?: string;
  clientId?: number;
  prospectId?: number;
  assignedCoachId?: number;
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

interface CalendarPageProps {
  clients?: Client[];
  prospects?: Prospect[];
  staff?: UserType[];
  currentUser: UserType;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ clients = [], prospects = [], staff = [], currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [filterCoach, setFilterCoach] = useState<number | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Navigation functions for different views
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      if (direction === 'prev') {
        newDate.setMonth(currentDate.getMonth() - 1);
      } else {
        newDate.setMonth(currentDate.getMonth() + 1);
      }
    } else if (view === 'week') {
      if (direction === 'prev') {
        newDate.setDate(currentDate.getDate() - 7);
      } else {
        newDate.setDate(currentDate.getDate() + 7);
      }
    } else if (view === 'day') {
      if (direction === 'prev') {
        newDate.setDate(currentDate.getDate() - 1);
      } else {
        newDate.setDate(currentDate.getDate() + 1);
      }
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get date range title based on view
  const getDateRangeTitle = () => {
    if (view === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (view === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()}-${weekEnd.getDate()} ${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
      } else {
        return `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]} ${weekStart.getFullYear()}`;
      }
    } else {
      return currentDate.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  // Get week start (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const filteredEvents = events.filter(event => event.date === dateStr);
    
    if (filterCoach !== 'all') {
      return filteredEvents.filter(event => event.assignedCoachId === filterCoach);
    }
    
    if (currentUser.role !== 'ADMIN') {
      return filteredEvents.filter(event => event.assignedCoachId === currentUser.id);
    }
    
    return filteredEvents;
  };

  // Get week days for week view
  const getWeekDays = () => {
    const weekStart = getWeekStart(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
      days.push(day);
    }
    return days;
  };

  const [events, setEvents] = useState<Event[]>([
    // Séances clients
    {
      id: 1,
      title: 'Séance Coaching - Sophie Laurent',
      date: '2024-01-25',
      time: '14:00',
      duration: '1 heure',
      type: 'client_session',
      clientId: 1,
      assignedCoachId: currentUser.id,
      location: 'Bureau',
      description: 'Séance de suivi - Travail sur la confiance en réunion',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Séance Coaching - Thomas Rousseau',
      date: '2024-01-28',
      time: '10:00',
      duration: '1 heure',
      type: 'client_session',
      clientId: 2,
      assignedCoachId: currentUser.id,
      location: 'Visioconférence',
      description: 'Séance reconversion - Définir les prochaines étapes',
      status: 'scheduled'
    },
    // RDV prospects
    {
      id: 3,
      title: 'RDV Découverte - Marie Dubois',
      date: '2024-01-26',
      time: '16:00',
      duration: '45 minutes',
      type: 'prospect_meeting',
      prospectId: 1,
      assignedCoachId: currentUser.id,
      location: 'Café Central',
      description: 'Premier rendez-vous pour présenter l\'offre de coaching',
      status: 'scheduled'
    },
    {
      id: 4,
      title: 'Appel Suivi - Pierre Martin',
      date: '2024-01-24',
      time: '11:00',
      duration: '30 minutes',
      type: 'call',
      prospectId: 2,
      assignedCoachId: currentUser.id,
      description: 'Suivi de la proposition envoyée',
      status: 'scheduled'
    },
    // Événements passés
    {
      id: 5,
      title: 'Séance Coaching - Sophie Laurent',
      date: '2024-01-18',
      time: '14:00',
      duration: '1 heure',
      type: 'client_session',
      clientId: 1,
      assignedCoachId: currentUser.id,
      location: 'Bureau',
      description: 'Séance sur l\'assertivité - Excellents résultats',
      status: 'completed'
    },
  ]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'client_session': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'prospect_meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'call': return 'bg-green-100 text-green-800 border-green-200';
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'reminder': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'client_session': return 'Séance Client';
      case 'prospect_meeting': return 'RDV Prospect';
      case 'call': return 'Appel';
      case 'deadline': return 'Échéance';
      case 'reminder': return 'Rappel';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Planifié';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    navigateDate(direction);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return getEventsForDate(date);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  };

  const getContactInfo = (event: Event) => {
    if (event.clientId) {
      return clients.find(c => c.id === event.clientId);
    }
    if (event.prospectId) {
      return prospects.find(p => p.id === event.prospectId);
    }
    return null;
  };

  const getAssignedCoach = (event: Event) => {
    return staff.find(s => s.id === event.assignedCoachId);
  };

  const upcomingEvents = events
    .filter(event => {
      const isUpcoming = new Date(event.date) >= new Date() && event.status === 'scheduled';
      const matchesCoachFilter = filterCoach === 'all' || event.assignedCoachId === filterCoach;
      const hasPermission = currentUser.role === 'ADMIN' || event.assignedCoachId === currentUser.id;
      return isUpcoming && matchesCoachFilter && hasPermission;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
    setIsEventDetailOpen(false);
  };

  const handleSaveEvent = (updatedEvent: Event) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  const handleMarkCompleted = (event: Event) => {
    const updatedEvent = { ...event, status: 'completed' as const };
    setEvents(events.map(e => e.id === event.id ? updatedEvent : e));
    setSelectedEvent(updatedEvent);
  };

  const EventDetailModal = () => {
    if (!selectedEvent) return null;
    
    const contact = getContactInfo(selectedEvent);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-2xl">
            <div className="flex items-center">
              <CalendarIcon className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">{getEventTypeLabel(selectedEvent.type)}</p>
                  {getAssignedCoach(selectedEvent) && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Coach: {getAssignedCoach(selectedEvent)?.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEventDetailOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Informations de l'événement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails de l'Événement</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedEvent.date).toLocaleDateString('fr-FR')} à {selectedEvent.time}
                      </p>
                      <p className="text-xs text-gray-500">Durée: {selectedEvent.duration}</p>
                    </div>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-700">{selectedEvent.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getEventTypeColor(selectedEvent.type)}`}>
                      {getEventTypeLabel(selectedEvent.type)}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ml-2 ${getStatusColor(selectedEvent.status)}`}>
                      {getStatusLabel(selectedEvent.status)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Informations du contact */}
              {contact && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedEvent.clientId ? 'Informations Client' : 'Informations Prospect'}
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-sm font-bold text-white">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-base font-bold text-gray-900">{contact.name}</h4>
                        <p className="text-sm text-gray-600">
                          {'coachingProgram' in contact ? contact.coachingProgram : contact.source}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {contact.email}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {contact.phone}
                      </div>
                      
                      {selectedEvent.clientId && 'goals' in contact && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Objectifs</p>
                          <div className="flex flex-wrap gap-1">
                            {contact.goals.slice(0, 3).map((goal, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {goal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.prospectId && 'coachingGoals' in contact && contact.coachingGoals && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Objectifs</p>
                          <p className="text-xs text-gray-700">{contact.coachingGoals}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Description */}
            {selectedEvent.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700">{selectedEvent.description}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEventDetailOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Fermer
              </button>
              <button 
                onClick={() => handleEditEvent(selectedEvent)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Modifier
              </button>
              {selectedEvent.status === 'scheduled' && (
                <button 
                  onClick={() => handleMarkCompleted(selectedEvent)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Marquer comme Terminé
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EditEventModal = () => {
    if (!editingEvent) return null;

    const [formData, setFormData] = useState({
      title: editingEvent.title,
      date: editingEvent.date,
      time: editingEvent.time,
      duration: editingEvent.duration,
      location: editingEvent.location || '',
      description: editingEvent.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const updatedEvent = {
        ...editingEvent,
        ...formData,
      };
      handleSaveEvent(updatedEvent);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-2xl">
            <div className="flex items-center">
              <CalendarIcon className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Modifier l'Événement</h2>
                <p className="text-sm text-gray-600">{getEventTypeLabel(editingEvent.type)}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durée</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="1 heure"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Bureau, Visioconférence..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Notes sur l'événement..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Calendrier</h2>
            <p className="text-sm text-gray-500 mt-1">Gérez vos rendez-vous et séances</p>
          </div>
          {/* Toolbar vues calendrier */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div role="tablist" aria-label="Changer la vue calendrier" className="inline-flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                role="tab"
                aria-selected={view === 'month'}
                onClick={() => setView('month')}
                className={`px-3 py-1.5 text-sm \${view==='month' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >Mois</button>
              <button
                role="tab"
                aria-selected={view === 'week'}
                onClick={() => setView('week')}
                className={`px-3 py-1.5 text-sm border-l border-gray-300 \${view==='week' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >Semaine</button>
              <button
                role="tab"
                aria-selected={view === 'day'}
                onClick={() => setView('day')}
                className={`px-3 py-1.5 text-sm border-l border-gray-300 \${view==='day' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >Jour</button>
            </div>
          </div>

          <button 
            onClick={() => alert('Fonctionnalité de création d\'événement à venir')}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nouvel Événement</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 min-w-0 text-center">
                {getDateRangeTitle()}
              </h3>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                Aujourd'hui
              </button>
            </div>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            {/* Filtre par coach pour les admins */}
            {currentUser.role === 'ADMIN' && (
              <select
                value={filterCoach}
                onChange={(e) => setFilterCoach(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les coachs</option>
                {staff.filter(s => s.role === 'COACH' || s.role === 'ADMIN').map(coach => (
                  <option key={coach.id} value={coach.id}>{coach.name}</option>
                ))}
              </select>
            )}
            
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                disabled={view === viewType}
                className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 ${
                  view === viewType
                    ? 'bg-blue-600 text-white shadow-md cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {viewType === 'month' ? 'Mois' : viewType === 'week' ? 'Semaine' : 'Jour'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 p-4 sm:p-6 min-h-0 overflow-y-auto">
          {view === 'month' && (
            <div className="bg-white rounded-lg border border-gray-200 min-h-full">
              <div className="grid grid-cols-7 gap-0 border-b border-gray-200 overflow-x-auto">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                  <div key={day} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-500 border-r border-gray-200 last:border-r-0 min-w-0">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 1)}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0">
                {getDaysInMonth().map((day, index) => (
                  <div
                    key={index}
                    className="min-h-[100px] sm:min-h-[140px] p-1 sm:p-2 border-r border-b border-gray-200 last:border-r-0 relative"
                  >
                    {day && (
                      <>
                        <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1">{day}</div>
                        <div className="space-y-1">
                          {getEventsForDay(day).map((event) => (
                            <div
                              key={event.id}
                              onClick={() => handleEventClick(event)}
                              className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-all duration-200 ${getEventTypeColor(event.type)} truncate block`}
                              title={event.title}
                            >
                              <div className="font-medium text-[10px] sm:text-xs">{event.time}</div>
                              <div className="truncate text-[10px] sm:text-xs">{event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {view === 'week' && (
            <div className="bg-white rounded-lg border border-gray-200 min-h-full">
              <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((dayName, index) => {
                  const weekDays = getWeekDays();
                  const day = weekDays[index];
                  const isToday = day.toDateString() === new Date().toDateString();
                  
                  return (
                    <div key={dayName} className="p-3 text-center border-r border-gray-200 last:border-r-0">
                      <div className="text-xs font-medium text-gray-500 mb-1">{dayName}</div>
                      <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-7 gap-0 min-h-[500px]">
                {getWeekDays().map((day, index) => (
                  <div
                    key={index}
                    className="p-2 border-r border-b border-gray-200 last:border-r-0"
                  >
                    <div className="space-y-1">
                      {getEventsForDate(day).map((event) => (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={`text-xs p-2 rounded border cursor-pointer hover:shadow-sm transition-all duration-200 ${getEventTypeColor(event.type)}`}
                          title={event.title}
                        >
                          <div className="font-medium text-xs">{event.time}</div>
                          <div className="truncate text-xs">{event.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {view === 'day' && (
            <div className="bg-white rounded-lg border border-gray-200 min-h-full">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {getEventsForDate(currentDate).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Aucun événement aujourd'hui</p>
                      <p className="text-sm">Votre journée est libre</p>
                    </div>
                  ) : (
                    getEventsForDate(currentDate)
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((event) => {
                        const contact = getContactInfo(event);
                        return (
                          <div
                            key={event.id}
                            onClick={() => handleEventClick(event)}
                            className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 ${getEventTypeColor(event.type)}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span className="font-semibold">{event.time}</span>
                                  <span className="text-sm text-gray-600 ml-2">({event.duration})</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                                {contact && (
                                  <p className="text-sm text-gray-600 mb-2">{contact.name}</p>
                                )}
                                {event.location && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {event.location}
                                  </div>
                                )}
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                                {getStatusLabel(event.status)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 p-4 sm:p-6 min-h-0 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochains Événements</h3>
          
          {/* Filtre coach pour sidebar */}
          {currentUser.role === 'ADMIN' && (
            <div className="mb-4">
              <select
                value={filterCoach}
                onChange={(e) => setFilterCoach(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les coachs</option>
                {staff.filter(s => s.role === 'COACH' || s.role === 'ADMIN').map(coach => (
                  <option key={coach.id} value={coach.id}>{coach.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="space-y-4">
            {upcomingEvents.map((event) => {
              const contact = getContactInfo(event);
              const assignedCoach = getAssignedCoach(event);
              return (
                <div 
                  key={event.id} 
                  className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.type)}`}>
                      {getEventTypeLabel(event.type)}
                    </span>
                  </div>
                  {assignedCoach && (
                    <div className="text-xs text-blue-600 mb-2 font-medium">
                      Coach: {assignedCoach.name}
                    </div>
                  )}
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time} ({event.duration})
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    {contact && (
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span className="truncate">{contact.name}</span>
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Statistiques rapides */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Cette Semaine</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Séances clients</span>
                <span className="font-medium text-blue-600">
                  {events.filter(e => {
                    const isClientSession = e.type === 'client_session' && e.status === 'scheduled';
                    const matchesFilter = filterCoach === 'all' || e.assignedCoachId === filterCoach;
                    const hasPermission = currentUser.role === 'ADMIN' || e.assignedCoachId === currentUser.id;
                    return isClientSession && matchesFilter && hasPermission;
                  }).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">RDV prospects</span>
                <span className="font-medium text-purple-600">
                  {events.filter(e => {
                    const isProspectMeeting = e.type === 'prospect_meeting' && e.status === 'scheduled';
                    const matchesFilter = filterCoach === 'all' || e.assignedCoachId === filterCoach;
                    const hasPermission = currentUser.role === 'ADMIN' || e.assignedCoachId === currentUser.id;
                    return isProspectMeeting && matchesFilter && hasPermission;
                  }).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Appels</span>
                <span className="font-medium text-green-600">
                  {events.filter(e => {
                    const isCall = e.type === 'call' && e.status === 'scheduled';
                    const matchesFilter = filterCoach === 'all' || e.assignedCoachId === filterCoach;
                    const hasPermission = currentUser.role === 'ADMIN' || e.assignedCoachId === currentUser.id;
                    return isCall && matchesFilter && hasPermission;
                  }).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isEventDetailOpen && <EventDetailModal />}
      {isEditModalOpen && <EditEventModal />}
    </div>
  );
};

export default CalendarPage;