import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  BookmarkIcon,
  ShareIcon,
  FlagIcon,
  PencilIcon,
  TagIcon,
  CalendarIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  StarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { 
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

interface ForumQuestion {
  id: string;
  title: string;
  content: string;
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
  updatedAt?: string;
  views: number;
  votes: number;
  answers: Answer[];
  isBookmarked: boolean;
  userVote?: 'up' | 'down';
  isSolved: boolean;
  acceptedAnswerId?: string;
}

interface Answer {
  id: string;
  content: string;
  author: {
    name: string;
    id: string;
    avatar: string;
    reputation: number;
    badge?: 'teacher' | 'expert' | 'student';
  };
  createdAt: string;
  updatedAt?: string;
  votes: number;
  isAccepted: boolean;
  userVote?: 'up' | 'down';
}

interface RelatedQuestion {
  id: string;
  title: string;
  votes: number;
  answers: number;
  views: number;
  tags: string[];
}

// Mock data - sẽ được thay thế bằng API calls
const mockQuestion: ForumQuestion = {
  id: 'toan-dao-ham-001',
  title: 'Tìm đạo hàm của hàm số y = x³ + 2x² - 5x + 1',
  content: `Cho hàm số **y = x³ + 2x² - 5x + 1**

Hãy tìm đạo hàm y' của hàm số này.

Em đã thử áp dụng công thức đạo hàm cơ bản nhưng không chắc chắn về kết quả. Mong các thầy cô và các bạn giúp đỡ.

**Công thức em đã sử dụng:**
- (x^n)' = n.x^(n-1)
- (ax + b)' = a
- (c)' = 0 (với c là hằng số)

Em tính được: y' = 3x² + 4x - 5

Không biết có đúng không ạ?`,
  author: {
    name: 'Học sinh A',
    id: 'hoc-sinh-a',
    avatar: '/images/avatars/student-1.png',
    reputation: 125,
    badge: 'student'
  },
  category: {
    name: 'Toán học',
    slug: 'toan-hoc'
  },
  tags: ['đạo hàm', 'hàm số bậc 3', 'toán 12', 'giải tích'],
  createdAt: '2024-01-15T10:30:00Z',
  views: 1247,
  votes: 15,
  answers: [],
  isBookmarked: false,
  userVote: undefined,
  isSolved: true,
  acceptedAnswerId: 'answer-1'
};

const mockAnswers: Answer[] = [
  {
    id: 'answer-1',
    content: `Chào em! Kết quả của em hoàn toàn **chính xác** 👍

**Lời giải chi tiết:**

Cho hàm số: y = x³ + 2x² - 5x + 1

Áp dụng công thức đạo hàm:
- (x³)' = 3x²
- (2x²)' = 2 × 2x = 4x  
- (-5x)' = -5
- (1)' = 0

**Vậy y' = 3x² + 4x - 5**

**Lưu ý:** Đây là dạng bài cơ bản về đạo hàm hàm đa thức. Em có thể thực hành thêm với các hàm số phức tạp hơn.

**Bài tập tương tự:**
1. y = 2x⁴ - 3x³ + x - 7
2. y = x⁵ - 4x² + 2x + 3

Chúc em học tốt! 📚`,
    author: {
      name: 'Thầy Nguyễn Văn A',
      id: 'nguyen-van-a',
      avatar: '/images/avatars/teacher-1.png',
      reputation: 2847,
      badge: 'teacher'
    },
    createdAt: '2024-01-15T11:15:00Z',
    votes: 12,
    isAccepted: true,
    userVote: undefined
  },
  {
    id: 'answer-2',
    content: `Mình cũng làm được kết quả giống bạn! 

Có thể bạn tham khảo thêm cách nhớ công thức đạo hàm:
- **Quy tắc cơ bản**: Hạ bậc, nhân hệ số
- **Ví dụ**: x³ → 3x² (hạ từ bậc 3 xuống bậc 2, nhân với 3)

Chúc bạn học tốt! 😊`,
    author: {
      name: 'Bạn học B',
      id: 'ban-hoc-b',
      avatar: '/images/avatars/student-2.png',
      reputation: 456,
      badge: 'student'
    },
    createdAt: '2024-01-15T14:22:00Z',
    votes: 8,
    isAccepted: false,
    userVote: undefined
  },
  {
    id: 'answer-3',
    content: `Bổ sung thêm một chút về **ý nghĩa hình học** của đạo hàm:

y' = 3x² + 4x - 5 chính là **hệ số góc** của tiếp tuyến với đồ thị hàm số tại điểm có hoành độ x.

**Ứng dụng:**
- Tìm phương trình tiếp tuyến
- Khảo sát sự biến thiên của hàm số
- Tìm cực trị

Rất hữu ích cho các bài tập nâng cao! 💡`,
    author: {
      name: 'Chuyên gia C',
      id: 'chuyen-gia-c',
      avatar: '/images/avatars/expert-1.png',
      reputation: 1923,
      badge: 'expert'
    },
    createdAt: '2024-01-15T16:45:00Z',
    votes: 6,
    isAccepted: false,
    userVote: undefined
  }
];

const relatedQuestions: RelatedQuestion[] = [
  {
    id: 'dao-ham-ham-hop',
    title: 'Cách tính đạo hàm của hàm hợp',
    votes: 23,
    answers: 4,
    views: 892,
    tags: ['đạo hàm', 'hàm hợp']
  },
  {
    id: 'dao-ham-bac-4',
    title: 'Tìm đạo hàm hàm số bậc 4: y = x⁴ - 2x³ + 3x² - x + 5',
    votes: 18,
    answers: 3,
    views: 654,
    tags: ['đạo hàm', 'hàm bậc 4']
  },
  {
    id: 'ung-dung-dao-ham',
    title: 'Ứng dụng đạo hàm trong tìm cực trị',
    votes: 31,
    answers: 6,
    views: 1203,
    tags: ['đạo hàm', 'cực trị', 'ứng dụng']
  },
  {
    id: 'dao-ham-luong-giac',
    title: 'Đạo hàm các hàm số lượng giác cơ bản',
    votes: 27,
    answers: 5,
    views: 987,
    tags: ['đạo hàm', 'lượng giác']
  }
];

// Mock function to get question data
async function getQuestion(slug: string): Promise<ForumQuestion | null> {
  // In real app, this would fetch from API
  if (slug === 'toan-dao-ham-001') {
    return { ...mockQuestion, answers: mockAnswers };
  }
  return null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const question = await getQuestion(params.slug);
  
  if (!question) {
    return {
      title: 'Câu hỏi không tồn tại - Khởi Trí Số',
    };
  }

  return {
    title: `${question.title} - Diễn đàn Khởi Trí Số`,
    description: question.content.substring(0, 160) + '...',
    keywords: question.tags.join(', '),
    authors: [{ name: question.author.name }],
    openGraph: {
      title: question.title,
      description: question.content.substring(0, 160) + '...',
      type: 'article',
      publishedTime: question.createdAt,
      authors: [question.author.name],
      tags: question.tags,
    },
  };
}

export default async function ForumQuestionPage({ params }: { params: { slug: string } }) {
  const question = await getQuestion(params.slug);

  if (!question) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
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
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-700 hover:text-blue-600">
                  Trang chủ
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href="/forum" className="text-gray-700 hover:text-blue-600">
                    Diễn đàn
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link 
                    href={`/forum/category/${question.category.slug}`}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    {question.category.name}
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Câu hỏi</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                      {question.category.name}
                    </span>
                    {question.isSolved && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Đã giải quyết
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {question.title}
                  </h1>

                  {/* Question Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>Đăng lúc {formatDate(question.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      <span>{question.views.toLocaleString()} lượt xem</span>
                    </div>
                    <div className="flex items-center">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                      <span>{question.answers.length} trả lời</span>
                    </div>
                  </div>
                </div>

                {/* Vote Section */}
                <div className="flex flex-col items-center space-y-2 ml-6">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowUpIcon className="h-6 w-6 text-gray-600" />
                  </button>
                  <span className="text-lg font-bold text-gray-900">
                    {question.votes}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowDownIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Question Content */}
              <div className="prose prose-lg max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: question.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {question.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/forum/tag/${tag}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              {/* Question Footer */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <BookmarkIcon className="h-5 w-5" />
                    <span>Lưu</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <ShareIcon className="h-5 w-5" />
                    <span>Chia sẻ</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                    <FlagIcon className="h-5 w-5" />
                    <span>Báo cáo</span>
                  </button>
                </div>

                {/* Author Info */}
                <div className="flex items-center space-x-3">
                  <Image
                    src={question.author.avatar}
                    alt={question.author.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                    quality={100}
                    unoptimized={true}
                  />
                  <div>
                    <Link
                      href={`/forum/user/${question.author.id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {question.author.name}
                    </Link>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(question.author.badge)}`}>
                        {getBadgeText(question.author.badge)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {question.author.reputation.toLocaleString()} điểm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Answers Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {question.answers.length} Trả lời
              </h2>

              <div className="space-y-8">
                {question.answers.map((answer) => (
                  <div key={answer.id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                    <div className="flex space-x-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center space-y-2">
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <ArrowUpIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        <span className="text-lg font-bold text-gray-900">
                          {answer.votes}
                        </span>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <ArrowDownIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        {answer.isAccepted && (
                          <CheckCircleIcon className="h-6 w-6 text-green-600 mt-2" />
                        )}
                      </div>

                      {/* Answer Content */}
                      <div className="flex-1">
                        {answer.isAccepted && (
                          <div className="flex items-center space-x-2 mb-4">
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            <span className="text-green-700 font-semibold text-sm">
                              Câu trả lời được chấp nhận
                            </span>
                          </div>
                        )}

                        <div className="prose prose-lg max-w-none mb-4">
                          <div dangerouslySetInnerHTML={{ 
                            __html: answer.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\n/g, '<br/>')
                              .replace(/📚|👍|😊|💡/g, '<span class="text-lg">$&</span>')
                          }} />
                        </div>

                        {/* Answer Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                              Bình luận
                            </button>
                            <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                              Chia sẻ
                            </button>
                          </div>

                          {/* Answer Author */}
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                Trả lời lúc {formatDate(answer.createdAt)}
                              </div>
                            </div>
                            <Image
                              src={answer.author.avatar}
                              alt={answer.author.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                              quality={100}
                              unoptimized={true}
                            />
                            <div>
                              <Link
                                href={`/forum/user/${answer.author.id}`}
                                className="font-semibold text-gray-900 hover:text-blue-600 text-sm"
                              >
                                {answer.author.name}
                              </Link>
                              <div className="flex items-center space-x-1">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getBadgeColor(answer.author.badge)}`}>
                                  {getBadgeText(answer.author.badge)}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {answer.author.reputation.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Answer Form */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Viết câu trả lời của bạn
                </h3>
                <div className="space-y-4">
                  <textarea
                    rows={6}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Hỗ trợ Markdown và LaTeX cho công thức toán học
                    </div>
                    <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                      Đăng trả lời
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-8">
              {/* Question Stats */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thống kê
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lượt xem:</span>
                    <span className="font-semibold">{question.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm bình chọn:</span>
                    <span className="font-semibold">{question.votes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trả lời:</span>
                    <span className="font-semibold">{question.answers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`font-semibold ${question.isSolved ? 'text-green-600' : 'text-yellow-600'}`}>
                      {question.isSolved ? 'Đã giải quyết' : 'Chưa giải quyết'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Questions */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Câu hỏi liên quan
                </h3>
                <div className="space-y-4">
                  {relatedQuestions.map((relatedQ) => (
                    <div key={relatedQ.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <Link
                        href={`/forum/${relatedQ.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm line-clamp-2 mb-2"
                      >
                        {relatedQ.title}
                      </Link>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center space-x-3">
                          <span>{relatedQ.votes} votes</span>
                          <span>{relatedQ.answers} answers</span>
                          <span>{relatedQ.views} views</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {relatedQ.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hot Tags */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tags phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['đạo hàm', 'tích phân', 'hàm số', 'phương trình', 'bất phương trình', 'hình học', 'lượng giác'].map((tag, index) => (
                    <Link
                      key={index}
                      href={`/forum/tag/${tag}`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full hover:bg-blue-200 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "QAPage",
            "mainEntity": {
              "@type": "Question",
              "name": question.title,
              "text": question.content,
              "answerCount": question.answers.length,
              "upvoteCount": question.votes,
              "dateCreated": question.createdAt,
              "author": {
                "@type": "Person",
                "name": question.author.name
              },
              ...(question.acceptedAnswerId && {
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": question.answers.find(a => a.id === question.acceptedAnswerId)?.content || "",
                  "upvoteCount": question.answers.find(a => a.id === question.acceptedAnswerId)?.votes || 0,
                  "author": {
                    "@type": "Person",
                    "name": question.answers.find(a => a.id === question.acceptedAnswerId)?.author.name || ""
                  }
                }
              })
            }
          })
        }}
      />
    </div>
  );
}
