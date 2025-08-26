import React, { useState } from 'react';
import { Search, Plus, Mail, Phone, Star, User as UserIcon, Calendar, Target, Grid, List, LayoutGrid, Users, TrendingUp, DollarSign } from 'lucide-react';
import AddClientModal from './AddClientModal';
import { Client } from '../types/Client';
import { User } from '../types/User';
import KpiBanner from './KpiBanner';
interface ClientListProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  selectedClientId: number | null;
  onAddClient: (client: Client) => void;
  staff?: User[];
  currentUser: User;
  sessions?: any[];
}

export function ClientList({ clients, onSelectClient, selectedClientId, onAddClient, staff = [], currentUser, sessions = [] }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');
  const [coachFilter, setCoachFilter] = useState<number | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'grid'>('cards');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Tous' || client.status === statusFilter;
    const matchesCoach = coachFilter === 'all' || client.assignedCoachId === coachFilter;
    
    // Si l'utilisateur n'est pas admin, ne montrer que ses clients
    const hasPermission = currentUser.role === 'ADMIN' || client.assignedCoachId === currentUser.id;
    
    return matchesSearch && matchesStatus && matchesCoach && hasPermission;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const handleAddClient = (clientData: Omit<Client, 'id'>) => {
    onAddClient(clientData);
    setShowAddModal(false);
  };

  const getAssignedCoach = (client: Client) => {
    return staff.find(s => s.id === client.assignedCoachId);
  };

  // Calculate KPI data with exact presets based on user role
  const getKpiData = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(today.getTime() - 59 * 24 * 60 * 60 * 1000);
    const thirtyOneDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get current ISO week (Monday to Sunday)
    const getISOWeekStart = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      return new Date(d.setDate(diff));
    };
    
    const weekStart = getISOWeekStart(today);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    if (currentUser.role === 'ADMIN') {
      // Admin scope: global data
      const activeClients = clients.filter(c => c.status === 'active').length;
      
      // New clients last 30 days
      const newClientsLast30 = clients.filter(c => {
        const startDate = new Date(c.startDate);
        return startDate >= thirtyDaysAgo && startDate <= today;
      }).length;
      
      // New clients previous 30 days (for delta calculation)
      const newClientsPrevious30 = clients.filter(c => {
        const startDate = new Date(c.startDate);
        return startDate >= sixtyDaysAgo && startDate <= thirtyOneDaysAgo;
      }).length;
      
      // Calculate delta
      const deltaValue = newClientsPrevious30 > 0 
        ? Math.round(((newClientsLast30 - newClientsPrevious30) / newClientsPrevious30) * 100)
        : newClientsLast30 > 0 ? 100 : 0;
      
      // My sessions this week (even for admin)
      const mySessionsThisWeek = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= weekStart && sessionDate <= weekEnd && 
               s.assignedCoachId === currentUser.id;
      }).length;
      
      // Total completed sessions (global)
      const totalCompletedSessions = sessions.filter(s => s.status === 'completed').length;
      
      return [
        {
          label: 'Clients actifs',
          value: activeClients,
          icon: Users,
          color: 'blue' as const,
          tooltip: 'Nombre global de clients avec statut Actif'
        },
        {
          label: 'Nouv. clients 30j',
          value: newClientsLast30,
          icon: TrendingUp,
          color: 'green' as const,
          delta: {
            value: deltaValue,
            type: deltaValue > 0 ? 'positive' as const : deltaValue < 0 ? 'negative' as const : 'neutral' as const,
            label: 'vs 30j-1'
          },
          tooltip: 'Clients créés sur les 30 derniers jours'
        },
        {
          label: 'Mes séances cette semaine',
          value: mySessionsThisWeek,
          icon: Calendar,
          color: 'purple' as const,
          tooltip: 'Séances assignées à l\'utilisateur courant cette semaine'
        },
        {
          label: 'Séances réalisées',
          value: totalCompletedSessions,
          icon: Target,
          color: 'orange' as const,
          tooltip: 'Nombre global de séances au statut réalisée'
        }
      ];
    } else {
      // Coach scope: personal data only
      const myClients = clients.filter(c => c.assignedCoachId === currentUser.id);
      const myActiveClients = myClients.filter(c => c.status === 'active').length;
      
      // My new clients last 30 days
      const myNewClientsLast30 = myClients.filter(c => {
        const startDate = new Date(c.startDate);
        return startDate >= thirtyDaysAgo && startDate <= today;
      }).length;
      
      // My sessions this week
      const mySessionsThisWeek = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= weekStart && sessionDate <= weekEnd && 
               s.assignedCoachId === currentUser.id;
      }).length;
      
      // My total completed sessions
      const myCompletedSessions = sessions.filter(s => 
        s.status === 'completed' && s.assignedCoachId === currentUser.id
      ).length;
      
      return [
        {
          label: 'Mes clients actifs',
          value: myActiveClients,
          icon: Users,
          color: 'blue' as const,
          tooltip: 'Clients Actifs assignés au coach courant'
        },
        {
          label: 'Nouv. clients 30j',
          value: myNewClientsLast30,
          icon: TrendingUp,
          color: 'green' as const,
          tooltip: 'Clients créés ces 30 derniers jours assignés au coach courant'
        },
        {
          label: 'Mes séances cette semaine',
          value: mySessionsThisWeek,
          icon: Calendar,
          color: 'purple' as const,
          tooltip: 'Séances du coach courant sur la semaine ISO en cours'
        },
        {
          label: 'Séances réalisées',
          value: myCompletedSessions,
          icon: Target,
          color: 'orange' as const,
          tooltip: 'Total des séances réalisées par ce coach'
        }
      ];
    }
  };

  return (
    <div className="flex flex-col bg-white min-h-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Clients Actifs</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau Client</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="paused">En pause</option>
              <option value="completed">Terminé</option>
            </select>
            
            {currentUser.role === 'ADMIN' && (
              <select
                value={coachFilter}
                onChange={(e) => setCoachFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">Tous les coachs</option>
                {staff.filter(s => s.role === 'COACH' || s.role === 'ADMIN').map(coach => (
                  <option key={coach.id} value={coach.id}>{coach.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* KPI Banner */}
      <KpiBanner
        items={getKpiData()}
        role={currentUser.role}
        dense={false}
      />

      {/* Client List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <UserIcon className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">Aucun client trouvé</p>
            <p className="text-sm">Commencez par ajouter votre premier client</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredClients.map((client) => {
              const progressPercentage = getProgressPercentage(client.sessionsCompleted, client.totalSessions);
              const assignedCoach = getAssignedCoach(client);
              
              return (
                <div
                  key={client.id}
                  onClick={() => onSelectClient(client)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedClientId === client.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                          {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{client.name}</h3>
                          <p className="text-sm text-gray-600">{client.coachingProgram}</p>
                          {assignedCoach && (
                            <p className="text-xs text-blue-600 font-medium">Coach: {assignedCoach.name}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {client.phone}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progression</span>
                          <span className="font-medium">{client.sessionsCompleted}/{client.totalSessions} séances</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{progressPercentage}% complété</div>
                      </div>

                      {/* Objectives */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Target className="w-4 h-4" />
                          Objectifs principaux
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(client.goals ?? []).slice(0, 2).map((objective, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {objective}
                            </span>
                          ))}
                          {(client.goals ?? []).length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{(client.goals ?? []).length - 2} autres
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Next Session */}
                      {client.nextSession && (
                        <div className="flex items-start sm:items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="break-words">Prochaine séance : {new Date(client.nextSession).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-bold text-gray-900">{client.value.toLocaleString('fr-FR')}€</div>
                      <div className="text-xs text-gray-500">CA généré</div>
                      {client.billing && client.billing.totalDue > 0 && (
                        <div className="text-sm font-medium text-orange-600 mt-1">
                          {client.billing.totalDue.toLocaleString('fr-FR')}€ dû
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="paused">En pause</option>
              <option value="completed">Terminé</option>
            </select>
            
            {/* View Mode Selector */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden w-fit">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2 sm:px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 sm:px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                  viewMode === 'list' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 sm:px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddClientModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddClient={handleAddClient}
          staff={staff}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}