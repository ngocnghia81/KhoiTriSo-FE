'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { forumApiService } from '@/services/forumApi';
import {
  ChartBarIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface AnalyticsData {
  totalQuestions: number;
  totalAnswers: number;
  totalComments: number;
  solvedQuestions: number;
  unsolvedQuestions: number;
  questionsLast7Days: number;
  questionsLast30Days: number;
  answersLast7Days: number;
  answersLast30Days: number;
  averageResponseTimeHours: number;
  topQuestionsByViews: Array<{
    id: string;
    title: string;
    views: number;
    votes: number;
    answers: number;
    createdAt: string;
  }>;
  topQuestionsByVotes: Array<{
    id: string;
    title: string;
    views: number;
    votes: number;
    answers: number;
    createdAt: string;
  }>;
  questionsByCategory: Array<{
    categoryId: string;
    count: number;
  }>;
  questionsTrend: Array<{
    date: string;
    count: number;
  }>;
  answersTrend: Array<{
    date: string;
    count: number;
  }>;
  filterUserId?: number;
}

export default function ForumAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // If instructor, only get their own analytics (userId will be filtered by backend)
      const userId = user?.role === 'instructor' || user?.role === 'teacher' ? parseInt(user.id || '0') : undefined;
      const analytics = await forumApiService.getAnalytics(userId);
      setData(analytics);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu thống kê');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} phút`;
    } else if (hours < 24) {
      return `${Math.round(hours)} giờ`;
    } else {
      return `${Math.round(hours / 24)} ngày`;
    }
  };

  const getTrendData = () => {
    if (!data) return { questions: [], answers: [] };
    
    const trend = timeRange === '7d' ? 
      data.questionsTrend.slice(-7) : 
      timeRange === '30d' ? 
      data.questionsTrend : 
      data.questionsTrend; // 90d uses all data
    
    const answersTrend = timeRange === '7d' ? 
      data.answersTrend.slice(-7) : 
      timeRange === '30d' ? 
      data.answersTrend : 
      data.answersTrend;
    
    return { questions: trend, answers: answersTrend };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không thể tải dữ liệu'}</p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { questions: questionsTrend, answers: answersTrend } = getTrendData();
  const solveRate = data.totalQuestions > 0 
    ? ((data.solvedQuestions / data.totalQuestions) * 100).toFixed(1) 
    : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Thống kê Diễn đàn</h1>
          <p className="mt-2 text-sm text-gray-600">
            {user?.role === 'admin' ? 'Tổng quan toàn bộ diễn đàn' : 'Thống kê câu hỏi và trả lời của bạn'}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Khoảng thời gian:</span>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === '7d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === '30d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              30 ngày
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === '90d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              90 ngày
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng câu hỏi</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalQuestions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {timeRange === '7d' ? `${data.questionsLast7Days} trong 7 ngày` :
                   timeRange === '30d' ? `${data.questionsLast30Days} trong 30 ngày` :
                   `${data.questionsLast30Days} trong 30 ngày`}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <QuestionMarkCircleIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng câu trả lời</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalAnswers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {timeRange === '7d' ? `${data.answersLast7Days} trong 7 ngày` :
                   timeRange === '30d' ? `${data.answersLast30Days} trong 30 ngày` :
                   `${data.answersLast30Days} trong 30 ngày`}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.solvedQuestions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Tỷ lệ: {solveRate}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thời gian phản hồi TB</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatTime(data.averageResponseTimeHours)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Từ câu hỏi đến câu trả lời đầu tiên
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ClockIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Questions Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng Câu hỏi</h3>
            <div className="h-64 flex items-end justify-between gap-1">
              {questionsTrend.length > 0 ? (
                questionsTrend.map((item, idx) => {
                  const maxCount = Math.max(...questionsTrend.map(t => t.count), 1);
                  const height = (item.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${height}%` }}
                        title={`${item.date}: ${item.count} câu hỏi`}
                      />
                      <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center text-gray-500 py-12">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>

          {/* Answers Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng Câu trả lời</h3>
            <div className="h-64 flex items-end justify-between gap-1">
              {answersTrend.length > 0 ? (
                answersTrend.map((item, idx) => {
                  const maxCount = Math.max(...answersTrend.map(t => t.count), 1);
                  const height = (item.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                        style={{ height: `${height}%` }}
                        title={`${item.date}: ${item.count} câu trả lời`}
                      />
                      <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center text-gray-500 py-12">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Questions by Views */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <EyeIcon className="h-5 w-5" />
              Câu hỏi nhiều lượt xem nhất
            </h3>
            <div className="space-y-3">
              {data.topQuestionsByViews.length > 0 ? (
                data.topQuestionsByViews.map((question, idx) => (
                  <Link
                    key={question.id}
                    href={`/dashboard/forum/questions/${question.id}`}
                    className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {idx + 1}. {question.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{question.views} lượt xem</span>
                          <span>{question.votes} votes</span>
                          <span>{question.answers} trả lời</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có câu hỏi</p>
              )}
            </div>
          </div>

          {/* Top Questions by Votes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ArrowUpIcon className="h-5 w-5" />
              Câu hỏi nhiều vote nhất
            </h3>
            <div className="space-y-3">
              {data.topQuestionsByVotes.length > 0 ? (
                data.topQuestionsByVotes.map((question, idx) => (
                  <Link
                    key={question.id}
                    href={`/dashboard/forum/questions/${question.id}`}
                    className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {idx + 1}. {question.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{question.votes} votes</span>
                          <span>{question.views} lượt xem</span>
                          <span>{question.answers} trả lời</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có câu hỏi</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng bình luận</h3>
            <p className="text-3xl font-bold text-gray-900">{data.totalComments}</p>
            <p className="text-sm text-gray-500 mt-2">Tổng số bình luận trong diễn đàn</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chưa giải quyết</h3>
            <p className="text-3xl font-bold text-orange-600">{data.unsolvedQuestions}</p>
            <p className="text-sm text-gray-500 mt-2">Câu hỏi đang chờ trả lời</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ giải quyết</h3>
            <p className="text-3xl font-bold text-green-600">{solveRate}%</p>
            <p className="text-sm text-gray-500 mt-2">
              {data.solvedQuestions} / {data.totalQuestions} câu hỏi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

