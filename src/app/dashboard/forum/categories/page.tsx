'use client';

import { useState, useEffect, useCallback } from 'react';
import { forumApiService, ForumCategory } from '@/services/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CategoriesManagementPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<ForumCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#000000');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [newCategorySortOrder, setNewCategorySortOrder] = useState(0);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDescription, setEditCategoryDescription] = useState('');
  const [editCategoryColor, setEditCategoryColor] = useState('');
  const [editCategoryIcon, setEditCategoryIcon] = useState('');
  const [editCategoryIsActive, setEditCategoryIsActive] = useState(true);
  const [editCategorySortOrder, setEditCategorySortOrder] = useState(0);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Admin can see inactive categories
      const data = await forumApiService.getCategories(user?.role === 'admin');
      setCategories(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách danh mục';
      setError(errorMessage);
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('Tên danh mục không được để trống');
      return;
    }
    try {
      await forumApiService.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
        color: newCategoryColor,
        icon: newCategoryIcon.trim() || undefined,
        sortOrder: newCategorySortOrder,
      });
      setShowCreateModal(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryColor('#000000');
      setNewCategoryIcon('');
      setNewCategorySortOrder(0);
      loadCategories();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo danh mục';
      alert(errorMessage);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory?.id || !editCategoryName.trim()) {
      alert('Tên danh mục không được để trống');
      return;
    }
    try {
      await forumApiService.updateCategory(currentCategory.id, {
        name: editCategoryName.trim(),
        description: editCategoryDescription.trim() || undefined,
        color: editCategoryColor,
        icon: editCategoryIcon.trim() || undefined,
        isActive: editCategoryIsActive,
        sortOrder: editCategorySortOrder,
      });
      setShowEditModal(false);
      setCurrentCategory(null);
      loadCategories();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật danh mục';
      alert(errorMessage);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await forumApiService.deleteCategory(categoryId);
      loadCategories();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa danh mục';
      alert(errorMessage);
    }
  };

  const handleToggleActive = async (category: ForumCategory) => {
    try {
      await forumApiService.updateCategory(category.id, {
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
        isActive: !category.isActive,
        sortOrder: category.sortOrder,
      });
      loadCategories();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái';
      alert(errorMessage);
    }
  };

  const openEditModal = (category: ForumCategory) => {
    setCurrentCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryDescription(category.description || '');
    setEditCategoryColor(category.color || '#000000');
    setEditCategoryIcon(category.icon || '');
    setEditCategoryIsActive(category.isActive);
    setEditCategorySortOrder(category.sortOrder);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách danh mục...</p>
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
            onClick={loadCategories}
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục</h1>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Tạo danh mục mới
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
                Hoạt động ({categories.filter(c => c.isActive).length})
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inactive'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Không hoạt động ({categories.filter(c => !c.isActive).length})
              </button>
            </nav>
          </div>
        )}

        {/* Filtered categories based on active tab */}
        {(() => {
          const filteredCategories = user?.role === 'admin' 
            ? categories.filter(c => activeTab === 'active' ? c.isActive : !c.isActive)
            : categories.filter(c => c.isActive);
          
          if (filteredCategories.length === 0) {
            return (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <TagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {activeTab === 'active' ? 'Chưa có danh mục hoạt động' : 'Chưa có danh mục không hoạt động'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'active' 
                    ? 'Hãy tạo danh mục đầu tiên của bạn!' 
                    : 'Tất cả danh mục đang hoạt động'}
                </p>
                {user?.role === 'admin' && activeTab === 'active' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Tạo danh mục mới
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thứ tự</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    {user?.role === 'admin' && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {category.icon && (
                            <span className="mr-2 text-gray-600" dangerouslySetInnerHTML={{ __html: category.icon }} />
                          )}
                          <span
                            className="h-3 w-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color || '#000000' }}
                          ></span>
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{category.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-900">{category.sortOrder}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user?.role === 'admin' ? (
                          <button
                            onClick={() => handleToggleActive(category)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              category.isActive ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                            role="switch"
                            aria-checked={category.isActive}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                category.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        )}
                      </td>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-4">
                            <button
                              onClick={() => openEditModal(category)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Chỉnh sửa"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
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


        {/* Create Category Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Tạo danh mục mới</h3>
              <form onSubmit={handleCreateCategory}>
                <div className="mb-4">
                  <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                  <input
                    type="text"
                    id="newCategoryName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="newCategoryDescription" className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    id="newCategoryDescription"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="newCategoryColor" className="block text-sm font-medium text-gray-700">Màu sắc</label>
                  <input
                    type="color"
                    id="newCategoryColor"
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="newCategoryIcon" className="block text-sm font-medium text-gray-700">Icon (HTML/SVG)</label>
                  <input
                    type="text"
                    id="newCategoryIcon"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    placeholder="e.g., <svg>...</svg> or 📚"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="newCategorySortOrder" className="block text-sm font-medium text-gray-700">Thứ tự sắp xếp</label>
                  <input
                    type="number"
                    id="newCategorySortOrder"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={newCategorySortOrder}
                    onChange={(e) => setNewCategorySortOrder(parseInt(e.target.value) || 0)}
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

        {/* Edit Category Modal */}
        {showEditModal && currentCategory && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Chỉnh sửa danh mục</h3>
              <form onSubmit={handleEditCategory}>
                <div className="mb-4">
                  <label htmlFor="editCategoryName" className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                  <input
                    type="text"
                    id="editCategoryName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="editCategoryDescription" className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    id="editCategoryDescription"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={editCategoryDescription}
                    onChange={(e) => setEditCategoryDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="editCategoryColor" className="block text-sm font-medium text-gray-700">Màu sắc</label>
                  <input
                    type="color"
                    id="editCategoryColor"
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={editCategoryColor}
                    onChange={(e) => setEditCategoryColor(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="editCategoryIcon" className="block text-sm font-medium text-gray-700">Icon (HTML/SVG)</label>
                  <input
                    type="text"
                    id="editCategoryIcon"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={editCategoryIcon}
                    onChange={(e) => setEditCategoryIcon(e.target.value)}
                    placeholder="e.g., <svg>...</svg> or 📚"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="editCategorySortOrder" className="block text-sm font-medium text-gray-700">Thứ tự sắp xếp</label>
                  <input
                    type="number"
                    id="editCategorySortOrder"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={editCategorySortOrder}
                    onChange={(e) => setEditCategorySortOrder(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="editCategoryIsActive"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={editCategoryIsActive}
                    onChange={(e) => setEditCategoryIsActive(e.target.checked)}
                  />
                  <label htmlFor="editCategoryIsActive" className="ml-2 block text-sm text-gray-900">Hoạt động</label>
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

