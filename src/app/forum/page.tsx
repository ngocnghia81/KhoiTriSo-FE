import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import {
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon,
  EyeIcon,
  TagIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  CheckCircleIcon,
  StarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Diễn đàn - Khởi Trí Số',
  description: 'Diễn đàn hỏi đáp và thảo luận học tập cùng cộng đồng Khởi Trí Số',
  keywords: 'diễn đàn, hỏi đáp, thảo luận, học tập, toán học, vật lý, hóa học',
};

interface ForumQuestion {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    id: string;
    avatar: string;
    reputation: number;
    badge?: 'teacher' | 'expert' | 'student';
  };
  category: {
    name: string;
    slug: string;
  };
  tags: string[];
  createdAt: string;
  views: number;
  votes: number;
  answers: number;
  isSolved: boolean;
  lastActivity: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  questionCount: number;
  color: string;
}

// Mock data
const categories: Category[] = [
  {
    id: 'math',
    name: 'Toán học',
    slug: 'math',
    description: 'Hỏi đáp về các bài toán từ cơ bản đến nâng cao',
    questionCount: 1247,
    color: 'bg-blue-500'
  },
  {
    id: 'physics',
    name: 'Vật lý',
    slug: 'physics', 
    description: 'Thảo luận về các hiện tượng vật lý và bài tập',
    questionCount: 892,
    color: 'bg-green-500'
  },
  {
    id: 'chemistry',
    name: 'Hóa học',
    slug: 'chemistry',
    description: 'Giải đáp thắc mắc về phản ứng hóa học và bài tập',
    questionCount: 634,
    color: 'bg-purple-500'
  },
  {
    id: 'general',
    name: 'Tổng quát',
    slug: 'general',
    description: 'Các câu hỏi chung về học tập và phương pháp',
    questionCount: 423,
    color: 'bg-orange-500'
  }
];

const mockQuestions: ForumQuestion[] = [
  {
    id: 'toan-dao-ham-001',
    title: 'Tính đạo hàm của hàm số y = x³ + 2x² - 5x + 3',
    excerpt: 'Mình đang gặp khó khăn trong việc tính đạo hàm của hàm số bậc 3. Có thể hướng dẫn chi tiết các bước không ạ?',
    author: {
      name: 'Nguyễn Văn A',
      id: 'nguyen-van-a',
      avatar: '/images/avatars/student-1.png',
      reputation: 245,
      badge: 'student'
    },
    category: {
      name: 'Toán học',
      slug: 'math'
    },
    tags: ['đạo hàm', 'hàm số', 'toán 12'],
    createdAt: '2024-01-15T10:30:00Z',
    views: 156,
    votes: 12,
    answers: 3,
    isSolved: true,
    lastActivity: '2024-01-15T14:22:00Z'
  },
  {
    id: 'vat-ly-dao-dong-001',
    title: 'Bài tập về dao động điều hòa - Tìm chu kỳ và tần số',
    excerpt: 'Một vật dao động điều hòa với phương trình x = 4cos(2πt + π/3) cm. Tìm chu kỳ, tần số và biên độ dao động.',
    author: {
      name: 'Trần Thị B',
      id: 'tran-thi-b',
      avatar: '/images/avatars/student-2.png',
      reputation: 189,
      badge: 'student'
    },
    category: {
      name: 'Vật lý',
      slug: 'physics'
    },
    tags: ['dao động', 'điều hòa', 'vật lý 12'],
    createdAt: '2024-01-15T09:15:00Z',
    views: 203,
    votes: 8,
    answers: 2,
    isSolved: false,
    lastActivity: '2024-01-15T13:45:00Z'
  },
  {
    id: 'hoa-hoc-phan-ung-001',
    title: 'Cân bằng phương trình hóa học phức tạp',
    excerpt: 'Làm thế nào để cân bằng phương trình: Al + HNO₃ → Al(NO₃)₃ + NO + H₂O? Mình luôn bị sai ở bước cuối.',
    author: {
      name: 'Lê Văn C',
      id: 'le-van-c',
      avatar: '/images/avatars/student-3.png',
      reputation: 312,
      badge: 'student'
    },
    category: {
      name: 'Hóa học',
      slug: 'chemistry'
    },
    tags: ['cân bằng', 'phương trình', 'hóa 11'],
    createdAt: '2024-01-14T16:20:00Z',
    views: 89,
    votes: 5,
    answers: 1,
    isSolved: false,
    lastActivity: '2024-01-15T08:30:00Z'
  },
  {
    id: 'toan-tich-phan-001',
    title: 'Tích phân từng phần - Bài tập nâng cao',
    excerpt: 'Tính tích phân ∫x²·ln(x)dx. Mình đã thử phương pháp từng phần nhưng kết quả không đúng.',
    author: {
      name: 'Phạm Thị D',
      id: 'pham-thi-d',
      avatar: '/images/avatars/student-4.png',
      reputation: 456,
      badge: 'student'
    },
    category: {
      name: 'Toán học',
      slug: 'math'
    },
    tags: ['tích phân', 'từng phần', 'toán 12'],
    createdAt: '2024-01-14T14:10:00Z',
    views: 234,
    votes: 15,
    answers: 4,
    isSolved: true,
    lastActivity: '2024-01-15T11:15:00Z'
  },
  {
    id: 'vat-ly-quang-hoc-001',
    title: 'Bài tập về thấu kính hội tụ',
    excerpt: 'Một thấu kính hội tụ có tiêu cự f = 20cm. Vật AB cao 2cm đặt cách thấu kính 30cm. Tìm vị trí và tính chất của ảnh.',
    author: {
      name: 'Hoàng Văn E',
      id: 'hoang-van-e',
      avatar: '/images/avatars/student-5.png',
      reputation: 178,
      badge: 'student'
    },
    category: {
      name: 'Vật lý',
      slug: 'physics'
    },
    tags: ['quang học', 'thấu kính', 'vật lý 11'],
    createdAt: '2024-01-14T11:45:00Z',
    views: 167,
    votes: 7,
    answers: 2,
    isSolved: false,
    lastActivity: '2024-01-14T18:20:00Z'
  }
];

