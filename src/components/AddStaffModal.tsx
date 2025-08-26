import React, { useState } from 'react';
import { X, User, Mail, Phone, Shield, Award } from 'lucide-react';
import { User as UserType, DEFAULT_PERMISSIONS } from '../types/User';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStaff: (user: UserType) => void;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onAddStaff }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'COACH' as 'ADMIN' | 'COACH',
    specialties: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: UserType = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
      isActive: true,
      createdAt: new Date().toISOString(),
      permissions: DEFAULT_PERMISSIONS[formData.role] || []
    };

    onAddStaff(newUser);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'coach',
      specialties: '',
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Ajouter un Membre</h2>
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
              <Shield className="w-4 h-4 inline mr-2" />
              Rôle
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
            >
              <option value="COACH">Coach</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Award className="w-4 h-4 inline mr-2" />
              Spécialités
            </label>
            <input
              type="text"
              name="specialties"
              value={formData.specialties}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
              placeholder="Leadership, Confiance, Stress (séparés par des virgules)"
            />
          </div>

          {/* Aperçu des permissions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Permissions accordées :</h4>
            <div className="space-y-1">
              {DEFAULT_PERMISSIONS[formData.role]?.slice(0, 4).map(permission => (
                <div key={permission.id} className="flex items-center text-xs text-gray-600">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                  {permission.name}
                </div>
              ))}
              {DEFAULT_PERMISSIONS[formData.role]?.length > 4 && (
                <div className="text-xs text-gray-500">
                  +{DEFAULT_PERMISSIONS[formData.role].length - 4} autres permissions
                </div>
              )}
            </div>
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
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;