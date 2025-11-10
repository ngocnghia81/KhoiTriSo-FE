'use client';

import { useState } from 'react';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import StatsCard from '@/components/dashboard/StatsCard';
import Chart from '@/components/dashboard/Chart';
import {
  UsersIcon,
  UserGroupIcon,
  UserPlusIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function UserAnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const { data, loading, error } = useUserAnalytics(period);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">Error loading analytics</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive user statistics and insights</p>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            name="Total Users"
            value={data.TotalUsers.toLocaleString()}
            change={`${data.UserGrowthRate > 0 ? '+' : ''}${data.UserGrowthRate}%`}
            changeType={data.UserGrowthRate >= 0 ? 'increase' : 'decrease'}
            icon={UsersIcon}
            color="blue"
            description="All registered users"
          />
          <StatsCard
            name="Active Users"
            value={data.ActiveUsers.toLocaleString()}
            change={`${((data.ActiveUsers / data.TotalUsers) * 100).toFixed(1)}%`}
            changeType="increase"
            icon={UserGroupIcon}
            color="green"
            description="Active in last 30 days"
          />
          <StatsCard
            name="New Users"
            value={data.NewUsersThisPeriod.toLocaleString()}
            change={`${data.UserGrowthRate > 0 ? '+' : ''}${data.UserGrowthRate}%`}
            changeType={data.UserGrowthRate >= 0 ? 'increase' : 'decrease'}
            icon={UserPlusIcon}
            color="purple"
            description={`New in last ${period === '7d' ? '7' : period === '30d' ? '30' : '90'} days`}
          />
          <StatsCard
            name="Email Verified"
            value={`${data.EmailVerificationStats.VerificationRate.toFixed(1)}%`}
            change={`${data.EmailVerificationStats.Verified} verified`}
            changeType="increase"
            icon={CheckCircleIcon}
            color="indigo"
            description="Verification rate"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Registration Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trend</h3>
            {data.RegistrationTrend.length > 0 ? (
              <Chart
                data={data.RegistrationTrend as any}
                type="area"
                xKey="Date"
                yKey="Amount"
                color="#3b82f6"
                height={250}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>

          {/* Activity Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Trend</h3>
            {data.ActivityTrend.length > 0 ? (
              <Chart
                data={data.ActivityTrend as any}
                type="line"
                xKey="Date"
                yKey="Amount"
                color="#10b981"
                height={250}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Role Distribution & Auth Providers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Role Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                  <span className="text-gray-700">Students</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {data.RoleDistribution.Students.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
                  <span className="text-gray-700">Instructors</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {data.RoleDistribution.Instructors.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                  <span className="text-gray-700">Admins</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {data.RoleDistribution.Admins.toLocaleString()}
                </span>
              </div>
            </div>
            
            {/* Visual Bar */}
            <div className="mt-6 h-4 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500"
                style={{
                  width: `${(data.RoleDistribution.Students / data.TotalUsers) * 100}%`,
                }}
              ></div>
              <div
                className="bg-purple-500"
                style={{
                  width: `${(data.RoleDistribution.Instructors / data.TotalUsers) * 100}%`,
                }}
              ></div>
              <div
                className="bg-red-500"
                style={{
                  width: `${(data.RoleDistribution.Admins / data.TotalUsers) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Auth Providers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Providers</h3>
            <div className="space-y-3">
              {data.AuthProviderStats.map((provider, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="text-gray-700 font-medium">{provider.Provider}</span>
                    <div className="ml-4 flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${provider.Percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="font-semibold text-gray-900">{provider.Count}</span>
                    <span className="text-gray-500 text-sm ml-2">({provider.Percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gender & Age Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gender Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Male</span>
                <span className="font-semibold text-gray-900">{data.GenderDistribution.Male}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Female</span>
                <span className="font-semibold text-gray-900">{data.GenderDistribution.Female}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Other</span>
                <span className="font-semibold text-gray-900">{data.GenderDistribution.Other}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Not Specified</span>
                <span className="font-semibold text-gray-900">{data.GenderDistribution.NotSpecified}</span>
              </div>
            </div>
          </div>

          {/* Age Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
            <div className="space-y-3">
              {data.AgeGroupStats.map((group, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="text-gray-700 font-medium w-20">{group.AgeGroup}</span>
                    <div className="ml-4 flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${group.Percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="font-semibold text-gray-900">{group.Count}</span>
                    <span className="text-gray-500 text-sm ml-2">({group.Percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Active Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Active Users</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.TopActiveUsers.map((user) => (
                  <tr key={user.UserId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.Avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.Avatar}
                              alt={user.FullName || user.Username}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {(user.FullName || user.Username).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.FullName || user.Username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.Username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.ActivityCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.LastActiveAt
                        ? new Date(user.LastActiveAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Email Verification Stats */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Verification Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {data.EmailVerificationStats.Verified}
              </div>
              <div className="text-sm text-gray-500">Verified</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {data.EmailVerificationStats.Unverified}
              </div>
              <div className="text-sm text-gray-500">Unverified</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {data.EmailVerificationStats.VerificationRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Verification Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
