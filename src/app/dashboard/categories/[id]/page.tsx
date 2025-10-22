"use client";

import { useEffect, useState } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useRouter, useParams } from 'next/navigation';

export default function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    (async ()=>{
      const resp = await authenticatedFetch(`/api/categories/${id}`);
      const data = await resp.json();
      const item = data?.Result?.Result ?? data?.Result ?? data?.data ?? data;
      if (item) {
        setName(item.name ?? item.Name ?? '');
        setDescription(item.description ?? item.Description ?? '');
        setOrderIndex((item.orderIndex ?? item.OrderIndex ?? 0) as number);
        setIsActive((item.isActive ?? item.IsActive) !== false);
      }
    })();
  }, [id, authenticatedFetch]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const resp = await authenticatedFetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name: name, Description: description, OrderIndex: orderIndex, IsActive: isActive }),
    });
    setSaving(false);
    if (resp.ok) router.push('/dashboard/categories');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-6">Sửa thể loại</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Tên</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Mô tả</label>
          <textarea className="mt-1 w-full border rounded px-3 py-2 h-28" value={description} onChange={(e)=>setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Thứ tự</label>
            <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={orderIndex} onChange={(e)=>setOrderIndex(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Trạng thái</label>
            <select className="mt-1 w-full border rounded px-3 py-2" value={isActive ? '1':'0'} onChange={(e)=>setIsActive(e.target.value==='1')}>
              <option value="1">Hiển thị</option>
              <option value="0">Ẩn</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-3">
          <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60">{saving? 'Đang lưu...' : 'Lưu'}</button>
          <button type="button" onClick={()=>router.push('/dashboard/categories')} className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">Hủy</button>
        </div>
      </form>
    </div>
  );
}


