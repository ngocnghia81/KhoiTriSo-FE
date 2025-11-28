import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage, retryRequest, throttleRequest } from '../utils/apiHelpers';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export interface Book {
  id: number;
  title: string;
  description?: string;
  authorId: number;
  authorName?: string;
  categoryId?: number;
  categoryName?: string;
  coverImage?: string;
  price: number;
  isFree: boolean;
  isOwned?: boolean; // User đã mua/kích hoạt sách này chưa
  approvalStatus: number;
  isActive?: boolean; // Trạng thái hoạt động của sách
  rating?: number; // Average rating from reviews
  totalReviews?: number; // Total number of reviews
  isbn?: string;
  language?: string;
  publicationYear?: number;
  edition?: string;
  totalQuestions?: number;
  totalChapters?: number;
  chapters?: BookChapter[]; // Chapters từ GetBookById
  createdAt: string;
  updatedAt?: string;
}

export interface BookChapter {
  id: number;
  bookId: number;
  title: string;
  content?: string;
  description?: string;
  orderIndex: number;
  isPublished: boolean;
  canView?: boolean; // Chương này có thể xem không
  questionCount?: number;
  questions?: any[];
  createdAt: string;
  updatedAt?: string;
}

export interface QuestionOption {
  Id?: number;
  id?: number;
  QuestionId?: number;
  questionId?: number;
  OptionText?: string;
  optionText?: string;
  IsCorrect?: boolean;
  isCorrect?: boolean;
  PointsValue?: number;
  pointsValue?: number;
  OrderIndex?: number;
  orderIndex?: number;
  CreatedAt?: string;
  createdAt?: string;
  UpdatedAt?: string;
  updatedAt?: string;
}

export interface BookQuestion {
  id: number;
  bookId?: number;
  chapterId?: number;
  question?: string;
  QuestionContent?: string;
  questionType?: number;
  QuestionType?: number;
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  explanationContent?: string;
  ExplanationContent?: string;
  videoUrl?: string;
  VideoUrl?: string;
  difficulty?: number;
  DifficultyLevel?: number;
  orderIndex?: number;
  OrderIndex?: number;
}

export interface ActivationCode {
  id: number;
  bookId: number;
  code: string;
  isUsed: boolean;
  usedBy?: number;
  usedAt?: string;
  createdAt: string;
}

export interface BookActivationRequest {
  activationCode: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  Success?: boolean;
  result?: T;
  Result?: T;
  message?: string;
  Message?: string;
  error?: any;
  Error?: any;
}

class BookApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  
  /**
   * Internal fetch method that uses authenticatedFetch for automatic token refresh
   */
  private async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Ensure full URL
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    return authenticatedFetch(fullUrl, options);
  }
  
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    console.log('BookApi - Token:', token ? 'Present' : 'Missing');
    console.log('BookApi - Token length:', token?.length || 0);
    
    if (!token) {
      console.warn('BookApi - No token found in localStorage');
      return {};
    }
    
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get books with filters
   */
  async getBooks(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
    approvalStatus?: number;
    authorId?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<Book[]> {
    const url = this.buildUrlWithParams('/api/books', params);
    
    const cacheKey = `books-${JSON.stringify(params)}`;
    const response = await throttleRequest(cacheKey, async () => {
      // Use authenticatedFetch for automatic token refresh
      return await authenticatedFetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    });
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No books data received');
      }
      
      // Handle different response formats
      // Backend returns: { Items: [...], Total: number, Page: number, PageSize: number }
      let books = [];
      if (Array.isArray(extracted)) {
        books = extracted;
      } else if (extracted.Items || extracted.items) {
        books = extracted.Items || extracted.items;
      } else if (extracted.Result || extracted.result) {
        books = extracted.Result || extracted.result;
      }
      
      return Array.isArray(books) ? books.map(this.mapBook) : [];
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Get books with pagination info
   */
  async getBooksWithPagination(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
    approvalStatus?: number;
    authorId?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<{ books: Book[]; total: number; page: number; pageSize: number }> {
    const url = this.buildUrlWithParams('/api/books', params);
    
    const cacheKey = `books-paginated-${JSON.stringify(params)}`;
    const response = await throttleRequest(cacheKey, async () => {
      return await retryRequest(async () => {
        const authHeaders = this.getAuthHeaders();
        // Use authenticatedFetch for automatic token refresh
        const res = await this.authenticatedRequest(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        return res;
      });
    });
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No books data received');
      }
      
      // Backend returns: { Items: [...], Total: number, Page: number, PageSize: number }
      let books = [];
      let total = 0;
      let page = params.page || 1;
      let pageSize = params.pageSize || 20;
      
      if (Array.isArray(extracted)) {
        books = extracted;
        total = extracted.length;
      } else {
        books = extracted.Items || extracted.items || extracted.Result || extracted.result || [];
        total = extracted.Total || extracted.total || extracted.TotalCount || extracted.totalCount || books.length;
        page = extracted.Page || extracted.page || page;
        pageSize = extracted.PageSize || extracted.pageSize || pageSize;
      }
      
      return {
        books: Array.isArray(books) ? books.map(this.mapBook) : [],
        total,
        page,
        pageSize
      };
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Get book details by ID
   */
  async getBookById(id: number): Promise<Book> {
    const response = await throttleRequest(`book-${id}`, async () => {
      return await retryRequest(async () => {
        const res = await this.authenticatedRequest(`/api/books/${id}`, {
          method: 'GET',
        });
        return res;
      });
    });
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No book data received');
      }
      return this.mapBook(extracted);
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Get book chapters
   */
  async getBookChapters(bookId: number): Promise<BookChapter[]> {
    console.log(`BookApi - Getting chapters for book ${bookId}`);
    
    const { fetchWithAutoRefresh } = await import('../utils/apiHelpers');
    const { retryRequest } = await import('../utils/apiHelpers');
    
    const response = await retryRequest(async () => {
      return await fetchWithAutoRefresh(`${this.baseUrl}/api/books/${bookId}/chapters`, {
        method: 'GET',
        headers: this.getAuthHeaders() as HeadersInit
      });
    });
    
    const result = await safeJsonParse(response);
    console.log('BookApi - Parsed result:', result);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No chapters data received');
      }
      
      // Handle both direct array and Chapters property
      const chaptersData = extracted.Chapters || extracted.chapters || extracted;
      const chapters = Array.isArray(chaptersData) ? chaptersData : [];
      console.log(`BookApi - Found ${chapters.length} chapters`);
      return chapters.map(chapter => this.mapBookChapter(chapter));
    } else {
      console.error('BookApi - Unsuccessful response:', result);
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Get book chapter by ID
   */
  async getBookChapterById(bookId: number, chapterId: number): Promise<BookChapter> {
    console.log(`BookApi - Getting chapter ${chapterId} for book ${bookId}`);
    
    const { fetchWithAutoRefresh } = await import('../utils/apiHelpers');
    const { retryRequest } = await import('../utils/apiHelpers');
    
    const response = await retryRequest(async () => {
      return await fetchWithAutoRefresh(`${this.baseUrl}/api/books/${bookId}/chapters/${chapterId}`, {
        method: 'GET',
        headers: this.getAuthHeaders() as HeadersInit
      });
    });
    
    const result = await safeJsonParse(response);
    console.log('BookApi - Parsed result:', result);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No chapter data received');
      }
      
      console.log(`BookApi - Found chapter:`, extracted);
      return this.mapBookChapter(extracted);
    } else {
      console.error('BookApi - Unsuccessful response:', result);
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Get book questions
   */
  async getBookQuestions(bookId: number, page: number = 1, pageSize: number = 20): Promise<BookQuestion[]> {
    debugger;
    const { fetchWithAutoRefresh } = await import('../utils/apiHelpers');
    const { retryRequest } = await import('../utils/apiHelpers');
    
    const response = await retryRequest(async () => {
      return await fetchWithAutoRefresh(`${this.baseUrl}/api/books/${bookId}/questions?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: this.getAuthHeaders() as HeadersInit
      });
    });
    
    const result = await safeJsonParse(response);
    console.log('getBookQuestions - Parsed result:', result);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      console.log('getBookQuestions - Extracted:', extracted);
      
      if (!extracted) {
        throw new Error('No questions data received');
      }
      
      // Response structure: { Result: { Items: [...], Total: ... } }
      // So extracted = Result object, and extracted.Items = questions array
      const questions = extracted.Items || extracted.items || 
                       (Array.isArray(extracted) ? extracted : []) || 
                       extracted.Result || extracted.result || [];
      
      console.log('getBookQuestions - Questions array:', questions);
      console.log('getBookQuestions - Questions count:', Array.isArray(questions) ? questions.length : 0);
      
      const mapped = Array.isArray(questions) ? questions.map(this.mapBookQuestion) : [];
      console.log('getBookQuestions - Mapped questions:', mapped);
      
      return mapped;
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Get all questions (from all books)
   */
  async getAllQuestions(page: number = 1, pageSize: number = 20): Promise<{ questions: BookQuestion[]; total: number }> {
    const response = await retryRequest(async () => {
      const res = await this.authenticatedRequest(`/api/questions?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
      });
      return res;
    });
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No questions data received');
      }
      
      const questions = extracted.Items || extracted.items || extracted.Result || extracted.result || [];
      const total = extracted.Total || extracted.total || extracted.TotalCount || extracted.totalCount || questions.length;
      
      return {
        questions: Array.isArray(questions) ? questions.map(this.mapBookQuestion) : [],
        total
      };
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Validate activation code
   */
  async validateActivationCode(code: string): Promise<{ isValid: boolean; bookId?: number; bookTitle?: string }> {
    const response = await retryRequest(async () => {
      const res = await this.authenticatedRequest(`/api/books/activation-codes/${code}/validate`, {
        method: 'GET',
      });
      return res;
    });
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No validation data received');
      }
      return {
        isValid: extracted.isValid || extracted.IsValid || false,
        bookId: extracted.bookId || extracted.BookId,
        bookTitle: extracted.bookTitle || extracted.BookTitle
      };
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Activate book with code
   */
  async activateBook(activationCode: string): Promise<{ success: boolean; message: string }> {
    const response = await retryRequest(async () => {
      const res = await this.authenticatedRequest(`/api/books/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activationCode })
      });
      return res;
    });
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      return {
        success: true,
        message: extractMessage(result)
      };
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Delete a book
   */
  async deleteBook(bookId: number): Promise<{ success: boolean; message: string }> {
    const response = await this.authenticatedRequest(`/api/books/${bookId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      return {
        success: true,
        message: extractMessage(result)
      };
    } else {
      throw new Error(extractMessage(result));
    }
  }

  async disableBook(bookId: number): Promise<Book> {
    const response = await this.authenticatedRequest(`/api/books/${bookId}/disable`, {
      method: 'PUT',
    });
    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Không thể vô hiệu hóa sách');
    }
    const extracted = extractResult(result);
    if (!extracted) {
      throw new Error('No book data received');
    }
    return this.mapBook(extracted);
  }

  async restoreBook(bookId: number): Promise<Book> {
    const response = await this.authenticatedRequest(`/api/books/${bookId}/restore`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No book data received');
      }
      return this.mapBook(extracted);
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Get activation codes for a book
   */
  async getActivationCodes(bookId: number, page: number = 1, pageSize: number = 20): Promise<any[]> {
    const response = await retryRequest(async () => {
      const res = await this.authenticatedRequest(`/api/books/${bookId}/activation-codes?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
      });
      return res;
    });
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No activation codes data received');
      }
      
      const codes = extracted.Items || extracted.items || extracted.Result || extracted.result || [];
      return Array.isArray(codes) ? codes : [];
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Generate activation codes for a book
   */
  async generateActivationCodes(bookId: number, request: any): Promise<any> {
    const response = await retryRequest(async () => {
      const res = await this.authenticatedRequest(`/api/books/${bookId}/activation-codes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      return res;
    });
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No generation result received');
      }
      return extracted;
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Update a book
   */
  async updateBook(bookId: number, request: any): Promise<any> {
    const response = await retryRequest(async () => {
      const res = await this.authenticatedRequest(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      return res;
    });
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No update result received');
      }
      return extracted;
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Get user's activated books
   */
  async getMyBooks(page: number = 1, pageSize: number = 20): Promise<Book[]> {
    const response = await retryRequest(async () => {
      const res = await this.authenticatedRequest(`/api/books/my-books?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
      });
      return res;
    });
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No books data received');
      }
      
      const books = extracted.Items || extracted.items || extracted.Result || extracted.result || [];
      return Array.isArray(books) ? books.map(this.mapBook) : [];
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Helper methods
   */
  private buildUrlWithParams(baseUrl: string, params: Record<string, any>): string {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        urlParams.append(key, value.toString());
      }
    });
    
    const queryString = urlParams.toString();
    return queryString ? `${this.baseUrl}${baseUrl}?${queryString}` : `${this.baseUrl}${baseUrl}`;
  }

  private mapBook(book: any): Book {
    const categoryObj = book.category || book.Category || {};
    const parsedRating = book.rating ?? book.Rating;

    const chapters = book.chapters || book.Chapters;
    const mappedChapters = chapters && Array.isArray(chapters) 
      ? chapters.map((ch: any) => this.mapBookChapter(ch))
      : undefined;
    
    return {
      id: book.id || book.Id,
      title: book.title || book.Title,
      description: book.description || book.Description,
      authorId: book.authorId || book.AuthorId,
      authorName: book.authorName || book.AuthorName || (book.Author?.FullName || book.author?.fullName),
      categoryId: book.categoryId || book.CategoryId || categoryObj.Id || categoryObj.id,
      categoryName: book.categoryName || book.CategoryName || categoryObj.Name || categoryObj.name,
      coverImage: book.coverImage || book.CoverImage,
      price: book.price || book.Price || 0,
      isFree: (book.price || book.Price || 0) === 0,
      isOwned: book.isOwned !== undefined ? book.isOwned : (book.IsOwned !== undefined ? book.IsOwned : false),
      approvalStatus: book.approvalStatus || book.ApprovalStatus || 0,
      isActive: book.isActive !== undefined ? book.isActive : (book.IsActive !== undefined ? book.IsActive : true),
      rating: typeof parsedRating === 'string' ? parseFloat(parsedRating) : parsedRating,
      totalReviews: book.totalReviews || book.TotalReviews,
      isbn: book.isbn || book.Isbn,
      language: book.language || book.Language,
      publicationYear: book.publicationYear || book.PublicationYear,
      edition: book.edition || book.Edition,
      totalQuestions: book.totalQuestions || book.TotalQuestions,
      totalChapters: book.totalChapters || book.TotalChapters || (mappedChapters?.length || 0),
      chapters: mappedChapters,
      createdAt: book.createdAt || book.CreatedAt,
      updatedAt: book.updatedAt || book.UpdatedAt
    };
  }

  private mapBookChapter(chapter: any): BookChapter {
    const questions = chapter.questions || chapter.Questions || [];
    console.log('mapBookChapter - Questions:', questions);
    console.log('mapBookChapter - Questions length:', Array.isArray(questions) ? questions.length : 0);
    
    // Map questions để đảm bảo ExplanationContent và các field khác được map đúng
    const mappedQuestions = Array.isArray(questions) 
      ? questions.map((q: any) => this.mapBookQuestion(q))
      : [];
    
    // Map canView - ưu tiên canView (camelCase), sau đó CanView (PascalCase), mặc định true
    const canViewValue = chapter.canView !== undefined 
      ? chapter.canView 
      : (chapter.CanView !== undefined ? chapter.CanView : true);
    
    console.log('mapBookChapter - canView mapping:', {
      'chapter.canView': chapter.canView,
      'chapter.CanView': chapter.CanView,
      'mapped canView': canViewValue,
      'chapter object': chapter
    });
    
    return {
      id: chapter.id || chapter.Id,
      bookId: chapter.bookId || chapter.BookId,
      title: chapter.title || chapter.Title,
      content: chapter.content || chapter.Content || chapter.Description || chapter.description,
      description: chapter.description || chapter.Description || chapter.content || chapter.Content,
      orderIndex: chapter.orderIndex || chapter.OrderIndex || 0,
      isPublished: chapter.isPublished || chapter.IsPublished || true,
      canView: canViewValue,
      questionCount: chapter.questionCount || chapter.QuestionCount || 0,
      questions: mappedQuestions,
      createdAt: chapter.createdAt || chapter.CreatedAt,
      updatedAt: chapter.updatedAt || chapter.UpdatedAt
    };
  }

  private mapBookQuestion(question: any): BookQuestion {
    const chapterId = question.chapterId || question.ChapterId;
    
    // Map options để đảm bảo các field được map đúng
    const rawOptions = question.options || question.Options || [];
    const mappedOptions = Array.isArray(rawOptions) 
      ? rawOptions.map((opt: any) => ({
          Id: opt.Id || opt.id,
          id: opt.id || opt.Id,
          QuestionId: opt.QuestionId || opt.questionId,
          questionId: opt.questionId || opt.QuestionId,
          OptionText: opt.OptionText || opt.optionText,
          optionText: opt.optionText || opt.OptionText,
          IsCorrect: opt.IsCorrect !== undefined ? opt.IsCorrect : (opt.isCorrect !== undefined ? opt.isCorrect : false),
          isCorrect: opt.isCorrect !== undefined ? opt.isCorrect : (opt.IsCorrect !== undefined ? opt.IsCorrect : false),
          PointsValue: opt.PointsValue || opt.pointsValue,
          pointsValue: opt.pointsValue || opt.PointsValue,
          OrderIndex: opt.OrderIndex || opt.orderIndex,
          orderIndex: opt.orderIndex || opt.OrderIndex,
          CreatedAt: opt.CreatedAt || opt.createdAt,
          createdAt: opt.createdAt || opt.CreatedAt,
          UpdatedAt: opt.UpdatedAt || opt.updatedAt,
          updatedAt: opt.updatedAt || opt.UpdatedAt
        }))
      : [];
    
    const mapped = {
      id: question.id || question.Id,
      bookId: question.bookId || question.BookId || question.ContextId,
      chapterId: chapterId,
      question: question.question || question.Question || question.QuestionContent,
      QuestionContent: question.QuestionContent || question.question || question.Question,
      questionType: question.questionType || question.QuestionType || 1,
      QuestionType: question.QuestionType || question.questionType || 1,
      options: mappedOptions,
      correctAnswer: question.correctAnswer || question.CorrectAnswer,
      explanation: question.explanation || question.Explanation || question.ExplanationContent,
      explanationContent: question.explanationContent || question.ExplanationContent || question.explanation || question.Explanation,
      ExplanationContent: question.ExplanationContent || question.explanationContent || question.explanation || question.Explanation,
      videoUrl: question.videoUrl || question.VideoUrl,
      VideoUrl: question.VideoUrl || question.videoUrl,
      difficulty: question.difficulty || question.Difficulty || question.DifficultyLevel || 1,
      DifficultyLevel: question.DifficultyLevel || question.difficulty || question.Difficulty || 1,
      orderIndex: question.orderIndex || question.OrderIndex || 0,
      OrderIndex: question.OrderIndex || question.orderIndex || 0
    };
    console.log('mapBookQuestion:', { 
      originalChapterId: question.ChapterId || question.chapterId,
      mappedChapterId: mapped.chapterId,
      questionId: mapped.id,
      hasExplanation: !!mapped.explanationContent,
      optionsCount: mappedOptions.length
    });
    return mapped;
  }

  async exportToWord(bookId: number, includeExplanation: boolean = false): Promise<Blob> {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = `${this.baseUrl}/api/books/${bookId}/export-word?includeExplanation=${includeExplanation}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to export book: ${errorText}`);
    }

    return await response.blob();
  }
}

export const bookApiService = new BookApiService();
