import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Mail, Phone, Calendar, Clock, User, Target, Building, TrendingUp, CheckCircle, XCircle, MessageSquare, FileText, Eye, Edit2, Trash2, Star, MoreHorizontal, Users } from 'lucide-react';
import { Client } from '../types/Client';
import { User as UserType } from '../types/User';
import AddProspectModal from './AddProspectModal';
import KpiBanner from './KpiBanner';

interface Prospect {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'lead' | 'contacted' | 'meeting_scheduled' | 'proposal_sent' | 'negotiation' | 'clients' | 'closed_lost';
  tags: string[];
  lastContact: string;
  starred: boolean;
  coachingGoals?: string;
  budget?: string;
  timeline?: string;
  notes?: string;
  assignedCoachId?: number;
}

interface PipelinePageProps {
  prospects?: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  selectedProspectId: number | null;
  onAddProspect: (prospect: Prospect) => void;
  currentUser: UserType;
  staff: UserType[];
}

const PipelinePage: React.FC<PipelinePageProps> = ({
  prospects = [],
  onSelectProspect,
  selectedProspectId,
  onAddProspect,
  currentUser,
  staff = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCoach, setFilterCoach] = useState<number | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const statusLabels = {
    lead: 'Nouveau Lead',
    contacted: 'Contacté',
    meeting_scheduled: 'RDV Planifié',
    proposal_sent: 'Proposition Envoyée',
    negotiation: 'Négociation',
    clients: 'Client Signé',
    closed_lost: 'Perdu'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting_scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'proposal_sent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'negotiation': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'clients': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed_lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'lead': return <User className="w-4 h-4" />;
      case 'contacted': return <Phone className="w-4 h-4" />;
      case 'meeting_scheduled': return <Calendar className="w-4 h-4" />;
      case 'proposal_sent': return <FileText className="w-4 h-4" />;
      case 'negotiation': return <MessageSquare className="w-4 h-4" />;
      case 'clients': return <CheckCircle className="w-4 h-4" />;
      case 'closed_lost': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || prospect.status === filterStatus;
    const matchesCoach = filterCoach === 'all' || prospect.assignedCoachId === filterCoach;
    
    // Si l'utilisateur n'est pas admin, ne montrer que ses prospects
    const hasPermission = currentUser.role === 'ADMIN' || prospect.assignedCoachId === currentUser.id;
    
    return matchesSearch && matchesStatus && matchesCoach && hasPermission;
  });

  const getAssignedCoach = (prospect: Prospect) => {
    return staff.find(s => s.id === prospect.assignedCoachId);
  };

  // Organiser les prospects par statut pour la vue Kanban
  const prospectsByStatus = {
    lead: filteredProspects.filter(p => p.status === 'lead'),
    contacted: filteredProspects.filter(p => p.status === 'contacted'),
    meeting_scheduled: filteredProspects.filter(p => p.status === 'meeting_scheduled'),
    proposal_sent: filteredProspects.filter(p => p.status === 'proposal_sent'),
    negotiation: filteredProspects.filter(p => p.status === 'negotiation'),
    clients: filteredProspects.filter(p => p.status === 'clients'),
    closed_lost: filteredProspects.filter(p => p.status === 'closed_lost')
  };

  // Stats
  const totalProspects = prospects.length;
  const activeProspects = prospects.filter(p => !['clients', 'closed_lost'].includes(p.status)).length;
  const hotProspects = prospects.filter(p => ['negotiation', 'proposal_sent'].includes(p.status)).length;
  const newThisWeek = prospects.filter(p => p.status === 'lead').length;

  // Calculate KPI data based on user role
  const getKpiData = () => {
    const scopedProspects = currentUser.role === 'ADMIN' 
      ? prospects 
      : prospects.filter(p => p.assignedCoachId === currentUser.id);
    
    const totalCount = scopedProspects.length;
    const activeCount = scopedProspects.filter(p => !['clients', 'closed_lost'].includes(p.status)).length;
    const hotCount = scopedProspects.filter(p => ['negotiation', 'proposal_sent'].includes(p.status)).length;
    const newCount = scopedProspects.filter(p => p.status === 'lead').length;
    
    return [
      {
        label: currentUser.role === 'ADMIN' ? 'Total Prospects' : 'Mes Prospects',
        value: totalCount,
        icon: TrendingUp,
        color: 'blue' as const,
        tooltip: 'Nombre total de prospects'
      },
      {
        label: 'Actifs',
        value: activeCount,
        icon: Target,
        color: 'green' as const,
        tooltip: 'Prospects en cours de traitement'
      },
      {
        label: 'Prospects Chauds',
        value: hotCount,
        icon: MessageSquare,
        color: 'orange' as const,
        tooltip: 'Prospects en négociation ou avec proposition envoyée'
      },
      {
        label: 'Nouveaux',
        value: newCount,
        icon: Plus,
        color: 'purple' as const,
        tooltip: 'Nouveaux leads à traiter'
      }
    ];
  };

  const ProspectCard: React.FC<{ prospect: Prospect }> = ({ prospect }) => {
    const assignedCoach = getAssignedCoach(prospect);
    
    return (
      <div
        onClick={() => onSelectProspect(prospect)}
        className={`p-4 bg-white rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
          selectedProspectId === prospect.id
            ? 'border-blue-500 shadow-md'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">
                {prospect.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-gray-900">{prospect.name}</h3>
              <p className="text-xs text-gray-600">{prospect.source}</p>
            </div>
          </div>
          {prospect.starred && (
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
          )}
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-xs text-gray-600">
            <Mail className="w-3 h-3 mr-2" />
            <span className="truncate">{prospect.email}</span>
          </div>
          {prospect.phone && (
            <div className="flex items-center text-xs text-gray-600">
              <Phone className="w-3 h-3 mr-2" />
              {prospect.phone}
            </div>
          )}
          {assignedCoach && (
            <div className="flex items-center text-xs text-blue-600">
              <User className="w-3 h-3 mr-2" />
              Coach: {assignedCoach.name}
            </div>
          )}
        </div>

        {prospect.coachingGoals && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Objectifs:</p>
            <p className="text-xs text-gray-700 line-clamp-2">{prospect.coachingGoals}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          {prospect.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {tag}
            </span>
          ))}
          {prospect.tags.length > 2 && (
            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              +{prospect.tags.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Dernier contact: {prospect.lastContact}</span>
          {prospect.budget && (
            <span className="font-medium text-green-600">{prospect.budget}</span>
          )}
        </div>
      </div>
    );
  };

  const KanbanColumn: React.FC<{ 
    status: keyof typeof prospectsByStatus; 
    title: string; 
    prospects: Prospect[];
    color: string;
  }> = ({ status, title, prospects, color }) => (
    <div className="flex-1 min-w-[280px]">
      <div className={`p-4 rounded-t-lg ${color} border-b-2`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="bg-white bg-opacity-80 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
            {prospects.length}
          </span>
        </div>
      </div>
      <div className="bg-gray-50 p-4 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
        {prospects.map(prospect => (
          <ProspectCard key={prospect.id} prospect={prospect} />
        ))}
        {prospects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              {getStatusIcon(status)}
            </div>
            <p className="text-sm">Aucun prospect</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Pipeline Commercial</h2>
            <p className="text-sm text-gray-500 mt-1">Gérez vos prospects et opportunités</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Prospect
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un prospect..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="lead">Nouveaux Leads</option>
              <option value="contacted">Contactés</option>
              <option value="meeting_scheduled">RDV Planifiés</option>
              <option value="proposal_sent">Propositions Envoyées</option>
              <option value="negotiation">Négociations</option>
              <option value="clients">Clients Signés</option>
              <option value="closed_lost">Perdus</option>
            </select>
            
            {currentUser.role === 'ADMIN' && (
              <select
                value={filterCoach}
                onChange={(e) => setFilterCoach(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les coachs</option>
                {staff.filter(s => s.role === 'COACH' || s.role === 'ADMIN').map(coach => (
                  <option key={coach.id} value={coach.id}>{coach.name}</option>
                ))}
              </select>
            )}
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2.5 text-sm font-medium transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2.5 text-sm font-medium transition-colors border-l border-gray-300 ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Liste
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Banner */}
      <KpiBanner
        items={getKpiData()}
        role={currentUser.role}
        dense={false}
      />

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {filteredProspects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun prospect trouvé</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              {searchTerm || filterStatus !== 'all' || filterCoach !== 'all' 
                ? "Aucun prospect ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                : "Commencez par ajouter votre premier prospect pour développer votre pipeline commercial."
              }
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5 mr-2 inline" />
              Ajouter le premier prospect
            </button>
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="p-6">
            <div className="flex gap-6 overflow-x-auto pb-4">
              <KanbanColumn
                status="lead"
                title="Nouveaux Leads"
                prospects={prospectsByStatus.lead}
                color="bg-gray-100"
              />
              <KanbanColumn
                status="contacted"
                title="Contactés"
                prospects={prospectsByStatus.contacted}
                color="bg-blue-100"
              />
              <KanbanColumn
                status="meeting_scheduled"
                title="RDV Planifiés"
                prospects={prospectsByStatus.meeting_scheduled}
                color="bg-purple-100"
              />
              <KanbanColumn
                status="proposal_sent"
                title="Propositions"
                prospects={prospectsByStatus.proposal_sent}
                color="bg-yellow-100"
              />
              <KanbanColumn
                status="negotiation"
                title="Négociations"
                prospects={prospectsByStatus.negotiation}
                color="bg-orange-100"
              />
              <KanbanColumn
                status="clients"
                title="Clients Signés"
                prospects={prospectsByStatus.clients}
                color="bg-green-100"
              />
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {filteredProspects.map(prospect => (
                <ProspectCard key={prospect.id} prospect={prospect} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Prospect Modal */}
      <AddProspectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProspect={onAddProspect}
      />
    </div>
  );
};

export default PipelinePage;