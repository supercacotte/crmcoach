export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'COACH';
  avatar?: string;
  specialties: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'clients' | 'billing' | 'calendar' | 'settings' | 'reports';
}

export const DEFAULT_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    { id: 'clients.view', name: 'Voir clients', description: 'Voir tous les clients', category: 'clients' },
    { id: 'clients.create', name: 'Créer clients', description: 'Créer de nouveaux clients', category: 'clients' },
    { id: 'clients.edit', name: 'Modifier clients', description: 'Modifier les clients existants', category: 'clients' },
    { id: 'clients.delete', name: 'Supprimer clients', description: 'Supprimer des clients', category: 'clients' },
    { id: 'billing.view', name: 'Voir facturation', description: 'Voir toutes les factures', category: 'billing' },
    { id: 'billing.create', name: 'Créer factures', description: 'Créer des factures', category: 'billing' },
    { id: 'billing.edit', name: 'Modifier factures', description: 'Modifier les factures', category: 'billing' },
    { id: 'calendar.view', name: 'Voir planning', description: 'Voir tout le planning', category: 'calendar' },
    { id: 'calendar.create', name: 'Créer événements', description: 'Créer des événements', category: 'calendar' },
    { id: 'calendar.edit', name: 'Modifier événements', description: 'Modifier les événements', category: 'calendar' },
    { id: 'settings.manage', name: 'Gérer paramètres', description: 'Gérer les paramètres système', category: 'settings' },
    { id: 'staff.manage', name: 'Gérer équipe', description: 'Gérer les utilisateurs', category: 'settings' },
    { id: 'reports.view', name: 'Voir rapports', description: 'Voir tous les rapports', category: 'reports' },
    { id: 'dashboard.view', name: 'Voir dashboard', description: 'Accéder au dashboard global', category: 'reports' },
    { id: 'pipeline.all', name: 'Pipeline global', description: 'Voir tous les leads', category: 'clients' },
    { id: 'assign.leads', name: 'Assigner leads', description: 'Assigner des leads aux coachs', category: 'clients' },
  ],
  COACH: [
    { id: 'clients.view.own', name: 'Voir ses clients', description: 'Voir ses clients assignés', category: 'clients' },
    { id: 'clients.edit.own', name: 'Modifier ses clients', description: 'Modifier ses clients', category: 'clients' },
    { id: 'billing.view.own', name: 'Voir ses factures', description: 'Voir ses factures', category: 'billing' },
    { id: 'billing.create.own', name: 'Créer ses factures', description: 'Créer des factures pour ses clients', category: 'billing' },
    { id: 'calendar.view.own', name: 'Voir son planning', description: 'Voir son planning', category: 'calendar' },
    { id: 'calendar.create.own', name: 'Créer ses événements', description: 'Créer ses événements', category: 'calendar' },
    { id: 'calendar.edit.own', name: 'Modifier ses événements', description: 'Modifier ses événements', category: 'calendar' },
    { id: 'pipeline.own', name: 'Pipeline personnel', description: 'Voir ses propres leads', category: 'clients' },
  ]
};