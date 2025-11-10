import { useState, useCallback, useEffect } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { API_URLS } from '@/lib/api-config';

// ===== ASSIGNMENT TYPES =====
export interface Assignment {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  maxScore: number;
  timeLimit?: number;
  maxAttempts: number;
  showAnswersAfter: number;
  dueDate?: string;
  isPublished: boolean;
  passingScore?: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  createdAt: string;
  updatedAt: string;
  lesson?: {
    id: number;
    courseId: number;
    title: string;
    description: string;
  };
}

export interface AssignmentCreateRequest {
  lessonId: number;
  title: string;
  description: string;
  maxScore: number;
  timeLimit?: number;
  maxAttempts: number;
  showAnswersAfter: number;
  dueDate?: string;
  isPublished: boolean;
  passingScore?: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface AssignmentUpdateRequest {
  title?: string;
  description?: string;
  maxScore?: number;
  timeLimit?: number;
  maxAttempts?: number;
  showAnswersAfter?: number;
  dueDate?: string;
  isPublished?: boolean;
  passingScore?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

export interface AssignmentImportResult {
  assignmentId: number;
  assignmentTitle: string;
  questionCount: number;
  errors: string[];
  warnings: string[];
}

export interface AssignmentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  questionCount: number;
  estimatedTime: number;
}

export interface AssignmentTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  questionCount: number;
  estimatedTime: number;
}

// ===== ASSIGNMENT HOOKS =====

export interface AssignmentFilters {
  lessonId?: number;
  isPublished?: boolean;
  page?: number;
  pageSize?: number;
}

export const useAssignments = (filters?: AssignmentFilters) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build URL với query parameters như curl command
      // Format: ?lessonId=5&isPublished=true&page=1&pageSize=20
      const params = new URLSearchParams();
      
      if (filters?.lessonId !== undefined && filters.lessonId !== null) {
        params.append('lessonId', filters.lessonId.toString());
      }
      
      if (filters?.isPublished !== undefined) {
        params.append('isPublished', filters.isPublished.toString());
      }
      
      if (filters?.page !== undefined) {
        params.append('page', filters.page.toString());
      }
      
      if (filters?.pageSize !== undefined) {
        params.append('pageSize', filters.pageSize.toString());
      }

      const queryString = params.toString();
      const url = queryString 
        ? `${API_URLS.ASSIGNMENTS_BASE}?${queryString}`
        : API_URLS.ASSIGNMENTS_BASE;

      const response = await authenticatedFetch(url);
      const result = await response.json();
      
      if (response.ok && result.Result) {
        // Handle response format: { Result: { Items: [...], Total: 3, ... } }
        let items: any[] = [];
        
        if (Array.isArray(result.Result)) {
          items = result.Result;
        } else if (result.Result.Items) {
          items = result.Result.Items;
        } else if (result.Result.items) {
          items = result.Result.items;
        } else {
          items = [];
        }
        
        // Map từ PascalCase (backend) sang camelCase (frontend)
        const mappedAssignments = items.map((item: any) => ({
          id: item.Id || item.id,
          lessonId: item.LessonId || item.lessonId,
          title: item.Title || item.title,
          description: item.Description || item.description,
          maxScore: item.MaxScore || item.maxScore,
          timeLimit: item.TimeLimit || item.timeLimit,
          maxAttempts: item.MaxAttempts || item.maxAttempts,
          showAnswersAfter: item.ShowAnswersAfter !== undefined ? item.ShowAnswersAfter : item.showAnswersAfter,
          dueDate: item.DueDate || item.dueDate,
          isPublished: item.IsPublished !== undefined ? item.IsPublished : item.isPublished,
          passingScore: item.PassingScore !== undefined ? item.PassingScore : item.passingScore,
          shuffleQuestions: item.ShuffleQuestions !== undefined ? item.ShuffleQuestions : item.shuffleQuestions,
          shuffleOptions: item.ShuffleOptions !== undefined ? item.ShuffleOptions : item.shuffleOptions,
          createdAt: item.CreatedAt || item.createdAt,
          updatedAt: item.UpdatedAt || item.updatedAt,
          lesson: item.Lesson ? {
            id: item.Lesson.Id || item.Lesson.id,
            courseId: item.Lesson.CourseId || item.Lesson.courseId,
            title: item.Lesson.Title || item.Lesson.title,
            description: item.Lesson.Description || item.Lesson.description,
          } : undefined,
        }));
        
        setAssignments(mappedAssignments);
      } else {
        throw new Error(result.Message || 'Failed to fetch assignments');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, filters?.lessonId, filters?.isPublished, filters?.page, filters?.pageSize]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { assignments, loading, error, refetch: fetchAssignments };
};

