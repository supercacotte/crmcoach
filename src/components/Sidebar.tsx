import React from 'react';
import { TrendingUp, Users, Calendar, Settings, Target, CreditCard, UserCog, X, BarChart3 } from 'lucide-react';
import { User } from '../types/User';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentUser: User;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  isOpen, 
  setIsOpen, 
  currentUser 
}) => {
  const getNavigationItems = () => {
    if (currentUser.role === 'ADMIN') {
      return [
        { id: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: '/admin/pipeline', label: 'Pipeline', icon: TrendingUp },
        { id: '/admin/clients', label: 'Clients', icon: Users },
        { id: '/admin/calendrier', label: 'Calendrier', icon: Calendar },
        { id: '/admin/seances', label: 'Séances', icon: Target },
        { id: '/admin/facturation', label: 'Facturation', icon: CreditCard },
        { id: '/admin/equipe', label: 'Équipe', icon: UserCog },
        { id: '/admin/settings', label: 'Paramètres', icon: Settings },
      ];
    } else {
      return [
        { id: '/coach/pipeline', label: 'Pipeline', icon: TrendingUp },
        { id: '/coach/clients', label: 'Clients', icon: Users },
        { id: '/coach/calendrier', label: 'Calendrier', icon: Calendar },
        { id: '/coach/seances', label: 'Séances', icon: Target },
        { id: '/coach/facturation', label: 'Facturation', icon: CreditCard },
        { id: '/coach/settings', label: 'Paramètres', icon: Settings },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setIsOpen(false); // Close mobile sidebar when section is selected
  };
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        sidebar fixed lg:relative inset-y-0 left-0 z-50 bg-white border-r border-gray-200 min-h-dvh lg:min-h-0
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shadow-xl lg:shadow-none
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CoachCRM</h1>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              {currentUser.role === 'ADMIN' ? 'Administration' : 'Espace Coach'}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleSectionChange(item.id)}
                    className={`
                      w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg 
                      transition-all duration-200 group
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`
                      w-5 h-5 mr-3 transition-colors duration-200
                      ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                    `} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 text-center">
            <p>© 2024 CoachCRM</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;