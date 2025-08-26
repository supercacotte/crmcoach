import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, Calculator, User, Mail, Phone, Building, CheckSquare, Square } from 'lucide-react';
import { Client, Invoice, InvoiceItem } from '../types/Client';

interface Session {
  id: number;
  clientId: number;
  date: string;
  type: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  description?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  unitPrice: number;
  category: string;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
  clients?: Client[];
  sessions?: Session[];
  onCreateInvoice: (invoice: Invoice) => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ 
  isOpen, 
  onClose, 
  client,
  clients = [],
  sessions = [],
  onCreateInvoice 
}) => {
  const [selectedClientId, setSelectedClientId] = useState<number>(client?.id || 0);
  const [formData, setFormData] = useState({
    dueDate: '',
    notes: '',
  });

  // Sessions sélectionnées
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

  // Produits disponibles (simulés)
  const [availableProducts] = useState<Product[]>([
    { id: 1, name: 'Séance de coaching individuel', description: 'Séance de coaching 1h', unitPrice: 150, category: 'Coaching' },
    { id: 2, name: 'Séance de coaching groupe', description: 'Séance de coaching en groupe 2h', unitPrice: 80, category: 'Coaching' },
    { id: 3, name: 'Bilan de compétences', description: 'Bilan complet avec rapport', unitPrice: 500, category: 'Bilan' },
    { id: 4, name: 'Formation leadership', description: 'Formation leadership 1 jour', unitPrice: 800, category: 'Formation' },
  ]);

  // Produits personnalisés ajoutés
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  
  // Produits sélectionnés pour la facture
  const [selectedProducts, setSelectedProducts] = useState<{productId: number, quantity: number, customPrice?: number}[]>([]);

  // Nouveau produit en cours de création
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    unitPrice: 0,
    category: 'Coaching'
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const selectedClient = client || clients.find(c => c.id === selectedClientId);
  const clientSessions = sessions.filter(s => s.clientId === selectedClientId && s.status === 'completed');

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}-${month}-${random}`;
  };

  const getAllProducts = () => [...availableProducts, ...customProducts];

  const calculateTotal = () => {
    let total = 0;
    
    // Ajouter les sessions sélectionnées
    selectedSessions.forEach(sessionId => {
      const session = clientSessions.find(s => s.id === sessionId);
      if (session && selectedClient) {
        total += selectedClient.billing.hourlyRate;
      }
    });
    
    // Ajouter les produits sélectionnés
    selectedProducts.forEach(item => {
      const product = getAllProducts().find(p => p.id === item.productId);
      if (product) {
        const price = item.customPrice !== undefined ? item.customPrice : product.unitPrice;
        total += price * item.quantity;
      }
    });
    
    return total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) return;

    const invoiceItems: InvoiceItem[] = [];
    let itemId = 1;

    // Ajouter les sessions comme items
    selectedSessions.forEach(sessionId => {
      const session = clientSessions.find(s => s.id === sessionId);
      if (session) {
        invoiceItems.push({
          id: itemId++,
          description: `Séance ${session.type} - ${new Date(session.date).toLocaleDateString('fr-FR')}`,
          quantity: 1,
          unitPrice: selectedClient.billing.hourlyRate,
          total: selectedClient.billing.hourlyRate,
        });
      }
    });

    // Ajouter les produits comme items
    selectedProducts.forEach(item => {
      const product = getAllProducts().find(p => p.id === item.productId);
      if (product) {
        const price = item.customPrice !== undefined ? item.customPrice : product.unitPrice;
        invoiceItems.push({
          id: itemId++,
          description: product.name,
          quantity: item.quantity,
          unitPrice: price,
          total: price * item.quantity,
        });
      }
    });

    const newInvoice: Invoice = {
      id: Date.now(),
      clientId: selectedClient.id,
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      amount: calculateTotal(),
      status: 'draft',
      items: invoiceItems,
      notes: formData.notes,
    };

    onCreateInvoice(newInvoice);
    
    // Reset form
    setFormData({ dueDate: '', notes: '' });
    setSelectedSessions([]);
    setSelectedProducts([]);
    setCustomProducts([]);
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClientChange = (clientId: number) => {
    setSelectedClientId(clientId);
    setSelectedSessions([]);
  };

  const toggleSession = (sessionId: number) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const addProduct = () => {
    if (newProduct.name && newProduct.unitPrice > 0) {
      const product: Product = {
        id: Date.now(),
        ...newProduct
      };
      setCustomProducts([...customProducts, product]);
      setNewProduct({ name: '', description: '', unitPrice: 0, category: 'Coaching' });
      setIsAddingProduct(false);
    }
  };

  const addProductToInvoice = (productId: number) => {
    if (!selectedProducts.find(p => p.productId === productId)) {
      setSelectedProducts([...selectedProducts, { productId, quantity: 1 }]);
    }
  };

  const updateProductQuantity = (productId: number, quantity: number) => {
    setSelectedProducts(prev => 
      prev.map(p => p.productId === productId ? { ...p, quantity } : p)
    );
  };

  const updateProductPrice = (productId: number, customPrice: number) => {
    setSelectedProducts(prev => 
      prev.map(p => p.productId === productId ? { ...p, customPrice } : p)
    );
  };

  const removeProductFromInvoice = (productId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{position: 'fixed'}}>
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-6xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Créer une Facture</h2>
              <p className="text-sm text-gray-600">
                {selectedClient ? `Pour ${selectedClient.name}` : 'Sélectionnez un client'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Sélection client */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Client</h3>
                  
                  {!client && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sélectionner un Client
                      </label>
                      <select
                        value={selectedClientId}
                        onChange={(e) => handleClientChange(Number(e.target.value))}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                      >
                        <option value={0}>Choisir un client...</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} - {c.coachingProgram}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedClient && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-lg font-bold text-white">
                            {selectedClient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-bold text-gray-900">{selectedClient.name}</h4>
                          <p className="text-sm text-gray-600">{selectedClient.coachingProgram}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {selectedClient.email}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {selectedClient.phone}
                        </div>
                        {selectedClient.company && (
                          <div className="flex items-center text-gray-600">
                            <Building className="w-4 h-4 mr-2" />
                            {selectedClient.company}
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <User className="w-4 h-4 mr-2" />
                          Tarif: {selectedClient.billing.hourlyRate}€/h
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails de la Facture</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Numéro de Facture
                      </label>
                      <input
                        type="text"
                        value={generateInvoiceNumber()}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date d'Échéance
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Séances */}
              {selectedClient && clientSessions.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Séances Réalisées</h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="space-y-2">
                      {clientSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => toggleSession(session.id)}
                              className="mr-3 text-blue-600 hover:text-blue-800"
                            >
                              {selectedSessions.includes(session.id) ? (
                                <CheckSquare className="w-5 h-5" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Séance {session.type} - {new Date(session.date).toLocaleDateString('fr-FR')}
                              </p>
                              <p className="text-xs text-gray-500">{session.duration} minutes</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {selectedClient.billing.hourlyRate}€
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Produits et services */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Produits et Services</h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Produit
                  </button>
                </div>

                {/* Formulaire nouveau produit */}
                {isAddingProduct && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Créer un Nouveau Produit</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit</label>
                        <input
                          type="text"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: Formation leadership avancé"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prix unitaire (€)</label>
                        <input
                          type="number"
                          value={newProduct.unitPrice}
                          onChange={(e) => setNewProduct({...newProduct, unitPrice: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="Coaching">Coaching</option>
                          <option value="Formation">Formation</option>
                          <option value="Bilan">Bilan</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input
                          type="text"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Description du produit"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3 mt-4">
                      <button
                        type="button"
                        onClick={addProduct}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        Ajouter le Produit
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingProduct(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* Liste des produits disponibles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {getAllProducts().map((product) => (
                    <div key={product.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900">{product.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{product.description}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{product.category}</span>
                            <span className="text-sm font-semibold text-gray-900 ml-2">{product.unitPrice}€</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addProductToInvoice(product.id)}
                          disabled={selectedProducts.some(p => p.productId === product.id)}
                          className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {selectedProducts.some(p => p.productId === product.id) ? 'Ajouté' : 'Ajouter'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Produits sélectionnés pour la facture */}
                {selectedProducts.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Produits sur la Facture</h4>
                    <div className="space-y-3">
                      {selectedProducts.map((item) => {
                        const product = getAllProducts().find(p => p.id === item.productId);
                        if (!product) return null;
                        
                        const currentPrice = item.customPrice !== undefined ? item.customPrice : product.unitPrice;
                        
                        return (
                          <div key={item.productId} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                              <div className="md:col-span-2">
                                <h5 className="text-sm font-semibold text-gray-900">{product.name}</h5>
                                <p className="text-xs text-gray-600">{product.description}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Quantité</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateProductQuantity(item.productId, parseInt(e.target.value) || 1)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Prix unitaire (€)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={currentPrice}
                                  onChange={(e) => updateProductPrice(item.productId, parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900">
                                  {(currentPrice * item.quantity).toLocaleString('fr-FR')}€
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeProductFromInvoice(item.productId)}
                                  className="p-1 text-red-400 hover:text-red-600 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calculator className="w-6 h-6 text-blue-600 mr-3" />
                    <span className="text-xl font-bold text-gray-900">Total de la Facture</span>
                  </div>
                  <span className="text-3xl font-bold text-blue-700">
                    {calculateTotal().toLocaleString('fr-FR')}€
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium resize-none"
                  placeholder="Notes additionnelles pour la facture..."
                />
              </div>
            </form>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedClient || (selectedSessions.length === 0 && selectedProducts.length === 0)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5 mr-2" />
              Créer la Facture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;