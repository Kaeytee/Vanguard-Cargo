import { useState, useEffect } from 'react';
import { FaGlobeAsia } from 'react-icons/fa';
import { usePreferences } from '../../context/PreferencesProvider';
import { type UserPreferences } from '../../services/api';

function PreferencesSettings() {
  const { 
    preferences, 
    loading: contextLoading, 
    updatePreferences,
    refreshPreferences 
  } = usePreferences();
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localPreferences, setLocalPreferences] = useState(preferences);

  // Update local state when context preferences change
  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (localPreferences) {
      setLocalPreferences((prev: UserPreferences | null) => prev ? { ...prev, language: e.target.value } : null);
    }
  };

  const handleUnitsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (localPreferences) {
      setLocalPreferences((prev: UserPreferences | null) => prev ? { ...prev, units: e.target.value as 'metric' | 'imperial' } : null);
    }
  };

  const handleAutoRefreshToggle = () => {
    if (localPreferences) {
      setLocalPreferences((prev: UserPreferences | null) => prev ? { ...prev, autoRefresh: !prev.autoRefresh } : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPreferences) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updatePreferences({
        language: localPreferences.language,
        units: localPreferences.units,
        autoRefresh: localPreferences.autoRefresh
      });
      
      setSuccessMessage('Preferences updated successfully!');
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to update preferences');
      console.error('Error updating preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  if (contextLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex text-xl font-semibold mb-2">
          <FaGlobeAsia className="text-2xl mr-3" />
          <h2>Preferences</h2>
        </div>
        <p className="text-gray-500 mb-6">Customize your app preferences</p>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading preferences...</span>
        </div>
      </div>
    );
  }

  if (!localPreferences) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex text-xl font-semibold mb-2">
          <FaGlobeAsia className="text-2xl mr-3" />
          <h2>Preferences</h2>
        </div>
        <p className="text-gray-500 mb-6">Customize your app preferences</p>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">Failed to load preferences</p>
          <button 
            onClick={refreshPreferences}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex text-xl font-semibold mb-2">
        <FaGlobeAsia className="text-2xl mr-3" />
        <h2>Preferences</h2>
      </div>
      <p className="text-gray-500 mb-6">Customize your app preferences</p>
      
      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Success State */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Setting */}
        <div>
          <label htmlFor="language" className="block text-md font-semibold mb-2">
            Language
          </label>
          <select
            id="language"
            value={localPreferences.language}
            onChange={handleLanguageChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Select your preferred language</p>
        </div>

        {/* Units Setting */}
        <div>
          <label htmlFor="units" className="block text-md font-semibold mb-2">
            Units
          </label>
          <select
            id="units"
            value={localPreferences.units}
            onChange={handleUnitsChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="metric">Metric (kg, cm, km)</option>
            <option value="imperial">Imperial (lbs, in, mi)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Choose measurement units for weight and distance</p>
        </div>

        {/* Auto Refresh Setting */}
        <div className="flex items-center justify-between py-3">
          <div>
            <h3 className="text-md font-semibold">Auto Refresh</h3>
            <p className="text-gray-500 text-sm">Automatically refresh shipment data</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={localPreferences.autoRefresh}
              onChange={handleAutoRefreshToggle}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-secondary hover:text-primary border-2 border-primary hover:border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}

export default PreferencesSettings;
