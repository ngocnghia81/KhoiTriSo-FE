import { useState, useCallback, useEffect } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { API_URLS } from '@/lib/api-config';
import {
  Book,
  BookListDto,
  BookDetailDto,
  BookFilters,
  PagedResult,
  CreateBookRequest,
  UpdateBookRequest,
  BookChapter,
  BookChapterDto,
  BookChaptersResponseDto,
  CreateBookChapterRequest,
  UpdateBookChapterRequest,
  BookQuestion,
  BookQuestionDto,
  CreateBookQuestionRequest,
  UpdateBookQuestionRequest,
  ActivationCode,
  ActivationCodeDto,
  GenerateActivationCodeRequest,
  BookActivationRequestDto,
  BookActivationResponseDto,
  ActivateCodeResponseDto,
  ValidateCodeResponseDto,
  MyBooksResponseDto,
} from '@/types/book';

export const useBooks = (filters: BookFilters) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<PagedResult<BookListDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    console.log('useBooks: fetchBooks called with filters:', filters);
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('page', filters.page.toString());
      params.append('pageSize', filters.pageSize.toString());
      
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.approvalStatus !== undefined) params.append('approvalStatus', filters.approvalStatus.toString());
      if (filters.authorId) params.append('authorId', filters.authorId.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      console.log('API_URLS.BOOKS_BASE:', API_URLS.BOOKS_BASE);
      const url = `${API_URLS.BOOKS_BASE}?${params.toString()}`;
      console.log('Books API URL:', url);
      console.log('About to call authenticatedFetch with URL:', url);
      
      const response = await authenticatedFetch(url);
      console.log('Response received:', response);
      const result = await response.json();
      
      console.log('Books API Response:', {
        ok: response.ok,
        status: response.status,
        result: result
      });
      
      if (response.ok && result.Result) {
        // Handle nested Result structure
        const booksData = result.Result.Result || result.Result;
        
        // Transform PascalCase to camelCase and map book items
        const transformedItems = (booksData.Items || booksData.items || []).map((book: any) => ({
          id: book.Id || book.id,
          title: book.Title || book.title,
          description: book.Description || book.description,
          coverImage: book.CoverImage || book.coverImage,
          isbn: book.Isbn || book.isbn,
          price: book.Price || book.price,
          qualityScore: book.QualityScore || book.qualityScore,
          approvalStatus: book.ApprovalStatus || book.approvalStatus,
          isActive: book.IsActive || book.isActive,
          authorId: book.AuthorId || book.authorId,
          categoryId: book.CategoryId || book.categoryId,
          createdAt: book.CreatedAt || book.createdAt,
          updatedAt: book.UpdatedAt || book.updatedAt,
          author: book.Author ? {
            id: book.Author.Id || book.Author.id,
            fullName: book.Author.FullName || book.Author.fullName,
            email: book.Author.Email || book.Author.email
          } : undefined,
          category: book.Category ? {
            id: book.Category.Id || book.Category.id,
            name: book.Category.Name || book.Category.name
          } : undefined,
          totalReviews: book.TotalReviews || book.totalReviews || 0,
          rating: book.Rating || book.rating || 0
        }));
        
        const transformedData = {
          items: transformedItems,
          total: booksData.Total || booksData.total || 0,
          page: booksData.Page || booksData.page || 1,
          pageSize: booksData.PageSize || booksData.pageSize || 20
        };

        console.log('transformedData:', transformedData);
        
        setData(transformedData);
      } else {
        setError(result.Message || 'Failed to fetch books');
      }
    } catch (err) {
      setError('Failed to fetch books');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, authenticatedFetch]);

  // Add useEffect to call fetchBooks when filters change
  useEffect(() => {
    console.log('useBooks: useEffect triggered, calling fetchBooks');
    fetchBooks();
  }, [filters.page, filters.pageSize, filters.search, filters.categoryId, filters.approvalStatus, filters.authorId, filters.sortBy, filters.sortOrder]);

  return { data, loading, error, refetch: fetchBooks };
};

export const useBook = (id: number) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<BookDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBook = useCallback(async () => {
    console.log('useBook: fetchBook called with id:', id);
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `${API_URLS.BOOKS_BY_ID_BASE}/${id}`;
      console.log('useBook: API URL:', url);
      const response = await authenticatedFetch(url);
      console.log('useBook: Response received:', response);
      const result = await response.json();
      
      if (response.ok && result.Result) {
        // Transform PascalCase to camelCase
        const bookData = result.Result;
        const transformedBook = {
          id: bookData.Id || bookData.id,
          title: bookData.Title || bookData.title,
          description: bookData.Description || bookData.description,
          coverImage: bookData.CoverImage || bookData.coverImage,
          isbn: bookData.Isbn || bookData.isbn,
          price: bookData.Price || bookData.price,
          qualityScore: bookData.QualityScore || bookData.qualityScore,
          approvalStatus: bookData.ApprovalStatus || bookData.approvalStatus,
          isActive: bookData.IsActive || bookData.isActive,
          authorId: bookData.AuthorId || bookData.authorId,
          categoryId: bookData.CategoryId || bookData.categoryId,
          createdAt: bookData.CreatedAt || bookData.createdAt,
          updatedAt: bookData.UpdatedAt || bookData.updatedAt,
          author: bookData.Author ? {
            id: bookData.Author.Id || bookData.Author.id,
            fullName: bookData.Author.FullName || bookData.Author.fullName,
            email: bookData.Author.Email || bookData.Author.email
          } : undefined,
          category: bookData.Category ? {
            id: bookData.Category.Id || bookData.Category.id,
            name: bookData.Category.Name || bookData.Category.name
          } : undefined,
          totalReviews: bookData.TotalReviews || bookData.totalReviews || 0,
          rating: bookData.Rating || bookData.rating || 0,
          chapters: bookData.Chapters || bookData.chapters || [],
          questions: bookData.Questions || bookData.questions || [],
          isOwned: bookData.IsOwned || bookData.isOwned || false
        };
        
        console.log('useBook: transformed book:', transformedBook);
        setData(transformedBook);
      } else {
        setError(result.Message || 'Failed to fetch book');
      }
    } catch (err) {
      setError('Failed to fetch book');
      console.error('Error fetching book:', err);
    } finally {
      setLoading(false);
    }
  }, [id, authenticatedFetch]);

  // Add useEffect to call fetchBook when id changes
  useEffect(() => {
    console.log('useBook: useEffect triggered, calling fetchBook');
    fetchBook();
  }, [id]);

  return { data, loading, error, refetch: fetchBook };
};

export const useCreateBook = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBook = useCallback(async (request: CreateBookRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(API_URLS.BOOKS_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (response.ok && result.Result) {
        return result.Result;
      } else {
        setError(result.Message || 'Failed to create book');
        return null;
      }
    } catch (err) {
      setError('Failed to create book');
      console.error('Error creating book:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { createBook, loading, error };
};

export const useUpdateBook = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBook = useCallback(async (id: number, request: UpdateBookRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_BY_ID_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (response.ok && result.Result) {
        return result.Result;
      } else {
        setError(result.Message || 'Failed to update book');
        return null;
      }
    } catch (err) {
      setError('Failed to update book');
      console.error('Error updating book:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { updateBook, loading, error };
};

export const useDeleteBook = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBook = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_BY_ID_BASE}/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (response.ok) {
        return true;
      } else {
        setError(result.Message || 'Failed to delete book');
        return false;
      }
    } catch (err) {
      setError('Failed to delete book');
      console.error('Error deleting book:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { deleteBook, loading, error };
};

export const useBookChapters = (bookId: number) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<BookChaptersResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = useCallback(async () => {
    if (!bookId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_BY_ID_BASE}/${bookId}/chapters`);
      const result = await response.json();
      
      if (response.ok && result.Result) {
        setData(result.Result);
      } else {
        setError(result.Message || 'Failed to fetch chapters');
      }
    } catch (err) {
      setError('Failed to fetch chapters');
      console.error('Error fetching chapters:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId, authenticatedFetch]);

  return { data, loading, error, refetch: fetchChapters };
};

export const useCreateBookChapter = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChapter = useCallback(async (bookId: number, request: CreateBookChapterRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_BY_ID_BASE}/${bookId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (response.ok && result.Result) {
        return result.Result;
      } else {
        setError(result.Message || 'Failed to create chapter');
        return null;
      }
    } catch (err) {
      setError('Failed to create chapter');
      console.error('Error creating chapter:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { createChapter, loading, error };
};

export const useUpdateBookChapter = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateChapter = useCallback(async (bookId: number, chapterId: number, request: UpdateBookChapterRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_BY_ID_BASE}/${bookId}/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (response.ok && result.Result) {
        return result.Result;
      } else {
        setError(result.Message || 'Failed to update chapter');
        return null;
      }
    } catch (err) {
      setError('Failed to update chapter');
      console.error('Error updating chapter:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { updateChapter, loading, error };
};

export const useDeleteBookChapter = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteChapter = useCallback(async (bookId: number, chapterId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_BY_ID_BASE}/${bookId}/chapters/${chapterId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (response.ok) {
        return true;
      } else {
        setError(result.Message || 'Failed to delete chapter');
        return false;
      }
    } catch (err) {
      setError('Failed to delete chapter');
      console.error('Error deleting chapter:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { deleteChapter, loading, error };
};

export const useBookQuestions = (bookId: number, page = 1, pageSize = 20) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<PagedResult<BookQuestionDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    console.log('useBookQuestions: fetchQuestions called with bookId:', bookId, 'page:', page, 'pageSize:', pageSize);
    if (!bookId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `${API_URLS.BOOKS_BY_ID_BASE}/${bookId}/questions?page=${page}&pageSize=${pageSize}`;
      console.log('useBookQuestions: API URL:', url);
      const response = await authenticatedFetch(url);
      console.log('useBookQuestions: Response received:', response);
      const result = await response.json();
      
      if (response.ok && result.Result) {
        // Transform PascalCase to camelCase
        const questionsData = result.Result;
        const transformedItems = (questionsData.Items || questionsData.items || []).map((question: any) => ({
          id: question.Id || question.id,
          questionText: question.QuestionContent || question.questionContent,
          questionType: question.QuestionType || question.questionType,
          difficultyLevel: question.DifficultyLevel || question.difficultyLevel,
          isActive: question.IsActive || question.isActive,
          orderIndex: question.OrderIndex || question.orderIndex,
          createdAt: question.CreatedAt || question.createdAt,
          updatedAt: question.UpdatedAt || question.updatedAt,
          options: question.Options || question.options || [],
          explanationContent: question.ExplanationContent || question.explanationContent,
          defaultPoints: question.DefaultPoints || question.defaultPoints,
          chapterId: question.ChapterId || question.chapterId,
          chapterTitle: question.ChapterTitle || question.chapterTitle
        }));
        
        const transformedData = {
          items: transformedItems,
          total: questionsData.Total || questionsData.total || 0,
          page: questionsData.Page || questionsData.page || 1,
          pageSize: questionsData.PageSize || questionsData.pageSize || 20
        };
        
        console.log('useBookQuestions: transformed data:', transformedData);
        setData(transformedData);
      } else {
        setError(result.Message || 'Failed to fetch questions');
      }
    } catch (err) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId, page, pageSize, authenticatedFetch]);

  // Add useEffect to call fetchQuestions when dependencies change
  useEffect(() => {
    console.log('useBookQuestions: useEffect triggered with bookId:', bookId, 'page:', page, 'pageSize:', pageSize);
    fetchQuestions();
  }, [bookId, page, pageSize]);

  return { data, loading, error, refetch: fetchQuestions };
};

export const useCreateBookQuestion = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuestion = useCallback(async (bookId: number, request: CreateBookQuestionRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_BY_ID_BASE}/${bookId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (response.ok && result.Result) {
        return result.Result;
      } else {
        setError(result.Message || 'Failed to create question');
        return null;
      }
    } catch (err) {
      setError('Failed to create question');
      console.error('Error creating question:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { createQuestion, loading, error };
};

export const useDeleteBookQuestion = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteQuestion = useCallback(async (questionId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_BY_ID_BASE}/questions/${questionId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (response.ok && result.Result) {
        return result.Result;
      } else {
        setError(result.Message || 'Failed to delete question');
        return null;
      }
    } catch (err) {
      setError('Failed to delete question');
      console.error('Error deleting question:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { deleteQuestion, loading, error };
};

export const useUpdateBookQuestion = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQuestion = useCallback(async (bookId: number, questionId: number, request: UpdateBookQuestionRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_BY_ID_BASE}/${bookId}/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (response.ok && result.Result) {
        return result.Result;
      } else {
        setError(result.Message || 'Failed to update question');
        return null;
      }
    } catch (err) {
      setError('Failed to update question');
      console.error('Error updating question:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { updateQuestion, loading, error };
};

export const useActivationCodes = (bookId: number, page = 1, pageSize = 20) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<PagedResult<ActivationCodeDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    console.log('useActivationCodes: fetchCodes called with bookId:', bookId, 'page:', page, 'pageSize:', pageSize);
    if (!bookId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `${API_URLS.BOOKS_BY_ID_BASE}/${bookId}/activation-codes?page=${page}&pageSize=${pageSize}`;
      console.log('useActivationCodes: API URL:', url);
      const response = await authenticatedFetch(url);
      console.log('useActivationCodes: Response received:', response);
      const result = await response.json();
      
      if (response.ok && result.Result) {
        // Transform PascalCase to camelCase
        const codesData = result.Result;
        const transformedItems = (codesData.Items || codesData.items || []).map((code: any) => ({
          id: code.Id || code.id,
          bookId: code.BookId || code.bookId,
          activationCode: code.ActivationCode || code.activationCode,
          isUsed: code.IsUsed || code.isUsed,
          usedById: code.UsedById || code.usedById,
          usedByFullName: code.UsedByFullName || code.usedByFullName,
          createdAt: code.CreatedAt || code.createdAt,
          updatedAt: code.UpdatedAt || code.updatedAt,
          usedBy: code.UsedByFullName ? {
            fullName: code.UsedByFullName
          } : undefined
        }));
        
        const transformedData = {
          items: transformedItems,
          total: codesData.Total || codesData.total || 0,
          page: codesData.Page || codesData.page || 1,
          pageSize: codesData.PageSize || codesData.pageSize || 20
        };
        
        console.log('useActivationCodes: transformed data:', transformedData);
        setData(transformedData);
      } else {
        setError(result.Message || 'Failed to fetch activation codes');
      }
    } catch (err) {
      setError('Failed to fetch activation codes');
      console.error('Error fetching activation codes:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId, page, pageSize, authenticatedFetch]);

  // Add useEffect to call fetchCodes when dependencies change
  useEffect(() => {
    console.log('useActivationCodes: useEffect triggered with bookId:', bookId, 'page:', page, 'pageSize:', pageSize);
    fetchCodes();
  }, [bookId, page, pageSize]);

  return { data, loading, error, refetch: fetchCodes };
};

export const useGenerateActivationCodes = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCodes = useCallback(async (bookId: number, request: GenerateActivationCodeRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_BY_ID_BASE}/${bookId}/activation-codes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (response.ok && result.Result) {
        return result.Result;
      } else {
        setError(result.Message || 'Failed to generate activation codes');
        return null;
      }
    } catch (err) {
      setError('Failed to generate activation codes');
      console.error('Error generating activation codes:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { generateCodes, loading, error };
};

export const useActivateBook = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activateBook = useCallback(async (request: BookActivationRequestDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(API_URLS.BOOKS_ACTIVATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (response.ok && result.Result) {
        return result.Result;
      } else {
        setError(result.Message || 'Failed to activate book');
        return null;
      }
    } catch (err) {
      setError('Failed to activate book');
      console.error('Error activating book:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { activateBook, loading, error };
};

export const useValidateActivationCode = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_VALIDATE_CODE}/${code}/validate`);
      const result = await response.json();
      
      if (response.ok && result.Result) {
        return result.Result;
      } else {
        setError(result.Message || 'Failed to validate code');
        return null;
      }
    } catch (err) {
      setError('Failed to validate code');
      console.error('Error validating code:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { validateCode, loading, error };
};

export const useMyBooks = (page = 1, pageSize = 20) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<PagedResult<MyBooksResponseDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_MY}?page=${page}&pageSize=${pageSize}`);
      const result = await response.json();
      
      if (response.ok && result.Result) {
        setData(result.Result);
      } else {
        setError(result.Message || 'Failed to fetch my books');
      }
    } catch (err) {
      setError('Failed to fetch my books');
      console.error('Error fetching my books:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, authenticatedFetch]);

  return { data, loading, error, refetch: fetchMyBooks };
};

// Utility function to generate ISBN from book title and content
export const generateISBN = (title: string, content: string): string => {
  const combined = `${title}${content}`;
  let hash = 0;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive number and format as ISBN-13
  const isbn = Math.abs(hash).toString().padStart(13, '0');
  return `${isbn.slice(0, 3)}-${isbn.slice(3, 4)}-${isbn.slice(4, 7)}-${isbn.slice(7, 12)}-${isbn.slice(12)}`;
};

// Hook for creating multiple questions at once
export const useCreateBulkBookQuestions = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBulkQuestions = useCallback(async (bookId: number, questionsData: CreateBookQuestionRequest[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch(`${API_URLS.BOOKS_BY_ID_BASE}/${bookId}/questions/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Questions: questionsData }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.Result) {
        return result.Result;
      } else {
        setError(result.Message || 'Failed to create bulk questions');
        return null;
      }
    } catch (err) {
      setError('Failed to create bulk questions');
      console.error('Error creating bulk questions:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { createBulkQuestions, loading, error };
};
