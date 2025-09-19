import { Metadata } from 'next';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  BookmarkIcon,
  FlagIcon,
  TagIcon,
  UserIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';

export const metadata: Metadata = {
  title: 'Quản lý Forum - Dashboard',
  description: 'Quản lý bài viết và hoạt động diễn đàn hệ thống Khởi Trí Số',
};

// Mock data for forum posts
const forumPosts = [
  {
    _id: '507f1f77bcf86cd799439011',
    title: 'Tính đạo hàm của hàm số y = x³ + 2x² - 5x + 3',
    content: 'Em đang gặp khó khăn trong việc tính đạo hàm của hàm số bậc 3. Có thể hướng dẫn chi tiết các bước không ạ? Em đã thử áp dụng công thức nhưng kết quả không đúng.',
    contentType: 'text',
    author: {
      userId: '507f1f77bcf86cd799439012',
      username: 'nguyenvana',
      displayName: 'Nguyễn Văn A',
      avatar: '/images/avatars/student-1.png',
      reputation: 245,
      badges: ['student', 'active_learner'],
      isOnline: true
    },
    category: {
      id: 'math',
      name: 'Toán học',
      slug: 'toan-hoc'
    },
    tags: ['đạo-hàm', 'hàm-số', 'toán-12', 'khó'],
    stats: {
      views: 156,
      upvotes: 12,
      downvotes: 1,
      totalVotes: 11,
      replies: 3,
      bookmarks: 8,
      shares: 2
    },
    status: 'active',
    isSolved: true,
    acceptedReplyId: '507f1f77bcf86cd799439013',
    moderation: {
      isReported: false,
      reportCount: 0,
      isHidden: false
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:22:00Z',
    lastActivityAt: '2024-01-20T14:22:00Z'
  },
  {
    _id: '507f1f77bcf86cd799439014',
    title: 'Bài tập về dao động điều hòa - Tìm chu kỳ và tần số',
    content: 'Một vật dao động điều hòa với phương trình x = 4cos(2πt + π/3) cm. Làm thế nào để tìm chu kỳ, tần số và biên độ dao động? Em cần giải thích chi tiết từng bước.',
    contentType: 'text',
    author: {
      userId: '507f1f77bcf86cd799439015',
      username: 'tranthib',
      displayName: 'Trần Thị B',
      avatar: '/images/avatars/student-2.png',
      reputation: 189,
      badges: ['student'],
      isOnline: false
    },
    category: {
      id: 'physics',
      name: 'Vật lý',
      slug: 'vat-ly'
    },
    tags: ['dao-động', 'điều-hòa', 'vật-lý-12', 'cơ-học'],
    stats: {
      views: 203,
      upvotes: 8,
      downvotes: 0,
      totalVotes: 8,
      replies: 2,
      bookmarks: 5,
      shares: 1
    },
    status: 'active',
    isSolved: false,
    acceptedReplyId: null,
    moderation: {
      isReported: false,
      reportCount: 0,
      isHidden: false
    },
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    lastActivityAt: '2024-01-18T16:45:00Z'
  },
  {
    _id: '507f1f77bcf86cd799439016',
    title: 'Cân bằng phương trình hóa học phức tạp',
    content: 'Làm thế nào để cân bằng phương trình: Al + HNO₃ → Al(NO₃)₃ + NO + H₂O? Em luôn bị sai ở bước cuối. Mong thầy cô hướng dẫn phương pháp cân bằng electron.',
    contentType: 'text',
    author: {
      userId: '507f1f77bcf86cd799439017',
      username: 'levanc',
      displayName: 'Lê Văn C',
      avatar: '/images/avatars/student-3.png',
      reputation: 312,
      badges: ['student', 'chemistry_lover'],
      isOnline: true
    },
    category: {
      id: 'chemistry',
      name: 'Hóa học',
      slug: 'hoa-hoc'
    },
    tags: ['cân-bằng', 'phương-trình', 'hóa-11', 'oxi-hóa-khử'],
    stats: {
      views: 89,
      upvotes: 5,
      downvotes: 0,
      totalVotes: 5,
      replies: 1,
      bookmarks: 3,
      shares: 0
    },
    status: 'active',
    isSolved: false,
    acceptedReplyId: null,
    moderation: {
      isReported: true,
      reportCount: 1,
      isHidden: false
    },
    createdAt: '2024-01-14T16:20:00Z',
    updatedAt: '2024-01-15T08:30:00Z',
    lastActivityAt: '2024-01-15T08:30:00Z'
  }
];

const getStatusBadge = (status: string, isSolved: boolean) => {
  if (isSolved) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'pinned':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: string, isSolved: boolean) => {
  if (isSolved) return 'Đã giải quyết';
  
  switch (status) {
    case 'active':
      return 'Đang hoạt động';
    case 'closed':
      return 'Đã đóng';
    case 'pinned':
      return 'Đã ghim';
    default:
      return 'Không xác định';
  }
};

const getCategoryColor = (categoryId: string) => {
  switch (categoryId) {
    case 'math':
      return 'bg-blue-500';
    case 'physics':
      return 'bg-green-500';
    case 'chemistry':
      return 'bg-purple-500';
    case 'biology':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ForumPostsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý Forum</h1>
          <p className="mt-2 text-sm text-gray-700">
            Quản lý bài viết, câu trả lời và hoạt động diễn đàn học tập
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-yellow-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 transition-all duration-200"
          >
            <ExclamationTriangleIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Kiểm duyệt
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Tạo bài viết
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow-lg rounded-xl p-6 border border-blue-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-blue-700">Tổng bài viết</dt>
                <dd className="text-2xl font-bold text-blue-900">1,247</dd>
                <dd className="text-sm text-blue-600">+23 hôm nay</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow-lg rounded-xl p-6 border border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircleIconSolid className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-green-700">Đã giải quyết</dt>
                <dd className="text-2xl font-bold text-green-900">1,089</dd>
                <dd className="text-sm text-green-600">87% tỷ lệ</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden shadow-lg rounded-xl p-6 border border-purple-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-purple-700">Người dùng hoạt động</dt>
                <dd className="text-2xl font-bold text-purple-900">456</dd>
                <dd className="text-sm text-purple-600">Tuần này</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 overflow-hidden shadow-lg rounded-xl p-6 border border-red-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <FlagIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-red-700">Báo cáo</dt>
                <dd className="text-2xl font-bold text-red-900">12</dd>
                <dd className="text-sm text-red-600">Cần xử lý</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow-lg rounded-xl">
        <div className="p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:items-center sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Tìm kiếm bài viết..."
                />
              </div>

              {/* Category filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50">
                <option>Tất cả danh mục</option>
                <option>Toán học</option>
                <option>Vật lý</option>
                <option>Hóa học</option>
                <option>Sinh học</option>
              </select>

              {/* Status filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50">
                <option>Tất cả trạng thái</option>
                <option>Đang hoạt động</option>
                <option>Đã giải quyết</option>
                <option>Cần kiểm duyệt</option>
                <option>Đã đóng</option>
              </select>

              {/* Sort filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50">
                <option>Mới nhất</option>
                <option>Phổ biến nhất</option>
                <option>Nhiều vote nhất</option>
                <option>Chưa giải quyết</option>
              </select>
            </div>

            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FunnelIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Lọc nâng cao
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forum posts list */}
      <div className="space-y-4">
        {forumPosts.map((post) => (
          <div key={post._id} className="bg-white shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Post header */}
                  <div className="flex items-center mb-3">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(post.category.id)} mr-3`}></div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {post.title}
                      </h3>
                      {post.isSolved && (
                        <CheckCircleIconSolid className="h-5 w-5 text-green-500" />
                      )}
                      {post.moderation.isReported && (
                        <FlagIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>

                  {/* Post content preview */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {post.content}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 4 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        +{post.tags.length - 4} khác
                      </span>
                    )}
                  </div>

                  {/* Author and meta info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {/* Author */}
                      <div className="flex items-center mr-6">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                          <span className="text-sm font-medium text-white">
                            {post.author.displayName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {post.author.displayName}
                            </span>
                            {post.author.isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {post.author.reputation} điểm
                            </span>
                            {post.author.badges.includes('teacher') && (
                              <TrophyIcon className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="flex items-center mr-6">
                        <span className="text-sm text-gray-600">{post.category.name}</span>
                      </div>

                      {/* Timestamps */}
                      <div className="flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(post.status, post.isSolved)}`}>
                      {getStatusText(post.status, post.isSolved)}
                    </span>
                  </div>
                </div>

                {/* Stats sidebar */}
                <div className="ml-6 flex flex-col items-center space-y-4">
                  {/* Votes */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <HandThumbUpIconSolid className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{post.stats.totalVotes}</span>
                    </div>
                    <span className="text-xs text-gray-500">votes</span>
                  </div>

                  {/* Replies */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{post.stats.replies}</span>
                    </div>
                    <span className="text-xs text-gray-500">replies</span>
                  </div>

                  {/* Views */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <EyeIcon className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{post.stats.views}</span>
                    </div>
                    <span className="text-xs text-gray-500">views</span>
                  </div>

                  {/* Bookmarks */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <BookmarkIconSolid className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{post.stats.bookmarks}</span>
                    </div>
                    <span className="text-xs text-gray-500">saved</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Xem chi tiết
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                    Xem replies
                  </button>
                  {post.moderation.isReported && (
                    <button className="inline-flex items-center px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      Kiểm duyệt
                    </button>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-xl shadow-lg">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            Trước
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            Sau
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">1</span> đến{' '}
              <span className="font-medium">3</span> trong{' '}
              <span className="font-medium">1,247</span> kết quả
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Trước
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                1
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Sau
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
