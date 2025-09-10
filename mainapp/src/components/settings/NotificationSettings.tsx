import { useState, useEffect } from 'react';
import { MdNotificationsNone } from 'react-icons/md';
import { apiService, type NotificationSettings as NotificationSettingsType } from '../../services/api';

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getNotificationSettings();
      
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        setError(response.message || 'Failed to load notification settings');
      }
    } catch (err) {
      setError('Failed to load notification settings');
      console.error('Error loading notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (settingName: keyof NotificationSettingsType) => {
    if (settings && typeof settings[settingName] === 'boolean') {
      setSaving(true);
      setSettings(prev => prev ? {
        ...prev,
        [settingName]: !prev[settingName as keyof NotificationSettingsType]
      } : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await apiService.updateNotificationSettings({
        shipmentUpdates: settings.shipmentUpdates,
        deliveryAlerts: settings.deliveryAlerts,
        delayNotifications: settings.delayNotifications,
        marketingNotifications: settings.marketingNotifications,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        pushNotifications: settings.pushNotifications
      });
      
      if (response.success) {
        setSuccessMessage('Notification settings updated successfully!');
        if (response.data) {
          setSettings(response.data);
        }
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to update notification settings');
      }
    } catch (err) {
      setError('Failed to update notification settings');
      console.error('Error updating notification settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <MdNotificationsNone className="text-xl" />
          <h2 className="text-lg font-semibold">Notification Settings</h2>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2 text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <MdNotificationsNone className="text-xl" />
          <h2 className="text-lg font-semibold">Notification Settings</h2>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">Failed to load notification settings</p>
          <button 
            onClick={loadNotificationSettings}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <MdNotificationsNone className="text-xl" />
        <h2 className="text-lg font-semibold">Notification Settings</h2>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-0">
        <div className="space-y-0">
          {/* Shipment Updates */}
          <div className="border-b border-gray-200 py-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">Shipment Updates</h3>
              <p className="text-sm text-gray-500 mt-1">Receive updates when your shipment status changes.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.shipmentUpdates}
                onChange={() => handleToggle('shipmentUpdates')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Delivery Alerts */}
          <div className="border-b border-gray-200 py-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">Delivery Alerts</h3>
              <p className="text-sm text-gray-500 mt-1">Get a notification once your package is delivered.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.deliveryAlerts}
                onChange={() => handleToggle('deliveryAlerts')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Delay Notifications */}
          <div className="border-b border-gray-200 py-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">Delay Notifications</h3>
              <p className="text-sm text-gray-500 mt-1">Be alerted if there is a delay with your shipment.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.delayNotifications}
                onChange={() => handleToggle('delayNotifications')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Marketing & Promotions */}
          <div className="py-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">Marketing & Promotions</h3>
              <p className="text-sm text-gray-500 mt-1">Updates on latest deals and info</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.marketingNotifications}
                onChange={() => handleToggle('marketingNotifications')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}