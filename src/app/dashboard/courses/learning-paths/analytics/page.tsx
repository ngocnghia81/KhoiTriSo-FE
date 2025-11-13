'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Layers,
  Users,
  BookOpen,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  learningPathApi,
  LearningPathAnalytics,
} from '@/services/learningPathApi';

const TIME_RANGES = [
  { label: '7 ngày qua', value: 7 },
  { label: '30 ngày qua', value: 30 },
  { label: '90 ngày qua', value: 90 },
  { label: '180 ngày qua', value: 180 },
];

const numberFormatter = new Intl.NumberFormat('vi-VN');
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString('vi-VN');
  } catch {
    return date;
  }
};

export default function LearningPathAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<LearningPathAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [trendExpanded, setTrendExpanded] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await learningPathApi.getLearningPathAnalytics(timeRange);
        setAnalytics(data);
      } catch (err) {
        console.error('Learning path analytics error:', err);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange]);

  const topEnrollmentTrend = useMemo(() => {
    if (!analytics?.enrollmentTrends?.length) return 0;
    return Math.max(...analytics.enrollmentTrends.map((item) => item.newEnrollments || 0));
  }, [analytics]);

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-36 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow">
        <Layers className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-600">Không có dữ liệu phân tích.</p>
        <p className="text-sm text-gray-500">
          Hãy thử đổi khoảng thời gian hoặc đảm bảo đã có dữ liệu học viên.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phân tích lộ trình học</h1>
          <p className="text-sm text-gray-600 mt-1">
            Tổng quan hiệu suất, học viên và xu hướng của các lộ trình học trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TIME_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng lộ trình</CardTitle>
            <Layers className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics.overview.totalLearningPaths}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                {analytics.overview.publishedLearningPaths} đã xuất bản
              </Badge>
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                {analytics.overview.pendingApproval} chờ duyệt
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Học viên tham gia</CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {numberFormatter.format(analytics.overview.totalEnrollments)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>{numberFormatter.format(analytics.overview.activeEnrollments)} đang học</span>
              <span className="mx-1">•</span>
              <CheckCircle className="h-3 w-3 text-blue-500" />
              <span>{numberFormatter.format(analytics.overview.completedEnrollments)} đã hoàn thành</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Số khóa học trung bình</CardTitle>
            <BookOpen className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics.overview.averageCoursesPerPath.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tổng {analytics.overview.totalCoursesInPaths} khóa học trong các lộ trình
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Giá trung bình</CardTitle>
            <TrendingUp className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {currencyFormatter.format(analytics.overview.averagePrice || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tiến độ trung bình {analytics.overview.averageProgress.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trends and Difficulty */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Xu hướng đăng ký</CardTitle>
              <CardDescription>
                Lượng học viên mới, hoàn thành trong {timeRange} ngày gần nhất
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-600"
              onClick={() => setTrendExpanded((prev) => !prev)}
            >
              {trendExpanded ? (
                <>
                  Thu gọn <ChevronUp className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Xem thêm <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.enrollmentTrends.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có dữ liệu đăng ký trong giai đoạn này.</p>
            ) : (
              (trendExpanded
                ? analytics.enrollmentTrends
                : analytics.enrollmentTrends.slice(-7)
              ).map((item) => (
                <div key={item.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatDate(item.date)}</span>
                    <span className="font-semibold text-gray-900">
                      {item.newEnrollments} học viên mới
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{
                        width: `${topEnrollmentTrend > 0 ? Math.max(
                          (item.newEnrollments / topEnrollmentTrend) * 100,
                          5
                        ) : 0}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>
                      <CheckCircle className="inline h-3 w-3 text-green-500 mr-1" />
                      {item.completed} hoàn thành
                    </span>
                    <span>
                      <Users className="inline h-3 w-3 text-purple-500 mr-1" />
                      {item.active} đang học
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bố theo độ khó</CardTitle>
            <CardDescription>Số lượng lộ trình và học viên theo cấp độ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.difficultyDistribution.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>
            ) : (
              analytics.difficultyDistribution.map((item) => (
                <div key={item.difficulty} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.difficulty}</span>
                    <span className="text-gray-500">{item.learningPathCount} lộ trình</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 bg-indigo-500 rounded-full"
                      style={{
                        width: `${analytics.overview.totalLearningPaths > 0
                          ? Math.max(
                              (item.learningPathCount / analytics.overview.totalLearningPaths) *
                                100,
                              5
                            )
                          : 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {numberFormatter.format(item.enrollmentCount)} học viên
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category stats */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê theo danh mục</CardTitle>
          <CardDescription>Hiệu suất lộ trình theo từng danh mục</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {analytics.categoryStats.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có dữ liệu danh mục.</p>
          ) : (
            <div className="min-w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Lộ trình
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Học viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Giá trung bình
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Khóa học / lộ trình
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.categoryStats.map((cat) => (
                    <tr key={`${cat.categoryId ?? 'none'}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {cat.categoryName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cat.learningPathCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {numberFormatter.format(cat.enrollmentCount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {currencyFormatter.format(cat.averagePrice)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cat.averageCoursesPerPath.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top learning paths */}
      <Card>
        <CardHeader>
          <CardTitle>Lộ trình nổi bật</CardTitle>
          <CardDescription>Lộ trình có lượt tham gia và hoàn thành cao nhất</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {analytics.topLearningPaths.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có dữ liệu lộ trình nổi bật.</p>
          ) : (
            <div className="min-w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Lộ trình
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Giảng viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Học viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hoàn thành
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tiến độ TB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Giá
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.topLearningPaths.map((path) => (
                    <tr key={path.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            {path.thumbnail ? (
                              <img
                                src={path.thumbnail}
                                alt={path.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Layers className="h-6 w-6 text-gray-400 m-3" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{path.title}</p>
                            <p className="text-xs text-gray-500">
                              {path.courseCount} khóa học
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{path.instructorName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {numberFormatter.format(path.enrollmentCount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {numberFormatter.format(path.completedCount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {path.averageProgress.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{path.courseCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {currencyFormatter.format(path.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top instructors */}
      <Card>
        <CardHeader>
          <CardTitle>Giảng viên nổi bật</CardTitle>
          <CardDescription>Những giảng viên có lộ trình được tham gia nhiều nhất</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topInstructors.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có dữ liệu giảng viên.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {analytics.topInstructors.map((instructor) => (
                <div
                  key={instructor.instructorId}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {instructor.instructorName?.charAt(0) ?? 'G'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{instructor.instructorName}</p>
                      <p className="text-xs text-gray-500">
                        {instructor.learningPathCount} lộ trình
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-gray-500 text-xs uppercase tracking-wide">Học viên</p>
                      <p className="text-gray-900 font-semibold">
                        {numberFormatter.format(instructor.totalEnrollments)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-gray-500 text-xs uppercase tracking-wide">Khóa học / lộ trình</p>
                      <p className="text-gray-900 font-semibold">
                        {instructor.averageCoursesPerPath.toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-3 col-span-2">
                      <p className="text-gray-500 text-xs uppercase tracking-wide">Giá trung bình</p>
                      <p className="text-gray-900 font-semibold">
                        {currencyFormatter.format(instructor.averagePrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional insights */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin nhanh</CardTitle>
          <CardDescription>Những chỉ số quan trọng giúp tối ưu lộ trình</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Target className="h-4 w-4" />
              <span className="text-sm font-semibold text-gray-900">Tiến độ trung bình</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.overview.averageProgress.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">
              Theo dõi các lộ trình có tiến độ thấp để hỗ trợ học viên tốt hơn.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold text-gray-900">Học viên tích cực</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {numberFormatter.format(analytics.overview.activeEnrollments)}
            </p>
            <p className="text-xs text-gray-500">
              Theo dõi tỷ lệ hoạt động để tối ưu chiến lược giữ chân học viên.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2">
            <div className="flex items-center gap-2 text-amber-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-semibold text-gray-900">Lộ trình chờ duyệt</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.overview.pendingApproval}
            </p>
            <p className="text-xs text-gray-500">
              Đảm bảo quy trình duyệt lộ trình nhanh chóng để tăng tốc ra mắt nội dung mới.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

