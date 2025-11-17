'use client';

import { useState, useEffect, useCallback } from 'react';
import { forumApiService, ForumTag } from '@/services/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function TagsManagementPage() {
  const { user } = useAuth();
  const [tags, setTags] = useState<ForumTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTag, setCurrentTag] = useState<ForumTag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [newTagColor, setNewTagColor] = useState('#000000');
  const [editTagName, setEditTagName] = useState('');
  const [editTagDescription, setEditTagDescription] = useState('');
  const [editTagColor, setEditTagColor] = useState('');
  const [editTagIsActive, setEditTagIsActive] = useState(true);

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Admin can see inactive tags
      const data = await forumApiService.getAllTags(user?.role === 'admin');
      setTags(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách thẻ';
      setError(errorMessage);
      console.error('Error loading tags:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      alert('Tên thẻ không được để trống');
      return;
    }
    try {
      await forumApiService.createTag({
        name: newTagName.trim(),
        description: newTagDescription.trim() || undefined,
        color: newTagColor,
      });
      setShowCreateModal(false);
      setNewTagName('');
      setNewTagDescription('');
      setNewTagColor('#000000');
      loadTags();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo thẻ';
      alert(errorMessage);
    }
  };

  const handleEditTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTag?.id || !editTagName.trim()) {
      alert('Tên thẻ không được để trống');
      return;
    }
    try {
      await forumApiService.updateTag(currentTag.id, {
        name: editTagName.trim(),
        description: editTagDescription.trim() || undefined,
        color: editTagColor,
        isActive: editTagIsActive,
      });
      setShowEditModal(false);
      setCurrentTag(null);
      loadTags();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật thẻ';
      alert(errorMessage);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thẻ này?')) return;
    try {
      await forumApiService.deleteTag(tagId);
      loadTags();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa thẻ';
      alert(errorMessage);
    }
  };

  const handleToggleActive = async (tag: ForumTag) => {
    try {
      await forumApiService.updateTag(tag.id, {
        name: tag.name,
        description: tag.description,
        color: tag.color,
        isActive: !tag.isActive,
      });
      loadTags();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái';
      alert(errorMessage);
    }
  };

  const openEditModal = (tag: ForumTag) => {
    setCurrentTag(tag);
    setEditTagName(tag.name);
    setEditTagDescription(tag.description || '');
    setEditTagColor(tag.color || '#000000');
    setEditTagIsActive(tag.isActive);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách thẻ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadTags}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard/forum/questions" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại diễn đàn
        </Link>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Thẻ (Tags)</h1>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Tạo thẻ mới
            </button>
          )}
        </div>

        {/* Tabs */}
        {user?.role === 'admin' && (
          <div className="mb-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('active')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Hoạt động ({tags.filter(t => t.isActive).length})
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inactive'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Không hoạt động ({tags.filter(t => !t.isActive).length})
              </button>
            </nav>
          </div>
        )}

        {/* Filtered tags based on active tab */}
        {(() => {
          const filteredTags = user?.role === 'admin' 
            ? tags.filter(t => activeTab === 'active' ? t.isActive : !t.isActive)
            : tags.filter(t => t.isActive);
          
          if (filteredTags.length === 0) {
            return (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <TagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {activeTab === 'active' ? 'Chưa có thẻ hoạt động' : 'Chưa có thẻ không hoạt động'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'active' 
                    ? 'Hãy tạo thẻ đầu tiên của bạn!' 
                    : 'Tất cả thẻ đang hoạt động'}
                </p>
                {user?.role === 'admin' && activeTab === 'active' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Tạo thẻ mới
                  </button>
                )}
              </div>
            );
          }

          return (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thẻ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    {user?.role === 'admin' && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className="h-3 w-3 rounded-full mr-2"
                            style={{ backgroundColor: tag.color || '#000000' }}
                          ></span>
                          <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{tag.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user?.role === 'admin' ? (
                          <button
                            onClick={() => handleToggleActive(tag)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              tag.isActive ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                            role="switch"
                            aria-checked={tag.isActive}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                tag.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tag.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {tag.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        )}
                      </td>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-4">
                            <button
                              onClick={() => openEditModal(tag)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Chỉnh sửa"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}


        {/* Create Tag Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Tạo thẻ mới</h3>
              <form onSubmit={handleCreateTag}>
                <div className="mb-4">
                  <label htmlFor="newTagName" className="block text-sm font-medium text-gray-700">Tên thẻ</label>
                  <input
                    type="text"
                    id="newTagName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="newTagDescription" className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    id="newTagDescription"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={newTagDescription}
                    onChange={(e) => setNewTagDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="newTagColor" className="block text-sm font-medium text-gray-700">Màu sắc</label>
                  <input
                    type="color"
                    id="newTagColor"
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Tạo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Tag Modal */}
        {showEditModal && currentTag && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Chỉnh sửa thẻ</h3>
              <form onSubmit={handleEditTag}>
                <div className="mb-4">
                  <label htmlFor="editTagName" className="block text-sm font-medium text-gray-700">Tên thẻ</label>
                  <input
                    type="text"
                    id="editTagName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={editTagName}
                    onChange={(e) => setEditTagName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="editTagDescription" className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    id="editTagDescription"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={editTagDescription}
                    onChange={(e) => setEditTagDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="editTagColor" className="block text-sm font-medium text-gray-700">Màu sắc</label>
                  <input
                    type="color"
                    id="editTagColor"
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={editTagColor}
                    onChange={(e) => setEditTagColor(e.target.value)}
                  />
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="editTagIsActive"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={editTagIsActive}
                    onChange={(e) => setEditTagIsActive(e.target.checked)}
                  />
                  <label htmlFor="editTagIsActive" className="ml-2 block text-sm text-gray-900">Hoạt động</label>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

