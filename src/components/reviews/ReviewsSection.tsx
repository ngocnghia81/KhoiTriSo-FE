'use client';

import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { ReviewSummary } from './ReviewSummary';
import { ReviewList } from './ReviewList';
import { ReviewForm } from './ReviewForm';
import { Button } from '@/components/ui/button';
import { Review, CreateReviewRequest, UpdateReviewRequest } from '@/services/reviewApi';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReviewsSectionProps {
  itemType: number; // 1: Course, 2: Book, 3: LearningPath
  itemId: number;
  className?: string;
}

export function ReviewsSection({
  itemType,
  itemId,
  className,
}: ReviewsSectionProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    reviews,
    loading,
    error,
    page,
    total,
    totalPages,
    averageRating,
    ratingDistribution,
    ratingFilter,
    sortBy,
    sortOrder,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getUserReview,
    setPage,
    setRatingFilter,
    setSortBy,
    setSortOrder,
  } = useReviews({
    itemType,
    itemId,
    autoLoad: true,
    pageSize: 10,
  });

  const userReview = getUserReview();

  const handleSubmit = async (data: CreateReviewRequest | UpdateReviewRequest) => {
    try {
      setIsSubmitting(true);
      if (editingReview) {
        await updateReview(editingReview.id, data as UpdateReviewRequest);
        setEditingReview(null);
      } else {
        await createReview(data as CreateReviewRequest);
      }
      setShowForm(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể gửi đánh giá';
      alert(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDelete = async (reviewId: number) => {
    try {
      await deleteReview(reviewId);
      if (editingReview?.id === reviewId) {
        setEditingReview(null);
        setShowForm(false);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa đánh giá';
      alert(errorMessage);
    }
  };

  const handleHelpfulChange = async (reviewId: number, helpfulCount: number) => {
    // State is already updated in useReviews hook
  };

  const handleNewReview = () => {
    if (userReview) {
      setEditingReview(userReview);
    } else {
      setEditingReview(null);
    }
    setShowForm(true);
  };

  const summary = {
    averageRating,
    totalReviews: total,
    ratingDistribution,
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Đánh giá</h2>
        
        {/* Summary */}
        {!loading && (
          <ReviewSummary
            summary={summary}
            onRatingFilter={setRatingFilter}
            selectedRating={ratingFilter}
          />
        )}
      </div>

      {/* Write Review Button */}
      {user && !showForm && (
        <div className="mb-6">
          {userReview ? (
            <Button onClick={handleNewReview} variant="outline">
              Chỉnh sửa đánh giá của bạn
            </Button>
          ) : (
            <Button onClick={handleNewReview}>
              Viết đánh giá
            </Button>
          )}
        </div>
      )}

      {/* Review Form */}
      {showForm && user && (
        <div className="mb-6">
          <ReviewForm
            itemType={itemType}
            itemId={itemId}
            existingReview={editingReview}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingReview(null);
            }}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {/* Filters and Sort */}
      {!loading && reviews.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Mới nhất</SelectItem>
                <SelectItem value="rating">Đánh giá cao</SelectItem>
                <SelectItem value="helpfulCount">Hữu ích nhất</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Giảm dần</SelectItem>
                <SelectItem value="asc">Tăng dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đánh giá...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : (
        <>
          <ReviewList
            reviews={reviews}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onHelpfulChange={handleHelpfulChange}
            emptyMessage="Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!"
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-700">
                Trang {page} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Sau
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

