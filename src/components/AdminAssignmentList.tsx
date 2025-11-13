'use client';

import React from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { Assignment } from '@/hooks/useAssignments';

interface AssignmentListProps {
  assignments: Assignment[];
  onEdit?: (assignment: Assignment) => void;
  onDelete?: (assignmentId: number) => void;
  onView?: (assignment: Assignment) => void;
}

export function AssignmentList({ assignments, onEdit, onDelete, onView }: AssignmentListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (!assignment.isPublished) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Bản nháp
        </span>
      );
    }

    if (assignment.dueDate) {
      const dueDate = new Date(assignment.dueDate);
      const now = new Date();
      
      if (now > dueDate) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Hết hạn
          </span>
        );
      }
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Đang hoạt động
      </span>
    );
  };

  return (
    <div className="divide-y divide-gray-200">
      {assignments.map((assignment) => (
        <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {assignment.title}
                </h3>
                {getStatusBadge(assignment)}
              </div>
              
              {assignment.description && (
                <div
                  className="text-sm text-gray-600 mb-3 line-clamp-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: assignment.description }}
                />
              )}

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <AcademicCapIcon className="h-4 w-4 mr-1" />
                  <span>{assignment.maxScore} điểm</span>
                </div>
                
                {assignment.maxAttempts && (
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>Tối đa {assignment.maxAttempts} lần làm</span>
                  </div>
                )}
                
                {assignment.timeLimit && (
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{assignment.timeLimit} phút</span>
                  </div>
                )}
                
                {assignment.dueDate && (
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>Hạn: {formatDate(assignment.dueDate)}</span>
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-400">
                Tạo lúc: {formatDate(assignment.createdAt)}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {onView && (
                <button
                  onClick={() => onView(assignment)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <EyeIcon className="h-3 w-3 mr-1" />
                  Xem
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(assignment)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PencilIcon className="h-3 w-3 mr-1" />
                  Sửa
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(assignment.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-3 w-3 mr-1" />
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
