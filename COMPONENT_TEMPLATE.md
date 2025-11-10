# Template Component với Translation

## Template cơ bản

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

export default function MyPage() {
  const { t } = useTranslation();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const resp = await authenticatedFetch('/api/your-endpoint');
      const result = await resp.json();
      
      if (resp.ok) {
        setData(result?.Items || []);
      } else {
        setError(result?.Message || t.error.loadingData);
      }
    } catch (err) {
      setError(t.error.somethingWrong);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t.myModule.title}
          </h1>
          <p className="text-sm text-gray-600">
            {t.myModule.subtitle}
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          {t.myModule.create}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">{t.common.loading}</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={loadData}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t.error.tryAgain}
            </button>
          </div>
        ) : (
          <div>
            {/* Your content here */}
            {data.length === 0 ? (
              <p className="text-center text-gray-500">{t.common.noData}</p>
            ) : (
              <div>
                {/* Render your data */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Template với Table

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function MyTablePage() {
  const { t } = useTranslation();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t.myModule.title}
          </h1>
          <p className="text-sm text-gray-600">{t.myModule.subtitle}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.myModule.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.myModule.columnName}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.myModule.columnStatus}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.common.actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    {t.common.edit}
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    {t.common.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Template với Form

```tsx
'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

export default function MyFormPage() {
  const { t } = useTranslation();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const resp = await authenticatedFetch('/api/your-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (resp.ok) {
        alert(t.common.success);
        // Reset form or redirect
      } else {
        const data = await resp.json();
        alert(data?.Message || t.error.somethingWrong);
      }
    } catch (err) {
      alert(t.error.somethingWrong);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {t.myModule.create}
        </h1>
        <p className="text-sm text-gray-600">{t.myModule.createSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.myModule.name}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.myModule.description}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.myModule.status}
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">{t.common.active}</option>
            <option value="inactive">{t.common.inactive}</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {t.common.cancel}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? t.common.loading : t.common.save}
          </button>
        </div>
      </form>
    </div>
  );
}
```

## Checklist khi tạo component mới

- [ ] Import `useTranslation` hook
- [ ] Sử dụng `t.module.key` thay vì hardcode text
- [ ] Thêm translations vào `vi.ts` và `en.ts`
- [ ] Test với cả 2 ngôn ngữ
- [ ] Kiểm tra TypeScript không có lỗi
- [ ] Đảm bảo UI responsive với cả text dài và ngắn
