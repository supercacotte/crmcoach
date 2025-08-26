import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface StripePaymentProps {
  amount: number;
  clientName: string;
  invoiceNumber: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const StripePayment: React.FC<StripePaymentProps> = ({
  amount,
  clientName,
  invoiceNumber,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const handleCardChange = (field: string, value: string) => {
    setCardData({ ...cardData, [field]: value });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simuler le traitement Stripe
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler une réussite (90% de chance)
      if (Math.random() > 0.1) {
        onPaymentSuccess();
      } else {
        throw new Error('Votre carte a été refusée. Veuillez vérifier vos informations.');
      }
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Erreur de paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
          <CreditCard className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Paiement Sécurisé</h3>
          <p className="text-sm text-gray-600">Facture {invoiceNumber} - {clientName}</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">Montant à payer</span>
          <span className="text-2xl font-bold text-blue-700">{amount.toLocaleString('fr-FR')}€</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de carte
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardData.number}
              onChange={(e) => handleCardChange('number', formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12"
              required
            />
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'expiration
            </label>
            <input
              type="text"
              value={cardData.expiry}
              onChange={(e) => handleCardChange('expiry', formatExpiry(e.target.value))}
              placeholder="MM/AA"
              maxLength={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVC
            </label>
            <input
              type="text"
              value={cardData.cvc}
              onChange={(e) => handleCardChange('cvc', e.target.value.replace(/\D/g, '').substring(0, 4))}
              placeholder="123"
              maxLength={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom sur la carte
          </label>
          <input
            type="text"
            value={cardData.name}
            onChange={(e) => handleCardChange('name', e.target.value)}
            placeholder="Jean Dupont"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <Lock className="w-4 h-4 mr-2" />
          Vos informations de paiement sont sécurisées et cryptées
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Payer {amount.toLocaleString('fr-FR')}€
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Propulsé par <span className="font-semibold">Stripe</span> - Paiements sécurisés
        </p>
      </div>
    </div>
  );
};

export default StripePayment;