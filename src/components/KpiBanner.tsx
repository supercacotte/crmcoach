import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface KpiItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: {
    value: number;
    type: 'positive' | 'negative' | 'neutral';
    label?: string;
  };
  tooltip?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
}

interface KpiBannerProps {
  items: KpiItem[];
  dense?: boolean;
  role?: 'ADMIN' | 'COACH';
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

const KpiBanner: React.FC<KpiBannerProps> = ({ 
  items, 
  dense = false, 
  role = 'ADMIN', 
  loading = false, 
  error = null,
  onRetry 
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-50 to-indigo-50 border-blue-100 bg-blue-100 text-blue-600';
      case 'green': return 'from-green-50 to-emerald-50 border-green-100 bg-green-100 text-green-600';
      case 'purple': return 'from-purple-50 to-pink-50 border-purple-100 bg-purple-100 text-purple-600';
      case 'orange': return 'from-orange-50 to-amber-50 border-orange-100 bg-orange-100 text-orange-600';
      case 'red': return 'from-red-50 to-pink-50 border-red-100 bg-red-100 text-red-600';
      case 'gray': return 'from-gray-50 to-slate-50 border-gray-100 bg-gray-100 text-gray-600';
      default: return 'from-blue-50 to-indigo-50 border-blue-100 bg-blue-100 text-blue-600';
    }
  };

  const getDeltaClasses = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getDeltaIcon = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive': return '↗';
      case 'negative': return '↘';
      case 'neutral': return '→';
      default: return '';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200">
        <div className={`px-4 sm:px-6 ${dense ? 'py-3' : 'py-4'}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="ml-3 min-w-0 flex-1">
                      <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-5 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white border-b border-gray-200">
        <div className={`px-4 sm:px-6 ${dense ? 'py-3' : 'py-4'}`}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800 font-medium mb-2">Erreur lors du chargement des KPI</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
              >
                Réessayer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="bg-white border-b border-gray-200">
        <div className={`px-4 sm:px-6 ${dense ? 'py-3' : 'py-4'}`}>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">Aucune donnée KPI disponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className={`px-4 sm:px-6 ${dense ? 'py-3' : 'py-4'}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            const colorClasses = getColorClasses(item.color);
            const [gradientClasses, borderClass, iconBgClass, iconColorClass] = colorClasses.split(' ');
            
            return (
              <div
                key={index}
                className={`bg-gradient-to-r ${gradientClasses} ${dense ? 'p-3' : 'p-3 sm:p-4'} rounded-lg border ${borderClass}`}
                title={item.tooltip}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${iconBgClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${iconColorClass}`} />
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className={`${dense ? 'text-xs' : 'text-xs sm:text-sm'} font-medium text-gray-600 truncate`}>
                      {item.label}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className={`${dense ? 'text-sm' : 'text-sm sm:text-lg'} font-bold text-gray-900`}>
                        {typeof item.value === 'number' ? item.value.toLocaleString('fr-FR') : item.value}
                      </p>
                      {item.delta && (
                        <span className={`text-xs font-medium ${getDeltaClasses(item.delta.type)} flex items-center`}>
                          <span className="mr-1">{getDeltaIcon(item.delta.type)}</span>
                          {item.delta.value > 0 ? '+' : ''}{item.delta.value}
                          {item.delta.label && <span className="ml-1">{item.delta.label}</span>}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(KpiBanner);