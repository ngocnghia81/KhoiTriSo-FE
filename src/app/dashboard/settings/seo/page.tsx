'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import {
  MagnifyingGlassIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface SeoSettings {
  SiteTitle: string;
  SiteDescription: string;
  SiteKeywords: string;
  GoogleAnalyticsId: string;
  GoogleSearchConsoleId: string;
  FacebookPixelId: string;
  EnableSitemap: boolean;
  EnableRobotsTxt: boolean;
  CanonicalUrl: string;
  OgImage: string;
  TwitterCard: string;
}

interface SeoAnalytics {
  TotalPages: number;
  IndexedPages: number;
  PagesWithIssues: number;
  AverageSeoScore: number;
  TotalBacklinks: number;
  OrganicTraffic: number;
}

interface SeoPage {
  Id: number;
  Url: string;
  Title: string;
  Description: string;
  Keywords: string;
  SeoScore: number;
  IsIndexed: boolean;
  Issues: string[];
}

export default function SeoPage() {
  const { t } = useTranslation();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SeoSettings | null>(null);
  const [analytics, setAnalytics] = useState<SeoAnalytics | null>(null);
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    loadSeoData();
  }, []);

  const loadSeoData = async () => {
    try {
      setLoading(true);
      const resp = await authenticatedFetch('/api/seo');
      const data = await resp.json();
      
      if (resp.ok && data.Result) {
        setSettings(data.Result.Settings);
        setAnalytics(data.Result.Analytics);
        setPages(data.Result.Pages);
      }
    } catch (err) {
      console.error('Error loading SEO data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      const resp = await authenticatedFetch('/api/seo/settings', {
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

  const updateSetting = (key: keyof SeoSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
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
          <h1 className="text-2xl font-semibold text-gray-900">{t.settings.seo}</h1>
          <p className="mt-2 text-sm text-gray-700">Optimize your site for search engines</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? t.common.loading : t.common.save}
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Pages</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.TotalPages}</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Indexed</p>
                <p className="text-2xl font-semibold text-green-600">{analytics.IndexedPages}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Issues</p>
                <p className="text-2xl font-semibold text-red-600">{analytics.PagesWithIssues}</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Avg Score</p>
                <p className={`text-2xl font-semibold ${getScoreColor(analytics.AverageSeoScore)}`}>
                  {analytics.AverageSeoScore.toFixed(1)}
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Backlinks</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.TotalBacklinks.toLocaleString()}</p>
              </div>
              <GlobeAltIcon className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Traffic</p>
                <p className="text-2xl font-semibold text-gray-900">{(analytics.OrganicTraffic / 1000).toFixed(1)}K</p>
              </div>
              <MagnifyingGlassIcon className="h-8 w-8 text-orange-400" />
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
            SEO Settings
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`${
              activeTab === 'pages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Page Analysis
          </button>
        </nav>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* Basic SEO */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic SEO</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
                  <input
                    type="text"
                    value={settings.SiteTitle}
                    onChange={(e) => updateSetting('SiteTitle', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <textarea
                    rows={3}
                    value={settings.SiteDescription}
                    onChange={(e) => updateSetting('SiteDescription', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={settings.SiteKeywords}
                    onChange={(e) => updateSetting('SiteKeywords', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
                  <input
                    type="url"
                    value={settings.CanonicalUrl}
                    onChange={(e) => updateSetting('CanonicalUrl', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Analytics & Tracking */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics & Tracking</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                  <input
                    type="text"
                    value={settings.GoogleAnalyticsId}
                    onChange={(e) => updateSetting('GoogleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Console ID</label>
                  <input
                    type="text"
                    value={settings.GoogleSearchConsoleId}
                    onChange={(e) => updateSetting('GoogleSearchConsoleId', e.target.value)}
                    placeholder="SC-XXXXXXXXXX"
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={settings.FacebookPixelId}
                    onChange={(e) => updateSetting('FacebookPixelId', e.target.value)}
                    placeholder="FB-XXXXXXXXXX"
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OG Image URL</label>
                  <input
                    type="url"
                    value={settings.OgImage}
                    onChange={(e) => updateSetting('OgImage', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter Card Type</label>
                  <select
                    value={settings.TwitterCard}
                    onChange={(e) => updateSetting('TwitterCard', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Options</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.EnableSitemap}
                    onChange={(e) => updateSetting('EnableSitemap', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable XML Sitemap</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.EnableRobotsTxt}
                    onChange={(e) => updateSetting('EnableRobotsTxt', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Robots.txt</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Indexed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issues</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pages.map((page) => (
                  <tr key={page.Id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{page.Url}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{page.Title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreBgColor(page.SeoScore)} ${getScoreColor(page.SeoScore)}`}>
                        {page.SeoScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {page.IsIndexed ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {page.Issues.length > 0 ? (
                        <div className="text-xs text-red-600">
                          {page.Issues.map((issue, idx) => (
                            <div key={idx}>• {issue}</div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-green-600">No issues</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
