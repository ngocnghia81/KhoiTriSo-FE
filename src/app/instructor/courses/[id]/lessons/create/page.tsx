"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useUpload } from '@/hooks/useUpload';
import { RichTextEditor } from '@/components/RichTextEditor';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  AcademicCapIcon,
  VideoCameraIcon,
  PaperClipIcon,
  CloudArrowUpIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

function CreateLessonClient() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  
  const { uploadFileWithPresign, uploading: uploadingVideo, progress: uploadProgress } = useUpload();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    duration: 0,
    lessonOrder: 1,
    isPublished: false,
    videoUrl: '',
    materialUrls: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingMaterials, setUploadingMaterials] = useState<{ [key: string]: boolean }>({});
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [loadingDuration, setLoadingDuration] = useState(false);
  const [materialFiles, setMaterialFiles] = useState<File[]>([]);
  const [materialInfos, setMaterialInfos] = useState<Array<{ url: string; fileName: string; fileSize: number; fileType: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        CourseId: parseInt(courseId),
        Title: formData.title,
        Description: formData.description,
        VideoUrl: formData.videoUrl || '',
        VideoDuration: formData.duration || null,
        ContentText: 1, // AssignmentType.Lesson
        LessonOrder: formData.lessonOrder,
        StaticPagePath: '', // Can be empty
        IsPublished: formData.isPublished, // Lấy từ form
        IsFree: true // Default to free
      };
      
      // Debug: Log payload để kiểm tra
      console.log('Creating lesson with payload:', JSON.stringify(payload, null, 2));
      console.log('IsPublished value:', formData.isPublished, typeof formData.isPublished);
      
      const resp = await authenticatedFetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await resp.json();
      
      if (resp.ok) {
        const lessonId = data?.Result?.Id || data?.Result?.id || data?.Id || data?.id;
        
        // Tạo lesson materials nếu có
        if (materialInfos.length > 0 && lessonId) {
          try {
            // Tạo từng material
            for (const materialInfo of materialInfos) {
              // Lấy extension từ fileName
              const fileNameParts = materialInfo.fileName.split('.');
              const fileExtension = fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1].toLowerCase() : 'bin';
              
              const materialPayload = {
                LessonId: lessonId,
                Title: materialInfo.fileName,
                FileUrl: materialInfo.url,
                FileName: materialInfo.fileName,
                FileType: fileExtension,
                FileSize: materialInfo.fileSize
              };

              const materialResp = await authenticatedFetch(`/api/lessons/${lessonId}/materials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(materialPayload)
              });

              if (!materialResp.ok) {
                const materialData = await materialResp.json();
                console.warn('Không thể tạo lesson material:', materialData);
                // Không block việc tạo lesson nếu tạo material thất bại
              } else {
                console.log('Đã tạo lesson material thành công:', materialInfo.fileName);
              }
            }
          } catch (materialError) {
            console.error('Lỗi khi tạo lesson materials:', materialError);
            // Không block việc tạo lesson nếu tạo material thất bại
          }
        }
        
        router.push(`/instructor/courses/${courseId}/lessons`);
      } else {
        setError(data.Message || 'Có lỗi xảy ra khi tạo bài học');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tạo bài học');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const getVideoDurationFromFile = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const durationInSeconds = Math.round(video.duration); // Làm tròn về giây
        console.log('Video duration:', durationInSeconds, 'seconds');
        resolve(durationInSeconds);
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Không thể đọc metadata của video'));
      };
      
      // Create object URL from file
      video.src = URL.createObjectURL(file);
    });
  };

  const handleVideoUpload = async () => {
    if (!videoFile) {
      alert('Vui lòng chọn file video');
      return;
    }

    try {
      setError(null);
      console.log('Starting video upload:', { fileName: videoFile.name, size: videoFile.size, type: videoFile.type });
      
      // Get video duration from file before uploading
      let detectedDuration = 0;
      try {
        setLoadingDuration(true);
        detectedDuration = await getVideoDurationFromFile(videoFile);
        console.log('Video duration detected:', detectedDuration, 'seconds');
        setVideoDuration(detectedDuration);
      } catch (durationError) {
        console.warn('Could not get video duration from file:', durationError);
        // Continue with upload even if duration detection fails
      } finally {
        setLoadingDuration(false);
      }
      
      const result = await uploadFileWithPresign(videoFile, {
        folder: 'lesson-videos',
        accessRole: 'GUEST',
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress.percentage}%`);
        }
      });

      if (result.success && result.url) {
        console.log('Video uploaded successfully, URL:', result.url);
        // Tự động cập nhật thời lượng sau khi upload thành công
        const finalDuration = detectedDuration || formData.duration;
        setFormData(prev => ({ 
          ...prev, 
          videoUrl: result.url!,
          duration: finalDuration // Tự động cập nhật thời lượng (bằng giây)
        }));
        setVideoFile(null); // Clear file after upload
        
        // Hiển thị thông báo thành công với thời lượng
        const minutes = Math.floor(finalDuration / 60);
        const seconds = finalDuration % 60;
        const durationText = minutes > 0 
          ? `${minutes} phút ${seconds > 0 ? `${seconds} giây` : ''}`.trim()
          : `${seconds} giây`;
        console.log(`Upload video thành công! Thời lượng: ${durationText}`);
      } else {
        throw new Error(result.error || 'Upload video thất bại');
      }
    } catch (e: any) {
      console.error('Video upload error:', e);
      setError(e?.message || 'Upload video thất bại');
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoDuration(null);
      setError(null);
      
      // Try to get duration immediately when file is selected
      setLoadingDuration(true);
      try {
        const duration = await getVideoDurationFromFile(file);
        setVideoDuration(duration);
        // Also update form duration (bằng giây)
        setFormData(prev => ({ ...prev, duration }));
        console.log('Video duration detected on file selection:', duration, 'seconds');
      } catch (durationError) {
        console.warn('Could not get video duration:', durationError);
        setVideoDuration(null);
      } finally {
        setLoadingDuration(false);
      }
    }
  };

  const handleMaterialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMaterialFiles(prev => [...prev, ...files]);
  };

  const handleUploadMaterial = async (file: File, index: number) => {
    try {
      setUploadingMaterials(prev => ({ ...prev, [index]: true }));
      console.log('Starting material upload:', { fileName: file.name, size: file.size, type: file.type });
      
      const result = await uploadFileWithPresign(file, {
        folder: 'lesson-materials',
        accessRole: 'GUEST',
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress.percentage}%`);
        }
      });

      if (result.success && result.url) {
        console.log('Material uploaded successfully, URL:', result.url);
        const fileUrl = result.url;
        setFormData(prev => ({ 
          ...prev, 
          materialUrls: [...prev.materialUrls, fileUrl] 
        }));
        // Lưu thông tin file để tạo lesson material sau
        setMaterialInfos(prev => [...prev, {
          url: fileUrl,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream'
        }]);
        setMaterialFiles(prev => prev.filter((_, i) => i !== index));
        alert('Upload tài liệu thành công!');
      } else {
        throw new Error(result.error || 'Upload tài liệu thất bại');
      }
    } catch (e: any) {
      console.error('Material upload error:', e);
      alert(e?.message || 'Upload tài liệu thất bại');
    } finally {
      setUploadingMaterials(prev => ({ ...prev, [index]: false }));
    }
  };

  const removeMaterialUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materialUrls: prev.materialUrls.filter((_, i) => i !== index)
    }));
    setMaterialInfos(prev => prev.filter((_, i) => i !== index));
  };

  const removeMaterialFile = (index: number) => {
    setMaterialFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push(`/instructor/courses/${courseId}/lessons`)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Quay lại
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Tạo bài học mới</h1>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài học *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tiêu đề bài học"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Mô tả ngắn gọn về bài học..."
                className="bg-white"
              />
              <p className="mt-2 text-xs text-gray-500">
                Bạn có thể sử dụng các công cụ định dạng để làm nổi bật nội dung (in đậm, in nghiêng, gạch chân, v.v.)
              </p>
            </div>

            {/* Content */}
            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung bài học
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="Nội dung chi tiết của bài học..."
                className="bg-white"
              />
              <p className="mt-2 text-xs text-gray-500">
                Bạn có thể sử dụng các công cụ định dạng để làm nổi bật nội dung (in đậm, in nghiêng, gạch chân, v.v.)
              </p>
            </div>

            {/* Video Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <VideoCameraIcon className="h-4 w-4 inline mr-1" />
                Video bài giảng
              </label>
              
              {formData.videoUrl ? (
                <div className="mb-3 space-y-3">
                  {/* Video Preview */}
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      src={formData.videoUrl}
                      controls
                      className="w-full aspect-video"
                      preload="metadata"
                    >
                      Trình duyệt của bạn không hỗ trợ video HTML5.
                    </video>
                  </div>
                  
                  {/* Video Info */}
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <VideoCameraIcon className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Video đã upload</p>
                        <p className="text-xs text-green-600 truncate max-w-md">{formData.videoUrl}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, videoUrl: '', duration: 0 }));
                        setVideoFile(null);
                        setVideoDuration(null);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="video-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Chọn file video để upload
                        </span>
                        <input
                          id="video-upload"
                          name="video-upload"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          className="sr-only"
                        />
                      </label>
                      {videoFile && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center flex-1 min-w-0">
                              <VideoCameraIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{videoFile.name}</p>
                                <div className="flex items-center space-x-3 mt-1 flex-wrap">
                                  <p className="text-xs text-gray-500">
                                    {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                  {loadingDuration && (
                                    <p className="text-xs text-blue-600">Đang đọc thời lượng...</p>
                                  )}
                                  {!loadingDuration && videoDuration !== null && (
                                    <p className="text-xs text-green-600 font-medium">
                                      Thời lượng: {Math.floor(videoDuration / 60)} phút {videoDuration % 60 > 0 ? `${videoDuration % 60} giây` : ''}
                                    </p>
                                  )}
                                  {!loadingDuration && videoDuration === null && (
                                    <p className="text-xs text-gray-400">Không thể đọc thời lượng</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleVideoUpload}
                              disabled={uploadingVideo || loadingDuration}
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ml-3 flex-shrink-0"
                            >
                              {uploadingVideo ? 'Đang upload...' : 'Upload'}
                            </button>
                          </div>
                          
                          {/* Progress bar khi upload */}
                          {uploadingVideo && uploadProgress && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>Đang upload video...</span>
                                <span>{uploadProgress.percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress.percentage}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500">
                                {(uploadProgress.loaded / 1024 / 1024).toFixed(2)} MB / {(uploadProgress.total / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        MP4, AVI, MOV hoặc các định dạng video khác (tối đa 500MB)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Thời lượng (giây) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                min="0"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                required
              />
              {formData.duration > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {Math.floor(formData.duration / 60)} phút {formData.duration % 60 > 0 ? `${formData.duration % 60} giây` : ''}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Thời lượng sẽ tự động tính sau khi upload video thành công
              </p>
            </div>

            {/* Lesson Order */}
            <div>
              <label htmlFor="lessonOrder" className="block text-sm font-medium text-gray-700 mb-2">
                Thứ tự bài học
              </label>
              <input
                type="number"
                id="lessonOrder"
                name="lessonOrder"
                min="1"
                value={formData.lessonOrder}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="1"
              />
            </div>

            {/* Materials Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PaperClipIcon className="h-4 w-4 inline mr-1" />
                Tài liệu bài học
              </label>
              
              {/* Uploaded materials */}
              {formData.materialUrls.length > 0 && (
                <div className="mb-3 space-y-3">
                  {formData.materialUrls.map((url, index) => {
                    const fileName = url.split('/').pop() || `Tài liệu ${index + 1}`;
                    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
                    const isPdf = fileExtension === 'pdf';
                    
                    return (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                        {/* File Preview/Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1 min-w-0">
                            <DocumentTextIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-900 truncate">{fileName}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  Xem/Tải file
                                </a>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500 truncate">{url}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMaterialUrl(index)}
                            className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                        {/* Preview for images and PDFs */}
                        {(isImage || isPdf) && (
                          <div className="mt-2 border border-gray-200 rounded overflow-hidden">
                            {isImage ? (
                              <img
                                src={url}
                                alt={fileName}
                                className="w-full h-auto max-h-64 object-contain bg-gray-50"
                                onError={(e) => {
                                  // Hide image if it fails to load
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : isPdf ? (
                              <div className="bg-gray-50 p-4 text-center">
                                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-2">PDF Document</p>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                >
                                  Mở PDF
                                </a>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Pending files to upload */}
              {materialFiles.length > 0 && (
                <div className="mb-3 space-y-2">
                  {materialFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleUploadMaterial(file, index)}
                          disabled={uploadingMaterials[index]}
                          className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {uploadingMaterials[index] ? 'Đang upload...' : 'Upload'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMaterialFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* File picker */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Chọn tài liệu để upload
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar"
                        onChange={handleMaterialFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, DOC, PPT, TXT, ZIP hoặc các file khác (tối đa 50MB mỗi file)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push(`/instructor/courses/${courseId}/lessons`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || uploadingVideo || Object.values(uploadingMaterials).some(v => v)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading 
                ? 'Đang tạo...' 
                : uploadingVideo
                  ? 'Đang upload video...'
                  : Object.values(uploadingMaterials).some(v => v)
                    ? 'Đang upload tài liệu...'
                    : 'Tạo bài học'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateLessonPage() {
  return <CreateLessonClient />;
}
