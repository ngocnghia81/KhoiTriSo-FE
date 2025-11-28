'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressDistribution {
  '0-25': number;
  '26-50': number;
  '51-75': number;
  '76-100': number;
}

interface ProgressDistributionChartProps {
  data: ProgressDistribution;
  title?: string;
}

const colors = {
  '0-25': '#ef4444',    // red
  '26-50': '#f59e0b',   // amber
  '51-75': '#3b82f6',   // blue
  '76-100': '#10b981',  // green
};

const labels = {
  '0-25': '0-25%',
  '26-50': '26-50%',
  '51-75': '51-75%',
  '76-100': '76-100%',
};

export default function ProgressDistributionChart({ 
  data, 
  title = 'Phân bố tiến độ học tập' 
}: ProgressDistributionChartProps) {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  
  if (total === 0) {
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

  const segments = (Object.keys(data) as Array<keyof ProgressDistribution>).map(key => ({
    key,
    value: data[key],
    percentage: total > 0 ? (data[key] / total) * 100 : 0,
    color: colors[key],
    label: labels[key],
  }));

  // Calculate angles for pie chart
  let currentAngle = 0;
  const segmentsWithAngles = segments.map(segment => {
    const angle = (segment.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return {
      ...segment,
      startAngle,
      endAngle: currentAngle,
      angle,
    };
  });

  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const getPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return [
      `M ${centerX} ${centerY}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      'Z',
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians)),
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Pie Chart */}
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {segmentsWithAngles.map((segment, index) => (
                <path
                  key={segment.key}
                  d={getPath(segment.startAngle, segment.endAngle)}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
              {/* Center circle for donut effect */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius * 0.6}
                fill="white"
              />
              {/* Total text in center */}
              <text
                x={centerX}
                y={centerY - 5}
                textAnchor="middle"
                className="text-lg font-semibold fill-gray-900"
              >
                {total}
              </text>
              <text
                x={centerX}
                y={centerY + 15}
                textAnchor="middle"
                className="text-sm fill-gray-600"
              >
                học viên
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="space-y-3 min-w-[200px]">
            {segments.map((segment) => (
              <div key={segment.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {segment.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {segment.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    {segment.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

