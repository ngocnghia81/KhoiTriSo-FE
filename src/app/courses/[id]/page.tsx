import { notFound } from 'next/navigation';
import { CourseDetailClient, CourseDetail, Lesson } from './CourseDetailClient';

// Revalidate mỗi giờ hoặc on-demand (khi BE gọi revalidate API)
// Nếu muốn dùng on-demand hoàn toàn, có thể bỏ dòng này
export const revalidate = 3600; // 1 giờ

// Generate static params cho các course phổ biến
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // Fetch danh sách courses đã được approve (approvalStatus=2)
    const response = await fetch(`${baseUrl}/courses?page=1&pageSize=50&approvalStatus=2`, {
      next: { 
        revalidate: 3600, // Cache 1 giờ
        tags: ['courses-list'] // Tag để revalidate list
      }
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch courses for static params generation');
      return [];
    }
    
    const data = await response.json();
    const courses = data?.Result?.Items || data?.Result || [];
    
    // Return array of params để Next.js pre-generate
    return courses.slice(0, 50).map((course: { Id?: number; id?: number }) => ({
      id: (course.Id || course.id || 0).toString(),
    }));
  } catch (error) {
    console.error('Error generating static params for courses:', error);
    return [];
  }
}

// Fetch course data ở server
async function fetchCourseData(id: string): Promise<CourseDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    const response = await fetch(`${baseUrl}/courses/${id}`, {
      next: { 
        revalidate: 3600, // Cache 1 giờ
        tags: [`course-${id}`] // Tag để on-demand revalidation
      }
    });
        
        if (!response.ok) {
          if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch course: ${response.status}`);
    }
    
    const result = await response.json();
    const courseData = result?.Result?.Result ?? result?.Result ?? result;
          
          if (!courseData) {
      return null;
          }

          // Transform PascalCase to camelCase
          const transformedCourse: CourseDetail = {
            id: courseData.Id || courseData.id,
            title: courseData.Title || courseData.title,
            description: courseData.Description || courseData.description,
            thumbnail: courseData.Thumbnail || courseData.thumbnail,
            instructorId: courseData.InstructorId || courseData.instructorId,
            instructor: {
              id: courseData.Instructor?.Id || courseData.Instructor?.id,
              name: courseData.Instructor?.Name || courseData.Instructor?.name,
              avatar: courseData.Instructor?.Avatar || courseData.Instructor?.avatar,
              bio: courseData.Instructor?.Bio || courseData.Instructor?.bio,
            },
            categoryId: courseData.CategoryId || courseData.categoryId,
            category: {
              id: courseData.Category?.Id || courseData.Category?.id,
              name: courseData.Category?.Name || courseData.Category?.name,
            },
            level: courseData.Level || courseData.level,
            isFree: courseData.IsFree || courseData.isFree,
            price: courseData.Price || courseData.price,
            rating: courseData.Rating || courseData.rating,
            totalReviews: courseData.TotalReviews || courseData.totalReviews,
            totalStudents: courseData.TotalStudents || courseData.totalStudents,
      lessons: (courseData.Lessons || courseData.lessons || []).map((l: {
        Id?: number; id?: number;
        Title?: string; title?: string;
        Description?: string; description?: string;
        VideoUrl?: string; videoUrl?: string;
        VideoDuration?: number; videoDuration?: number;
        LessonOrder?: number; lessonOrder?: number;
        IsPublished?: boolean; isPublished?: boolean;
        IsFree?: boolean; isFree?: boolean;
      }): Lesson => ({
        id: l.Id || l.id || 0,
        title: l.Title || l.title || '',
        description: l.Description || l.description || '',
        videoUrl: l.VideoUrl || l.videoUrl || '',
        videoDuration: l.VideoDuration || l.videoDuration || 0,
        lessonOrder: l.LessonOrder || l.lessonOrder || 0,
        isPublished: l.IsPublished ?? l.isPublished ?? false,
        isFree: l.IsFree ?? l.isFree ?? false,
      })),
      isEnrolled: courseData.IsEnrolled || courseData.isEnrolled || false,
            requirements: courseData.Requirements || courseData.requirements,
            whatYouWillLearn: courseData.WhatYouWillLearn || courseData.whatYouWillLearn,
            createdAt: courseData.CreatedAt || courseData.createdAt,
            updatedAt: courseData.UpdatedAt || courseData.updatedAt,
          };

    return transformedCourse;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

// Server Component - Fetch data và render
export default async function CourseDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Next.js 15 requires awaiting params
  const { id } = await params;
  const course = await fetchCourseData(id);
  
  if (!course) {
    notFound();
  }

  return (
    <CourseDetailClient 
      initialCourse={course} 
      courseId={parseInt(id)} 
    />
  );
}
