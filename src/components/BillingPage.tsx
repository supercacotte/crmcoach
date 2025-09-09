import React, { useState } from 'react';
import { Search, Plus, FileText, CreditCard, Euro, Calendar, User, Download, Send, Eye, Edit, Trash2, DollarSign, TrendingUp, Clock, AlertCircle, ExternalLink, Filter, X, ChevronDown, MoreHorizontal, Menu, CheckSquare, Square, Mail, Users } from 'lucide-react';
import { Client, Invoice } from '../types/Client';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceDetailModal from './InvoiceDetailModal';
import InvoiceRowDetailModal from './InvoiceRowDetailModal';
import KpiBanner from './KpiBanner';
import { sendInvoiceReminders } from '../services/invoiceApi';
import { defaultReminderTemplate, interpolate } from '../templates/reminderTemplates';

interface BillingPageProps {
  clients: Client[];
  onUpdateClient: (client: Client) => void;
  currentUser: User;
}

const BillingPage: React.FC<BillingPageProps> = ({ clients, onUpdateClient, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [isInvoiceDetailModalOpen, setIsInvoiceDetailModalOpen] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<(Invoice & { clientName: string; clientEmail: string }) | null>(null);
  const [selectedInvoiceRow, setSelectedInvoiceRow] = useState<(Invoice & { clientName: string; clientEmail: string }) | null>(null);
  const [isInvoiceRowDetailOpen, setIsInvoiceRowDetailOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [reminderTemplateId, setReminderTemplateId] = useState<string>('default');
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [isBulkReminderModalOpen, setIsBulkReminderModalOpen] = useState(false);

  // Récupérer toutes les factures de tous les clients
  const allInvoices = clients.flatMap(client => 
    client.billing.invoices.map(invoice => ({
      ...invoice,
      clientName: client.name,
      clientEmail: client.email
    }))
  );

  const filteredInvoices = allInvoices.filter(invoice => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesClient = filterClient === 'all' || invoice.clientName === filterClient;
    
    let matchesDate = true;
    if (filterDateRange !== 'all') {
      const invoiceDate = new Date(invoice.date);
      const now = new Date();
      switch (filterDateRange) {
        case 'this_month':
          matchesDate = invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear();
          break;
        case 'last_month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          matchesDate = invoiceDate.getMonth() === lastMonth.getMonth() && invoiceDate.getFullYear() === lastMonth.getFullYear();
          break;
        case 'this_year':
          matchesDate = invoiceDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesClient && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'sent': return 'Envoyée';
      case 'overdue': return 'En retard';
      case 'draft': return 'Brouillon';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  // Calculs financiers
  const totalRevenue = clients.reduce((sum, client) => sum + client.billing.totalPaid, 0);
  const totalDue = clients.reduce((sum, client) => sum + client.billing.totalDue, 0);
  const overdueInvoices = allInvoices.filter(inv => inv.status === 'overdue').length;
  const thisMonthRevenue = allInvoices
    .filter(inv => inv.status === 'paid' && new Date(inv.date).getMonth() === new Date().getMonth())
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handleCreateInvoice = (newInvoice: Invoice) => {
    const client = clients.find(c => c.id === newInvoice.clientId);
    if (client) {
      const updatedClient = {
        ...client,
        billing: {
          ...client.billing,
          invoices: [...client.billing.invoices, newInvoice],
          totalDue: client.billing.totalDue + newInvoice.amount,
        }
      };
      onUpdateClient(updatedClient);
    }
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoiceForDetail(invoice);
    setIsInvoiceDetailModalOpen(true);
  };

  const handleRowClick = (invoice: any) => {
    setSelectedInvoiceRow(invoice);
    setIsInvoiceRowDetailOpen(true);
  };

  const handleDownloadInvoice = (invoice: any) => {
    // Générer un PDF simple avec les données de la facture
    const invoiceContent = `
FACTURE ${invoice.invoiceNumber}

Client: ${invoice.clientName}
Email: ${invoice.clientEmail}
Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}
Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}

PRESTATIONS:
${invoice.items?.map(item => `- ${item.description}: ${item.quantity} x ${item.unitPrice}€ = ${item.total}€`).join('\n') || 'Aucune prestation détaillée'}

TOTAL: ${invoice.amount.toLocaleString('fr-FR')}€
STATUT: ${getStatusLabel(invoice.status)}

${invoice.notes ? `NOTES:\n${invoice.notes}` : ''}

---
Facture générée par CoachCRM
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Facture_${invoice.invoiceNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const handleSendInvoice = (invoice: any) => {
    // Simuler l'envoi d'email
    alert(`Facture ${invoice.invoiceNumber} envoyée à ${invoice.clientEmail}`);
    
    // Mettre à jour le statut de la facture
    const client = clients.find(c => c.id === invoice.clientId);
    if (client) {
      const updatedInvoices = client.billing.invoices.map(inv => 
        inv.id === invoice.id ? { ...inv, status: 'sent' as const } : inv
      );
      const updatedClient = {
        ...client,
        billing: {
          ...client.billing,
          invoices: updatedInvoices
        }
      };
      onUpdateClient(updatedClient);
    }
  };

  const handleMarkAsPaid = (invoice: any) => {
    const client = clients.find(c => c.id === invoice.clientId);
    if (client) {
      const updatedInvoices = client.billing.invoices.map(inv => 
        inv.id === invoice.id ? { ...inv, status: 'paid' as const } : inv
      );
      
      // Recalculer les totaux
      const totalPaid = updatedInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
      const totalDue = updatedInvoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').reduce((sum, inv) => sum + inv.amount, 0);
      
      const updatedClient = {
        ...client,
        billing: {
          ...client.billing,
          invoices: updatedInvoices,
          totalPaid,
          totalDue
        }
      };
      onUpdateClient(updatedClient);
    }
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    const client = clients.find(c => c.id === updatedInvoice.clientId);
    if (client) {
      const updatedInvoices = client.billing.invoices.map(inv => 
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      );
      
      // Recalculer les totaux
      const totalPaid = updatedInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
      const totalDue = updatedInvoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').reduce((sum, inv) => sum + inv.amount, 0);
      
      const updatedClient = {
        ...client,
        billing: {
          ...client.billing,
          invoices: updatedInvoices,
          totalPaid,
          totalDue
        }
      };
      onUpdateClient(updatedClient);
    }
  };

  const handleBulkReminder = () => {
    const overdueInvoices = filteredInvoices.filter(inv => 
      inv.status === 'overdue' && 
      (selectedInvoices.length === 0 || selectedInvoices.includes(inv.id))
    );
    
    if (overdueInvoices.length === 0) {
      alert('Aucune facture en retard sélectionnée');
      return;
    }
    
    setIsBulkReminderModalOpen(true);
  };

  const handleSendBulkReminder = () => {
    const overdueInvoices = filteredInvoices.filter(inv => 
      inv.status === 'overdue' && 
      (selectedInvoices.length === 0 || selectedInvoices.includes(inv.id))
    );
    
    // Simuler l'envoi des relances
    setTimeout(() => {
      alert(`${overdueInvoices.length} relances envoyées avec succès`);
      setIsBulkReminderModalOpen(false);
      setSelectedInvoices([]);
    }, 1500);
  };

  const toggleInvoiceSelection = (invoiceId: number) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const toggleAllInvoices = () => {
    const overdueInvoiceIds = filteredInvoices.filter(inv => inv.status === 'overdue').map(inv => inv.id);
    if (selectedInvoices.length === overdueInvoiceIds.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(overdueInvoiceIds);
    }
  };

  const uniqueClients = [...new Set(allInvoices.map(inv => inv.clientName))];
  const overdueInvoicesCount = filteredInvoices.filter(inv => inv.status === 'overdue').length;

  // Calculate KPI data
  const getKpiData = () => [
    {
      label: 'CA Total',
      value: `${totalRevenue.toLocaleString('fr-FR')}€`,
      icon: Euro,
      color: 'green' as const,
      tooltip: 'Chiffre d\'affaires total encaissé'
    },
    {
      label: 'Ce Mois',
      value: `${thisMonthRevenue.toLocaleString('fr-FR')}€`,
      icon: TrendingUp,
      color: 'blue' as const,
      delta: {
        value: 12,
        type: 'positive' as const,
        label: '%'
      },
      tooltip: 'Revenus de ce mois'
    },
    {
      label: 'À Recevoir',
      value: `${totalDue.toLocaleString('fr-FR')}€`,
      icon: Clock,
      color: 'orange' as const,
      tooltip: 'Montant total des factures impayées'
    },
    {
      label: 'En Retard',
      value: overdueInvoices,
      icon: AlertCircle,
      color: 'red' as const,
      tooltip: 'Nombre de factures en retard'
    }
  ];

  // Filters Sheet Component
  const FiltersSheet = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden ${isFiltersOpen ? 'block' : 'hidden'}`}>
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
          <button
            onClick={() => setIsFiltersOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="sent">Envoyées</option>
              <option value="paid">Payées</option>
              <option value="overdue">En retard</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les clients</option>
              {uniqueClients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les périodes</option>
              <option value="this_month">Ce mois</option>
              <option value="last_month">Mois dernier</option>
              <option value="this_year">Cette année</option>
            </select>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterClient('all');
              setFilterDateRange('all');
            }}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Réinitialiser
          </button>
          <button
            onClick={() => setIsFiltersOpen(false)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );

  // Action Menu Component
  const ActionMenu = ({ invoice, onClose }: { invoice: any, onClose: () => void }) => (
    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]">
      <button
        onClick={() => {
          handleViewInvoice(invoice);
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
      >
        <Eye className="w-4 h-4 mr-2" />
        Voir détails
      </button>
      <button
        onClick={() => {
          handleDownloadInvoice(invoice);
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
      >
        <Download className="w-4 h-4 mr-2" />
        Télécharger PDF
      </button>
      <button
        onClick={() => {
          handleSendInvoice(invoice);
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
      >
        <Send className="w-4 h-4 mr-2" />
        Envoyer
      </button>
      {(invoice.status === 'sent' || invoice.status === 'overdue') && (
        <button
          onClick={() => {
            handleMarkAsPaid(invoice);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Marquer payée
        </button>
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Facturation</h1>
              <p className="text-sm text-gray-600 mt-1 hidden sm:block">Gérez vos factures et paiements</p>
            </div>
            
            {/* Desktop New Invoice Button */}
            <button 
              onClick={() => setIsCreateInvoiceModalOpen(true)}
              className="hidden lg:flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Facture
            </button>
          </div>
        </div>
      </div>

      {/* KPI Banner */}
      <KpiBanner
        items={getKpiData()}
        role={currentUser.role}
        dense={false}
      />

      {/* Search and Filters */}
      {overdueInvoicesCount > 0 && (
        <div className="bg-orange-50 border-b border-orange-200">
          <div className="px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-800">
                  {overdueInvoicesCount} facture(s) en retard
                </span>
              </div>
              <button
                onClick={handleBulkReminder}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm font-medium"
              >
                <Mail className="w-4 h-4 mr-2 inline" />
                Relancer
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher factures ou clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="sent">Envoyées</option>
              <option value="paid">Payées</option>
              <option value="overdue">En retard</option>
              <option value="cancelled">Annulées</option>
            </select>
            
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
            >
              <option value="all">Tous les clients</option>
              {uniqueClients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
            
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
            >
              <option value="all">Toutes les périodes</option>
              <option value="this_month">Ce mois</option>
              <option value="last_month">Mois dernier</option>
              <option value="this_year">Cette année</option>
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
              {(filterStatus !== 'all' || filterClient !== 'all' || filterDateRange !== 'all') && (
                <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 min-h-0 overflow-y-auto">
        {filteredInvoices.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune facture trouvée</h3>
            <p className="text-gray-600 mb-6">Commencez par créer votre première facture</p>
            <button
              onClick={() => setIsCreateInvoiceModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Créer ma première facture
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="table-scroll">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {overdueInvoicesCount > 0 && (
                        <th className="px-6 py-4 text-left">
                          <button
                            onClick={toggleAllInvoices}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {selectedInvoices.length === filteredInvoices.filter(inv => inv.status === 'overdue').length ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">N° Facture</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredInvoices.map((invoice) => (
                      <tr 
                        key={invoice.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        onClick={(e) => {
                          // Empêcher le clic si on clique sur une action
                          if ((e.target as HTMLElement).closest('button')) {
                            return;
                          }
                          handleRowClick(invoice);
                        }}
                      >
                        {overdueInvoicesCount > 0 && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {invoice.status === 'overdue' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleInvoiceSelection(invoice.id);
                                }}
                                className="text-gray-400 hover:text-blue-600"
                              >
                                {selectedInvoices.includes(invoice.id) ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{invoice.clientName}</div>
                            <div className="text-sm text-gray-500">{invoice.clientEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(invoice.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">{invoice.amount.toLocaleString('fr-FR')}€</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(invoice.status)}`}>
                            {getStatusLabel(invoice.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewInvoice(invoice);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadInvoice(invoice);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendInvoice(invoice);
                              }}
                              className="p-1 text-gray-400 hover:text-purple-600 rounded transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Facture</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Montant</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredInvoices.map((invoice) => {
                      const [showMenu, setShowMenu] = useState(false);
                      
                      return (
                        <tr 
                          key={invoice.id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                          onClick={() => handleRowClick(invoice)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{invoice.clientName}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">{invoice.amount.toLocaleString('fr-FR')}€</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(invoice.status)}`}>
                              {getStatusLabel(invoice.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {showMenu && (
                              <ActionMenu 
                                invoice={invoice} 
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
              {filteredInvoices.map((invoice) => {
                const [showMenu, setShowMenu] = useState(false);
                
                return (
                  <div
                    key={invoice.id}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Client:</span>
                        <span className="text-sm font-medium text-gray-900 truncate ml-2">{invoice.clientName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="text-sm text-gray-900">{new Date(invoice.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Montant:</span>
                        <span className="text-lg font-bold text-gray-900">{invoice.amount.toLocaleString('fr-FR')}€</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(invoice);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        Voir / Éditer
                      </button>
                      {invoice.status === 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Logique pour générer facture depuis séance
                            alert(`Générer facture pour ${invoice.clientName}`);
                          }}
                          className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                          <FileText className="w-3 h-3 mr-1 inline" />
                          Facturer
                        </button>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => setShowMenu(!showMenu)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {showMenu && (
                          <ActionMenu 
                            invoice={invoice} 
                            onClose={() => setShowMenu(false)} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setIsCreateInvoiceModalOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Filters Sheet */}
      <FiltersSheet />
      
      {/* Modal de relance groupée */}
      {isBulkReminderModalOpen && (
        <BulkReminderModal
          isOpen={isBulkReminderModalOpen}
          onClose={() => setIsBulkReminderModalOpen(false)}
          invoices={filteredInvoices.filter(inv => 
            inv.status === 'overdue' && 
            (selectedInvoices.length === 0 || selectedInvoices.includes(inv.id))
          )}
          onSendReminders={handleSendBulkReminder}
        />
      )}
      
      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceModalOpen}
        onClose={() => setIsCreateInvoiceModalOpen(false)}
        clients={clients}
        sessions={[
          { id: 1, clientId: 1, date: '2024-01-18', type: 'individuelle', duration: 60, status: 'completed', description: 'Séance sur l\'assertivité' },
          { id: 2, clientId: 1, date: '2024-01-11', type: 'individuelle', duration: 60, status: 'completed', description: 'Travail sur la confiance' },
          { id: 3, clientId: 2, date: '2024-01-21', type: 'individuelle', duration: 60, status: 'completed', description: 'Clarification du projet' },
          { id: 4, clientId: 2, date: '2024-01-14', type: 'individuelle', duration: 60, status: 'completed', description: 'Exploration des options' },
        ]}
        onCreateInvoice={handleCreateInvoice}
      />
      
      {selectedInvoiceForDetail && (
        <InvoiceDetailModal
          isOpen={isInvoiceDetailModalOpen}
          onClose={() => {
            setIsInvoiceDetailModalOpen(false);
            setSelectedInvoiceForDetail(null);
          }}
          invoice={selectedInvoiceForDetail}
          client={clients.find(c => c.id === selectedInvoiceForDetail.clientId)!}
          onUpdateInvoice={handleUpdateInvoice}
        />
      )}
      
      {selectedInvoiceRow && (
        <InvoiceRowDetailModal
          isOpen={isInvoiceRowDetailOpen}
          onClose={() => {
            setIsInvoiceRowDetailOpen(false);
            setSelectedInvoiceRow(null);
          }}
          invoice={selectedInvoiceRow}
          client={clients.find(c => c.id === selectedInvoiceRow.clientId)!}
          onUpdateInvoice={handleUpdateInvoice}
        />
      )}
    </div>
  );
};

// Modal de relance groupée
const BulkReminderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  invoices: any[];
  onSendReminders: () => void;
}> = ({ isOpen, onClose, invoices, onSendReminders }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    setIsLoading(true);
    onSendReminders();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-2xl">
          <div className="flex items-center">
            <Mail className="w-6 h-6 text-orange-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Relancer les Factures</h2>
              <p className="text-sm text-gray-600">{invoices.length} facture(s) en retard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Factures à relancer</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-gray-600">{invoice.clientName} - {invoice.amount.toLocaleString('fr-FR')}€</p>
                  </div>
                  <span className="text-xs text-red-600 font-medium">
                    En retard de {Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24))} jour(s)
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Template de relance</h4>
            <p className="text-sm text-blue-800">
              Un email de relance automatique sera envoyé à chaque client avec les détails de la facture en retard et un lien de paiement.
            </p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Relancer factures en retard
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;