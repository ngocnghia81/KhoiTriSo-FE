'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useCourses } from '@/hooks/useCourses';
import { Assignment } from '@/hooks/useAssignments';
import { AssignmentList } from '@/components/AdminAssignmentList';
import { AssignmentForm } from '@/components/AssignmentForm';
import { AssignmentImportModal } from '@/components/AssignmentImportModal';
import { CourseSelector } from '@/components/CourseSelector';
import { LessonSelector } from '@/components/LessonSelector';
import { PlusIcon, DocumentArrowUpIcon, FolderIcon } from '@heroicons/react/24/outline';

interface Course {
  id: number;
  title: string;
  description?: string;
}

interface Lesson {
  id: number;
  courseId: number;
  title: string;
  description?: string;
}

export default function AssignmentsPage() {
  const { authenticatedFetch } = useAuthenticatedApi();
  const router = useRouter();
  
  // Use courses hook
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  
  // State management
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Fetch lessons when course is selected
  useEffect(() => {
    if (selectedCourseId) {
      fetchLessons(selectedCourseId);
      setSelectedLessonId(null); // Reset lesson selection
    }
  }, [selectedCourseId]);

  // Fetch assignments when lesson is selected
  useEffect(() => {
    if (selectedLessonId) {
      fetchAssignments(selectedLessonId);
    } else {
      setAssignments([]);
    }
  }, [selectedLessonId]);

  const fetchLessons = async (courseId: number) => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`/api/courses/${courseId}/lessons`);
      if (response.ok) {
        const data = await response.json();
        setLessons(data.Result || []);
      }
    } catch (err) {
      setError('Không thể tải danh sách bài học');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (lessonId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build URL với query parameters như curl command
      // Format: ?lessonId=5&isPublished=true&page=1&pageSize=20
      const params = new URLSearchParams();
      params.append('lessonId', lessonId.toString());
      params.append('page', '1');
      params.append('pageSize', '20');
      
      // Sử dụng API_URLS để đảm bảo đúng base URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const url = `${baseUrl}/api/assignments?${params.toString()}`;
      
      console.log('Fetching assignments from:', url);
      
      const response = await authenticatedFetch(url);
      if (response.ok) {
        const data = await response.json();
        
        // Handle response format: { Result: { Items: [...], Total: 3, ... } }
        let items: any[] = [];
        
        if (Array.isArray(data.Result)) {
          items = data.Result;
        } else if (data.Result?.Items) {
          items = data.Result.Items;
        } else if (data.Result?.items) {
          items = data.Result.items;
        }
        
        // Map từ PascalCase (backend) sang camelCase (frontend) - match với Assignment interface
        const mappedAssignments: Assignment[] = items.map((item: any) => ({
          id: item.Id || item.id,
          lessonId: item.LessonId || item.lessonId,
          title: item.Title || item.title || '',
          description: item.Description || item.description || '',
          maxScore: item.MaxScore || item.maxScore || 0,
          timeLimit: item.TimeLimit || item.timeLimit,
          maxAttempts: item.MaxAttempts || item.maxAttempts || 1,
          showAnswersAfter: item.ShowAnswersAfter !== undefined ? item.ShowAnswersAfter : (item.showAnswersAfter !== undefined ? item.showAnswersAfter : 0),
          dueDate: item.DueDate || item.dueDate,
          isPublished: item.IsPublished !== undefined ? item.IsPublished : (item.isPublished !== undefined ? item.isPublished : false),
          passingScore: item.PassingScore !== undefined ? item.PassingScore : item.passingScore,
          shuffleQuestions: item.ShuffleQuestions !== undefined ? item.ShuffleQuestions : (item.shuffleQuestions !== undefined ? item.shuffleQuestions : false),
          shuffleOptions: item.ShuffleOptions !== undefined ? item.ShuffleOptions : (item.shuffleOptions !== undefined ? item.shuffleOptions : false),
          createdAt: item.CreatedAt || item.createdAt || new Date().toISOString(),
          updatedAt: item.UpdatedAt || item.updatedAt || new Date().toISOString(),
          lesson: item.Lesson ? {
            id: item.Lesson.Id || item.Lesson.id,
            courseId: item.Lesson.CourseId || item.Lesson.courseId,
            title: item.Lesson.Title || item.Lesson.title,
            description: item.Lesson.Description || item.Lesson.description,
          } : undefined,
        }));
        
        setAssignments(mappedAssignments);
      } else {
        const errorData = await response.json();
        setError(errorData.Message || 'Không thể tải danh sách bài tập');
      }
    } catch (err) {
      setError('Không thể tải danh sách bài tập');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (courseId: number) => {
    console.log('AssignmentsPage: Course selected:', courseId);
    setSelectedCourseId(courseId);
  };

  const handleLessonSelect = (lessonId: number) => {
    setSelectedLessonId(lessonId);
  };

  const handleViewAssignment = (assignment: Assignment) => {
    if (!assignment?.id) return;
    router.push(`/dashboard/assignments/${assignment.id}`);
  };

  const handleCreateAssignment = () => {
    if (!selectedLessonId) {
      alert('Vui lòng chọn bài học trước');
      return;
    }
    setShowCreateModal(true);
  };

  const handleImportAssignment = () => {
    if (!selectedLessonId) {
      alert('Vui lòng chọn bài học trước');
      return;
    }
    setShowImportModal(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowCreateModal(true);
  };

  const handleAssignmentSaved = () => {
    setShowCreateModal(false);
    setEditingAssignment(null);
    if (selectedLessonId) {
      fetchAssignments(selectedLessonId);
    }
  };

  const handleAssignmentImported = () => {
    setShowImportModal(false);
    if (selectedLessonId) {
      fetchAssignments(selectedLessonId);
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!confirm('Bạn có chắc muốn xóa bài tập này?')) return;
    
    try {
      const response = await authenticatedFetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        if (selectedLessonId) {
          fetchAssignments(selectedLessonId);
        }
      } else {
        alert('Không thể xóa bài tập');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa bài tập');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Bài tập</h1>
              <p className="mt-2 text-gray-600">
                Tạo và quản lý các bài tập, kiểm tra cho từng bài học
          </p>
        </div>
            
            {selectedLessonId && (
              <div className="flex space-x-3">
          <button
                  onClick={handleCreateAssignment}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Tạo bài tập
          </button>
          <button
                  onClick={handleImportAssignment}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
                  <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                  Import từ Word
          </button>
        </div>
            )}
          </div>
        </div>

        {/* Course and Lesson Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FolderIcon className="h-4 w-4 inline mr-1" />
                Chọn Khóa học
              </label>
              <CourseSelector
                courses={courses}
                selectedCourseId={selectedCourseId}
                onCourseSelect={handleCourseSelect}
                loading={coursesLoading}
                />
              </div>

            {/* Lesson Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FolderIcon className="h-4 w-4 inline mr-1" />
                Chọn Bài học
              </label>
              {selectedCourseId ? (
                <LessonSelector
                  courseId={selectedCourseId}
                  selectedLessonId={selectedLessonId || undefined}
                  onLessonSelect={handleLessonSelect}
                />
              ) : (
                <div className="w-full">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-sm text-gray-600">Vui lòng chọn khóa học trước</p>
            </div>
          </div>
              )}
        </div>
      </div>

          {/* Selection Status */}
          {selectedCourseId && selectedLessonId && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✓ Đã chọn: {courses.find(c => c.id === selectedCourseId)?.title} → 
                {lessons.find(l => l.id === selectedLessonId)?.title}
              </p>
                      </div>
                    )}
                  </div>

        {/* Error Display */}
        {(error || coursesError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error || coursesError}</p>
                    </div>
        )}

        {/* Assignments List */}
        {selectedLessonId ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Danh sách Bài tập ({assignments.length})
              </h2>
                  </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
                      </div>
            ) : assignments.length > 0 ? (
              <AssignmentList
                assignments={assignments as Assignment[]}
                onEdit={handleEditAssignment as any}
                onDelete={handleDeleteAssignment}
                onView={handleViewAssignment}
              />
            ) : (
              <div className="p-6 text-center text-gray-500">
                <FolderIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Chưa có bài tập nào</p>
                <p className="text-sm mb-4">Tạo bài tập mới hoặc import từ file Word để bắt đầu</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={handleCreateAssignment}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Tạo bài tập
                    </button>
                  <button
                    onClick={handleImportAssignment}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                    Import từ Word
                    </button>
                  </div>
                </div>
            )}
              </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FolderIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chọn khóa học và bài học
            </h3>
            <p className="text-gray-600">
              Vui lòng chọn khóa học và bài học để xem danh sách bài tập
            </p>
          </div>
        )}

        {/* Modals */}
        {showCreateModal && (
          <AssignmentForm
            lessonId={selectedLessonId!}
            assignment={editingAssignment}
            onClose={() => {
              setShowCreateModal(false);
              setEditingAssignment(null);
            }}
            onSaved={handleAssignmentSaved}
          />
        )}

        {showImportModal && (
          <AssignmentImportModal
            lessonId={selectedLessonId!}
            onClose={() => setShowImportModal(false)}
            onImported={handleAssignmentImported}
          />
        )}
      </div>
    </div>
  );
}