import React, { useState } from 'react';
import { X, FileText, Download, Send, CreditCard, CheckCircle, Calendar, User, Mail, Phone, Building, DollarSign, Clock, AlertTriangle, Check } from 'lucide-react';
import { Invoice, Client } from '../types/Client';
import StripePayment from './StripePayment';

interface InvoiceRowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice & { clientName: string; clientEmail: string };
  client: Client;
  onUpdateInvoice: (invoice: Invoice) => void;
}

const InvoiceRowDetailModal: React.FC<InvoiceRowDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  client,
  onUpdateInvoice
}) => {
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isSendingPaymentLink, setIsSendingPaymentLink] = useState(false);

  const handleSendPaymentLink = async () => {
    setIsSendingPaymentLink(true);
    
    try {
      // Simuler l'envoi du lien de paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Générer un lien de paiement fictif
      const paymentLink = `https://pay.stripe.com/invoice/${invoice.invoiceNumber}`;
      
      // Simuler l'envoi par email
      alert(`Lien de paiement envoyé à ${invoice.clientEmail}\n\nLien: ${paymentLink}\n\nLe client recevra un email avec le lien sécurisé pour payer la facture.`);
      
      // Optionnel: mettre à jour le statut si nécessaire
      // const updatedInvoice = { ...invoice, status: 'payment_link_sent' as const };
      // onUpdateInvoice(updatedInvoice);
      
    } catch (error) {
      alert('Erreur lors de l\'envoi du lien de paiement');
    } finally {
      setIsSendingPaymentLink(false);
    }
  };

  const handleMarkAsPaid = () => {
    setIsMarkingPaid(true);
    setTimeout(() => {
      const updatedInvoice = {
        ...invoice,
        status: 'paid' as const,
      };
      onUpdateInvoice(updatedInvoice);
      setIsMarkingPaid(false);
      onClose();
    }, 1000);
  };

  const handleDownload = () => {
    // Simuler le téléchargement PDF
    const element = document.createElement('a');
    const file = new Blob([`Facture ${invoice.invoiceNumber} - ${invoice.clientName}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

  const isOverdue = () => {
    return new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" style={{position: 'fixed'}}>
      <div className="modal-content bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
          <div className="flex items-center min-w-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                Facture {invoice.invoiceNumber}
              </h2>
              <p className="text-sm text-gray-600 truncate">{invoice.clientName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full border ${getStatusColor(invoice.status)}`}>
              {getStatusLabel(invoice.status)}
            </span>
            {isOverdue() && (
              <span className="inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-red-100 text-red-800 border-red-200">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                En retard
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="space-y-6 sm:space-y-8">
                {/* Montant principal */}
                <div className="text-center py-4 sm:py-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2">
                    {invoice.amount.toLocaleString('fr-FR')}€
                  </div>
                  <div className="text-sm sm:text-base text-gray-600">
                    Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                  </div>
                  {isOverdue() && (
                    <div className="text-sm text-red-600 font-medium mt-1">
                      Facture en retard de {Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24))} jour(s)
                    </div>
                  )}
                </div>

                {/* Informations facture et client */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Informations Client</h3>
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        <span className="font-medium text-gray-900 truncate">{invoice.clientName}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{invoice.clientEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{client.phone}</span>
                      </div>
                      {client.company && (
                        <div className="flex items-center">
                          <Building className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 truncate">{client.company}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Détails de la Facture</h3>
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-3">
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
                        <span className="text-base sm:text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-xl sm:text-2xl font-bold text-blue-700">{invoice.amount.toLocaleString('fr-FR')}€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prestations */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Prestations</h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Description</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">Qté</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-700">Prix Unit.</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-700">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {invoice.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{item.description}</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-700">{item.quantity}</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm text-gray-700">{item.unitPrice.toLocaleString('fr-FR')}€</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-900">{item.total.toLocaleString('fr-FR')}€</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-4 sm:px-6 py-3 sm:py-4 text-right text-base sm:text-lg font-semibold text-gray-900">
                              Total TTC:
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-lg sm:text-xl font-bold text-blue-700">
                              {invoice.amount.toLocaleString('fr-FR')}€
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                      <p className="text-gray-700 text-sm sm:text-base">{invoice.notes}</p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        {
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl sm:rounded-b-2xl flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </button>
              
              {invoice.status === 'draft' && (
                <button
                  onClick={handleSend}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base font-medium"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer au Client
                </button>
              )}
              
              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <>
                  <button
                    onClick={handleSendPaymentLink}
                    className="flex-1 px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSendingPaymentLink}
                  >
                    {isSendingPaymentLink ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Envoyer Lien de Paiement
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={isMarkingPaid}
                    className="flex-1 px-4 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isMarkingPaid ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Marquage...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Marquer Payée
                      </>
                    )}
                  </button>
                </>
              )}
              
              {invoice.status === 'paid' && (
                <div className="flex-1 px-4 py-2.5 sm:py-3 bg-green-100 text-green-800 rounded-lg flex items-center justify-center text-sm sm:text-base font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Facture Payée
                </div>
              )}
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default InvoiceRowDetailModal;