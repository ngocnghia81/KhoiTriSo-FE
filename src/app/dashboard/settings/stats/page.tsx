'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import {
  UserGroupIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ShoppingCartIcon,
  ClockIcon,
  ServerIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

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

export default function StatsPage() {
  const { t } = useTranslation();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const resp = await authenticatedFetch('/api/system/stats');
      const data = await resp.json();
      
      if (resp.ok && data.Result) {
        setStats(data.Result);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
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

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.TotalUsers.toLocaleString(),
      icon: UserGroupIcon,
      color: 'blue',
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Total Courses',
      value: stats.TotalCourses.toLocaleString(),
      icon: BookOpenIcon,
      color: 'green',
      trend: '+8.2%',
      trendUp: true
    },
    {
      title: 'Total Books',
      value: stats.TotalBooks.toLocaleString(),
      icon: AcademicCapIcon,
      color: 'purple',
      trend: '+5.1%',
      trendUp: true
    },
    {
      title: 'Learning Paths',
      value: stats.TotalLearningPaths.toLocaleString(),
      icon: ChartBarIcon,
      color: 'orange',
      trend: '+3.4%',
      trendUp: true
    },
    {
      title: 'Total Orders',
      value: stats.TotalOrders.toLocaleString(),
      icon: ShoppingCartIcon,
      color: 'pink',
      trend: '+15.8%',
      trendUp: true
    },
    {
      title: 'Active Users (24h)',
      value: stats.ActiveUsers24h.toLocaleString(),
      icon: UserGroupIcon,
      color: 'indigo',
      trend: '-2.3%',
      trendUp: false
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600', icon: 'text-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'text-purple-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'text-orange-600' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600', icon: 'text-pink-600' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: 'text-indigo-600' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t.settings.stats}</h1>
          <p className="mt-2 text-sm text-gray-700">System statistics and metrics overview</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowTrendingUpIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const colors = getColorClasses(card.color);
          const Icon = card.icon;
          
          return (
            <div key={index} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                  <div className="mt-2 flex items-center">
                    {card.trendUp ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {card.trend}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last month</span>
                  </div>
                </div>
                <div className={`${colors.bg} rounded-lg p-3`}>
                  <Icon className={`h-8 w-8 ${colors.icon}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Uptime */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">System Information</h3>
            <ServerIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">System Uptime</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatUptime(stats.SystemUptime)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Storage Used</span>
              <span className="text-sm font-semibold text-gray-900">{stats.StorageUsed}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.LastBackup ? new Date(stats.LastBackup).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-600">Active Users (24h)</span>
              <span className="text-sm font-semibold text-green-600">{stats.ActiveUsers24h}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            <ClockIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Export Statistics</span>
                <span className="text-xs text-blue-600">CSV/Excel</span>
              </div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900">Generate Report</span>
                <span className="text-xs text-green-600">PDF</span>
              </div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-900">Schedule Report</span>
                <span className="text-xs text-purple-600">Email</span>
              </div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-900">View Detailed Analytics</span>
                <span className="text-xs text-orange-600">Dashboard</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">98.5%</div>
            <div className="text-sm text-gray-600 mt-1">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">1.2s</div>
            <div className="text-sm text-gray-600 mt-1">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">2.5M</div>
            <div className="text-sm text-gray-600 mt-1">API Calls/day</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">0.02%</div>
            <div className="text-sm text-gray-600 mt-1">Error Rate</div>
          </div>
        </div>
      </div>

      {/* Growth Chart Placeholder */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Overview</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Chart visualization will be displayed here</p>
            <p className="text-xs text-gray-400 mt-1">Integrate with Chart.js or Recharts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
