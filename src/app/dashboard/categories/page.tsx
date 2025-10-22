"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

type Category = {
  id: number;
  name: string;
  description?: string;
  parentId?: number | null;
  orderIndex?: number;
  isActive?: boolean;
  children?: Category[];
};

function flattenCategories(items: Category[] | undefined, depth = 0, parentPath = ''): Category[] {
  if (!items) return [] as Category[];
  const out: Category[] = [];
  for (const it of items) {
    out.push({ ...it, name: `${'— '.repeat(depth)}${it.name}` });
    if (it.children && it.children.length) {
      out.push(...flattenCategories(it.children, depth + 1, parentPath ? `${parentPath} / ${it.name}` : it.name));
    }
  }
  return out;
}

export default function CategoriesPage() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [tree, setTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const flat = flattenCategories(tree);
    if (!q) return flat;
    return flat.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
  }, [tree, q]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const resp = await authenticatedFetch('/api/categories?includeInactive=true&includeCount=false');
        const data = await resp.json();
        // Chuẩn hóa theo nhiều cấu trúc trả về
        let arr: any = [];
        if (Array.isArray(data?.Result?.Result)) arr = data.Result.Result; // trường hợp bạn đưa
        else if (Array.isArray(data?.Result)) arr = data.Result;
        else if (Array.isArray(data?.Data)) arr = data.Data;
        else if (Array.isArray(data?.data)) arr = data.data;
        else if (Array.isArray(data?.Result?.Items)) arr = data.Result.Items;
        else if (Array.isArray(data?.Items)) arr = data.Items;

        // Map về dạng chuẩn Category[]
        const mapNode = (n: any): Category => ({
          id: n.id ?? n.Id,
          name: n.name ?? n.Name,
          description: n.description ?? n.Description,
          parentId: n.parentId ?? n.ParentId ?? null,
          isActive: n.isActive ?? n.IsActive,
          orderIndex: n.orderIndex ?? n.OrderIndex,
          children: Array.isArray(n.children ?? n.InverseParent)
            ? (n.children ?? n.InverseParent).map(mapNode)
            : [],
        });

        setTree(Array.isArray(arr) ? arr.map(mapNode) : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [authenticatedFetch]);

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa thể loại này?')) return;
    const resp = await authenticatedFetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (resp.ok) {
      setTree(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleToggle = async (id: number) => {
    const resp = await authenticatedFetch(`/api/categories/${id}/toggle`, { method: 'PUT' });
    if (resp.ok) {
      // reload list quickly
      const r = await authenticatedFetch('/api/categories?includeInactive=true&includeCount=false');
      const d = await r.json();
      let arr: any = [];
      if (Array.isArray(d?.Result?.Result)) arr = d.Result.Result;
      else if (Array.isArray(d?.Result)) arr = d.Result;
      else if (Array.isArray(d?.Data)) arr = d.Data;
      else if (Array.isArray(d?.data)) arr = d.data;
      else if (Array.isArray(d?.Result?.Items)) arr = d.Result.Items;
      else if (Array.isArray(d?.Items)) arr = d.Items;
      const mapNode = (n: any): Category => ({
        id: n.id ?? n.Id,
        name: n.name ?? n.Name,
        description: n.description ?? n.Description,
        parentId: n.parentId ?? n.ParentId ?? null,
        isActive: n.isActive ?? n.IsActive,
        orderIndex: n.orderIndex ?? n.OrderIndex,
        children: Array.isArray(n.children ?? n.InverseParent)
          ? (n.children ?? n.InverseParent).map(mapNode)
          : [],
      });
      setTree(Array.isArray(arr) ? arr.map(mapNode) : []);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thể loại</h1>
          <p className="text-sm text-gray-600">Tạo, sửa, xóa thể loại khóa học</p>
        </div>
        <Link href="/dashboard/categories/create" className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700">Tạo thể loại</Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-4">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Tìm kiếm thể loại" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td className="px-4 py-3" colSpan={4}>Đang tải...</td></tr>
              ) : list.length === 0 ? (
                <tr><td className="px-4 py-3" colSpan={4}>Không có dữ liệu</td></tr>
              ) : (
                list.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{c.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{c.description || ''}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.isActive === false ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-800'}`}>
                        {c.isActive === false ? 'Ẩn' : 'Hiển thị'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-sm ${c.isActive===false? 'border-green-300 text-green-700 hover:bg-green-50':'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        onClick={()=>handleToggle(c.id)}
                        title={c.isActive===false ? 'Hiển thị thể loại' : 'Ẩn thể loại'}
                      >
                        {c.isActive===false? 'Hiển thị' : 'Ẩn'}
                      </button>
                      <Link className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50" href={`/dashboard/categories/${c.id}`}>Sửa</Link>
                      <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-red-300 text-sm text-red-600 hover:bg-red-50" onClick={()=>handleDelete(c.id)}>Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


