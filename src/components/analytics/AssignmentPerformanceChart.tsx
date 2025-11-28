'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Chart from '@/components/dashboard/Chart';

interface AssignmentPerformance {
  AssignmentId: number;
  AverageScore: number;
  CompletionRate: number;
}

interface AssignmentPerformanceChartProps {
  data: AssignmentPerformance[];
  title?: string;
  assignmentNames?: Record<number, string>;
}

export default function AssignmentPerformanceChart({ 
  data, 
  title = 'Hiệu suất làm bài tập',
  assignmentNames = {}
}: AssignmentPerformanceChartProps) {
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

  // Sort by average score descending
  const sortedData = [...data].sort((a, b) => b.AverageScore - a.AverageScore);

  // Prepare chart data for average score
  const scoreChartData = sortedData.map(item => ({
    Date: assignmentNames[item.AssignmentId] || `Bài tập ${item.AssignmentId}`,
    Amount: item.AverageScore,
  }));

  // Prepare chart data for completion rate
  const completionChartData = sortedData.map(item => ({
    Date: assignmentNames[item.AssignmentId] || `Bài tập ${item.AssignmentId}`,
    Amount: item.CompletionRate,
  }));

  return (
    <div className="space-y-6">
      {/* Average Score Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Điểm trung bình</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Chart
              data={scoreChartData}
              type="bar"
              xKey="Date"
              yKey="Amount"
              color="#10b981"
              height={250}
            />
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ hoàn thành</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Chart
              data={completionChartData}
              type="bar"
              xKey="Date"
              yKey="Amount"
              color="#3b82f6"
              height={250}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết từng bài tập</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bài tập
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Điểm TB
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tỷ lệ hoàn thành
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((item) => (
                  <tr key={item.AssignmentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {assignmentNames[item.AssignmentId] || `Bài tập #${item.AssignmentId}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.AverageScore.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">/100</span>
                        <div className="ml-3 w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.AverageScore >= 80 ? 'bg-green-500' :
                              item.AverageScore >= 60 ? 'bg-yellow-500' :
                              item.AverageScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.AverageScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.CompletionRate.toFixed(1)}%
                        </span>
                        <div className="ml-3 w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.CompletionRate >= 80 ? 'bg-green-500' :
                              item.CompletionRate >= 60 ? 'bg-yellow-500' :
                              item.CompletionRate >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.CompletionRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

