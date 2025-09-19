import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookDetailClient from './BookDetailClient';

interface Book {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    id: string;
    avatar: string;
    bio: string;
  };
  category: {
    name: string;
    slug: string;
  };
  isbn: string;
  coverImage: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  totalQuestions: number;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  publishedAt: string;
  features: string[];
  chapters: BookChapter[];
  reviews: BookReview[];
  relatedBooks: RelatedBook[];
  tags: string[];
  activationInfo: {
    accessDuration: string;
    videoContent: boolean;
    textSolutions: boolean;
    imageSolutions: boolean;
  };
}

interface BookChapter {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  orderIndex: number;
}

interface BookReview {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
}

interface RelatedBook {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  price: number;
  originalPrice?: number;
  rating: number;
  slug: string;
}

// Mock data - sẽ được thay thế bằng API calls
const mockBook: Book = {
  id: 'toan-hoc-lop-12-nang-cao',
  title: 'Sách Toán học lớp 12 - Nâng cao (Kèm video giải bài tập)',
  description: `Sách Toán học lớp 12 nâng cao được biên soạn theo chương trình mới nhất của Bộ Giáo dục và Đào tạo. Sách bao gồm đầy đủ các chương: Ứng dụng đạo hàm, Hàm số mũ và logarit, Nguyên hàm - tích phân, Số phức, Hình học không gian.

**Đặc biệt:** Mỗi câu hỏi trong sách đều được gán mã ID riêng, học sinh có thể tra cứu video giải bài tập chi tiết thông qua việc kích hoạt mã truy cập.

**Phù hợp cho:** 
- Học sinh lớp 12 chuẩn bị thi THPT Quốc gia
- Học sinh muốn nâng cao kiến thức Toán học
- Giáo viên tham khảo phương pháp giảng dạy`,
  author: {
    name: 'PGS. TS. Nguyễn Văn Toán',
    id: 'nguyen-van-toan',
    avatar: '/images/authors/author-1.png',
    bio: 'Phó Giáo sư, Tiến sĩ Toán học với hơn 20 năm kinh nghiệm giảng dạy tại các trường đại học hàng đầu.'
  },
  category: {
    name: 'Sách Toán học',
    slug: 'sach-toan-hoc'
  },
  isbn: '978-604-0-12345-6',
  coverImage: '/images/books/toan-12-cover.jpg',
  price: 299000,
  originalPrice: 399000,
  discountPercent: 25,
  totalQuestions: 850,
  rating: 4.8,
  reviewsCount: 234,
  isActive: true,
  publishedAt: '2024-01-01',
  features: [
    'Video giải bài tập chi tiết cho mỗi câu hỏi',
    'Lời giải bằng text và hình ảnh',
    'Truy cập trong 2 năm sau khi kích hoạt',
    'Tra cứu nhanh theo mã ID câu hỏi',
    'Cập nhật nội dung liên tục',
    'Hỗ trợ học tập 24/7'
  ],
  chapters: [
    {
      id: 'chuong-1',
      title: 'Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
      description: 'Sự biến thiên của hàm số, cực trị, giá trị lớn nhất và nhỏ nhất',
      questionCount: 150,
      orderIndex: 1
    },
    {
      id: 'chuong-2',
      title: 'Chương 2: Hàm số mũ và hàm số logarit',
      description: 'Lũy thừa, hàm số mũ, hàm số logarit và các ứng dụng',
      questionCount: 120,
      orderIndex: 2
    },
    {
      id: 'chuong-3',
      title: 'Chương 3: Nguyên hàm, tích phân và ứng dụng',
      description: 'Nguyên hàm, tích phân xác định và ứng dụng hình học',
      questionCount: 180,
      orderIndex: 3
    },
    {
      id: 'chuong-4',
      title: 'Chương 4: Số phức',
      description: 'Khái niệm số phức, các phép toán và ứng dụng',
      questionCount: 100,
      orderIndex: 4
    },
    {
      id: 'chuong-5',
      title: 'Chương 5: Hình học không gian',
      description: 'Khối đa diện, mặt tròn xoay và thể tích',
      questionCount: 200,
      orderIndex: 5
    }
  ],
  reviews: [
    {
      id: '1',
      user: {
        name: 'Nguyễn Thị Lan',
        avatar: '/images/avatars/user-1.png'
      },
      rating: 5,
      comment: 'Sách rất hay! Video giải bài tập rất chi tiết, giúp con em hiểu bài tốt hơn. Đáng đồng tiền bát gạo!',
      createdAt: '2024-01-20',
      isVerified: true
    },
    {
      id: '2',
      user: {
        name: 'Trần Văn Nam',
        avatar: '/images/avatars/user-2.png'
      },
      rating: 5,
      comment: 'Chất lượng sách tốt, video HD rõ nét. Cách giải thích dễ hiểu, phù hợp cho học sinh trung bình.',
      createdAt: '2024-01-18',
      isVerified: true
    },
    {
      id: '3',
      user: {
        name: 'Lê Thị Hoa',
        avatar: '/images/avatars/user-3.png'
      },
      rating: 4,
      comment: 'Sách hay, video chất lượng. Chỉ tiếc là một số bài khó chưa có video giải chi tiết.',
      createdAt: '2024-01-15',
      isVerified: false
    }
  ],
  relatedBooks: [
    {
      id: 'vat-ly-12',
      title: 'Sách Vật lý lớp 12 - Nâng cao',
      author: 'TS. Phạm Văn Lý',
      coverImage: '/images/books/vat-ly-12-cover.jpg',
      price: 279000,
      originalPrice: 349000,
      rating: 4.7,
      slug: 'vat-ly-lop-12-nang-cao'
    },
    {
      id: 'hoa-hoc-12',
      title: 'Sách Hóa học lớp 12 - Nâng cao',
      author: 'PGS. Trần Thị Hóa',
      coverImage: '/images/books/hoa-hoc-12-cover.jpg',
      price: 289000,
      originalPrice: 359000,
      rating: 4.6,
      slug: 'hoa-hoc-lop-12-nang-cao'
    },
    {
      id: 'toan-11',
      title: 'Sách Toán học lớp 11 - Cơ bản',
      author: 'TS. Lê Văn Số',
      coverImage: '/images/books/toan-11-cover.jpg',
      price: 259000,
      rating: 4.5,
      slug: 'toan-hoc-lop-11-co-ban'
    }
  ],
  tags: ['Toán 12', 'THPT Quốc gia', 'Nâng cao', 'Video giải bài tập'],
  activationInfo: {
    accessDuration: '2 năm',
    videoContent: true,
    textSolutions: true,
    imageSolutions: true
  }
};

// Mock function to get book data
async function getBook(slug: string): Promise<Book | null> {
  // In real app, this would fetch from API
  if (slug === 'toan-hoc-lop-12-nang-cao') {
    return mockBook;
  }
  return null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const book = await getBook(params.slug);
  
  if (!book) {
    return {
      title: 'Sách không tồn tại - Khởi Trí Số',
    };
  }

  return {
    title: `${book.title} - Khởi Trí Số`,
    description: book.description.substring(0, 160) + '...',
    keywords: book.tags.join(', '),
    authors: [{ name: book.author.name }],
    openGraph: {
      title: book.title,
      description: book.description.substring(0, 160) + '...',
      images: [book.coverImage],
      type: 'website',
    },
  };
}

export default async function BookDetailPage({ params }: { params: { slug: string } }) {
  const book = await getBook(params.slug);

  if (!book) {
    notFound();
  }

  return <BookDetailClient book={book} />;
}

