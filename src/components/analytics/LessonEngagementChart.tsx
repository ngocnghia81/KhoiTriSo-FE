'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Chart from '@/components/dashboard/Chart';

interface LessonEngagement {
  LessonId: number;
  CompletionRate: number;
}

interface LessonEngagementChartProps {
  data: LessonEngagement[];
  title?: string;
  lessonNames?: Record<number, string>;
}

export default function LessonEngagementChart({ 
  data, 
  title = 'Tỷ lệ hoàn thành bài học',
  lessonNames = {}
}: LessonEngagementChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by completion rate descending
  const sortedData = [...data].sort((a, b) => b.CompletionRate - a.CompletionRate);

  // Prepare chart data
  const chartData = sortedData.map(item => ({
    Date: lessonNames[item.LessonId] || `Bài ${item.LessonId}`,
    Amount: item.CompletionRate,
  }));

  // Also show as list for better readability
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Bar Chart */}
          <div className="h-64">
            <Chart
              data={chartData}
              type="bar"
              xKey="Date"
              yKey="Amount"
              color="#3b82f6"
              height={250}
            />
          </div>

          {/* Detailed List */}
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Chi tiết từng bài học</h4>
            {sortedData.map((item) => (
              <div key={item.LessonId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    {lessonNames[item.LessonId] || `Bài học #${item.LessonId}`}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {item.CompletionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.CompletionRate >= 80 ? 'bg-green-500' :
                      item.CompletionRate >= 60 ? 'bg-yellow-500' :
                      item.CompletionRate >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.CompletionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

