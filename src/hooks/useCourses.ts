import { useState, useCallback, useEffect } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage, debugApiResponse, buildUrlWithParams } from '../utils/apiHelpers';

export interface Instructor {
  id: number;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  categoryId?: number;
  category?: Category;
  instructorId?: number;
  instructor?: Instructor;
  level?: number;
  isFree?: boolean;
  price?: number;
  estimatedDuration?: number;
  totalLessons?: number;
  totalStudents?: number;
  rating?: number;
  totalReviews?: number;
  approvalStatus?: number;
  isPublished?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseListResponse {
  items: Course[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
}

export const useCourses = (filters?: {
  category?: number;
  level?: number;
  isFree?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  approvalStatus?: number;
}) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 20,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchCoursesAsync = async () => {
      // Build URL with filters
      const url = buildUrlWithParams('/api/courses', {
        category: filters?.category,
        level: filters?.level,
        isFree: filters?.isFree,
        search: filters?.search,
        page: filters?.page,
        pageSize: filters?.pageSize,
        sortBy: filters?.sortBy,
        sortOrder: filters?.sortOrder,
        approvalStatus: filters?.approvalStatus,
      });
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await authenticatedFetch(url);
        
        const result = await safeJsonParse(response);
        
        // Debug logging
        debugApiResponse(result, 'Courses API');
        
        if (isSuccessfulResponse(result)) {
          // Transform PascalCase to camelCase
          const coursesData = extractResult(result);
          console.log('Courses Data:', coursesData);
          
          const transformedItems = (coursesData?.Items || coursesData?.items || []).map((course: any) => ({
            id: course.Id || course.id,
            title: course.Title || course.title,
            description: course.Description || course.description,
            thumbnail: course.Thumbnail || course.thumbnail,
            categoryId: course.CategoryId || course.categoryId,
            category: course.Category ? {
              id: course.Category.Id || course.Category.id,
              name: course.Category.Name || course.Category.name,
            } : undefined,
            instructorId: course.InstructorId || course.instructorId,
            instructor: course.Instructor ? {
              id: course.Instructor.Id || course.Instructor.id,
              name: course.Instructor.Name || course.Instructor.name,
              avatar: course.Instructor.Avatar || course.Instructor.avatar,
              bio: course.Instructor.Bio || course.Instructor.bio,
            } : undefined,
            level: course.Level || course.level,
            isFree: course.IsFree || course.isFree,
            price: course.Price || course.price,
            estimatedDuration: course.EstimatedDuration || course.estimatedDuration,
            totalLessons: course.TotalLessons || course.totalLessons,
            totalStudents: course.TotalStudents || course.totalStudents,
            rating: course.Rating || course.rating,
            totalReviews: course.TotalReviews || course.totalReviews,
            approvalStatus: course.ApprovalStatus || course.approvalStatus,
            isPublished: course.IsPublished || course.isPublished,
            isActive: course.IsActive || course.isActive,
            createdAt: course.CreatedAt || course.createdAt,
            updatedAt: course.UpdatedAt || course.updatedAt,
          }));
          
          console.log('Transformed Items:', transformedItems);
          setCourses(transformedItems);
          
          // Update pagination info
          setPagination({
            total: coursesData?.Total || coursesData?.total || 0,
            page: coursesData?.Page || coursesData?.page || 1,
            pageSize: coursesData?.PageSize || coursesData?.pageSize || 20,
          });
        } else {
          setError(extractMessage(result));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
        setError(errorMessage);
        console.error('Error fetching courses:', {
          error: err,
          url: url,
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAsync();
  }, [
    authenticatedFetch,
    filters?.category,
    filters?.level,
    filters?.isFree,
    filters?.search,
    filters?.page,
    filters?.pageSize,
    filters?.sortBy,
    filters?.sortOrder,
    filters?.approvalStatus,
    refreshTrigger,
  ]);

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return { courses, loading, error, pagination, refetch };
};