export const useAssignment = (id: number) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignment = useCallback(async () => {
    if (!id || typeof id !== 'number' || Number.isNaN(id) || id <= 0) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${id}`);
      const result = await response.json();
      
      if (response.ok && result.Result) {
        // Map từ PascalCase (backend) sang camelCase (frontend)
        const item = result.Result;
        const mappedAssignment: Assignment = {
          id: item.Id || item.id,
          lessonId: item.LessonId || item.lessonId,
          title: item.Title || item.title,
          description: item.Description || item.description,
          maxScore: item.MaxScore || item.maxScore,
          timeLimit: item.TimeLimit || item.timeLimit,
          maxAttempts: item.MaxAttempts || item.maxAttempts,
          showAnswersAfter: item.ShowAnswersAfter !== undefined ? item.ShowAnswersAfter : item.showAnswersAfter,
          dueDate: item.DueDate || item.dueDate,
          isPublished: item.IsPublished !== undefined ? item.IsPublished : item.isPublished,
          passingScore: item.PassingScore !== undefined ? item.PassingScore : item.passingScore,
          shuffleQuestions: item.ShuffleQuestions !== undefined ? item.ShuffleQuestions : item.shuffleQuestions,
          shuffleOptions: item.ShuffleOptions !== undefined ? item.ShuffleOptions : item.shuffleOptions,
          createdAt: item.CreatedAt || item.createdAt,
          updatedAt: item.UpdatedAt || item.updatedAt,
          lesson: item.Lesson ? {
            id: item.Lesson.Id || item.Lesson.id,
            courseId: item.Lesson.CourseId || item.Lesson.courseId,
            title: item.Lesson.Title || item.Lesson.title,
            description: item.Lesson.Description || item.Lesson.description,
          } : undefined,
        };
        setAssignment(mappedAssignment);
      } else {
        throw new Error(result.Message || 'Failed to fetch assignment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching assignment:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, id]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  return { assignment, loading, error, refetch: fetchAssignment };
};

export const useCreateAssignment = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAssignment = useCallback(async (data: AssignmentCreateRequest): Promise<{ success: boolean; data?: Assignment; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(API_URLS.ASSIGNMENTS_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (response.ok && result.Result) {
        return {
          success: true,
          data: result.Result
        };
      } else {
        throw new Error(result.Message || 'Failed to create assignment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { createAssignment, loading, error };
};

export const useUpdateAssignment = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAssignment = useCallback(async (id: number, data: AssignmentUpdateRequest): Promise<{ success: boolean; data?: Assignment; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (response.ok && result.Result) {
        return {
          success: true,
          data: result.Result
        };
      } else {
        throw new Error(result.Message || 'Failed to update assignment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { updateAssignment, loading, error };
};

export const useDeleteAssignment = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAssignment = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (response.ok) {
        return { success: true };
      } else {
        throw new Error(result.Message || 'Failed to delete assignment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { deleteAssignment, loading, error };
};

export const useImportAssignment = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importAssignment = useCallback(async (lessonId: number, file: File): Promise<{ success: boolean; data?: AssignmentImportResult; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('lessonId', lessonId.toString());

      const response = await authenticatedFetch(API_URLS.ASSIGNMENTS_IMPORT_WORD, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok && result.Result) {
        return {
          success: true,
          data: result.Result
        };
      } else {
        throw new Error(result.Message || 'Import thất bại');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { importAssignment, loading, error };
};

export const useValidateWordFile = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateWordFile = useCallback(async (file: File): Promise<{ success: boolean; data?: AssignmentValidationResult; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await authenticatedFetch(API_URLS.ASSIGNMENTS_VALIDATE_WORD, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok && result.Result) {
        return {
          success: true,
          data: result.Result
        };
      } else {
        throw new Error(result.Message || 'Validation thất bại');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { validateWordFile, loading, error };
};

export const useAssignmentTemplates = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [templates, setTemplates] = useState<AssignmentTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(API_URLS.ASSIGNMENTS_TEMPLATES);
      const result = await response.json();
      
      if (response.ok && result.Result) {
        setTemplates(result.Result);
      } else {
        throw new Error(result.Message || 'Failed to fetch templates');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, loading, error, refetch: fetchTemplates };
};

export const useAssignmentQuestions = (assignmentId: number) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!assignmentId) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${assignmentId}/questions`);
      const result = await response.json();
      
      if (response.ok && result.Result) {
        setQuestions(Array.isArray(result.Result) ? result.Result : []);
      } else {
        throw new Error(result.Message || 'Failed to fetch questions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, assignmentId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { questions, loading, error, refetch: fetchQuestions };
};

export const useAssignmentResults = (assignmentId: number) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!assignmentId) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${assignmentId}/results`);
      const result = await response.json();
      
      if (response.ok && result.Result) {
        setData(result.Result);
      } else {
        throw new Error(result.Message || 'Failed to fetch results');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, assignmentId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return { data, loading, error, refetch: fetchResults };
};

export const useAssignmentSubmissions = (assignmentId: number, page: number = 1, pageSize: number = 20) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!assignmentId) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${assignmentId}/submissions?page=${page}&pageSize=${pageSize}`);
      const result = await response.json();
      
      if (response.ok && result.Result) {
        setData(result.Result);
      } else {
        throw new Error(result.Message || 'Failed to fetch submissions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, assignmentId, page, pageSize]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { data, loading, error, refetch: fetchSubmissions };
};

// Question Management Hooks

export interface CreateQuestionRequest {
  QuestionContent: string;
  QuestionType: number;
  DifficultyLevel: number;
  DefaultPoints: number;
  Points?: number[];
  ExplanationContent?: string;
  QuestionImage?: string;
  VideoUrl?: string;
  TimeLimit?: number;
  SubjectType?: string;
  OrderIndex?: number;
  Options?: Array<{
    OptionText: string;
    IsCorrect: boolean;
    PointsValue?: number;
    OrderIndex?: number;
  }>;
}

export interface UpdateQuestionRequest {
  QuestionContent?: string;
  QuestionType?: number;
  DifficultyLevel?: number;
  DefaultPoints?: number;
  ExplanationContent?: string;
  QuestionImage?: string;
  VideoUrl?: string;
  TimeLimit?: number;
  SubjectType?: string;
  OrderIndex?: number;
  Options?: Array<{
    OptionText?: string;
    IsCorrect?: boolean;
    PointsValue?: number;
    OrderIndex?: number;
  }>;
}

export const useCreateAssignmentQuestion = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuestion = useCallback(async (assignmentId: number, data: CreateQuestionRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${assignmentId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (response.ok && result.Result) {
        return { success: true };
      } else {
        throw new Error(result.Message || 'Failed to create question');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { createQuestion, loading, error };
};

export const useDeleteAssignmentQuestion = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteQuestion = useCallback(async (assignmentId: number, questionId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${assignmentId}/questions/${questionId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (response.ok) {
        return { success: true };
      } else {
        throw new Error(result.Message || 'Failed to delete question');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { deleteQuestion, loading, error };
};

// Attach existing book questions to assignment
export const useAttachAssignmentQuestion = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attachQuestion = useCallback(async (assignmentId: number, questionId: number, orderIndex: number = 0): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const payload = { QuestionId: questionId, OrderIndex: orderIndex };
      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${assignmentId}/questions/attach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok && result.Result) {
        return { success: true };
      } else {
        throw new Error(result.Message || 'Failed to attach question');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { attachQuestion, loading, error };
};

// Grading Hooks

export interface QuestionGradingRequest {
  QuestionId: number;
  PointsEarned: number;
  Feedback?: string;
}

export interface AssignmentGradingRequest {
  AttemptId: number;
  QuestionGrades: QuestionGradingRequest[];
  Feedback?: string;
}

export const useGradeAssignment = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gradeAssignment = useCallback(async (assignmentId: number, data: AssignmentGradingRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${assignmentId}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (response.ok && result.Result) {
        return { success: true };
      } else {
        throw new Error(result.Message || 'Failed to grade assignment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { gradeAssignment, loading, error };
};

// AI Generate Questions from Word (.docx)
export interface AIGeneratedOption {
  OptionText: string;
  IsCorrect: boolean;
  OrderIndex?: number;
}

export interface AIGeneratedQuestion {
  QuestionContent: string;
  QuestionType: number;
  DifficultyLevel: number;
  DefaultPoints: number;
  ExplanationContent?: string;
  Options?: AIGeneratedOption[];
}

export const useAIGenerateQuestions = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFromWord = useCallback(async (fileUrl: string): Promise<{ success: boolean; data?: AIGeneratedQuestion[]; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      // Backend expects { FileUrl: "..." } in JSON body
      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BASE}/AIGeneratedQuestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ FileUrl: fileUrl }),
      });

      const result = await response.json();
      if (response.ok && result.Result) {
        const items = Array.isArray(result.Result) ? result.Result : (result.Result.Items || []);
        return { success: true, data: items };
      } else {
        throw new Error(result.Message || 'AI generate thất bại');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { generateFromWord, loading, error };
};

// Batch insert questions into assignment
export interface BatchInsertQuestionsRequest {
  Questions: AIGeneratedQuestion[];
}

export const useBatchInsertQuestions = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const batchInsert = useCallback(async (assignmentId: number, data: BatchInsertQuestionsRequest): Promise<{ success: boolean; count?: number; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${assignmentId}/questions/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok && result.Result) {
        const items = Array.isArray(result.Result) ? result.Result : (result.Result.Items || []);
        return { success: true, count: Array.isArray(items) ? items.length : undefined };
      } else {
        throw new Error(result.Message || 'Batch insert thất bại');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { batchInsert, loading, error };
};