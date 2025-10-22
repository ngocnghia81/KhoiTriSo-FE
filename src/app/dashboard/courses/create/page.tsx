"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useEffect } from 'react';

export default function CreateCoursePage() {
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [level, setLevel] = useState<number>(0); // 0: Cơ bản, ...
  const [isFree, setIsFree] = useState<boolean>(true);
  const [price, setPrice] = useState<number>(0);
  const [staticPagePath, setStaticPagePath] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [language, setLanguage] = useState('vi');
  const [requirements, setRequirements] = useState<string>(''); // newline separated
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string>(''); // newline separated
  const [isPublished, setIsPublished] = useState<boolean>(false); // Admin có thể xuất bản trực tiếp
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    // Load categories for dropdown
    (async () => {
      try {
        const resp = await authenticatedFetch('/api/categories');
        const data = await resp.json();
        // Chuẩn hóa lấy mảng: Result.Result | Result | Data | data | Result.Items | Items
        let arr: any = [];
        if (Array.isArray(data?.Result?.Result)) arr = data.Result.Result;
        else if (Array.isArray(data?.Result)) arr = data.Result;
        else if (Array.isArray(data?.Data)) arr = data.Data;
        else if (Array.isArray(data?.data)) arr = data.data;
        else if (Array.isArray(data?.Result?.Items)) arr = data.Result.Items;
        else if (Array.isArray(data?.Items)) arr = data.Items;

        const flatten = (items: any[], prefix = ''): any[] => {
          if (!Array.isArray(items)) return [];
          const out: any[] = [];
          for (const it of items) {
            const id = it.id ?? it.Id ?? it.ID;
            const name = it.name ?? it.Name ?? 'Unnamed';
            out.push({ id, name: prefix ? `${prefix} / ${name}` : name });
            const children = it.children ?? it.Children ?? it.items ?? it.Items;
            if (children && Array.isArray(children)) {
              out.push(...flatten(children, prefix ? `${prefix} / ${name}` : name));
            }
          }
          return out;
        };

        setCategoryOptions(flatten(arr));
      } catch {}
    })();
  }, [authenticatedFetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const body = {
        Title: title,
        Description: description,
        Thumbnail: thumbnail || undefined,
        CategoryId: categoryId === '' ? 0 : Number(categoryId),
        Level: Number(level) || 0,
        IsFree: isFree,
        Price: isFree ? 0 : Number(price) || 0,
        StaticPagePath: staticPagePath || undefined,
        EstimatedDuration: Number(estimatedDuration) || 0,
        Language: language || 'vi',
        Requirements: requirements
          .split('\n')
          .map(s=>s.trim())
          .filter(Boolean),
        WhatYouWillLearn: whatYouWillLearn
          .split('\n')
          .map(s=>s.trim())
          .filter(Boolean),
        IsPublished: isPublished, // Admin có thể xuất bản trực tiếp
      } as any;

      const resp = await authenticatedFetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.message || 'Tạo khóa học thất bại');
        return;
      }
      router.push('/dashboard/courses');
    } catch (e) {
      setError('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tạo khóa học mới</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            className="mt-1 w-full border rounded px-3 py-2 h-32"
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Thumbnail (URL)</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={thumbnail}
            onChange={(e)=>setThumbnail(e.target.value)}
            placeholder="https://.../image.jpg"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Miễn phí</label>
            <select className="mt-1 w-full border rounded px-3 py-2" value={isFree ? 'yes':'no'} onChange={(e)=>setIsFree(e.target.value==='yes')}>
              <option value="yes">Có</option>
              <option value="no">Không</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Giá</label>
            <input
              type="number"
              className="mt-1 w-full border rounded px-3 py-2"
              value={price}
              onChange={(e)=>setPrice(Number(e.target.value))}
              disabled={isFree}
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cấp độ</label>
            <select className="mt-1 w-full border rounded px-3 py-2" value={level} onChange={(e)=>setLevel(Number(e.target.value))}>
              <option value={0}>Cơ bản</option>
              <option value={1}>Trung bình</option>
              <option value={2}>Nâng cao</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Thể loại</label>
          <select
            className="mt-1 w-full border rounded px-3 py-2"
            value={categoryId === '' ? '' : String(categoryId)}
            onChange={(e)=>setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">Chọn thể loại</option>
            {categoryOptions.map((c:any)=> (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Đường dẫn trang tĩnh (StaticPagePath)</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={staticPagePath} onChange={(e)=>setStaticPagePath(e.target.value)} placeholder="/pages/my-course" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Thời lượng ước tính (phút)</label>
            <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={estimatedDuration} onChange={(e)=>setEstimatedDuration(Number(e.target.value))} min={0} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngôn ngữ</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={language} onChange={(e)=>setLanguage(e.target.value)} placeholder="vi | en" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Yêu cầu đầu vào (mỗi dòng một mục)</label>
            <textarea className="mt-1 w-full border rounded px-3 py-2 h-24" value={requirements} onChange={(e)=>setRequirements(e.target.value)} placeholder={"Máy tính cá nhân\nKết nối Internet"} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bạn sẽ học được (mỗi dòng một mục)</label>
          <textarea className="mt-1 w-full border rounded px-3 py-2 h-24" value={whatYouWillLearn} onChange={(e)=>setWhatYouWillLearn(e.target.value)} placeholder={"Thành thạo kiến thức A\nHiểu rõ khái niệm B"} />
        </div>

        {/* Admin có thể xuất bản trực tiếp */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm font-medium text-gray-900">
              Xuất bản khóa học ngay sau khi tạo
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-600">
            Nếu được chọn, khóa học sẽ được xuất bản và hiển thị cho người dùng ngay lập tức mà không cần gửi duyệt.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex space-x-3 pt-2">
          <button disabled={saving} type="submit" className={`px-5 py-2 rounded text-white font-medium disabled:opacity-60 ${
            isPublished 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}>
            {saving 
              ? 'Đang tạo...' 
              : isPublished 
                ? 'Tạo và xuất bản khóa học' 
                : 'Tạo khóa học'
            }
          </button>
          <button type="button" onClick={()=>router.push('/dashboard/courses')} className="bg-gray-100 text-gray-800 px-5 py-2 rounded hover:bg-gray-200">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}


