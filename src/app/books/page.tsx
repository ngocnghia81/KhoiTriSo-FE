import BooksListClient from './BooksListClient';
import { Book } from '@/services/bookApi';
import { PaginationInfo } from '@/hooks/useBooks';

// Revalidate mỗi giờ hoặc on-demand (khi BE gọi revalidate API)
export const revalidate = 3600; // 1 giờ

// Fetch initial books data ở server với ISR
async function fetchInitialBooks(): Promise<{ books: Book[]; pagination: PaginationInfo } | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // Fetch với default filters: page=1, pageSize=1000, sortBy=createdAt, sortOrder=desc
    // Không gửi approvalStatus - backend sẽ tự động filter cho người dùng thường
    const params = new URLSearchParams({
      page: '1',
      pageSize: '1000',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    
    const response = await fetch(`${baseUrl}/books?${params.toString()}`, {
      next: { 
        revalidate: 3600, // Cache 1 giờ
        tags: ['books-list'] // Tag để on-demand revalidation
      },
      headers: {
        'Accept-Language': 'vi',
      }
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch initial books');
      return null;
    }
    
    const result = await response.json();
    const booksData = result?.Result || result;
    
    // Transform PascalCase to camelCase
    const transformedBooks: Book[] = (booksData?.Items || booksData?.items || []).map((book: any) => ({
      id: book.Id || book.id,
      title: book.Title || book.title,
      description: book.Description || book.description,
      authorId: book.AuthorId || book.authorId,
      authorName: book.AuthorName || book.authorName,
      categoryId: book.CategoryId || book.categoryId,
      categoryName: book.CategoryName || book.categoryName,
      coverImage: book.CoverImage || book.coverImage,
      price: book.Price || book.price || 0,
      isFree: book.IsFree || book.isFree || false,
      isOwned: book.IsOwned || book.isOwned || false,
      approvalStatus: book.ApprovalStatus || book.approvalStatus || 0,
      rating: book.Rating || book.rating,
      totalReviews: book.TotalReviews || book.totalReviews,
      totalQuestions: book.TotalQuestions || book.totalQuestions,
      totalChapters: book.TotalChapters || book.totalChapters,
      createdAt: book.CreatedAt || book.createdAt,
      updatedAt: book.UpdatedAt || book.updatedAt,
    }));
    
    const totalItems = booksData?.Total || booksData?.total || transformedBooks.length;
    const pageSize = booksData?.PageSize || booksData?.pageSize || 1000;
    const currentPage = booksData?.Page || booksData?.page || 1;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    
    const pagination: PaginationInfo = {
      currentPage,
      totalPages,
      totalItems,
      pageSize,
    };
    
    return {
      books: transformedBooks,
      pagination,
    };
  } catch (error) {
    console.error('Error fetching initial books:', error);
    return null;
  }
}

// Server Component - Fetch initial data và render
export default async function BooksPage() {
  const initialData = await fetchInitialBooks();
  
  // Nếu không fetch được data, vẫn render client component (nó sẽ tự fetch)
  // Không cần notFound() vì client component sẽ handle error state
  
  return (
    <BooksListClient 
      initialBooks={initialData?.books}
      initialPagination={initialData?.pagination}
    />
  );
}
