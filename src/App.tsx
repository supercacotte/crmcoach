import React, { useState, useEffect } from 'react';
import { Menu, LogOut, User as UserIcon, Bell, Search } from 'lucide-react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import Sidebar from './components/Sidebar';
import ActivityFeed from './components/ActivityFeed';
import { ClientList } from './components/ClientList';
import ContactDetail from './components/ContactDetail';
import PipelinePage from './components/PipelinePage';
import SessionsPage from './components/SessionsPage';
import BillingPage from './components/BillingPage';
import StaffManagementPage from './components/StaffManagementPage';
import CalendarPage from './components/CalendarPage';
import SettingsPage from './components/SettingsPage';
import AdminGuard from './components/guards/AdminGuard';
import NotFoundPage from './components/NotFoundPage';
import { User, DEFAULT_PERMISSIONS } from './types/User';
import { Client } from './types/Client';

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

interface Session {
  id: number;
  clientId: number;
  date: string;
  type: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  description?: string;
  assignedCoachId?: number;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState('/admin/dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  // Sample data
  const [staff, setStaff] = useState<User[]>([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@coachcrm.com',
      phone: '+33 6 12 34 56 78',
      role: 'ADMIN',
      specialties: ['Leadership', 'Management'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      permissions: DEFAULT_PERMISSIONS.ADMIN
    },
    {
      id: 2,
      name: 'Coach Martin',
      email: 'martin@coachcrm.com',
      phone: '+33 6 23 45 67 89',
      role: 'COACH',
      specialties: ['Confiance en soi', 'Communication'],
      isActive: true,
      createdAt: '2024-01-15T00:00:00Z',
      permissions: DEFAULT_PERMISSIONS.COACH
    }
  ]);

  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      name: 'Sophie Laurent',
      email: 'sophie.laurent@example.com',
      phone: '+33 6 12 34 56 78',
      company: 'TechCorp',
      status: 'active',
      tags: ['VIP', 'Leadership'],
      lastContact: 'Il y a 2 jours',
      starred: true,
      coachingProgram: 'Leadership & Confiance - 12 séances',
      startDate: '2024-01-01',
      sessionsCompleted: 8,
      totalSessions: 12,
      nextSession: '2024-01-25T14:00:00',
      goals: ['Leadership', 'Confiance en réunion', 'Communication'],
      progress: 'Excellents progrès, très motivée',
      value: 1800,
      assignedCoachId: 1,
      billing: {
        hourlyRate: 150,
        packagePrice: 1800,
        paymentMethod: 'package',
        invoices: [
          {
            id: 1,
            clientId: 1,
            invoiceNumber: 'INV-2024-001',
            date: '2024-01-01',
            dueDate: '2024-01-31',
            amount: 1800,
            status: 'paid',
            items: [
              {
                id: 1,
                description: 'Forfait Leadership & Confiance - 12 séances',
                quantity: 1,
                unitPrice: 1800,
                total: 1800
              }
            ]
          }
        ],
        totalPaid: 1800,
        totalDue: 0
      }
    },
    {
      id: 2,
      name: 'Thomas Rousseau',
      email: 'thomas.rousseau@example.com',
      phone: '+33 6 23 45 67 89',
      company: 'StartupXYZ',
      status: 'active',
      tags: ['Reconversion'],
      lastContact: 'Il y a 1 semaine',
      starred: false,
      coachingProgram: 'Reconversion Professionnelle - 8 séances',
      startDate: '2024-01-15',
      sessionsCompleted: 3,
      totalSessions: 8,
      nextSession: '2024-01-28T10:00:00',
      goals: ['Reconversion', 'Clarification projet', 'Confiance'],
      progress: 'Projet se précise, motivation en hausse',
      value: 1200,
      assignedCoachId: 2,
      billing: {
        hourlyRate: 150,
        packagePrice: 1200,
        paymentMethod: 'package',
        invoices: [
          {
            id: 2,
            clientId: 2,
            invoiceNumber: 'INV-2024-002',
            date: '2024-01-15',
            dueDate: '2024-02-15',
            amount: 1200,
            status: 'sent',
            items: [
              {
                id: 1,
                description: 'Forfait Reconversion - 8 séances',
                quantity: 1,
                unitPrice: 1200,
                total: 1200
              }
            ]
          }
        ],
        totalPaid: 0,
        totalDue: 1200
      }
    }
  ]);

  const [prospects, setProspects] = useState<Prospect[]>([
    {
      id: 1,
      name: 'Marie Dubois',
      email: 'marie.dubois@example.com',
      phone: '+33 6 34 56 78 90',
      source: 'Site web',
      status: 'meeting_scheduled',
      tags: ['Stress', 'Management'],
      lastContact: 'Il y a 3 jours',
      starred: false,
      coachingGoals: 'Gestion du stress et amélioration du leadership',
      budget: '150-200€/mois',
      timeline: '6 mois',
      notes: 'Très motivée, manager dans une grande entreprise',
      assignedCoachId: 1
    },
    {
      id: 2,
      name: 'Pierre Martin',
      email: 'pierre.martin@example.com',
      phone: '+33 6 45 67 89 01',
      source: 'Recommandation',
      status: 'negotiation',
      tags: ['Carrière', 'Confiance'],
      lastContact: 'Il y a 1 jour',
      starred: true,
      coachingGoals: 'Évolution de carrière et développement personnel',
      budget: '200-300€/mois',
      timeline: '1 an',
      notes: 'Prospect chaud, prêt à signer',
      assignedCoachId: 2
    }
  ]);

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 1,
      clientId: 1,
      date: '2024-01-25',
      type: 'individual',
      duration: 60,
      status: 'scheduled',
      description: 'Séance sur la confiance en réunion',
      assignedCoachId: 1
    },
    {
      id: 2,
      clientId: 2,
      date: '2024-01-28',
      type: 'individual',
      duration: 60,
      status: 'scheduled',
      description: 'Travail sur la reconversion',
      assignedCoachId: 2
    },
    {
      id: 3,
      clientId: 1,
      date: '2024-01-18',
      type: 'individual',
      duration: 60,
      status: 'completed',
      description: 'Séance sur l\'assertivité',
      assignedCoachId: 1
    }
  ]);

  // Apply theme and density to body
  useEffect(() => {
    const body = document.body;
    
    // Theme
    if (theme === 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
    
    // Density
    if (density === 'compact') {
      body.classList.add('compact', 'density-compact');
    } else {
      body.classList.remove('compact', 'density-compact');
    }
  }, [theme, density]);

  const handleLogin = (role: 'ADMIN' | 'COACH') => {
    const user = staff.find(u => u.role === role) || staff[0];
    setCurrentUser(user);
    setActiveSection(role === 'ADMIN' ? '/admin/dashboard' : '/coach/pipeline');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveSection('/admin/dashboard');
    setSelectedClient(null);
    setSelectedProspect(null);
  };

  const handleAddClient = (newClient: Client) => {
    setClients([...clients, newClient]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleAddProspect = (newProspect: Prospect) => {
    setProspects([...prospects, newProspect]);
  };

  const handleAddStaff = (newUser: User) => {
    setStaff([...staff, newUser]);
  };

  const handleUpdateStaff = (updatedUser: User) => {
    setStaff(staff.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteStaff = (userId: number) => {
    setStaff(staff.filter(u => u.id !== userId));
  };

  const handleCreateSession = (sessionData: any) => {
    const newSession: Session = {
      id: Date.now(),
      clientId: selectedClient?.id || 0,
      date: `${sessionData.date}T${sessionData.time}:00`,
      type: sessionData.type,
      duration: parseInt(sessionData.duration),
      status: 'scheduled',
      description: sessionData.objectives,
      assignedCoachId: currentUser?.id
    };
    setSessions([...sessions, newSession]);
  };

  const renderMainContent = () => {
    if (!currentUser) return null;

    switch (activeSection) {
      case '/admin/dashboard':
        return (
          <AdminGuard currentUser={currentUser}>
            <DashboardPage 
              clients={clients}
              prospects={prospects}
              sessions={sessions}
              staff={staff}
              currentUser={currentUser}
            />
          </AdminGuard>
        );
      
      case '/admin/pipeline':
      case '/coach/pipeline':
        return (
          <PipelinePage
            prospects={prospects}
            onSelectProspect={setSelectedProspect}
            selectedProspectId={selectedProspect?.id || null}
            onAddProspect={handleAddProspect}
            currentUser={currentUser}
            staff={staff}
          />
        );
      
      case '/admin/clients':
      case '/coach/clients':
        return (
          <ClientList
            clients={clients}
            onSelectClient={setSelectedClient}
            selectedClientId={selectedClient?.id || null}
            onAddClient={handleAddClient}
            staff={staff}
            currentUser={currentUser}
            sessions={sessions}
          />
        );
      
      case '/admin/calendrier':
      case '/coach/calendrier':
        return (
          <CalendarPage
            clients={clients}
            prospects={prospects}
            staff={staff}
            currentUser={currentUser}
          />
        );
      
      case '/admin/seances':
      case '/coach/seances':
        return (
          <SessionsPage
            clients={clients}
            sessions={sessions}
            onUpdateSessions={setSessions}
          />
        );
      
      case '/admin/facturation':
      case '/coach/facturation':
        return (
          <BillingPage
            clients={clients}
            onUpdateClient={handleUpdateClient}
            currentUser={currentUser}
          />
        );
      
      case '/admin/equipe':
        return (
          <AdminGuard currentUser={currentUser}>
            <StaffManagementPage
              currentUser={currentUser}
              staff={staff}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          </AdminGuard>
        );
      
      case '/admin/settings':
      case '/coach/settings':
        return (
          <SettingsPage
            theme={theme}
            density={density}
            onThemeChange={setTheme}
            onDensityChange={setDensity}
            currentUser={currentUser}
          />
        );
      
      default:
        return <NotFoundPage />;
    }
  };

  // Show login page if no user is logged in
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentUser={currentUser}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">
                {activeSection.includes('dashboard') ? 'Dashboard' :
                 activeSection.includes('pipeline') ? 'Pipeline' :
                 activeSection.includes('clients') ? 'Clients' :
                 activeSection.includes('calendrier') ? 'Calendrier' :
                 activeSection.includes('seances') ? 'Séances' :
                 activeSection.includes('facturation') ? 'Facturation' :
                 activeSection.includes('equipe') ? 'Équipe' :
                 activeSection.includes('settings') ? 'Paramètres' : 'CoachCRM'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <Bell className="w-5 h-5" />
            </button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">
                  {currentUser.role === 'ADMIN' ? 'Administrateur' : 'Coach'}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 flex min-h-0">
          <div className="flex-1 min-h-0">
            {renderMainContent()}
          </div>
          
          {/* Contact Detail Sidebar */}
          {(selectedClient || selectedProspect) && (
            <ContactDetail
              client={selectedClient}
              prospect={selectedProspect}
              sessions={sessions}
              onClose={() => {
                setSelectedClient(null);
                setSelectedProspect(null);
              }}
              onUpdateClient={handleUpdateClient}
              onCreateSession={handleCreateSession}
            />
          )}
        </main>
      </div>
      
      {/* Activity Feed */}
      <ActivityFeed
        isOpen={isActivityFeedOpen}
        onToggle={() => setIsActivityFeedOpen(!isActivityFeedOpen)}
      />
    </div>
  );
}

export default App;