import {
  UserPlusIcon,
  ShoppingCartIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Activity {
  id: number;
  type: 'user_register' | 'order' | 'course_complete' | 'book_activate' | 'forum_post' | 'system';
  title: string;
  description: string;
  time: string;
  user?: string;
  metadata?: {
    amount?: string;
    [key: string]: unknown;
  };
}

const activities: Activity[] = [
  {
    id: 1,
    type: 'user_register',
    title: 'Người dùng mới đăng ký',
    description: 'Nguyễn Văn A đã tạo tài khoản mới',
    time: '2 phút trước',
    user: 'Nguyễn Văn A'
  },
  {
    id: 2,
    type: 'order',
    title: 'Đơn hàng mới',
    description: 'Đơn hàng #12345 - Khóa học Toán 12',
    time: '15 phút trước',
    user: 'Trần Thị B',
    metadata: { amount: '299,000đ' }
  },
  {
    id: 3,
    type: 'course_complete',
    title: 'Hoàn thành khóa học',
    description: 'Lê Văn C đã hoàn thành khóa học Vật lý 11',
    time: '1 giờ trước',
    user: 'Lê Văn C'
  },
  {
    id: 4,
    type: 'book_activate',
    title: 'Kích hoạt sách',
    description: 'Sách "Toán học nâng cao" được kích hoạt',
    time: '2 giờ trước',
    user: 'Phạm Thị D'
  },
  {
    id: 5,
    type: 'forum_post',
    title: 'Bài viết mới trong diễn đàn',
    description: 'Câu hỏi về đạo hàm hàm số',
    time: '3 giờ trước',
    user: 'Hoàng Văn E'
  },
  {
    id: 6,
    type: 'system',
    title: 'Cập nhật hệ thống',
    description: 'Backup database hoàn thành',
    time: '4 giờ trước'
  }
];

const getActivityIcon = (type: Activity['type']) => {
  const iconClass = "h-5 w-5";
  
  switch (type) {
    case 'user_register':
      return <UserPlusIcon className={`${iconClass} text-green-500`} />;
    case 'order':
      return <ShoppingCartIcon className={`${iconClass} text-blue-500`} />;
    case 'course_complete':
      return <AcademicCapIcon className={`${iconClass} text-purple-500`} />;
    case 'book_activate':
      return <BookOpenIcon className={`${iconClass} text-yellow-500`} />;
    case 'forum_post':
      return <ChatBubbleLeftRightIcon className={`${iconClass} text-indigo-500`} />;
    case 'system':
      return <ExclamationTriangleIcon className={`${iconClass} text-gray-500`} />;
    default:
      return <ExclamationTriangleIcon className={`${iconClass} text-gray-500`} />;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'user_register':
      return 'bg-green-100 border-green-200';
    case 'order':
      return 'bg-blue-100 border-blue-200';
    case 'course_complete':
      return 'bg-purple-100 border-purple-200';
    case 'book_activate':
      return 'bg-yellow-100 border-yellow-200';
    case 'forum_post':
      return 'bg-indigo-100 border-indigo-200';
    case 'system':
      return 'bg-gray-100 border-gray-200';
    default:
      return 'bg-gray-100 border-gray-200';
  }
};

export default function RecentActivity() {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Xem tất cả
          </button>
        </div>
        
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index !== activities.length - 1 && (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className={`relative px-1 py-1 rounded-full ${getActivityColor(activity.type)} border`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            {activity.title}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {activity.description}
                        </p>
                        {activity.user && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            Người dùng: {activity.user}
                          </p>
                        )}
                        {activity.metadata?.amount && (
                          <p className="mt-0.5 text-xs font-medium text-green-600">
                            Giá trị: {activity.metadata.amount}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <time>{activity.time}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
