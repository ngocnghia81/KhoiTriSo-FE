import LearningPathsListClient from './LearningPathsListClient';

interface LearningPath {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  instructor?: {
    id: number;
    name: string;
    avatar?: string;
  };
  category?: {
    id: number;
    name: string;
  };
  estimatedDuration?: number;
  difficultyLevel: number;
  difficultyLevelName: string;
  price: number;
  courseCount: number;
  enrollmentCount: number;
  isEnrolled?: boolean;
  createdAt: string;
}

interface PaginationInfo {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

// Revalidate mỗi giờ hoặc on-demand (khi BE gọi revalidate API)
export const revalidate = 3600; // 1 giờ

// Fetch initial learning paths data ở server với ISR
async function fetchInitialLearningPaths(): Promise<{ paths: LearningPath[]; pagination: PaginationInfo } | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // Fetch với default filters: page=1, pageSize=100, sortBy=createdAt, sortOrder=desc
    const params = new URLSearchParams({
      page: '1',
      pageSize: '100',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    
    const response = await fetch(`${baseUrl}/learning-paths?${params.toString()}`, {
      next: { 
        revalidate: 3600, // Cache 1 giờ
        tags: ['learning-paths-list'] // Tag để on-demand revalidation
      },
      headers: {
        'Accept-Language': 'vi',
      }
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch initial learning paths');
      return null;
    }
    
    const result = await response.json();
    const pathsData = result?.Result || result;
    
    // Transform PascalCase to camelCase
    const transformedPaths: LearningPath[] = (pathsData?.Items || pathsData?.items || []).map((path: any) => ({
        id: path.Id || path.id,
        title: path.Title || path.title,
        description: path.Description || path.description,
        thumbnail: path.Thumbnail || path.thumbnail,
        instructor: path.Instructor || path.instructor ? {
          id: (path.Instructor || path.instructor).Id || (path.Instructor || path.instructor).id,
          name: (path.Instructor || path.instructor).Name || (path.Instructor || path.instructor).name,
          avatar: (path.Instructor || path.instructor).Avatar || (path.Instructor || path.instructor).avatar,
          bio: (path.Instructor || path.instructor).Bio || (path.Instructor || path.instructor).bio,
        } : undefined,
        category: path.Category || path.category ? {
          id: (path.Category || path.category).Id || (path.Category || path.category).id,
          name: (path.Category || path.category).Name || (path.Category || path.category).name,
        } : undefined,
        estimatedDuration: path.EstimatedDuration || path.estimatedDuration,
        difficultyLevel: path.DifficultyLevel || path.difficultyLevel,
        difficultyLevelName: path.DifficultyLevelName || path.difficultyLevelName,
        price: path.Price || path.price || 0,
        courseCount: path.CourseCount || path.courseCount || 0,
        enrollmentCount: path.EnrollmentCount || path.enrollmentCount || 0,
        isEnrolled: path.IsEnrolled || path.isEnrolled || false,
        createdAt: path.CreatedAt || path.createdAt,
      }));

    const totalItems = pathsData?.Total || pathsData?.total || transformedPaths.length;
    const pageSize = pathsData?.PageSize || pathsData?.pageSize || 100;
    const currentPage = pathsData?.Page || pathsData?.page || 1;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    
    const pagination: PaginationInfo = {
      currentPage,
      totalPages,
      totalItems,
      pageSize,
    };
    
    return {
      paths: transformedPaths,
      pagination,
    };
  } catch (error) {
    console.error('Error fetching initial learning paths:', error);
    return null;
  }
}

// Server Component - Fetch initial data và render
export default async function LearningPathsPage() {
  const initialData = await fetchInitialLearningPaths();
  
  // Nếu không fetch được data, vẫn render client component (nó sẽ tự fetch)
  // Không cần notFound() vì client component sẽ handle error state
  
  return (
    <LearningPathsListClient 
      initialPaths={initialData?.paths}
      initialPagination={initialData?.pagination}
    />
  );
}
