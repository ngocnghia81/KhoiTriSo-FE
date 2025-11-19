'use client';

import { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { Review, CreateReviewRequest, UpdateReviewRequest } from '@/services/reviewApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface ReviewFormProps {
  itemType: number; // 1: Course, 2: Book, 3: LearningPath
  itemId: number;
  existingReview?: Review | null;
  onSubmit: (data: CreateReviewRequest | UpdateReviewRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ReviewForm({
  itemType,
  itemId,
  existingReview,
  onSubmit,
  onCancel,
  isLoading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.reviewTitle || '');
  const [content, setContent] = useState(existingReview?.reviewContent || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setTitle(existingReview.reviewTitle || '');
      setContent(existingReview.reviewContent || '');
    }
  }, [existingReview]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (rating < 1 || rating > 5) {
      newErrors.rating = 'Vui lòng chọn số sao đánh giá';
    }

    if (content.trim().length < 10) {
      newErrors.content = 'Nội dung đánh giá phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (existingReview) {
      await onSubmit({
        rating,
        reviewTitle: title.trim() || undefined,
        reviewContent: content.trim(),
      });
    } else {
      await onSubmit({
        itemType,
        itemId,
        rating,
        reviewTitle: title.trim() || undefined,
        reviewContent: content.trim(),
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {existingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Đánh giá của bạn <span className="text-red-500">*</span>
          </Label>
          <StarRating
            rating={rating}
            interactive={true}
            onRatingChange={setRating}
            size="lg"
          />
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Title (Optional) */}
        <div>
          <Label htmlFor="review-title" className="text-sm font-medium text-gray-700">
            Tiêu đề (tùy chọn)
          </Label>
          <Input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tóm tắt đánh giá của bạn..."
            maxLength={200}
            className="mt-1"
          />
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="review-content" className="text-sm font-medium text-gray-700">
            Nội dung đánh giá <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            rows={5}
            className="mt-1"
            maxLength={2000}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {content.length}/2000 ký tự
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang gửi...' : existingReview ? 'Cập nhật' : 'Gửi đánh giá'}
          </Button>
        </div>
      </form>
    </div>
  );
}

