import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface StatsCardProps {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'indigo' | 'red';
  description: string;
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  yellow: 'bg-yellow-500',
  indigo: 'bg-indigo-500',
  red: 'bg-red-500',
};

const changeColorClasses = {
  increase: 'text-green-600 bg-green-100',
  decrease: 'text-red-600 bg-red-100',
};

export default function StatsCard({
  name,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  description,
}: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{name}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                <div className={`ml-2 flex items-baseline text-sm font-semibold rounded-full px-2.5 py-0.5 ${changeColorClasses[changeType]}`}>
                  {changeType === 'increase' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  )}
                  <span>{change}</span>
                </div>
              </dd>
              <dd className="text-sm text-gray-600 mt-1">{description}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
