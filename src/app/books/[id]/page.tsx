import { notFound } from 'next/navigation';
import BooksDetailClient from './BooksDetailClient';
import { Book, BookChapter } from '@/services/bookApi';

// Revalidate mỗi giờ hoặc on-demand (khi BE gọi revalidate API)
export const revalidate = 3600; // 1 giờ

// Fetch initial book data ở server với ISR
async function fetchBookData(id: number): Promise<{
  book: Book | null;
  chapters: BookChapter[];
} | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // Fetch book details
    const bookRes = await fetch(`${baseUrl}/books/${id}`, {
      next: { 
        revalidate: 3600, // Cache 1 giờ
        tags: [`book-${id}`] // Tag để on-demand revalidation
      },
      headers: {
        'Accept-Language': 'vi',
      }
    });
    
    if (!bookRes.ok) {
      console.warn('Failed to fetch book:', bookRes.status);
      return null;
    }
    
    const bookData = await bookRes.json();
    const bookResult = bookData?.Result || bookData;
    
    if (!bookResult) {
      return null;
    }
    
    // Transform book
    const categoryObj = bookResult.Category || bookResult.category;
    const book: Book = {
      id: bookResult.Id || bookResult.id || id,
      title: bookResult.Title || bookResult.title || '',
      description: bookResult.Description || bookResult.description,
      authorId: bookResult.AuthorId || bookResult.authorId || 0,
      authorName: bookResult.AuthorName || bookResult.authorName,
      categoryId: bookResult.CategoryId || bookResult.categoryId || categoryObj?.Id || categoryObj?.id,
      categoryName: bookResult.CategoryName || bookResult.categoryName || categoryObj?.Name || categoryObj?.name,
      coverImage: bookResult.CoverImage || bookResult.coverImage,
      price: bookResult.Price || bookResult.price || 0,
      isFree: bookResult.IsFree || bookResult.isFree || false,
      isOwned: bookResult.IsOwned || bookResult.isOwned || false,
      approvalStatus: bookResult.ApprovalStatus || bookResult.approvalStatus || 0,
      rating: bookResult.Rating || bookResult.rating,
      totalReviews: bookResult.TotalReviews || bookResult.totalReviews,
      totalQuestions: bookResult.TotalQuestions || bookResult.totalQuestions,
      totalChapters: bookResult.TotalChapters || bookResult.totalChapters,
      createdAt: bookResult.CreatedAt || bookResult.createdAt || '',
      updatedAt: bookResult.UpdatedAt || bookResult.updatedAt,
      isbn: bookResult.Isbn || bookResult.isbn,
    };
    
    // Fetch chapters
    let chapters: BookChapter[] = [];
    
    // First try to use chapters from bookData if available
    if (bookResult.Chapters && Array.isArray(bookResult.Chapters) && bookResult.Chapters.length > 0) {
      chapters = bookResult.Chapters.map((ch: {
        Id?: number;
        id?: number;
        BookId?: number;
        bookId?: number;
        Title?: string;
        title?: string;
        Content?: string;
        content?: string;
        Description?: string;
        description?: string;
        OrderIndex?: number;
        orderIndex?: number;
        IsPublished?: boolean;
        isPublished?: boolean;
        CanView?: boolean;
        canView?: boolean;
        QuestionCount?: number;
        questionCount?: number;
        CreatedAt?: string;
        createdAt?: string;
        UpdatedAt?: string;
        updatedAt?: string;
      }) => ({
        id: ch.Id || ch.id || 0,
        bookId: ch.BookId || ch.bookId || id,
        title: ch.Title || ch.title || '',
        content: ch.Content || ch.content,
        description: ch.Description || ch.description,
        orderIndex: ch.OrderIndex || ch.orderIndex || 0,
        isPublished: ch.IsPublished !== false && ch.isPublished !== false,
        canView: ch.CanView !== false && ch.canView !== false,
        questionCount: ch.QuestionCount || ch.questionCount,
        createdAt: ch.CreatedAt || ch.createdAt || '',
        updatedAt: ch.UpdatedAt || ch.updatedAt,
      }));
    } else {
      // Fallback: fetch chapters separately
      try {
        const chaptersRes = await fetch(`${baseUrl}/books/${id}/chapters`, {
          next: { 
            revalidate: 3600,
            tags: [`book-${id}`]
          },
          headers: {
            'Accept-Language': 'vi',
          }
        });
        
        if (chaptersRes.ok) {
          const chaptersData = await chaptersRes.json();
          const chaptersResult = chaptersData?.Result || chaptersData;
          const chaptersItems = chaptersResult?.Chapters || chaptersResult?.chapters || chaptersResult;
          const chaptersArray = Array.isArray(chaptersItems) ? chaptersItems : [];
          
          chapters = chaptersArray.map((ch: {
            Id?: number;
            id?: number;
            BookId?: number;
            bookId?: number;
            Title?: string;
            title?: string;
            Content?: string;
            content?: string;
            Description?: string;
            description?: string;
            OrderIndex?: number;
            orderIndex?: number;
            IsPublished?: boolean;
            isPublished?: boolean;
            CanView?: boolean;
            canView?: boolean;
            QuestionCount?: number;
            questionCount?: number;
            CreatedAt?: string;
            createdAt?: string;
            UpdatedAt?: string;
            updatedAt?: string;
          }) => ({
            id: ch.Id || ch.id || 0,
            bookId: ch.BookId || ch.bookId || id,
            title: ch.Title || ch.title || '',
            content: ch.Content || ch.content,
            description: ch.Description || ch.description,
            orderIndex: ch.OrderIndex || ch.orderIndex || 0,
            isPublished: ch.IsPublished !== false && ch.isPublished !== false,
            canView: ch.CanView !== false && ch.canView !== false,
            questionCount: ch.QuestionCount || ch.questionCount,
            createdAt: ch.CreatedAt || ch.createdAt || '',
            updatedAt: ch.UpdatedAt || ch.updatedAt,
          }));
        }
      } catch (err) {
        console.error('Error fetching chapters:', err);
        chapters = [];
      }
    }
    
    // Sort chapters by orderIndex
    chapters.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    
    return {
      book,
      chapters,
    };
  } catch (error) {
    console.error('Error fetching book data:', error);
    return null;
  }
}

// Server Component - Fetch initial data và render
export default async function BookDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const bookId = parseInt(id);
  
  if (!bookId || isNaN(bookId)) {
    notFound();
  }
  
  const initialData = await fetchBookData(bookId);
  
  if (!initialData || !initialData.book) {
    notFound();
  }

  return (
    <BooksDetailClient 
      initialBook={initialData.book}
      initialChapters={initialData.chapters}
      bookId={bookId}
    />
  );
}
