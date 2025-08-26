import React, { useState } from 'react';
import { X, User, Mail, Phone, Target, DollarSign, Clock, MapPin } from 'lucide-react';

interface AddProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProspect: (prospect: any) => void;
}

const AddProspectModal: React.FC<AddProspectModalProps> = ({ isOpen, onClose, onAddProspect }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'lead' as 'lead' | 'contacted' | 'meeting_scheduled' | 'proposal_sent' | 'negotiation' | 'closed_won' | 'closed_lost',
    tags: '',
    coachingGoals: '',
    budget: '',
    timeline: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProspect = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      source: formData.source,
      status: formData.status,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      lastContact: 'Ajouté maintenant',
      starred: false,
      coachingGoals: formData.coachingGoals,
      budget: formData.budget,
      timeline: formData.timeline,
      notes: formData.notes,
    };

    onAddProspect(newProspect);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      source: '',
      status: 'lead',
      tags: '',
      coachingGoals: '',
      budget: '',
      timeline: '',
      notes: '',
    });
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Nouveau Prospect</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nom Complet
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                  placeholder="Nom et prénom"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                  placeholder="email@exemple.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Source
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                >
                  <option value="">Sélectionner une source</option>
                  <option value="Site web">Site web</option>
                  <option value="Recommandation">Recommandation</option>
                  <option value="Réseaux sociaux">Réseaux sociaux</option>
                  <option value="Événement">Événement</option>
                  <option value="Publicité">Publicité</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          </div>

          {/* Informations coaching */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Coaching</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  Objectifs de Coaching
                </label>
                <textarea
                  name="coachingGoals"
                  value={formData.coachingGoals}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium resize-none"
                  placeholder="Quels sont les objectifs du prospect en matière de coaching ?"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Budget Mensuel
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                  >
                    <option value="">Budget non défini</option>
                    <option value="50-100€/mois">50-100€/mois</option>
                    <option value="100-150€/mois">100-150€/mois</option>
                    <option value="150-200€/mois">150-200€/mois</option>
                    <option value="200-300€/mois">200-300€/mois</option>
                    <option value="300€+/mois">300€+/mois</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Durée Souhaitée
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                  >
                    <option value="">Durée non définie</option>
                    <option value="1-2 mois">1-2 mois</option>
                    <option value="3-4 mois">3-4 mois</option>
                    <option value="6 mois">6 mois</option>
                    <option value="1 an">1 an</option>
                    <option value="Suivi long terme">Suivi long terme</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Statut et tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                >
                  <option value="lead">Prospect</option>
                  <option value="contacted">Contacté</option>
                  <option value="meeting_scheduled">RDV Planifié</option>
                  <option value="proposal_sent">Proposition Envoyée</option>
                  <option value="negotiation">Négociation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                  placeholder="Confiance, Carrière, Stress (séparés par des virgules)"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium resize-none"
              placeholder="Notes additionnelles sur le prospect..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              Ajouter le Prospect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProspectModal;