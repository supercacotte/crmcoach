import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Database, Mail, Phone, MapPin, Save, Moon, Sun, Maximize, Minimize } from 'lucide-react';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  density: 'comfortable' | 'compact';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onDensityChange: (density: 'comfortable' | 'compact') => void;
  currentUser: User;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  theme,
  density,
  onThemeChange,
  onDensityChange,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: '+33 6 12 34 56 78',
    company: 'CoachCRM',
    address: '123 Business St, Paris, France',
    bio: 'Coach expérimenté aidant les clients à atteindre leurs objectifs.'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    clientUpdates: true,
    meetingReminders: true,
    weeklyReports: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90'
  });

  const [dataSettings, setDataSettings] = useState({
    dataRetention: '5years'
  });

  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'profile', label: 'Profil', icon: User },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'appearance', label: 'Apparence', icon: Palette },
    ];

    if (currentUser.role === 'admin') {
      return [
        ...baseTabs,
        { id: 'security', label: 'Sécurité', icon: Shield },
        { id: 'data', label: 'Données', icon: Database }
      ];
    }

    return baseTabs;
  };

  const tabs = getAvailableTabs();

  const handleProfileChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings({ ...notificationSettings, [setting]: value });
  };

  const handleSecurityChange = (setting: string, value: string | boolean) => {
    setSecuritySettings({ ...securitySettings, [setting]: value });
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Personnelles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nom Complet
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Téléphone
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entreprise
            </label>
            <input
              type="text"
              value={profileData.company}
              onChange={(e) => handleProfileChange('company', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Adresse
          </label>
          <input
            type="text"
            value={profileData.address}
            onChange={(e) => handleProfileChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleProfileChange('bio', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        
        {/* Informations de rôle (lecture seule) */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Informations de Compte</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Rôle:</span>
              <span className="ml-2 text-blue-800">
                {currentUser.role === 'admin' ? 'Administrateur' : 'Coach'}
              </span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Membre depuis:</span>
              <span className="ml-2 text-blue-800">
                {new Date(currentUser.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
          {currentUser.specialties.length > 0 && (
            <div className="mt-2">
              <span className="text-blue-700 font-medium text-sm">Spécialités:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentUser.specialties.map((specialty, index) => (
                  <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences de Notification</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Notifications Email', description: 'Recevoir les notifications par email' },
            { key: 'pushNotifications', label: 'Notifications Push', description: 'Recevoir les notifications dans le navigateur' },
            { key: 'clientUpdates', label: 'Mises à jour Clients', description: 'Être notifié des changements clients' },
            { key: 'meetingReminders', label: 'Rappels de Rendez-vous', description: 'Recevoir des rappels avant les rendez-vous' },
            ...(currentUser.role === 'admin' ? [
              { key: 'weeklyReports', label: 'Rapports Hebdomadaires', description: 'Recevoir un résumé d\'activité hebdomadaire' }
            ] : [])
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{setting.label}</h4>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                  onChange={(e) => handleNotificationChange(setting.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de Sécurité</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Authentification à Deux Facteurs</h4>
                <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration de Session (minutes)
              </label>
              <select
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 heure</option>
                <option value="120">2 heures</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Mot de Passe (jours)
              </label>
              <select
                value={securitySettings.passwordExpiry}
                onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="30">30 jours</option>
                <option value="60">60 jours</option>
                <option value="90">90 jours</option>
                <option value="never">Jamais</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres d'Apparence</h3>
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Thème</h4>
            <p className="text-sm text-gray-500 mb-4">Choisissez votre thème préféré</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onThemeChange('light')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  theme === 'light' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                <span className="text-sm font-medium">Clair</span>
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  theme === 'dark' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Moon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm font-medium">Sombre</span>
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Densité</h4>
            <p className="text-sm text-gray-500 mb-4">Choisissez la compacité de l'interface</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onDensityChange('comfortable')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  density === 'comfortable' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Maximize className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm font-medium">Confortable</span>
              </button>
              <button
                onClick={() => onDensityChange('compact')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  density === 'compact' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Minimize className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm font-medium">Compact</span>
              </button>
            </div>
          </div>
          
          {/* Preview */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Aperçu</h4>
            <p className="text-sm text-blue-700">
              Thème: <span className="font-semibold">{theme === 'light' ? 'Clair' : 'Sombre'}</span> | 
              Densité: <span className="font-semibold">{density === 'comfortable' ? 'Confortable' : 'Compact'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Données & Confidentialité</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Export des Données</h4>
            <p className="text-sm text-gray-500 mb-3">Télécharger une copie de vos données</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Exporter les Données
            </button>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Rétention des Données</h4>
            <p className="text-sm text-gray-500 mb-3">Durée de conservation de vos données</p>
            <select 
              value={dataSettings.dataRetention}
              onChange={(e) => setDataSettings({...dataSettings, dataRetention: e.target.value})}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1year">1 An</option>
              <option value="2years">2 Ans</option>
              <option value="5years">5 Ans</option>
              <option value="forever">Toujours</option>
            </select>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="text-sm font-medium text-red-900 mb-2">Zone de Danger</h4>
            <p className="text-sm text-red-700 mb-3">Supprimer définitivement votre compte et toutes les données</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
              Supprimer le Compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'security': return currentUser.role === 'ADMIN' ? renderSecurityTab() : renderProfileTab();
      case 'appearance': return renderAppearanceTab();
      case 'data': return currentUser.role === 'ADMIN' ? renderDataTab() : renderProfileTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="bg-white flex flex-col lg:flex-row min-h-0">
      {/* Mobile Tab Navigation */}
      <div className="lg:hidden border-b border-gray-200">
        <div className="table-scroll">
          <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 border-r border-gray-200 bg-gray-50">
        <div className="p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Paramètres</h2>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-6 overflow-y-auto flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-4xl">
            {renderTabContent()}
          </div>
        </div>
        
        {/* Save Button */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <button className="w-full lg:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center font-semibold">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder les Modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;