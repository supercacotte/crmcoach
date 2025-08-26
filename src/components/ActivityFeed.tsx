import React from 'react';
import { Mail, Phone, Calendar, User, Clock, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Activity {
  id: number;
  type: 'email' | 'call' | 'meeting' | 'note' | 'contact_added';
  title: string;
  description: string;
  timestamp: string;
  client: string;
}

interface ActivityFeedProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ isOpen, onToggle }) => {
  const activities: Activity[] = [
    {
      id: 1,
      type: 'email',
      title: 'Email envoyé à Sophie Laurent',
      description: 'Préparation de la prochaine séance de coaching',
      timestamp: 'Il y a 2 heures',
      client: 'Sophie Laurent',
    },
    {
      id: 2,
      type: 'call',
      title: 'Appel avec Thomas Rousseau',
      description: 'Discussion sur les objectifs de reconversion',
      timestamp: 'Il y a 5 heures',
      client: 'Thomas Rousseau',
    },
    {
      id: 3,
      type: 'meeting',
      title: 'Séance planifiée',
      description: 'Séance de suivi avec Marie Dubois',
      timestamp: 'Il y a 1 jour',
      client: 'Marie Dubois',
    },
    {
      id: 4,
      type: 'note',
      title: 'Note ajoutée',
      description: 'Prospect intéressé par un programme de 6 mois',
      timestamp: 'Il y a 2 jours',
      client: 'Pierre Martin',
    },
    {
      id: 5,
      type: 'contact_added',
      title: 'Nouveau prospect ajouté',
      description: 'Nouveau prospect via le site web',
      timestamp: 'Il y a 3 jours',
      client: 'Julie Moreau',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'note': return <MessageCircle className="w-4 h-4" />;
      case 'contact_added': return <User className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-600';
      case 'call': return 'bg-green-100 text-green-600';
      case 'meeting': return 'bg-purple-100 text-purple-600';
      case 'note': return 'bg-yellow-100 text-yellow-600';
      case 'contact_added': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-1/2 right-0 transform -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-l-lg shadow-lg p-2 hover:bg-gray-50 transition-all duration-200 hidden xl:block"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>
    );
  }

  return (
    <>
      {/* Toggle Button - When open */}
      <button
        onClick={onToggle}
        className="fixed top-1/2 right-80 transform -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-l-lg shadow-lg p-2 hover:bg-gray-50 transition-all duration-200 hidden xl:block"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>

      {/* Activity Feed Sidebar */}
      <div className="w-80 bg-white border-l border-gray-100 h-screen shadow-sm hidden xl:block">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Activité Récente</h3>
              <p className="text-sm text-gray-600 mt-1 font-medium">Dernières interactions et mises à jour</p>
            </div>
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 hover:shadow-sm">
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-gray-500 font-medium">{activity.timestamp}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-xs text-gray-600 font-medium">{activity.client}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <button className="w-full px-4 py-2.5 text-sm font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 shadow-sm hover:shadow-md">
              Voir Toute l'Activité
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityFeed;