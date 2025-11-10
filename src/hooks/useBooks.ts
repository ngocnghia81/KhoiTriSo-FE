import { useState, useEffect, useCallback } from 'react';
import { bookApiService, Book, BookChapter, BookQuestion } from '../services/bookApi';
import { extractMessage, extractResult, isSuccessfulResponse, safeJsonParse } from '@/utils/apiHelpers';

export interface BookFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  approvalStatus?: number;
  authorId?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export const useBooks = (filters: BookFilters = {}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stringify filters to avoid infinite loop
  const filtersString = JSON.stringify(filters);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching books with filters:', filters);
      const result = await bookApiService.getBooksWithPagination(filters);
      console.log('Books fetched successfully:', result.books.length, 'books, total:', result.total);
      setBooks(result.books);
      
      // Extract pagination info from backend response
      const totalItems = result.total;
      const pageSize = result.pageSize;
      const currentPage = result.page;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      
      setPagination({
        currentPage,
        totalPages,
        totalItems,
        pageSize
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch books';
      setError(errorMessage);
      console.error('Error fetching books:', {
        error: err,
        errorMessage,
        errorStack: err instanceof Error ? err.stack : undefined,
        filters,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, [filtersString]); // Use stringified version

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { books, pagination, loading, error, refetch: fetchBooks };
};

export const useBook = (id: number) => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBook = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await bookApiService.getBookById(id);
      setBook(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch book';
      setError(errorMessage);
      console.error('Error fetching book:', {
        error: err,
        bookId: id,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  return { book, loading, error, refetch: fetchBook };
};

export const useBookChapters = (bookId: number) => {
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = useCallback(async () => {
    if (!bookId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await bookApiService.getBookChapters(bookId);
      console.log('Chapters fetched successfully:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chapters';
      setError(errorMessage);
      console.error('Error fetching chapters:', {
        error: err,
        bookId,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  return { chapters, loading, error, refetch: fetchChapters };
};

export const useBookQuestions = (bookId: number, page: number = 1, pageSize: number = 20) => {
  const [questions, setQuestions] = useState<BookQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!bookId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await bookApiService.getBookQuestions(bookId, page, pageSize);
      console.log('Questions fetched successfully:', result);
      setQuestions(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch questions';
      setError(errorMessage);
      console.error('Error fetching questions:', {
        error: err,
        bookId,
        page,
        pageSize,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, [bookId, page, pageSize]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { questions, loading, error, refetch: fetchQuestions };
};

export const useMyBooks = (page: number = 1, pageSize: number = 20) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await bookApiService.getMyBooks(page, pageSize);
      setBooks(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch my books';
      setError(errorMessage);
      console.error('Error fetching my books:', {
        error: err,
        page,
        pageSize,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchMyBooks();
  }, [fetchMyBooks]);

  return { books, loading, error, refetch: fetchMyBooks };
};

export const useBookActivation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCode = useCallback(async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await bookApiService.validateActivationCode(code);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate code';
      setError(errorMessage);
      console.error('Error validating code:', {
        error: err,
        code,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateBook = useCallback(async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await bookApiService.activateBook(code);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate book';
      setError(errorMessage);
      console.error('Error activating book:', {
        error: err,
        code,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { validateCode, activateBook, loading, error };
};

export const useDeleteBook = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBook = useCallback(async (bookId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await bookApiService.deleteBook(bookId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete book';
      setError(errorMessage);
      console.error('Error deleting book:', {
        error: err,
        bookId,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteBook, loading, error };
};

export const useActivationCodes = (bookId: number, page: number = 1, pageSize: number = 20) => {
  const [activationCodes, setActivationCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivationCodes = useCallback(async () => {
    if (!bookId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await bookApiService.getActivationCodes(bookId, page, pageSize);
      setActivationCodes(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activation codes';
      setError(errorMessage);
      console.error('Error fetching activation codes:', {
        error: err,
        bookId,
        page,
        pageSize,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, [bookId, page, pageSize]);

  useEffect(() => {
    fetchActivationCodes();
  }, [fetchActivationCodes]);

  return { activationCodes, loading, error, refetch: fetchActivationCodes };
};

export const useGenerateActivationCodes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateActivationCodes = useCallback(async (bookId: number, request: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await bookApiService.generateActivationCodes(bookId, request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate activation codes';
      setError(errorMessage);
      console.error('Error generating activation codes:', {
        error: err,
        bookId,
        request,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateActivationCodes, loading, error };
};

export const useUpdateBook = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBook = useCallback(async (bookId: number, request: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await bookApiService.updateBook(bookId, request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update book';
      setError(errorMessage);
      console.error('Error updating book:', {
        error: err,
        bookId,
        request,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateBook, loading, error };
};

export const useCreateBookQuestion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBookQuestion = useCallback(async (bookId: number, request: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8080/api/books/${bookId}/questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      const result = await safeJsonParse(response);
      
      if (isSuccessfulResponse(result)) {
        return extractResult(result);
      } else {
        throw new Error(extractMessage(result));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create book question';
      setError(errorMessage);
      console.error('Error creating book question:', {
        error: err,
        bookId,
        request,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createBookQuestion, loading, error };
};

export const useUpdateBookQuestion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBookQuestion = useCallback(async (bookId: number, questionId: number, request: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8080/api/books/${bookId}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      const result = await safeJsonParse(response);
      
      if (isSuccessfulResponse(result)) {
        return extractResult(result);
      } else {
        throw new Error(extractMessage(result));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update book question';
      setError(errorMessage);
      console.error('Error updating book question:', {
        error: err,
        bookId,
        questionId,
        request,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateBookQuestion, loading, error };
};

export const useDeleteBookQuestion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBookQuestion = useCallback(async (bookId: number, questionId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8080/api/books/${bookId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete book question';
      setError(errorMessage);
      console.error('Error deleting book question:', {
        error: err,
        bookId,
        questionId,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteBookQuestion, loading, error };
};

export const useCreateBulkBookQuestions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBulkQuestions = useCallback(async (bookId: number, questions: any[]) => {
    try {
      setLoading(true);
      setError(null);

      // Create questions one by one using the existing API endpoint
      const createdQuestions = [];
      for (const question of questions) {
        try {
          const response = await fetch(`http://localhost:8080/api/books/${bookId}/questions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(question)
          });

          const result = await safeJsonParse(response);

          if (isSuccessfulResponse(result)) {
            createdQuestions.push(extractResult(result));
          }
        } catch (err) {
          console.error(`Error creating question: ${err}`);
          // Continue with other questions even if one fails
        }
      }

      return createdQuestions.length > 0 ? createdQuestions : null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bulk book questions';
      setError(errorMessage);
      console.error('Error creating bulk book questions:', {
        error: err,
        bookId,
        questions,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createBulkQuestions, loading, error };
};