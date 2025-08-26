import React, { useMemo } from 'react';
import KpiBanner from './KpiBanner';
import { Users, TrendingUp, Calendar, DollarSign, Target, Clock, Award, AlertCircle, ArrowUp, ArrowDown, BarChart3, PieChart, Activity } from 'lucide-react';
import { Client } from '../types/Client';

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
  assignedCoachId?: number;
}

interface DashboardPageProps {
  clients: Client[];
  prospects: Prospect[];
  sessions: any[];
  staff: User[];
  currentUser: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ clients, prospects, sessions, staff, currentUser }) => {

  const adminKpis = useMemo(() => [
    { label: 'Clients actifs (total)', value: clients.filter(c=>c.status==='active').length, icon: Users, color: 'blue' as const },
    { label: 'Nouv. clients 30j (delta vs 30j-1)', value: (() => {
        const today = new Date();
        const winStart = new Date(today.getTime() - 29 * 864e5);
        const prevStart = new Date(today.getTime() - 59 * 864e5);
        const prevEnd = new Date(today.getTime() - 30 * 864e5);
        const curr = clients.filter(c => {
          const d = new Date(c.startDate);
          return d >= winStart && d <= today;
        }).length;
        const prev = clients.filter(c => {
          const d = new Date(c.startDate);
          return d >= prevStart && d <= prevEnd;
        }).length;
        return curr;
      })(), icon: TrendingUp, color: 'green' as const, delta: (() => {
        const today = new Date();
        const winStart = new Date(today.getTime() - 29 * 864e5);
        const prevStart = new Date(today.getTime() - 59 * 864e5);
        const prevEnd = new Date(today.getTime() - 30 * 864e5);
        const curr = clients.filter(c => {
          const d = new Date(c.startDate);
          return d >= winStart && d <= today;
        }).length;
        const prev = clients.filter(c => {
          const d = new Date(c.startDate);
          return d >= prevStart && d <= prevEnd;
        }).length;
        const deltaValue = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : (curr > 0 ? 100 : 0);
        return {
          value: deltaValue,
          type: deltaValue > 0 ? 'positive' as const : deltaValue < 0 ? 'negative' as const : 'neutral' as const,
          label: '%'
        };
      })() },
    { label: 'Mes séances cette semaine', value: sessions.filter(s=>{
        const d=new Date(s.date); const day=d.getDay(); const monday = new Date(d); monday.setDate(d.getDate()-day+(day===0?-6:1));
        const today=new Date(); const wstart=new Date(today); const td=today.getDay(); wstart.setDate(today.getDate()-td+(td===0?-6:1));
        const wend=new Date(wstart.getTime()+6*864e5);
        return d>=wstart && d<=wend && s.assignedCoachId===currentUser.id;
      }).length, icon: Calendar, color: 'purple' as const },
    { label: 'Séances réalisées (total)', value: sessions.filter(s=>s.status==='completed').length, icon: Target, color: 'orange' as const },
  ], [clients, sessions, currentUser.id]);

  const coachKpis = useMemo(() => [
    { label: 'Mes clients actifs', value: clients.filter(c=>c.status==='active' && c.assignedCoachId===currentUser.id).length, icon: Users, color: 'blue' as const },
    { label: 'Nouv. clients 30j (moi)', value: (() => {
        const today = new Date();
        const winStart = new Date(today.getTime() - 29 * 864e5);
        return clients.filter(c => c.assignedCoachId === currentUser.id && new Date(c.startDate) >= winStart && new Date(c.startDate) <= today).length;
      })(), icon: TrendingUp, color: 'green' as const, delta: (() => {
        const today = new Date();
        const winStart = new Date(today.getTime() - 29 * 864e5);
        const prevStart = new Date(today.getTime() - 59 * 864e5);
        const prevEnd = new Date(today.getTime() - 30 * 864e5);
        const curr = clients.filter(c => c.assignedCoachId === currentUser.id && new Date(c.startDate) >= winStart && new Date(c.startDate) <= today).length;
        const prev = clients.filter(c => c.assignedCoachId === currentUser.id && new Date(c.startDate) >= prevStart && new Date(c.startDate) <= prevEnd).length;
        const deltaValue = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : (curr > 0 ? 100 : 0);
        return {
          value: deltaValue,
          type: deltaValue > 0 ? 'positive' as const : deltaValue < 0 ? 'negative' as const : 'neutral' as const,
          label: '%'
        };
      })() },
    { label: 'Mes séances cette semaine', value: sessions.filter(s=>{
        const today=new Date(); const td=today.getDay(); const wstart=new Date(today); wstart.setDate(today.getDate()-td+(td===0?-6:1));
        const wend=new Date(wstart.getTime()+6*864e5);
        const d=new Date(s.date);
        return d>=wstart && d<=wend && s.assignedCoachId===currentUser.id;
      }).length, icon: Calendar, color: 'purple' as const },
    { label: 'Séances réalisées (total)', value: sessions.filter(s=>s.status==='completed' && s.assignedCoachId===currentUser.id).length, icon: Target, color: 'orange' as const },
  ], [clients, sessions, currentUser.id]);

  const kpiItems = currentUser.role === 'ADMIN' ? adminKpis : coachKpis;

  // Calculs des KPI
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.billing.totalPaid, 0);
  const pendingRevenue = clients.reduce((sum, c) => sum + c.billing.totalDue, 0);
  
  const totalProspects = prospects.length;
  const hotProspects = prospects.filter(p => p.status === 'negotiation' || p.status === 'proposal_sent').length;
  
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  }).length;
  
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  
  const activeCoaches = staff.filter(s => s.role === 'coach' && s.isActive).length;

  // Données pour les graphiques (simulées)
  const monthlyRevenue = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Fév', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Avr', revenue: 16000 },
    { month: 'Mai', revenue: 22000 },
    { month: 'Juin', revenue: 25000 },
  ];

  const pipelineData = [
    { stage: 'Nouveau', count: prospects.filter(p => p.status === 'lead').length },
    { stage: '1er contact', count: prospects.filter(p => p.status === 'contacted').length },
    { stage: 'Découverte', count: prospects.filter(p => p.status === 'meeting_scheduled').length },
    { stage: 'Devis', count: prospects.filter(p => p.status === 'proposal_sent').length },
    { stage: 'Négociation', count: prospects.filter(p => p.status === 'negotiation').length },
  ];

  const recentActivities = [
    { id: 1, type: 'client', message: 'Nouveau client ajouté: Sophie Laurent', time: '2h', icon: Users },
    { id: 2, type: 'session', message: 'Séance terminée avec Thomas Rousseau', time: '4h', icon: Target },
    { id: 3, type: 'invoice', message: 'Facture INV-2024-001 payée', time: '6h', icon: DollarSign },
    { id: 4, type: 'prospect', message: 'Nouveau lead: Marie Dubois', time: '1j', icon: TrendingUp },
  ];

  return (
    <div className="bg-gray-50 min-h-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Vue d'ensemble de votre activité coaching</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Clients Actifs</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{activeClients}</p>
                <p className="text-xs text-gray-500">sur {totalClients} total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">CA Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString('fr-FR')}€</p>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +12% ce mois
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Prospects Chauds</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{hotProspects}</p>
                <p className="text-xs text-gray-500">sur {totalProspects} total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Séances Aujourd'hui</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{todaySessions}</p>
                <p className="text-xs text-gray-500">{completedSessions} terminées</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Évolution du CA</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {monthlyRevenue.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.revenue / 25000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                      {item.revenue.toLocaleString('fr-FR')}€
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Pipeline Commercial</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {pipelineData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.stage}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${Math.max((item.count / Math.max(...pipelineData.map(d => d.count))) * 100, 10)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Activité Récente</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">Il y a {activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Équipe</h3>
              <Award className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Coachs Actifs</span>
                <span className="text-lg font-bold text-gray-900">{activeCoaches}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Équipe</span>
                <span className="text-lg font-bold text-gray-900">{staff.length}</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  {staff.filter(s => s.role === 'coach').slice(0, 3).map((coach) => (
                    <div key={coach.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {coach.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{coach.name}</p>
                        <p className="text-xs text-gray-500">
                          {clients.filter(c => c.assignedCoachId === coach.id).length} clients
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Alertes & Actions</h3>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-800">Factures en retard</span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                {clients.reduce((sum, c) => sum + c.billing.invoices.filter(i => i.status === 'overdue').length, 0)} factures à relancer
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Séances à venir</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                {sessions.filter(s => s.status === 'scheduled').length} séances planifiées cette semaine
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Prospects chauds</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                {hotProspects} prospects prêts à signer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;