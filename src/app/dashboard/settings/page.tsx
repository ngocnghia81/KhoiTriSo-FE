'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ServerIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

interface SystemSetting {
  Key: string;
  Value: string;
  Type: number;
  IsPublic: boolean;
}

interface SystemHealth {
  Status: string;
  Timestamp: string;
  Services: Record<string, string>;
  Version: string;
  Uptime: number;
}

interface SystemStats {
  TotalUsers: number;
  TotalCourses: number;
  TotalBooks: number;
  TotalLearningPaths: number;
  TotalOrders: number;
  SystemUptime: number;
  StorageUsed: string;
  LastBackup: string | null;
  ActiveUsers24h: number;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadHealth();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const resp = await authenticatedFetch('/api/system/settings');
      const data = await resp.json();
      
      if (resp.ok && data.Result) {
        const settingsMap: Record<string, string> = {};
        data.Result.Settings.forEach((s: SystemSetting) => {
          settingsMap[s.Key] = s.Value;
        });
        setSettings(settingsMap);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHealth = async () => {
    try {
      const resp = await authenticatedFetch('/api/system/health');
      const data = await resp.json();
      if (resp.ok && data.Result) {
        setHealth(data.Result);
      }
    } catch (err) {
      console.error('Error loading health:', err);
    }
  };

  const loadStats = async () => {
    try {
      const resp = await authenticatedFetch('/api/system/stats');
      const data = await resp.json();
      if (resp.ok && data.Result) {
        setStats(data.Result);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        Key: key,
        Value: value
      }));
      
      const resp = await authenticatedFetch('/api/system/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Settings: settingsArray })
      });
      
      const data = await resp.json();
      
      if (resp.ok) {
        alert(t.common.success);
      } else {
        setError(data?.Message || t.error.somethingWrong);
      }
    } catch (err) {
      setError(t.error.somethingWrong);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">{t.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">{t.settings.title}</h1>
          <p className="mt-2 text-sm text-gray-700">{t.settings.subtitle}</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200 disabled:opacity-50"
          >
            {saving ? t.common.loading : t.common.save}
          </button>
        </div>
      </div>

      {/* System Health & Stats Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        {/* Health Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.settings.health}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {health?.Status === 'healthy' ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-6 w-6 mr-2" />
                    Healthy
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <XCircleIcon className="h-6 w-6 mr-2" />
                    Unhealthy
                  </span>
                )}
              </p>
            </div>
            <ServerIcon className="h-12 w-12 text-gray-400" />
          </div>
          {health && (
            <div className="mt-4 space-y-2">
              {Object.entries(health.Services).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">{service}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.settings.stats}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {stats?.TotalUsers || 0}
              </p>
              <p className="text-sm text-gray-500">{t.common.total} Users</p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-gray-400" />
          </div>
          {stats && (
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Courses</p>
                <p className="text-lg font-semibold">{stats.TotalCourses}</p>
              </div>
              <div>
                <p className="text-gray-600">Books</p>
                <p className="text-lg font-semibold">{stats.TotalBooks}</p>
              </div>
            </div>
          )}
        </div>

        {/* System Uptime */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {stats ? formatUptime(stats.SystemUptime) : '-'}
              </p>
            </div>
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400" />
          </div>
          {stats && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Users (24h)</span>
                <span className="font-semibold">{stats.ActiveUsers24h}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Backup</span>
                <span className="font-semibold">
                  {stats.LastBackup ? new Date(stats.LastBackup).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full ${activeTab === 'general' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-900 hover:bg-gray-50'} group border-l-4 px-3 py-2 flex items-center text-sm font-medium`}
            >
              <Cog6ToothIcon className={`${activeTab === 'general' ? 'text-blue-500' : 'text-gray-400'} mr-3 flex-shrink-0 h-5 w-5`} />
              {t.settings.general}
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`w-full ${activeTab === 'company' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-900 hover:bg-gray-50'} group border-l-4 px-3 py-2 flex items-center text-sm font-medium`}
            >
              <BuildingOfficeIcon className={`${activeTab === 'company' ? 'text-blue-500' : 'text-gray-400'} mr-3 flex-shrink-0 h-5 w-5`} />
              Company Info
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full ${activeTab === 'security' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-900 hover:bg-gray-50'} group border-l-4 px-3 py-2 flex items-center text-sm font-medium`}
            >
              <ShieldCheckIcon className={`${activeTab === 'security' ? 'text-blue-500' : 'text-gray-400'} mr-3 flex-shrink-0 h-5 w-5`} />
              Security
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{t.settings.general}</h3>
                <p className="mt-1 text-sm text-gray-500">{t.settings.subtitle}</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="site-name" className="block text-sm font-medium text-gray-700">
                      {t.settings.siteName}
                    </label>
                    <input
                      type="text"
                      id="site-name"
                      value={settings['site_name'] || ''}
                      onChange={(e) => updateSetting('site_name', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                      {t.settings.timezone}
                    </label>
                    <select
                      id="timezone"
                      value={settings['timezone'] || 'Asia/Ho_Chi_Minh'}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
                      <option value="Asia/Bangkok">Thailand (UTC+7)</option>
                      <option value="Asia/Singapore">Singapore (UTC+8)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="site-description" className="block text-sm font-medium text-gray-700">
                    {t.settings.siteDescription}
                  </label>
                  <textarea
                    id="site-description"
                    rows={3}
                    value={settings['site_description'] || ''}
                    onChange={(e) => updateSetting('site_description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    {t.settings.language}
                  </label>
                  <select
                    id="language"
                    value={settings['default_language'] || 'vi'}
                    onChange={(e) => updateSetting('default_language', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Company Information */}
          {activeTab === 'company' && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
                <p className="mt-1 text-sm text-gray-500">Company contact and legal information</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company-name"
                      value={settings['company_name'] || ''}
                      onChange={(e) => updateSetting('company_name', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">
                      {t.settings.contactEmail}
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      value={settings['contact_email'] || ''}
                      onChange={(e) => updateSetting('contact_email', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                <p className="mt-1 text-sm text-gray-500">Configure security and access control</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      id="session-timeout"
                      value={settings['session_timeout'] || '60'}
                      onChange={(e) => updateSetting('session_timeout', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="max-login-attempts" className="block text-sm font-medium text-gray-700">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      id="max-login-attempts"
                      value={settings['max_login_attempts'] || '5'}
                      onChange={(e) => updateSetting('max_login_attempts', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => loadSettings()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? t.common.loading : t.common.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
