'use client';

import React, { useState } from 'react';
import { useAssignments, useDeleteAssignment, Assignment } from '@/hooks/useAssignments';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  DocumentArrowUpIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface AssignmentListProps {
  lessonId?: number;
  onEdit?: (assignment: Assignment) => void;
  onView?: (assignment: Assignment) => void;
  onCreate?: () => void;
  onImport?: () => void;
}

export function AssignmentList({ 
  lessonId, 
  onEdit, 
  onView, 
  onCreate, 
  onImport 
}: AssignmentListProps) {
  // Sử dụng filters object như curl command format
  const { assignments, loading, error, refetch } = useAssignments({
    lessonId,
    page: 1,
    pageSize: 20
  });
  const { deleteAssignment, loading: deleteLoading } = useDeleteAssignment();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return;
    
    setDeletingId(id);
    const result = await deleteAssignment(id);
    
    if (result.success) {
      refetch();
    } else {
      alert(`Lỗi: ${result.error}`);
    }
    
    setDeletingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.isPublished) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Đã xuất bản
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Bản nháp
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Lỗi: {error}</p>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {lessonId ? 'Bài tập của bài học' : 'Tất cả bài tập'}
          </h2>
          <p className="text-gray-600 mt-1">
            {assignments.length} bài tập
          </p>
        </div>
        
        <div className="flex space-x-3">
          {onImport && (
            <button
              onClick={onImport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
              Import từ Word
            </button>
          )}
          
          {onCreate && (
            <button
              onClick={onCreate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Tạo bài tập mới
            </button>
          )}
        </div>
      </div>

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có bài tập</h3>
          <p className="mt-1 text-sm text-gray-500">
            {lessonId ? 'Bài học này chưa có bài tập nào.' : 'Chưa có bài tập nào được tạo.'}
          </p>
          {onCreate && (
            <div className="mt-6">
              <button
                onClick={onCreate}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Tạo bài tập đầu tiên
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {assignment.title}
                </h3>
                {getStatusBadge(assignment)}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {assignment.description}
              </p>

              {/* Lesson Info */}
              {assignment.lesson && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500">Bài học:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {assignment.lesson.title}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-500">Điểm tối đa</p>
                  <p className="font-semibold text-gray-900">{assignment.maxScore}</p>
                </div>
                <div>
                  <p className="text-gray-500">Số lần làm</p>
                  <p className="font-semibold text-gray-900">{assignment.maxAttempts}</p>
                </div>
                {assignment.timeLimit && (
                  <div>
                    <p className="text-gray-500">Thời gian</p>
                    <p className="font-semibold text-gray-900">{assignment.timeLimit} phút</p>
                  </div>
                )}
                {assignment.passingScore && (
                  <div>
                    <p className="text-gray-500">Điểm đạt</p>
                    <p className="font-semibold text-gray-900">{assignment.passingScore}</p>
                  </div>
                )}
              </div>

              {/* Due Date */}
              {assignment.dueDate && (
                <div className="mb-4 flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Hạn nộp: {formatDate(assignment.dueDate)}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                {onView && (
                  <button
                    onClick={() => onView(assignment)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Xem chi tiết"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                )}
                
                {onEdit && (
                  <button
                    onClick={() => onEdit(assignment)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Chỉnh sửa"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(assignment.id)}
                  disabled={deleteLoading && deletingId === assignment.id}
                  className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  title="Xóa"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
