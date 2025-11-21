"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { useUpload } from "@/hooks/useUpload";
import { useAuth } from '@/contexts/AuthContext';
import { renameFileWithTimestamp } from '@/utils/fileUtils';
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface CategoryOption {
  id: number;
  name: string;
}

const normalizeArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.Result?.Items)) return data.Result.Items;
  if (Array.isArray(data?.Result?.Result)) return data.Result.Result;
  if (Array.isArray(data?.Result)) return data.Result;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.Items)) return data.Items;
  if (Array.isArray(data?.Data)) return data.Data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const flattenCategories = (items: any[], prefix = ""): CategoryOption[] => {
  if (!Array.isArray(items)) return [];
  const result: CategoryOption[] = [];
  items.forEach((item) => {
    const id = item.id ?? item.Id ?? item.ID;
    const name = item.name ?? item.Name ?? "Không có tên";
    const label = prefix ? `${prefix} / ${name}` : name;
    if (id) {
      result.push({ id, name: label });
    }
    const children =
      item.children ??
      item.Children ??
      item.items ??
      item.Items ??
      item.subCategories;
    if (children && Array.isArray(children)) {
      result.push(...flattenCategories(children, label));
    }
  });
  return result;
};

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params?.id);

  const { authenticatedFetch } = useAuthenticatedFetch();
  const { user } = useAuth();
  const {
    uploadFileWithPresign,
    uploading: uploadingThumbnail,
    progress: uploadProgress,
  } = useUpload();

  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [level, setLevel] = useState<number>(0);
  const [isFree, setIsFree] = useState<boolean>(true);
  const [price, setPrice] = useState<number>(0);
  const [priceInput, setPriceInput] = useState<string>("0");
  const [staticPagePath, setStaticPagePath] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(
    null
  );
  const [language, setLanguage] = useState("vi");
  const [requirements, setRequirements] = useState<string>("");
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string>("");
  const [isPublished, setIsPublished] = useState<boolean>(false);

  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const resp = await authenticatedFetch("/api/categories");
      const data = await resp.json();
      const normalized = normalizeArray(data);
      setCategoryOptions(flattenCategories(normalized));
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  }, [authenticatedFetch]);

  const fetchCourseDetails = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError(null);

      const resp = await authenticatedFetch(`/api/courses/${courseId}`);
      const data = await resp.json();

      if (!resp.ok) {
        setError(data?.Message || "Không thể tải thông tin khóa học");
        return;
      }

      const course =
        data?.Result?.Result ??
        data?.Result ??
        data?.result ??
        data?.Data ??
        data;

      const courseTitle = course?.Title ?? course?.title ?? "";
      setTitle(courseTitle);
      setDescription(course?.Description ?? course?.description ?? "");
      setThumbnail(course?.Thumbnail ?? course?.thumbnail ?? "");
      setCategoryId(
        course?.CategoryId ?? course?.categoryId ?? course?.Category?.Id ?? ""
      );
      setLevel(
        course?.Level ??
          course?.level ??
          (course?.DifficultyLevel ?? course?.difficultyLevel ?? 0)
      );

      const priceValue =
        course?.Price ?? course?.price ?? (course?.IsFree ? 0 : 0);
      setPrice(Number(priceValue) || 0);
      setPriceInput(String(Number(priceValue) || 0));

      const courseIsFree =
        course?.IsFree ??
        course?.isFree ??
        (Number(priceValue) === 0 ? true : false);
      setIsFree(Boolean(courseIsFree));

      setStaticPagePath(
        course?.StaticPagePath ?? course?.staticPagePath ?? ""
      );
      setEstimatedDuration(
        course?.EstimatedDuration ?? course?.estimatedDuration ?? null
      );
      setLanguage(course?.Language ?? course?.language ?? "vi");

      const reqs =
        course?.Requirements ??
        course?.requirements ??
        course?.RequirementList ??
        [];
      if (Array.isArray(reqs)) {
        setRequirements(reqs.join("\n"));
      }

      const learns =
        course?.WhatYouWillLearn ??
        course?.whatYouWillLearn ??
        course?.LearningOutcomes ??
        [];
      if (Array.isArray(learns)) {
        setWhatYouWillLearn(learns.join("\n"));
      }

      const publishState =
        course?.IsPublished ??
        course?.isPublished ??
        (course?.ApprovalStatus === 2 || course?.approvalStatus === 2);
      setIsPublished(Boolean(publishState));
    } catch (err) {
      console.error("Failed to load course", err);
      setError("Có lỗi xảy ra khi tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, courseId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  useEffect(() => {
    if (isFree) {
      setPrice(0);
      setPriceInput("0");
    }
  }, [isFree]);

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước file không được vượt quá 5MB");
      return;
    }

    setError(null);

    try {
      // Đổi tên file trước khi upload để tránh trùng tên
      const renamedFile = renameFileWithTimestamp(file, user?.id);
      
      const result = await uploadFileWithPresign(renamedFile, {
        folder: "course-thumbnails",
        accessRole: "GUEST",
      });

      if (result.success && result.url) {
        setThumbnail(result.url);
      } else {
        throw new Error(result.error || "Upload thumbnail thất bại");
      }
    } catch (err: any) {
      console.error("Thumbnail upload error:", err);
      setError(err?.message || "Upload thumbnail thất bại");
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnail("");
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    if (!thumbnail) {
      setError("Vui lòng upload thumbnail trước khi lưu");
      return;
    }

    if (uploadingThumbnail) {
      setError("Vui lòng đợi upload thumbnail hoàn tất");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: Record<string, any> = {
        Title: title,
        Description: description,
        Thumbnail: thumbnail,
        CategoryId: categoryId === "" ? 0 : Number(categoryId),
        Level: Number(level) || 0,
        IsFree: Boolean(isFree),
        Price: isFree ? 0 : Number(price) || 0,
        StaticPagePath: staticPagePath || undefined,
        EstimatedDuration:
          estimatedDuration === null ? undefined : Number(estimatedDuration),
        Language: language || "vi",
        Requirements: requirements
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        WhatYouWillLearn: whatYouWillLearn
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        IsPublished: Boolean(isPublished),
      };

      const resp = await authenticatedFetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(data?.Message || data?.message || "Cập nhật khóa học thất bại");
        return;
      }

      router.push(`/dashboard/courses/${courseId}`);
    } catch (err) {
      console.error("Update course error", err);
      setError("Có lỗi xảy ra khi cập nhật khóa học");
    } finally {
      setSaving(false);
    }
  };

  if (!courseId) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          Không xác định được khóa học cần chỉnh sửa.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow space-y-4">
        <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
        <div className="h-48 bg-slate-100 rounded animate-pulse"></div>
        <div className="h-96 bg-slate-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/courses/${courseId}`)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại chi tiết
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Chỉnh sửa khóa học
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tiêu đề
          </label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả khóa học
          </label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Nhập mô tả chi tiết về khóa học..."
            className="bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail <span className="text-red-500">*</span>
          </label>

          {!thumbnail ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                uploadingThumbnail
                  ? "border-blue-400 bg-blue-50 cursor-wait"
                  : "border-gray-300 hover:border-gray-400 cursor-pointer"
              }`}
              onClick={() =>
                !uploadingThumbnail && thumbnailInputRef.current?.click()
              }
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
                <p className="mt-4 text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click để upload thumbnail
                  </span>{" "}
                  hoặc kéo thả file vào đây
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Chấp nhận: JPG, PNG, GIF • Tối đa 5MB
                </p>
              </div>

              {uploadingThumbnail && uploadProgress && (
                <div className="mt-4 space-y-2">
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
                <span>Thumbnail hiện tại</span>
              </div>
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                Thay thumbnail khác
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Miễn phí
            </label>
            <select
              className="mt-1 w-full border rounded px-3 py-2"
              value={isFree ? "yes" : "no"}
              onChange={(e) => setIsFree(e.target.value === "yes")}
            >
              <option value="yes">Có</option>
              <option value="no">Không</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Giá</label>
            {isFree ? (
              <div className="mt-1 px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded">
                Khóa học miễn phí sẽ không có giá. Hủy chọn &quot;Miễn phí&quot;
                để nhập giá.
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
                  const digitsOnly = raw.replace(/\D/g, "");
                  const normalized =
                    digitsOnly.replace(/^0+(?=\d)/, "") || "0";
                  setPriceInput(normalized);
                  setPrice(Number(normalized));
                }}
                onBlur={() => {
                  const normalized = priceInput.replace(/^0+(?=\d)/, "") || "0";
                  setPriceInput(normalized);
                  setPrice(Number(normalized));
                }}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cấp độ
            </label>
            <select
              className="mt-1 w-full border rounded px-3 py-2"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
            >
              <option value={0}>Cơ bản</option>
              <option value={1}>Trung bình</option>
              <option value={2}>Nâng cao</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Thể loại
          </label>
          <select
            className="mt-1 w-full border rounded px-3 py-2"
            value={categoryId === "" ? "" : String(categoryId)}
            onChange={(e) =>
              setCategoryId(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          >
            <option value="">Chọn thể loại</option>
            {categoryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Đường dẫn trang tĩnh (StaticPagePath)
          </label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={staticPagePath}
            onChange={(e) => setStaticPagePath(e.target.value)}
            placeholder="/pages/my-course"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ngôn ngữ
            </label>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="vi | en"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Thời lượng ước tính
            </label>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              type="number"
              min={0}
              value={estimatedDuration ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setEstimatedDuration(value === "" ? null : Number(value));
              }}
              placeholder="Tự động tính theo bài học"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Yêu cầu đầu vào (mỗi dòng một mục)
          </label>
          <textarea
            className="mt-1 w-full border rounded px-3 py-2 h-24"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder={"Máy tính cá nhân\nKết nối Internet"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bạn sẽ học được (mỗi dòng một mục)
          </label>
          <textarea
            className="mt-1 w-full border rounded px-3 py-2 h-24"
            value={whatYouWillLearn}
            onChange={(e) => setWhatYouWillLearn(e.target.value)}
            placeholder={"Thành thạo kiến thức A\nHiểu rõ khái niệm B"}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isPublished"
              className="ml-2 block text-sm font-medium text-gray-900"
            >
              Xuất bản khóa học
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-600">
            Nếu được chọn, khóa học sẽ hiển thị cho học viên ngay sau khi lưu.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex space-x-3 pt-2">
          <button
            disabled={saving || uploadingThumbnail || !thumbnail}
            type="submit"
            className={`px-5 py-2 rounded text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed ${
              isPublished
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            title={
              !thumbnail
                ? "Vui lòng upload thumbnail trước"
                : uploadingThumbnail
                ? "Đang upload thumbnail..."
                : ""
            }
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/courses/${courseId}`)}
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

