'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import {
  VideoCameraIcon,
  ServerIcon,
  SignalIcon,
  ChartBarIcon,
  PlayIcon,
  CloudIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface StreamingSettings {
  Provider: string;
  ApiKey: string;
  ApiSecret: string;
  StreamingUrl: string;
  CdnUrl: string;
  EnableAdaptiveBitrate: boolean;
  EnableDrmProtection: boolean;
  EnableWatermark: boolean;
  WatermarkText: string;
  MaxBitrate: number;
  MinBitrate: number;
  DefaultQuality: string;
  EnableAutoPlay: boolean;
  EnableDownload: boolean;
  BufferSize: number;
}

interface StreamingStats {
  TotalVideos: number;
  TotalBandwidth: number;
  ActiveStreams: number;
  TotalViews: number;
  AverageWatchTime: number;
  StorageUsed: string;
  VideoProcessingQueue: number;
}

interface StreamingServer {
  Id: number;
  Name: string;
  Region: string;
  Status: string;
  Load: number;
  Bandwidth: number;
  ActiveConnections: number;
}

export default function StreamingPage() {
  const { t } = useTranslation();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState<StreamingSettings | null>(null);
  const [stats, setStats] = useState<StreamingStats | null>(null);
  const [servers, setServers] = useState<StreamingServer[]>([]);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    loadStreamingData();
  }, []);

  const loadStreamingData = async () => {
    try {
      setLoading(true);
      const resp = await authenticatedFetch('/api/streaming');
      const data = await resp.json();
      
      if (resp.ok && data.Result) {
        setSettings(data.Result.Settings);
        setStats(data.Result.Stats);
        setServers(data.Result.Servers);
      }
    } catch (err) {
      console.error('Error loading streaming data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      const resp = await authenticatedFetch('/api/streaming/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (resp.ok) {
        alert(t.common.success);
      }
    } catch (err) {
      alert(t.error.somethingWrong);
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      const resp = await authenticatedFetch('/api/streaming/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ VideoUrl: 'https://test.video' })
      });
      
      const data = await resp.json();
      
      if (resp.ok && data.Result) {
        alert(`Test successful!\nLatency: ${data.Result.latency}ms\nBandwidth: ${data.Result.bandwidth}Mbps`);
      }
    } catch (err) {
      alert('Test failed');
    } finally {
      setTesting(false);
    }
  };

  const updateSetting = (key: keyof StreamingSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const formatBandwidth = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(2)} GB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getServerStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 80) return 'bg-red-500';
    if (load >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
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
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t.settings.streaming}</h1>
          <p className="mt-2 text-sm text-gray-700">Configure video streaming and CDN settings</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={testConnection}
            disabled={testing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? t.common.loading : t.common.save}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <VideoCameraIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Videos</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.TotalVideos.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <SignalIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Streams</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.ActiveStreams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900">{(stats.TotalViews / 1000).toFixed(1)}K</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                <CloudIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bandwidth</p>
                <p className="text-2xl font-semibold text-gray-900">{formatBandwidth(stats.TotalBandwidth)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('servers')}
            className={`${
              activeTab === 'servers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Servers
          </button>
        </nav>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* Provider Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                  <select
                    value={settings.Provider}
                    onChange={(e) => updateSetting('Provider', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="cloudflare">Cloudflare Stream</option>
                    <option value="aws">AWS MediaConvert</option>
                    <option value="azure">Azure Media Services</option>
                    <option value="custom">Custom Server</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Quality</label>
                  <select
                    value={settings.DefaultQuality}
                    onChange={(e) => updateSetting('DefaultQuality', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="360p">360p</option>
                    <option value="480p">480p</option>
                    <option value="720p">720p (HD)</option>
                    <option value="1080p">1080p (Full HD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <input
                    type="password"
                    value={settings.ApiKey}
                    onChange={(e) => updateSetting('ApiKey', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Secret</label>
                  <input
                    type="password"
                    value={settings.ApiSecret}
                    onChange={(e) => updateSetting('ApiSecret', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Streaming URL</label>
                  <input
                    type="url"
                    value={settings.StreamingUrl}
                    onChange={(e) => updateSetting('StreamingUrl', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CDN URL</label>
                  <input
                    type="url"
                    value={settings.CdnUrl}
                    onChange={(e) => updateSetting('CdnUrl', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Quality Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quality & Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Bitrate (kbps)</label>
                  <input
                    type="number"
                    value={settings.MaxBitrate}
                    onChange={(e) => updateSetting('MaxBitrate', parseInt(e.target.value))}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Bitrate (kbps)</label>
                  <input
                    type="number"
                    value={settings.MinBitrate}
                    onChange={(e) => updateSetting('MinBitrate', parseInt(e.target.value))}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Size (seconds)</label>
                  <input
                    type="number"
                    value={settings.BufferSize}
                    onChange={(e) => updateSetting('BufferSize', parseInt(e.target.value))}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.EnableAdaptiveBitrate}
                    onChange={(e) => updateSetting('EnableAdaptiveBitrate', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Adaptive Bitrate Streaming</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.EnableDrmProtection}
                    onChange={(e) => updateSetting('EnableDrmProtection', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable DRM Protection</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.EnableWatermark}
                    onChange={(e) => updateSetting('EnableWatermark', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Watermark</span>
                </label>

                {settings.EnableWatermark && (
                  <div className="ml-6">
                    <input
                      type="text"
                      value={settings.WatermarkText}
                      onChange={(e) => updateSetting('WatermarkText', e.target.value)}
                      placeholder="Watermark text"
                      className="w-full md:w-1/2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.EnableAutoPlay}
                    onChange={(e) => updateSetting('EnableAutoPlay', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Auto Play</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.EnableDownload}
                    onChange={(e) => updateSetting('EnableDownload', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow Video Download</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Servers Tab */}
      {activeTab === 'servers' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Streaming Servers</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {servers.map((server) => (
              <div key={server.Id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <ServerIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{server.Name}</h4>
                        <p className="text-sm text-gray-500">{server.Region}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getServerStatusColor(server.Status)}`}>
                          {server.Status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Load</p>
                        <div className="flex items-center mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${getLoadColor(server.Load)}`}
                              style={{ width: `${server.Load}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{server.Load}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Bandwidth</p>
                        <p className="text-sm font-medium text-gray-900">{(server.Bandwidth / 1000000).toFixed(1)} MB/s</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Connections</p>
                        <p className="text-sm font-medium text-gray-900">{server.ActiveConnections}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {server.Status === 'online' ? (
                      <CheckCircleIcon className="h-8 w-8 text-green-500" />
                    ) : server.Status === 'maintenance' ? (
                      <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
                    ) : (
                      <XCircleIcon className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
