'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LessonFormModal } from '@/components/LessonFormModal';
import { useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from '@/hooks/useLessons';

export default function LessonsAdminPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { items, total, loading, error, refetch } = useLessons(page, pageSize, query);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const { createLesson, loading: creating } = useCreateLesson();
  const { updateLesson, loading: updating } = useUpdateLesson();
  const { deleteLesson, loading: deleting } = useDeleteLesson();

  const maxPage = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const onSubmit = async (payload: any) => {
    if (editing?.id) {
      const res = await updateLesson(editing.id, payload);
      if (res.success) { setShowForm(false); setEditing(null); refetch(); }
    } else {
      const res = await createLesson(payload);
      if (res.success) { setShowForm(false); refetch(); }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Quản lý bài học (Lessons)</h1>
          <div className="flex gap-2">
            <Input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button variant="outline" onClick={() => { setPage(1); setQuery(search); }}>Lọc</Button>
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>Thêm bài học</Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách bài học</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-gray-600">Đang tải...</div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Không có bài học</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="px-2 py-2">ID</th>
                      <th className="px-2 py-2">Tiêu đề</th>
                      <th className="px-2 py-2">Mô tả</th>
                      <th className="px-2 py-2">Course</th>
                      <th className="px-2 py-2">Thứ tự</th>
                      <th className="px-2 py-2">Trạng thái</th>
                      <th className="px-2 py-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((l) => (
                      <tr key={l.id} className="border-b hover:bg-gray-50">
                        <td className="px-2 py-2">{l.id}</td>
                        <td className="px-2 py-2 font-medium">{l.title}</td>
                        <td className="px-2 py-2 max-w-[320px] truncate">{l.description}</td>
                        <td className="px-2 py-2">{l.courseId}</td>
                        <td className="px-2 py-2">{l.orderIndex}</td>
                        <td className="px-2 py-2">{l.isActive ? 'Xuất bản' : 'Nháp'}</td>
                        <td className="px-2 py-2 flex gap-2">
                          <Link className="text-blue-600 hover:underline" href={`/dashboard/courses/${l.courseId}/lessons`}>Tới khoá</Link>
                          <Button variant="outline" size="sm" onClick={() => { setEditing(l); setShowForm(true); }}>Sửa</Button>
                          <Button variant="ghost" size="sm" className="text-red-600" disabled={deleting} onClick={async () => {
                            if (confirm('Xoá bài học này?')) { const r = await deleteLesson(l.id); if (r.success) refetch(); }
                          }}>Xoá</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">Tổng: {total}</div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Trước</Button>
                <div className="text-sm px-2">{page} / {maxPage}</div>
                <Button variant="outline" disabled={page>=maxPage} onClick={() => setPage(p => Math.min(maxPage, p+1))}>Sau</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {showForm && (
          <LessonFormModal
            open
            lesson={editing}
            onClose={() => { setShowForm(false); setEditing(null); }}
            onSubmit={async (payload) => { await onSubmit(payload); }}
          />
        )}
      </div>
    </div>
  );
}


