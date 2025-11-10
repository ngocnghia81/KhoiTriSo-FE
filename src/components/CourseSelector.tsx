'use client';

import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Course {
  id: number;
  title: string;
  description?: string;
}

interface CourseSelectorProps {
  courses: Course[];
  selectedCourseId: number | null;
  onCourseSelect: (courseId: number) => void;
  loading?: boolean;
}

export function CourseSelector({ 
  courses, 
  selectedCourseId, 
  onCourseSelect, 
  loading = false 
}: CourseSelectorProps) {
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="relative">
      <select
        value={selectedCourseId || ''}
        onChange={(e) => onCourseSelect(Number(e.target.value))}
        disabled={loading}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">-- Chọn khóa học --</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
      
      <ChevronDownIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
      
      {selectedCourse && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="font-medium text-blue-900">{selectedCourse.title}</p>
          {selectedCourse.description && (
            <p className="text-blue-700">{selectedCourse.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
