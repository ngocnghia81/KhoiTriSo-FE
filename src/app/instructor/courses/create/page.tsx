"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useUpload } from '@/hooks/useUpload';
import { CloudArrowUpIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useCategories } from '@/hooks/useCategories';
import { useMemo } from 'react';

export default function CreateCoursePage() {
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();

  const { uploadFileWithPresign, uploading: uploadingThumbnail, progress: uploadProgress } = useUpload();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [level, setLevel] = useState<number>(0); // 0: Cơ bản, ...
  const [isFree, setIsFree] = useState<boolean>(true);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [price, setPrice] = useState<number>(0);
  const [priceInput, setPriceInput] = useState<string>('0');
  const [staticPagePath, setStaticPagePath] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [language, setLanguage] = useState('vi');
  const [requirements, setRequirements] = useState<string>(''); // newline separated
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string>(''); // newline separated
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const categoryOptions = useMemo(() => {
    const flatten = (items: any[], prefix = ''): any[] => {
      if (!Array.isArray(items)) return [];
      const out: any[] = [];
      for (const it of items) {
        const id = it.id ?? it.Id ?? it.ID;
        const name = it.name ?? it.Name ?? 'Unnamed';
        out.push({ id, name: prefix ? `${prefix} / ${name}` : name });
        const children = it.children ?? [];
        if (children && Array.isArray(children) && children.length > 0) {
          out.push(...flatten(children, prefix ? `${prefix} / ${name}` : name));
        }
      }
      return out;
    };
    return flatten(categories);
  }, [categories]);

  useEffect(() => {
    if (isFree) {
      setPrice(0);
      setPriceInput('0');
    }
  }, [isFree]);

  useEffect(()=>{
    if (isFree) {
      setPrice(0);
      setPriceInput('0');
    }
  }, [isFree]);

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setThumbnailFile(file);
    setError(null);

    try {
      // Upload thumbnail immediately
      const result = await uploadFileWithPresign(file, {
        folder: 'course-thumbnails',
        accessRole: 'GUEST',
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress.percentage}%`);
        }
      });

      if (result.success && result.url) {
        setThumbnail(result.url);
        console.log('Thumbnail uploaded successfully:', result.url);
      } else {
        throw new Error(result.error || 'Upload thumbnail thất bại');
      }
    } catch (e: any) {
      console.error('Thumbnail upload error:', e);
      setError(e?.message || 'Upload thumbnail thất bại');
      setThumbnailFile(null);
      setThumbnail('');
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnail('');
    setThumbnailFile(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate thumbnail is uploaded
    if (!thumbnail) {
      setError('Vui lòng upload thumbnail trước khi tạo khóa học');
      return;
    }

    // Prevent submit if still uploading
    if (uploadingThumbnail) {
      setError('Vui lòng đợi upload thumbnail hoàn tất');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const body = {
        Title: title,
        Description: description,
        Thumbnail: thumbnail,
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

      // Lấy courseId từ response
      const courseId = data?.Result?.Id || data?.Result?.id || data?.Id || data?.id;
      
      if (courseId) {
        // Tự động tạo lesson giới thiệu đầu tiên (miễn phí)
        try {
          const introLessonPayload = {
            CourseId: courseId,
            Title: 'Giới thiệu khóa học',
            Description: 'Video giới thiệu về khóa học này. Học viên có thể xem miễn phí để hiểu rõ hơn về nội dung khóa học.',
            VideoUrl: null, // Có thể để null, user sẽ upload sau
            VideoDuration: null,
            ContentText: 1, // AssignmentType.Lesson
            LessonOrder: 1,
            StaticPagePath: null,
            IsPublished: false, // Mặc định chưa xuất bản
            IsFree: true // Lesson miễn phí - học viên có thể xem mà không cần mua khóa học
          };

          const lessonResp = await authenticatedFetch('/api/lessons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(introLessonPayload),
          });

          if (lessonResp.ok) {
            console.log('Đã tạo lesson giới thiệu thành công');
          } else {
            console.warn('Không thể tạo lesson giới thiệu tự động:', await lessonResp.json());
            // Không block việc tạo course nếu tạo lesson thất bại
          }
        } catch (lessonError) {
          console.error('Lỗi khi tạo lesson giới thiệu:', lessonError);
          // Không block việc tạo course nếu tạo lesson thất bại
        }
      }

      router.push('/instructor/courses');
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả khóa học
          </label>
          <div className="mt-1">
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Nhập mô tả chi tiết về khóa học..."
              className="bg-white"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Bạn có thể sử dụng các công cụ định dạng để làm nổi bật nội dung (in đậm, in nghiêng, gạch chân, v.v.)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail <span className="text-red-500">*</span>
          </label>
          
          {!thumbnail ? (
            <div className="space-y-2">
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                  uploadingThumbnail
                    ? 'border-blue-400 bg-blue-50 cursor-wait'
                    : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                }`}
                onClick={() => !uploadingThumbnail && thumbnailInputRef.current?.click()}
              >
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  disabled={uploadingThumbnail}
                />
                
                <div className="text-center">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click để upload thumbnail
                      </span>
                      {' '}hoặc kéo thả file vào đây
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Chấp nhận: JPG, PNG, GIF • Tối đa 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadingThumbnail && uploadProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Đang upload thumbnail...</span>
                    <span>{uploadProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative inline-block">
                <img
                  src={thumbnail}
                  alt="Thumbnail preview"
                  className="h-48 w-full object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveThumbnail}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={uploadingThumbnail}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
                <span>Thumbnail đã được upload thành công</span>
              </div>
            </div>
          )}
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
            {isFree ? (
              <div className="mt-1 px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded">
                Khóa học miễn phí sẽ không có giá. Hủy chọn &quot;Miễn phí&quot; để nhập giá.
              </div>
            ) : (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="mt-1 w-full border rounded px-3 py-2"
                value={priceInput}
                onChange={(e) => {
                  const raw = e.target.value;
                  const digitsOnly = raw.replace(/\D/g, '');
                  const normalized = digitsOnly.replace(/^0+(?=\d)/, '') || '0';
                  setPriceInput(normalized);
                  setPrice(Number(normalized));
                }}
                onBlur={() => {
                  const normalized = priceInput.replace(/^0+(?=\d)/, '') || '0';
                  setPriceInput(normalized);
                  setPrice(Number(normalized));
                }}
              />
            )}
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
            {categoriesLoading && <option value="" disabled>Đang tải danh mục...</option>}
            {categoriesError && <option value="" disabled>Lỗi tải danh mục</option>}
            {categoryOptions.map((c:any)=> (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Đường dẫn trang tĩnh (StaticPagePath)</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={staticPagePath} onChange={(e)=>setStaticPagePath(e.target.value)} placeholder="/pages/my-course" />
        </div>
        
        {/* Thời lượng ước tính sẽ tự động tính từ tổng thời lượng của các lesson */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Thời lượng ước tính
              </p>
              <p className="text-xs text-gray-600">
                Thời lượng sẽ được tự động tính từ tổng thời lượng của tất cả các lesson sau khi bạn upload lesson.
                Bạn không cần nhập thủ công trường này.
              </p>
            </div>
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


        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex space-x-3 pt-2">
          <button 
            disabled={saving || uploadingThumbnail || !thumbnail} 
            type="submit" 
            className={`px-5 py-2 rounded text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed ${
              isPublished 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            title={!thumbnail ? 'Vui lòng upload thumbnail trước' : uploadingThumbnail ? 'Đang upload thumbnail...' : ''}
          >
            {uploadingThumbnail
              ? 'Đang upload thumbnail...'
              : saving 
                ? 'Đang tạo...' 
                : isPublished 
                  ? 'Tạo và xuất bản khóa học' 
                  : 'Tạo khóa học'
            }
          </button>
          <button 
            type="button" 
            onClick={()=>router.push('/instructor/courses')} 
            className="bg-gray-100 text-gray-800 px-5 py-2 rounded hover:bg-gray-200"
            disabled={uploadingThumbnail}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}


