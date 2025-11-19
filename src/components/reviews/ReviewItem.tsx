'use client';

import { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { Review } from '@/services/reviewApi';
import { HandThumbUpIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { reviewApiService } from '@/services/reviewApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Format time ago helper
const formatTimeAgo = (dateString: string): string => {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
    return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
  } catch {
    return dateString;
  }
};

interface ReviewItemProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  onHelpfulChange?: (reviewId: number, helpfulCount: number) => void;
}

export function ReviewItem({
  review,
  onEdit,
  onDelete,
  onHelpfulChange,
}: ReviewItemProps) {
  const { user } = useAuth();
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [isMarkingHelpful, setIsMarkingHelpful] = useState(false);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

  const isOwner = user?.id && parseInt(user.id) === review.userId;
  const displayName = review.fullName || review.username || 'Người dùng';

  // Load marked helpful status from localStorage
  useEffect(() => {
    if (!user?.id) {
      setHasMarkedHelpful(false);
      return;
    }

    const storageKey = `review_helpful_${user.id}`;
    const markedReviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(markedReviews) && markedReviews.includes(review.id)) {
      setHasMarkedHelpful(true);
    }
  }, [user?.id, review.id]);

  const handleMarkHelpful = async () => {
    if (hasMarkedHelpful || isMarkingHelpful || !user?.id) return;

    try {
      setIsMarkingHelpful(true);
      const result = await reviewApiService.markHelpful(review.id);
      setHelpfulCount(result.helpfulCount);
      setHasMarkedHelpful(true);
      
      // Save to localStorage
      const storageKey = `review_helpful_${user.id}`;
      const markedReviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(markedReviews) && !markedReviews.includes(review.id)) {
        markedReviews.push(review.id);
        localStorage.setItem(storageKey, JSON.stringify(markedReviews));
      }
      
      onHelpfulChange?.(review.id, result.helpfulCount);
    } catch (error) {
      console.error('Failed to mark helpful:', error);
      alert('Không thể đánh dấu hữu ích');
    } finally {
      setIsMarkingHelpful(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      await reviewApiService.deleteReview(review.id);
      onDelete?.(review.id);
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Không thể xóa đánh giá');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={review.avatar} alt={displayName} />
          <AvatarFallback>
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">
                  {displayName}
                </span>
                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    ✓ Đã mua
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(review.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(review)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Xóa"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          {review.reviewTitle && (
            <h4 className="font-semibold text-gray-900 mb-2">
              {review.reviewTitle}
            </h4>
          )}

          {/* Content */}
          {review.reviewContent && (
            <p className="text-gray-700 mb-3 whitespace-pre-wrap">
              {review.reviewContent}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleMarkHelpful}
              disabled={hasMarkedHelpful || isMarkingHelpful}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                hasMarkedHelpful
                  ? 'bg-blue-50 text-blue-600 cursor-default'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600',
                isMarkingHelpful && 'opacity-50 cursor-not-allowed'
              )}
            >
              <HandThumbUpIcon className="h-4 w-4" />
              <span>Hữu ích</span>
              {helpfulCount > 0 && (
                <span className="font-medium">({helpfulCount})</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

