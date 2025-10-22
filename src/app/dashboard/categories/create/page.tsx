"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

export default function CategoryCreatePage() {
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<number | ''>('');
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [icon, setIcon] = useState('');
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const resp = await authenticatedFetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name: name, Description: description, ParentId: parentId === '' ? null : Number(parentId), Icon: icon, OrderIndex: orderIndex }),
    });
    setSaving(false);
    if (resp.ok) router.push('/dashboard/categories');
  };

  const handleIconFile = async (file: File | undefined) => {
    if (!file) return;
    // Tạm thời encode base64 để BE lưu (hoặc chuyển thành URL sau khi tích hợp upload service)
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setIcon(result);
      setIconPreview(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold mb-6">Tạo thể loại</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên</label>
          <input className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={(e)=>setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500" value={description} onChange={(e)=>setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ParentId</label>
            <input type="number" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={parentId} onChange={(e)=>setParentId(e.target.value===''?'':Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Icon</label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                {iconPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="icon" src={iconPreview} className="h-12 w-12 object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">No icon</span>
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 shadow-sm text-sm hover:bg-gray-50">
                Chọn file
                <input type="file" accept="image/*" className="hidden" onChange={(e)=>handleIconFile(e.target.files?.[0])} />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Thứ tự</label>
            <input type="number" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={orderIndex} onChange={(e)=>setOrderIndex(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex space-x-3">
          <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 shadow-sm">{saving? 'Đang lưu...' : 'Tạo'}</button>
          <button type="button" onClick={()=>router.push('/dashboard/categories')} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 border border-gray-200">Hủy</button>
        </div>
      </form>
    </div>
  );
}


