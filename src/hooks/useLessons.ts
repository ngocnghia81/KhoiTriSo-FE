import { useState, useCallback, useEffect } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { API_URLS } from '@/lib/api-config';

export interface Lesson {
  id: number;
  title: string;
  description?: string;
  content?: string;
  orderIndex: number;
  isActive: boolean;
  courseId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseLessonsResponse {
  items: Lesson[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AssignmentImportResult {
  assignmentId: number;
  assignmentTitle: string;
  questionCount: number;
  errors: string[];
  warnings: string[];
}

export const useCourseLessons = (courseId: number) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!courseId) {
      console.log('useCourseLessons: No courseId provided, skipping fetch');
      return;
    }
    
    console.log('useCourseLessons: Starting fetch for courseId:', courseId);
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await authenticatedFetch(`/api/courses/${courseId}/lessons`);
      const result = await response.json();
      
      console.log('Lessons API Response:', {
        ok: response.ok,
        status: response.status,
        result: result
      });
      
      if (response.ok && result.Result) {
        // Transform PascalCase to camelCase
        const lessonsData = result.Result;
        
        // Handle both array and object with Items property
        let lessonsArray = [];
        if (Array.isArray(lessonsData)) {
          lessonsArray = lessonsData;
        } else if (lessonsData.Items || lessonsData.items) {
          lessonsArray = lessonsData.Items || lessonsData.items;
        }
        
        console.log('Lessons array:', lessonsArray);
        
        const transformedItems = lessonsArray.map((lesson: any) => ({
          id: lesson.Id || lesson.id,
          title: lesson.Title || lesson.title,
          description: lesson.Description || lesson.description,
          content: lesson.Content || lesson.content,
          orderIndex: lesson.LessonOrder || lesson.OrderIndex || lesson.orderIndex || lesson.lessonOrder,
          isActive: lesson.IsPublished !== undefined ? lesson.IsPublished : (lesson.IsActive || lesson.isActive),
          courseId: lesson.CourseId || lesson.courseId,
          createdAt: lesson.CreatedAt || lesson.createdAt,
          updatedAt: lesson.UpdatedAt || lesson.updatedAt,
        }));
        
        console.log('Transformed lessons:', transformedItems);
        console.log('Setting lessons state with:', transformedItems.length, 'items');
        setLessons(transformedItems);
      } else {
        setError(result.Message || 'Failed to fetch lessons');
      }
    } catch (err) {
      setError('Failed to fetch lessons');
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, authenticatedFetch]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return { lessons, loading, error, refetch: fetchLessons };
};

// Admin: CRUD lessons (list all, create, update, delete)
export const useLessons = (page: number = 1, pageSize: number = 20, search?: string) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [items, setItems] = useState<Lesson[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (search) query.set('search', search);
      const res = await authenticatedFetch(`/api/lessons?${query.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.Message || 'Failed to load lessons');

      const result = json.Result || json.result || json;
      const list = (result.Items || result.items || result || []).map((lesson: any) => ({
        id: lesson.Id || lesson.id,
        title: lesson.Title || lesson.title,
        description: lesson.Description || lesson.description,
        content: lesson.Content || lesson.content,
        orderIndex: lesson.LessonOrder || lesson.OrderIndex || lesson.orderIndex || lesson.lessonOrder,
        isActive: lesson.IsPublished !== undefined ? lesson.IsPublished : (lesson.IsActive || lesson.isActive),
        courseId: lesson.CourseId || lesson.courseId,
        createdAt: lesson.CreatedAt || lesson.createdAt,
        updatedAt: lesson.UpdatedAt || lesson.updatedAt,
      }));
      setItems(list);
      setTotal(result.Total || result.total || list.length);
    } catch (err: any) {
      setError(err?.message || 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, page, pageSize, search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { items, total, loading, error, refetch: fetchAll };
};

export const useCreateLesson = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLesson = useCallback(async (payload: Partial<Lesson> & { courseId: number; title: string }) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authenticatedFetch(`/api/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CourseId: payload.courseId,
          Title: payload.title,
          Description: payload.description || '',
          Content: payload.content || '',
          LessonOrder: payload.orderIndex || 0,
          IsPublished: payload.isActive ?? true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.Message || 'Create failed');
      return { success: true, data: json.Result || json } as const;
    } catch (err: any) {
      setError(err?.message || 'Create failed');
      return { success: false, error: err?.message || 'Create failed' } as const;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { createLesson, loading, error };
};

export const useUpdateLesson = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLesson = useCallback(async (id: number, payload: Partial<Lesson>) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authenticatedFetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Title: payload.title,
          Description: payload.description,
          Content: payload.content,
          LessonOrder: payload.orderIndex,
          IsPublished: payload.isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.Message || 'Update failed');
      return { success: true, data: json.Result || json } as const;
    } catch (err: any) {
      setError(err?.message || 'Update failed');
      return { success: false, error: err?.message || 'Update failed' } as const;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { updateLesson, loading, error };
};

export const useDeleteLesson = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteLesson = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authenticatedFetch(`/api/lessons/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.Message || 'Delete failed');
      return { success: true } as const;
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
      return { success: false, error: err?.message || 'Delete failed' } as const;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return { deleteLesson, loading, error };
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
      
      if (response.ok) {
        return {
          success: true,
          data: result.Result || result
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
