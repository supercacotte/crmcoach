import React, { useState } from 'react';
import { X, User, Building, Mail, Phone, Tag, DollarSign, Euro, UserCheck } from 'lucide-react';
import { Client } from '../types/Client';
import { User as UserType } from '../types/User';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: Client) => void;
  staff?: UserType[];
  currentUser: UserType;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onAddClient, staff = [], currentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'active' as 'active' | 'paused' | 'completed',
    tags: '',
    coachingProgram: '',
    goals: '',
    assignedCoachId: currentUser.id,
    hourlyRate: '150',
    packagePrice: '',
    paymentMethod: 'package' as 'monthly' | 'per_session' | 'package',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newClient: Client = {
      id: Date.now(), // Simple ID generation
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      status: formData.status,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      lastContact: 'Just added',
      starred: false,
      coachingProgram: formData.coachingProgram,
      startDate: new Date().toISOString().split('T')[0],
      sessionsCompleted: 0,
      totalSessions: 12,
      goals: formData.goals ? formData.goals.split(',').map(goal => goal.trim()).filter(goal => goal) : [],
      progress: 'Nouveau client',
      value: 0,
      assignedCoachId: formData.assignedCoachId,
      billing: {
        hourlyRate: parseInt(formData.hourlyRate) || 150,
        packagePrice: formData.packagePrice ? parseInt(formData.packagePrice) : undefined,
        paymentMethod: formData.paymentMethod,
        invoices: [],
        totalPaid: 0,
        totalDue: 0
      }
    };

    onAddClient(newClient);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'active',
      tags: '',
      coachingProgram: '',
      goals: '',
      assignedCoachId: currentUser.id,
      hourlyRate: '150',
      packagePrice: '',
      paymentMethod: 'package',
    });
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Add New Client</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
              placeholder="Enter client's full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
              placeholder="client@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
              placeholder="Company name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Programme de Coaching
            </label>
            <input
              type="text"
              name="coachingProgram"
              value={formData.coachingProgram}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
              placeholder="Ex: Leadership & Confiance - 12 séances"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <UserCheck className="w-4 h-4 inline mr-2" />
              Coach Assigné
            </label>
            <select
              name="assignedCoachId"
              value={formData.assignedCoachId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
            >
              {staff.filter(s => s.role === 'coach' || s.role === 'admin').map(coach => (
                <option key={coach.id} value={coach.id}>
                  {coach.name} ({coach.role === 'admin' ? 'Administrateur' : 'Coach'})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
            >
              <option value="active">Actif</option>
              <option value="paused">En pause</option>
              <option value="completed">Terminé</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Objectifs
            </label>
            <input
              type="text"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
              placeholder="Leadership, Communication, Confiance (séparés par des virgules)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
              placeholder="VIP, Prioritaire, Urgent (séparés par des virgules)"
            />
          </div>
          
          {/* Section Facturation */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de Facturation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Tarif Horaire (€)
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                  placeholder="150"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mode de Paiement
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                >
                  <option value="package">Forfait</option>
                  <option value="monthly">Mensuel</option>
                  <option value="per_session">Par séance</option>
                </select>
              </div>
            </div>
            
            {formData.paymentMethod === 'package' && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Euro className="w-4 h-4 inline mr-2" />
                  Prix du Forfait (€)
                </label>
                <input
                  type="number"
                  name="packagePrice"
                  value={formData.packagePrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                  placeholder="1800"
                />
              </div>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;