export default function ForumPage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeText = (badge?: string) => {
    switch (badge) {
      case 'teacher': return 'Giảng viên';
      case 'expert': return 'Chuyên gia';
      case 'student': return 'Học sinh';
      default: return 'Thành viên';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Diễn đàn học tập</h1>
              <p className="mt-2 text-gray-600">
                Nơi chia sẻ kiến thức và giải đáp thắc mắc cùng cộng đồng
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/forum/ask"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Đặt câu hỏi
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm câu hỏi..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option>Tất cả danh mục</option>
                    <option>Toán học</option>
                    <option>Vật lý</option>
                    <option>Hóa học</option>
                  </select>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <FunnelIcon className="w-4 h-4 mr-1" />
                    Lọc
                  </button>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sắp xếp theo:</span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                    Mới nhất
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
                    Phổ biến
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
                    Chưa giải quyết
                  </button>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {mockQuestions.length} câu hỏi
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {mockQuestions.map((question) => (
                <div key={question.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Question Title */}
                        <div className="flex items-center mb-2">
                          {question.isSolved && (
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                          )}
                          <Link
                            href={`/forum/${question.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                          >
                            {question.title}
                          </Link>
                        </div>

                        {/* Question Excerpt */}
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {question.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {question.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              <TagIcon className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Question Meta */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {/* Author */}
                            <div className="flex items-center">
                              <UserCircleIcon className="w-4 h-4 mr-1" />
                              <span>{question.author.name}</span>
                              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getBadgeColor(question.author.badge)}`}>
                                {getBadgeText(question.author.badge)}
                              </span>
                            </div>

                            {/* Category */}
                            <Link
                              href={`/forum/category/${question.category.slug}`}
                              className="hover:text-blue-600"
                            >
                              {question.category.name}
                            </Link>

                            {/* Created Date */}
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {formatDate(question.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Question Stats */}
                      <div className="ml-6 flex flex-col items-center space-y-2 text-sm">
                        <div className="text-center">
                          <div className="flex items-center text-gray-500">
                            <HandThumbUpIcon className="w-4 h-4 mr-1" />
                            <span className="font-medium">{question.votes}</span>
                          </div>
                          <span className="text-xs text-gray-400">votes</span>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center text-gray-500">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                            <span className="font-medium">{question.answers}</span>
                          </div>
                          <span className="text-xs text-gray-400">answers</span>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center text-gray-500">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            <span className="font-medium">{question.views}</span>
                          </div>
                          <span className="text-xs text-gray-400">views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
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
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Sau
                </button>
              </nav>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/forum/category/${category.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${category.color} mr-3`}></div>
                      <div>
                        <div className="font-medium text-gray-900">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {category.questionCount}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                {['đạo hàm', 'tích phân', 'dao động', 'quang học', 'hóa học', 'phương trình', 'hình học', 'xác suất'].map((tag) => (
                  <Link
                    key={tag}
                    href={`/forum/tag/${tag}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Forum Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng câu hỏi</span>
                  <span className="font-semibold">3,196</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã giải quyết</span>
                  <span className="font-semibold text-green-600">2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thành viên</span>
                  <span className="font-semibold">1,245</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chuyên gia</span>
                  <span className="font-semibold text-purple-600">23</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
