import { notFound } from 'next/navigation';
import CoursesListClient from './CoursesListClient';
import { Course, PaginationInfo } from '@/hooks/useCourses';

// Revalidate mỗi giờ hoặc on-demand (khi BE gọi revalidate API)
export const revalidate = 3600; // 1 giờ

// Fetch initial courses data ở server với ISR
async function fetchInitialCourses(): Promise<{ courses: Course[]; pagination: PaginationInfo } | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // Fetch với default filters: approvalStatus=2 (approved), page=1, pageSize=20, sortBy=totalStudents, sortOrder=desc
    const params = new URLSearchParams({
      page: '1',
      pageSize: '20',
      approvalStatus: '2',
      sortBy: 'totalStudents',
      sortOrder: 'desc',
    });
    
    const response = await fetch(`${baseUrl}/courses?${params.toString()}`, {
      next: { 
        revalidate: 3600, // Cache 1 giờ
        tags: ['courses-list'] // Tag để on-demand revalidation
      },
      headers: {
        'Accept-Language': 'vi',
      }
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch initial courses');
      return null;
    }
    
    const result = await response.json();
    const coursesData = result?.Result || result;
    
    // Transform PascalCase to camelCase
    const transformedCourses: Course[] = (coursesData?.Items || coursesData?.items || []).map((course: any) => ({
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
    
    const pagination: PaginationInfo = {
      total: coursesData?.Total || coursesData?.total || 0,
      page: coursesData?.Page || coursesData?.page || 1,
      pageSize: coursesData?.PageSize || coursesData?.pageSize || 20,
    };
    
    return {
      courses: transformedCourses,
      pagination,
    };
  } catch (error) {
    console.error('Error fetching initial courses:', error);
    return null;
  }
}

// Server Component - Fetch initial data và render
export default async function CoursesPage() {
  const initialData = await fetchInitialCourses();
  
  // Nếu không fetch được data, vẫn render client component (nó sẽ tự fetch)
  // Không cần notFound() vì client component sẽ handle error state

  return (
    <CoursesListClient 
      initialCourses={initialData?.courses}
      initialPagination={initialData?.pagination}
    />
  );
}
