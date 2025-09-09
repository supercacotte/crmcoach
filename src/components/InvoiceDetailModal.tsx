import React, { useState } from 'react';
import { X, FileText, Download, Send, CreditCard, CheckCircle, Calendar, User, Mail, Phone } from 'lucide-react';
import { Invoice, Client } from '../types/Client';
import StripePayment from './StripePayment';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice & { clientName: string; clientEmail: string };
  client: Client;
  onUpdateInvoice: (invoice: Invoice) => void;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  client,
  onUpdateInvoice
}) => {
  const [showPayment, setShowPayment] = useState(false);

  const handlePaymentSuccess = () => {
    const updatedInvoice = {
      ...invoice,
      status: 'paid' as const,
    };
    onUpdateInvoice(updatedInvoice);
    setShowPayment(false);
    onClose();
  };

  const handlePaymentError = (error: string) => {
    alert(`Erreur de paiement: ${error}`);
  };

  const handleDownload = () => {
    // Générer un PDF détaillé avec toutes les informations
    const invoiceContent = `
FACTURE ${invoice.invoiceNumber}

INFORMATIONS CLIENT:
Nom: ${invoice.clientName}
Email: ${invoice.clientEmail}
Téléphone: ${client.phone}
${client.company ? `Entreprise: ${client.company}` : ''}

DÉTAILS FACTURE:
Date d'émission: ${new Date(invoice.date).toLocaleDateString('fr-FR')}
Date d'échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
Statut: ${getStatusLabel(invoice.status)}

PRESTATIONS:
${invoice.items.map(item => 
  `${item.description}
  Quantité: ${item.quantity}
  Prix unitaire: ${item.unitPrice.toLocaleString('fr-FR')}€
  Total: ${item.total.toLocaleString('fr-FR')}€`
).join('\n\n')}

TOTAL TTC: ${invoice.amount.toLocaleString('fr-FR')}€

${invoice.notes ? `NOTES:\n${invoice.notes}` : ''}

---
Facture générée par CoachCRM
Date de génération: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Facture_${invoice.invoiceNumber}_${invoice.clientName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const handleSend = () => {
    alert(`Facture ${invoice.invoiceNumber} envoyée à ${invoice.clientEmail}`);
    const updatedInvoice = {
      ...invoice,
      status: 'sent' as const,
    };
    onUpdateInvoice(updatedInvoice);
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{position: 'fixed'}}>
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Facture {invoice.invoiceNumber}</h2>
              <p className="text-sm text-gray-600">{invoice.clientName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(invoice.status)}`}>
              {getStatusLabel(invoice.status)}
            </span>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6">
            {showPayment ? (
              <div className="max-w-md mx-auto">
                <StripePayment
                  amount={invoice.amount}
                  clientName={invoice.clientName}
                  invoiceNumber={invoice.invoiceNumber}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
                <button
                  onClick={() => setShowPayment(false)}
                  className="w-full mt-4 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Retour aux détails
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Informations facture */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Client</h3>
                    <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="font-medium text-gray-900">{invoice.clientName}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-700">{invoice.clientEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-700">{client.phone}</span>
                      </div>
                      {client.company && (
                        <div className="flex items-center">
                          <Building className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-700">{client.company}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails de la Facture</h3>
                    <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Numéro:</span>
                        <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date d'émission:</span>
                        <span className="font-medium text-gray-900">{new Date(invoice.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date d'échéance:</span>
                        <span className="font-medium text-gray-900">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-gray-200">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-blue-700">{invoice.amount.toLocaleString('fr-FR')}€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prestations */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Prestations</h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Quantité</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Prix Unitaire</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {invoice.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{item.quantity}</td>
                            <td className="px-6 py-4 text-right text-sm text-gray-700">{item.unitPrice.toLocaleString('fr-FR')}€</td>
                            <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{item.total.toLocaleString('fr-FR')}€</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-right text-lg font-semibold text-gray-900">
                            Total TTC:
                          </td>
                          <td className="px-6 py-4 text-right text-xl font-bold text-blue-700">
                            {invoice.amount.toLocaleString('fr-FR')}€
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <p className="text-gray-700">{invoice.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Actions */}
        {!showPayment && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 min-w-0 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </button>
              
              {invoice.status === 'draft' && (
                <button
                  onClick={handleSend}
                  className="flex-1 min-w-0 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer au Client
                </button>
              )}
              
              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <button
                  onClick={() => setShowPayment(true)}
                  className="flex-1 min-w-0 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Encaisser le Paiement
                </button>
              )}
              
              {invoice.status === 'paid' && (
                <div className="flex-1 min-w-0 px-4 py-3 bg-green-100 text-green-800 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Facture Payée
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailModal;