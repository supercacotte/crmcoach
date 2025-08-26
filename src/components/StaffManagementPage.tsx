import React, { useState } from 'react';
import { Search, Plus, Users, Shield, Edit2, Trash2, UserCheck, UserX, Mail, Phone, Calendar, Award, Settings, Eye, EyeOff, X, User as UserIcon, Filter, MoreHorizontal, Menu } from 'lucide-react';
import { User, DEFAULT_PERMISSIONS } from '../types/User';
import AddStaffModal from './AddStaffModal';

interface StaffManagementPageProps {
  currentUser: User;
  staff: User[];
  onAddStaff: (user: User) => void;
  onUpdateStaff: (user: User) => void;
  onDeleteStaff: (userId: number) => void;
}

const StaffManagementPage: React.FC<StaffManagementPageProps> = ({
  currentUser,
  staff,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isKPISticky, setIsKPISticky] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredStaff = staff.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'coach': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assistant': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'coach': return 'Coach';
      case 'assistant': return 'Assistant';
      default: return role;
    }
  };

  const handleToggleStatus = (user: User) => {
    const updatedUser = { ...user, isActive: !user.isActive };
    onUpdateStaff(updatedUser);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const canManageStaff = currentUser.permissions.some(p => p.id === 'staff.manage');
  
  // Vérifier si l'utilisateur a accès à cette page
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="bg-white min-h-0 flex items-center justify-center">
        <div className="text-center px-4 py-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Accès Refusé</h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          
          <p className="text-sm text-gray-500 mb-8">
            Cette section est réservée aux administrateurs.
          </p>
        </div>
      </div>
    );
  }

  // Stats
  const totalStaff = staff.length;
  const activeStaff = staff.filter(u => u.isActive).length;
  const coaches = staff.filter(u => u.role === 'coach').length;
  const admins = staff.filter(u => u.role === 'admin').length;

  // Gestion du scroll pour sticky KPI
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsKPISticky(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="animate-pulse">
      {/* Desktop Skeleton */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="grid grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-gray-100 p-4">
              <div className="grid grid-cols-7 gap-4 items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex gap-1">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Skeleton */}
      <div className="lg:hidden space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="space-y-2 mb-3">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="flex gap-1 mb-3">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex space-x-2">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="text-center py-12 px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Users className="w-12 h-12 text-blue-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun membre d'équipe trouvé</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
          ? "Aucun membre ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
          : "Commencez par ajouter votre premier membre d'équipe pour collaborer efficacement."
        }
      </p>
      {canManageStaff && (searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
        <button
          onClick={() => {
            setSearchTerm('');
            setFilterRole('all');
            setFilterStatus('all');
          }}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold mr-4"
        >
          Réinitialiser les filtres
        </button>
      )}
      {canManageStaff && (
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2 inline" />
          Ajouter le premier membre
        </button>
      )}
    </div>
  );

  // Filters Sheet Component
  const FiltersSheet = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden ${isFiltersOpen ? 'block' : 'hidden'}`}>
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
          <button
            onClick={() => setIsFiltersOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="coach">Coachs</option>
              <option value="assistant">Assistants</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              setFilterRole('all');
              setFilterStatus('all');
            }}
            className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Réinitialiser
          </button>
          <button
            onClick={() => setIsFiltersOpen(false)}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );

  // Action Menu Component
  const ActionMenu = ({ user, onClose }: { user: User, onClose: () => void }) => (
    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]">
      <button
        onClick={() => {
          handleViewDetails(user);
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
      >
        <Eye className="w-4 h-4 mr-2" />
        Voir détails
      </button>
      {canManageStaff && (
        <>
          <button
            onClick={() => {
              alert('Fonctionnalité de modification à venir');
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Modifier
          </button>
          <button
            onClick={() => {
              handleToggleStatus(user);
              onClose();
            }}
            disabled={user.id === currentUser.id}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center transition-colors ${
              user.id === currentUser.id 
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700'
            }`}
          >
            {user.isActive ? <UserX className="w-4 h-4 mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
            {user.id === currentUser.id 
              ? 'Votre compte' 
              : user.isActive ? 'Désactiver' : 'Activer'
            }
          </button>
          {user.id !== currentUser.id && (
            <button
              onClick={() => {
                if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) {
                  onDeleteStaff(user.id);
                }
                onClose();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </button>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion de l'Équipe</h1>
              <p className="text-sm text-gray-600 mt-1 hidden sm:block">Gérez les utilisateurs et leurs permissions</p>
            </div>
            
            {/* Desktop Add Button */}
            {canManageStaff && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="hidden lg:flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un Membre
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards - Sticky on mobile */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Équipe</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{totalStaff}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-lg border border-green-100">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-green-600" />
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Actifs</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{activeStaff}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg border border-purple-100">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Coachs</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{coaches}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 sm:p-4 rounded-lg border border-red-100">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Admins</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{admins}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="coach">Coachs</option>
              <option value="assistant">Assistants</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>

          {/* Mobile Search and Filter Button */}
          <div className="lg:hidden space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="flex items-center justify-center w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
              {(filterRole !== 'all' || filterStatus !== 'all') && (
                <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 sm:px-6 py-6 min-h-0 overflow-y-auto">
        {isLoading ? (
          <SkeletonLoader />
        ) : filteredStaff.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="table-scroll">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Membre</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rôle</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Spécialités</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dernière Connexion</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredStaff.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                              <span className="text-sm font-bold text-white">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {user.specialties.slice(0, 2).map((specialty, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {specialty}
                              </span>
                            ))}
                            {user.specialties.length > 2 && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                +{user.specialties.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewDetails(user)}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
                              aria-label={`Voir les détails de ${user.name}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManageStaff && (
                              <>
                                <button 
                                  onClick={() => handleToggleStatus(user)}
                                  disabled={user.id === currentUser.id}
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    user.id === currentUser.id 
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : user.isActive 
                                      ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                  }`}
                                  aria-label={user.id === currentUser.id ? 'Votre compte' : user.isActive ? `Désactiver ${user.name}` : `Activer ${user.name}`}
                                >
                                  {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </button>
                                <button 
                                  onClick={() => alert('Fonctionnalité de modification à venir')}
                                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                  aria-label={`Modifier ${user.name}`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                {user.id !== currentUser.id && (
                                  <button 
                                    onClick={() => {
                                      if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) {
                                        onDeleteStaff(user.id);
                                      }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                                    aria-label={`Supprimer ${user.name}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tablet Table (reduced columns) */}
            <div className="hidden md:block lg:hidden bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="table-scroll">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Membre</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rôle</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredStaff.map((user) => {
                      const [showMenu, setShowMenu] = useState(false);
                      
                      return (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                                <span className="text-sm font-bold text-white">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 truncate max-w-[150px]">{user.email}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap relative">
                            <button 
                              onClick={() => setShowMenu(!showMenu)}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
                              aria-label={`Actions pour ${user.name}`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {showMenu && (
                              <ActionMenu 
                                user={user} 
                                onClose={() => setShowMenu(false)} 
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredStaff.map((user) => {
                const [showMenu, setShowMenu] = useState(false);
                const clientsCount = (user.role === 'coach' || user.role === 'admin') ? 
                  Math.floor(Math.random() * 15) + 5 : 0;
                
                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-gray-900 truncate">{user.name}</h3>
                          <p className="text-sm text-gray-600">{getRoleLabel(user.role)}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                      {(user.role === 'coach' || user.role === 'admin') && (
                        <div className="flex items-center text-sm text-gray-600">
                          <UserIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{clientsCount} clients suivis</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {user.specialties.map((specialty, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="flex-1 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium min-h-[44px] flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Détails
                      </button>
                      {canManageStaff && (
                        <>
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            disabled={user.id === currentUser.id}
                            className={`flex-1 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium min-h-[44px] flex items-center justify-center ${
                              user.id === currentUser.id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : user.isActive 
                                ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {user.isActive ? <UserX className="w-4 h-4 mr-1" /> : <UserCheck className="w-4 h-4 mr-1" />}
                            <span className="hidden sm:inline">
                              {user.id === currentUser.id 
                                ? 'Vous' 
                                : user.isActive ? 'Désactiver' : 'Activer'
                              }
                            </span>
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setShowMenu(!showMenu)}
                              className="p-2.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                              aria-label={`Plus d'actions pour ${user.name}`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {showMenu && (
                              <ActionMenu 
                                user={user} 
                                onClose={() => setShowMenu(false)} 
                              />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Mobile FAB */}
      {canManageStaff && (
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
          aria-label="Ajouter un membre d'équipe"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Filters Sheet */}
      <FiltersSheet />
      
      {/* Modals */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStaff={onAddStaff}
      />
      
      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          user={selectedUser}
          canEdit={canManageStaff}
          onUpdateUser={onUpdateStaff}
        />
      )}
    </div>
  );
};

// User Detail Modal Component
const UserDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: User;
  canEdit: boolean;
  onUpdateUser: (user: User) => void;
}> = ({ isOpen, onClose, user, canEdit, onUpdateUser }) => {
  if (!isOpen) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'coach': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assistant': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'coach': return 'Coach';
      case 'assistant': return 'Assistant';
      default: return role;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-2xl">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-lg font-bold text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-600">{getRoleLabel(user.role)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Email</span>
                </div>
                <p className="text-gray-900 break-all">{user.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Téléphone</span>
                </div>
                <p className="text-gray-900">{user.phone}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Shield className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Rôle</span>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Membre depuis</span>
                </div>
                <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* Spécialités */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spécialités</h3>
            <div className="flex flex-wrap gap-2">
              {user.specialties.map((specialty, index) => (
                <span key={index} className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['clients', 'billing', 'calendar', 'settings', 'reports'].map(category => {
                const categoryPermissions = user.permissions.filter(p => p.category === category);
                if (categoryPermissions.length === 0) return null;
                
                return (
                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 capitalize">{category}</h4>
                    <div className="space-y-1">
                      {categoryPermissions.map(permission => (
                        <div key={permission.id} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="truncate">{permission.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium min-h-[44px]"
            >
              Fermer
            </button>
            {canEdit && (
              <button 
                onClick={() => alert('Fonctionnalité de modification à venir')}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium min-h-[44px]"
              >
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManagementPage;