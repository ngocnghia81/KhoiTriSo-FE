import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface LessonFormModalProps {
  open?: boolean;
  lesson?: {
    id: number;
    title: string;
    description?: string;
    content?: string;
    orderIndex?: number;
    isActive?: boolean;
    courseId: number;
  } | null;
  onClose: () => void;
  onSubmit: (payload: {
    id?: number;
    courseId: number;
    title: string;
    description?: string;
    content?: string;
    orderIndex?: number;
    isActive?: boolean;
  }) => Promise<void> | void;
}

export function LessonFormModal({ open = true, lesson, onClose, onSubmit }: LessonFormModalProps) {
  const [courseId, setCourseId] = useState<number>(lesson?.courseId || 0);
  const [title, setTitle] = useState<string>(lesson?.title || '');
  const [description, setDescription] = useState<string>(lesson?.description || '');
  const [content, setContent] = useState<string>(lesson?.content || '');
  const [orderIndex, setOrderIndex] = useState<number>(lesson?.orderIndex || 0);
  const [isActive, setIsActive] = useState<boolean>(lesson?.isActive ?? true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-md shadow-lg w-full max-w-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">{lesson ? 'Cập nhật bài học' : 'Tạo bài học'}</div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Course ID</label>
              <Input type="number" value={courseId} onChange={e => setCourseId(parseInt(e.target.value || '0'))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Thứ tự</label>
              <Input type="number" value={orderIndex} onChange={e => setOrderIndex(parseInt(e.target.value || '0'))} />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Tiêu đề</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Mô tả</label>
            <Textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Nội dung</label>
            <Textarea rows={4} value={content} onChange={e => setContent(e.target.value)} />
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            Kích hoạt / xuất bản
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={async () => {
            await onSubmit({ id: lesson?.id, courseId, title, description, content, orderIndex, isActive });
          }}>{lesson ? 'Cập nhật' : 'Tạo mới'}</Button>
        </div>
      </div>
    </div>
  );
}


