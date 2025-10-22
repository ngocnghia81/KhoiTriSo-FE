'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, isAuthenticated, token, login } = useAuth();
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const resp = await authenticatedFetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FullName: fullName,
          Email: email,
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        // Cập nhật thông tin user trong context
        login({
          id: user.id,
          name: fullName || user.name,
          email: email || user.email,
          avatar: user.avatar,
          role: user.role,
        }, token || '');
        setEditMode(false);
      } else {
        setError(data?.message || 'Cập nhật thất bại');
      }
    } catch (e) {
      setError('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('File', file);
      const resp = await authenticatedFetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.message || 'Tải ảnh thất bại');
      } else {
        // reload page state via me endpoint or simple image refresh
        window.location.reload();
      }
    } catch (e) {
      setError('Có lỗi xảy ra');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Thông tin tài khoản</h1>
          
          <div className="flex items-center space-x-6 mb-8">
            <Image
              className="h-20 w-20 rounded-full object-cover"
              src={user.avatar || '/images/default-avatar.svg'}
              alt={user.name}
              width={80}
              height={80}
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                {user.role === 'student' ? 'Học viên' : user.role === 'instructor' ? 'Giảng viên' : 'Quản trị viên'}
              </span>
              <div className="mt-3">
                <label className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 text-sm">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAvatarUpload(f);
                  }} />
                  {uploading ? 'Đang tải...' : 'Đổi ảnh đại diện'}
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Thông tin cá nhân</h3>
              {!editMode ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Họ và tên:</span>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Vai trò:</span>
                    <p className="text-gray-900">{user.role === 'student' ? 'Học viên' : user.role === 'instructor' ? 'Giảng viên' : 'Quản trị viên'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                    <input className="mt-1 w-full border rounded px-3 py-2 text-sm" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input className="mt-1 w-full border rounded px-3 py-2 text-sm" value={email} onChange={(e)=>setEmail(e.target.value)} />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Thống kê học tập</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Khóa học đã mua:</span>
                  <p className="text-gray-900">0</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Bài tập đã hoàn thành:</span>
                  <p className="text-gray-900">0</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Điểm trung bình:</span>
                  <p className="text-gray-900">Chưa có</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex space-x-4">
            {!editMode ? (
              <button onClick={()=>{setFullName(user.name); setEmail(user.email); setEditMode(true);}} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Chỉnh sửa thông tin
              </button>
            ) : (
              <>
                <button disabled={saving} onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60">
                  {saving ? 'Đang lưu...' : 'Lưu' }
                </button>
                <button onClick={()=>setEditMode(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                  Hủy
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}