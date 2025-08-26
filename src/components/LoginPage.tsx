import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (role: 'ADMIN' | 'COACH') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@coachcrm.com');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'COACH'>('ADMIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CoachCRM</h1>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle de démonstration
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as 'ADMIN' | 'COACH')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ADMIN">Administrateur</option>
              <option value="COACH">Coach</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold"
          >
            Se connecter
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Compte de démonstration :</p>
          <p>Email: admin@coachcrm.com</p>
          <p>Mot de passe: admin123</p>
          <p className="mt-2 text-blue-600 font-medium">
            Choisissez "Administrateur" ou "Coach" pour tester les différentes interfaces
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;