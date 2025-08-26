import React from 'react';
import { Search, ArrowLeft, Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-white min-h-0 flex items-center justify-center">
      <div className="text-center px-4 py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page non trouvée</h1>
        
        <p className="text-lg text-gray-600 mb-2">
          La page que vous recherchez n'existe pas.
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          Vérifiez l'URL ou utilisez la navigation pour accéder aux pages disponibles.
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
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Erreur 404</h3>
          <p className="text-xs text-gray-600">
            Cette page n'a pas été trouvée sur le serveur.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;