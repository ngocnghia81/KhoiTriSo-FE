'use client';

import { ReviewItem } from './ReviewItem';
import { Review } from '@/services/reviewApi';
import { Button } from '@/components/ui/button';

interface ReviewListProps {
  reviews: Review[];
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  onHelpfulChange?: (reviewId: number, helpfulCount: number) => void;
  emptyMessage?: string;
}

export function ReviewList({
  reviews,
  onEdit,
  onDelete,
  onHelpfulChange,
  emptyMessage = 'Chưa có đánh giá nào',
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          onEdit={onEdit}
          onDelete={onDelete}
          onHelpfulChange={onHelpfulChange}
        />
      ))}
    </div>
  );
}

