import React from 'react';
import { User, Building, Mail, Phone, Calendar, Clock, Target, Tag, Star } from 'lucide-react';
import { Link as LinkIcon, Video } from 'lucide-react';

interface SummaryBannerProps {
  type: 'client' | 'session' | 'prospect';
  data: {
    name: string;
    company?: string;
    status?: string;
    assignedCoach?: string;
    email?: string;
    phone?: string;
    nextSession?: string;
    date?: string;
    time?: string;
    duration?: string;
    sessionType?: string;
    lastContact?: string;
    nextAction?: string;
    tags?: string[];
    starred?: boolean;
  };
  compact?: boolean;
}

const SummaryBanner: React.FC<SummaryBannerProps> = ({ type, data, compact = false }) => {
  const getStatusColor = (status: string, type: string) => {
    if (type === 'client') {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800 border-green-200';
        case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else if (type === 'prospect') {
      switch (status) {
        case 'lead': return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'meeting_scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'proposal_sent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'negotiation': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'closed_won': return 'bg-green-100 text-green-800 border-green-200';
        case 'closed_lost': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else if (type === 'session') {
      switch (status) {
        case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string, type: string) => {
    if (type === 'client') {
      switch (status) {
        case 'active': return 'Actif';
        case 'paused': return 'En pause';
        case 'completed': return 'Terminé';
        default: return status;
      }
    } else if (type === 'prospect') {
      switch (status) {
        case 'lead': return 'Nouveau';
        case 'contacted': return 'Contacté';
        case 'meeting_scheduled': return 'RDV Planifié';
        case 'proposal_sent': return 'Proposition Envoyée';
        case 'negotiation': return 'Négociation';
        case 'closed_won': return 'Clients';
        case 'closed_lost': return 'Perdu';
        default: return status;
      }
    } else if (type === 'session') {
      switch (status) {
        case 'scheduled': return 'Planifiée';
        case 'completed': return 'Terminée';
        case 'cancelled': return 'Annulée';
        default: return status;
      }
    }
    return status;
  };

  const avatarSize = compact ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12';
  const textSize = compact ? 'text-sm' : 'text-sm sm:text-base';
  const subtextSize = compact ? 'text-xs' : 'text-xs sm:text-sm';
  const padding = compact ? 'p-3' : 'p-4';

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${padding} shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center flex-1 min-w-0">
          {/* Avatar */}
          <div className={`${avatarSize} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0`}>
            <span className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-white`}>
              {data.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center">
              <h3 className={`${textSize} font-semibold text-gray-900 truncate`}>
                {data.name}
              </h3>
              {data.starred && (
                <Star className="w-4 h-4 text-yellow-500 ml-2 fill-current flex-shrink-0" />
              )}
            </div>
            
            {data.company && (
              <div className="flex items-center mt-1">
                <Building className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                <span className={`${subtextSize} text-gray-600 truncate`}>{data.company}</span>
              </div>
            )}

            {/* Type-specific info */}
            {type === 'client' && (
              <>
                {data.assignedCoach && (
                  <div className="flex items-center mt-1">
                    <User className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                    <span className={`${subtextSize} text-gray-600 truncate`}>Coach: {data.assignedCoach}</span>
                  </div>
                )}
                {data.nextSession && (
                  <div className="flex items-center mt-1">
                    <Calendar className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                    <span className={`${subtextSize} text-gray-600 truncate`}>
                      Prochaine: {new Date(data.nextSession).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </>
            )}

            {type === 'session' && (
              <>
                {data.date && data.time && (
                  <div className="flex items-center mt-1">
                    <Calendar className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                    <span className={`${subtextSize} text-gray-600 truncate`}>
                      {new Date(data.date).toLocaleDateString('fr-FR')} à {data.time}
                    </span>
                  </div>
                )}
                {data.duration && data.sessionType && (
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                    <span className={`${subtextSize} text-gray-600 truncate`}>
                      {data.sessionType} - {data.duration}
                    </span>
                  </div>
                )}
                {data.assignedCoach && (
                  <div className="flex items-center mt-1">
                    <User className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                    <span className={`${subtextSize} text-gray-600 truncate`}>Coach: {data.assignedCoach}</span>
                  </div>
                )}
              </>
            )}

            {type === 'prospect' && (
              <>
                {data.assignedCoach && (
                  <div className="flex items-center mt-1">
                    <User className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                    <span className={`${subtextSize} text-gray-600 truncate`}>Coach: {data.assignedCoach}</span>
                  </div>
                )}
                {data.lastContact && (
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                    <span className={`${subtextSize} text-gray-600 truncate`}>Dernier contact: {data.lastContact}</span>
                  </div>
                )}
                {data.nextAction && (
                  <div className="flex items-center mt-1">
                    <Target className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                    <span className={`${subtextSize} text-gray-600 truncate`}>Prochaine action: {data.nextAction}</span>
                  </div>
                )}
              </>
            )}

            {/* Contact info for non-compact mode */}
            {!compact && (
              <div className="flex flex-wrap gap-4 mt-2">
                {data.email && (
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                    <span className={`${subtextSize} text-gray-600 truncate`}>{data.email}</span>
                  </div>
                )}
                {data.phone && (
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                    <span className={`${subtextSize} text-gray-600`}>{data.phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {data.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
                  <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {tag}
                  </span>
                ))}
                {data.tags.length > (compact ? 2 : 3) && (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    +{data.tags.length - (compact ? 2 : 3)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {data.status && (
          <div className="flex-shrink-0 ml-3">
            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(data.status, type)}`}>
              {getStatusLabel(data.status, type)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryBanner;