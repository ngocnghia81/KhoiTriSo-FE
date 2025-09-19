import {
  TrophyIcon,
  AcademicCapIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Performer {
  id: number;
  name: string;
  role: 'instructor' | 'student';
  avatar?: string;
  metric: string;
  value: string | number;
  change: string;
  rank: number;
}

const topInstructors: Performer[] = [
  {
    id: 1,
    name: 'Nguyễn Văn Minh',
    role: 'instructor',
    metric: 'Đánh giá trung bình',
    value: 4.9,
    change: '+0.1',
    rank: 1
  },
  {
    id: 2,
    name: 'Trần Thị Hoa',
    role: 'instructor',
    metric: 'Học sinh hoàn thành',
    value: '95%',
    change: '+3%',
    rank: 2
  },
  {
    id: 3,
    name: 'Lê Đức Anh',
    role: 'instructor',
    metric: 'Doanh thu',
    value: '₫45M',
    change: '+12%',
    rank: 3
  }
];

const topStudents: Performer[] = [
  {
    id: 1,
    name: 'Phạm Thị Mai',
    role: 'student',
    metric: 'Điểm trung bình',
    value: 9.8,
    change: '+0.2',
    rank: 1
  },
  {
    id: 2,
    name: 'Hoàng Văn Nam',
    role: 'student',
    metric: 'Khóa học hoàn thành',
    value: 12,
    change: '+2',
    rank: 2
  },
  {
    id: 3,
    name: 'Nguyễn Thị Lan',
    role: 'student',
    metric: 'Thời gian học',
    value: '145h',
    change: '+25h',
    rank: 3
  }
];

const getRankIcon = (rank: number) => {
  if (rank === 1) {
    return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
  }
  return (
    <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
      <span className="text-xs font-medium text-gray-600">{rank}</span>
    </div>
  );
};

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIconSolid
          key={i}
          className={`h-4 w-4 ${
            i < fullStars ? 'text-yellow-400' : 'text-gray-200'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating}</span>
    </div>
  );
};

const PerformerCard = ({ performer }: { performer: Performer }) => (
  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0">
      {getRankIcon(performer.rank)}
    </div>
    <div className="flex-shrink-0">
      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
        {performer.role === 'instructor' ? (
          <AcademicCapIcon className="h-5 w-5 text-white" />
        ) : (
          <UserIcon className="h-5 w-5 text-white" />
        )}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">
        {performer.name}
      </p>
      <p className="text-sm text-gray-500">
        {performer.metric}
      </p>
      {typeof performer.value === 'number' && performer.metric.includes('Đánh giá') ? (
        renderStars(performer.value)
      ) : (
        <div className="flex items-center mt-1">
          <span className="text-lg font-semibold text-gray-900">
            {performer.value}
          </span>
          <span className="ml-2 text-sm text-green-600">
            {performer.change}
          </span>
        </div>
      )}
    </div>
  </div>
);

export default function TopPerformers() {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Top Performers</h3>
        
        <div className="space-y-6">
          {/* Top Instructors */}
          <div>
            <div className="flex items-center mb-4">
              <AcademicCapIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Giảng viên xuất sắc</h4>
            </div>
            <div className="space-y-3">
              {topInstructors.map((instructor) => (
                <PerformerCard key={instructor.id} performer={instructor} />
              ))}
            </div>
          </div>

          {/* Top Students */}
          <div>
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Học sinh xuất sắc</h4>
            </div>
            <div className="space-y-3">
              {topStudents.map((student) => (
                <PerformerCard key={student.id} performer={student} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800">
            Xem bảng xếp hạng đầy đủ
          </button>
        </div>
      </div>
    </div>
  );
}
