import React from 'react';
import { Shield, ArrowLeft, Home } from 'lucide-react';

const AccessDeniedPage: React.FC = () => {
  return (
    <div className="bg-white min-h-0 flex items-center justify-center">
      <div className="text-center px-4 py-12">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Accès Refusé</h1>
        
        <p className="text-lg text-gray-600 mb-2">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          Cette section est réservée aux administrateurs. Contactez votre administrateur si vous pensez que c'est une erreur.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Home className="w-4 h-4 mr-2" />
            Accueil
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Permissions requises</h3>
          <p className="text-xs text-blue-800">
            Cette page nécessite des privilèges d'administrateur pour être consultée.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;