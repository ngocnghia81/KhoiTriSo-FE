'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useAuth } from '@/contexts/AuthContext';

export interface StudentSummary {
  id: number;
  username: string;
  fullName?: string | null;
  avatar?: string | null;
  email?: string | null;
  enrolledCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
  lastActivity?: string | null;
  status?: 'active' | 'inactive' | 'at_risk' | string;
  enrollmentDate?: string | null;
}

export interface StudentsFilters {
  instructorId?: number; // if undefined and current user is instructor/teacher, defaults to current user's id
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface StudentsPage {
  items: StudentSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export const useStudents = (filters: StudentsFilters = {}, options: { enabled?: boolean } = {}) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { isAuthenticated, user } = useAuth();

  const [data, setData] = useState<StudentsPage>({
    items: [],
    total: 0,
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTeacher =
    (user?.role === 'instructor' || user?.role === 'teacher') && typeof user?.id === 'number';
  const effectiveInstructorId =
    filters.instructorId ?? (isTeacher ? (user?.id as number) : undefined);

  const enabled = options.enabled ?? (isAuthenticated && (!!effectiveInstructorId || !isTeacher));

  const fetchStudents = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Build query
      const page = filters.page ?? 1;
      const pageSize = filters.pageSize ?? 20;
      const search = filters.search;
      const instructorId = effectiveInstructorId;

      if (!instructorId) {
        // If we still don't have instructorId (e.g. not a teacher), return empty set gracefully
        setData({ items: [], total: 0, page, pageSize });
        return;
      }

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (search) params.set('search', search);

      // Endpoint: GET /api/courses/{instructorId}/students
      const resp = await authenticatedFetch(`/api/courses/${instructorId}/students?${params}`);
      const json = await resp.json();

      if (!resp.ok) {
        const message = json?.Message || json?.message || 'Failed to fetch students';
        throw new Error(message);
      }

      // Accept multiple backend shapes
      const result = json?.Result || json?.result || json;
      const itemsRaw = result?.Items || result?.items || [];
      const total =
        result?.Total || result?.total || result?.TotalCount || result?.totalCount || itemsRaw.length;
      const currentPage = result?.Page || result?.page || page;
      const currentPageSize = result?.PageSize || result?.pageSize || pageSize;

      // Map to StudentSummary
      const items: StudentSummary[] = (Array.isArray(itemsRaw) ? itemsRaw : []).map((u: any) => ({
        id: u.Id ?? u.id,
        username: u.Username ?? u.username ?? '',
        fullName: u.FullName ?? u.fullName,
        avatar: u.Avatar ?? u.avatar,
        email: u.Email ?? u.email,
        enrolledCourses: Number(u.EnrolledCourses ?? u.enrolledCourses ?? 0),
        completedCourses: Number(u.CompletedCourses ?? u.completedCourses ?? 0),
        totalLessons: Number(u.TotalLessons ?? u.totalLessons ?? 0),
        completedLessons: Number(u.CompletedLessons ?? u.completedLessons ?? 0),
        totalAssignments: Number(u.TotalAssignments ?? u.totalAssignments ?? 0),
        completedAssignments: Number(u.CompletedAssignments ?? u.completedAssignments ?? 0),
        averageScore: Number(u.AverageScore ?? u.averageScore ?? 0),
        lastActivity: (u.LastActivity ?? u.lastActivity) ? String(u.LastActivity ?? u.lastActivity) : null,
        status: (u.Status ?? u.status) || 'inactive',
        enrollmentDate: (u.EnrollmentDate ?? u.enrollmentDate) ? String(u.EnrollmentDate ?? u.enrollmentDate) : null,
      }));

      setData({
        items,
        total,
        page: currentPage,
        pageSize: currentPageSize,
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    authenticatedFetch,
    filters.page,
    filters.pageSize,
    filters.search,
    effectiveInstructorId,
  ]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students: data.items,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    loading,
    error,
    refetch: fetchStudents,
  };
};


