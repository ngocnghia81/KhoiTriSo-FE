import { useState, useEffect, useCallback } from 'react';
import { reviewApiService, Review, ReviewFilters, CreateReviewRequest, UpdateReviewRequest, PagedReviews } from '@/services/reviewApi';
import { useAuth } from '@/contexts/AuthContext';

interface UseReviewsOptions {
  itemType: number;
  itemId: number;
  autoLoad?: boolean;
  pageSize?: number;
}

export function useReviews({
  itemType,
  itemId,
  autoLoad = true,
  pageSize = 20,
}: UseReviewsOptions) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'createdAt' | 'rating' | 'helpfulCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadReviews = useCallback(async (pageNum: number = page) => {
    try {
      setLoading(true);
      setError(null);

      const filters: ReviewFilters = {
        itemType,
        itemId,
        page: pageNum,
        pageSize,
        sortBy,
        sortOrder,
      };

      if (ratingFilter) {
        filters.rating = ratingFilter;
      }

      const result = await reviewApiService.getReviews(filters);
      
      setReviews(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setAverageRating(result.averageRating);
      setRatingDistribution(result.ratingDistribution);
      setPage(result.page);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải đánh giá';
      setError(errorMessage);
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [itemType, itemId, pageSize, sortBy, sortOrder, ratingFilter, page]);

  useEffect(() => {
    if (autoLoad) {
      loadReviews(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, itemType, itemId, ratingFilter, sortBy, sortOrder]);

  const createReview = useCallback(async (request: CreateReviewRequest): Promise<Review> => {
    try {
      const review = await reviewApiService.createReview(request);
      await loadReviews(1); // Reload first page
      return review;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo đánh giá';
      throw new Error(errorMessage);
    }
  }, [loadReviews]);

  const updateReview = useCallback(async (id: number, request: UpdateReviewRequest): Promise<Review> => {
    try {
      const review = await reviewApiService.updateReview(id, request);
      await loadReviews(page); // Reload current page
      return review;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật đánh giá';
      throw new Error(errorMessage);
    }
  }, [loadReviews, page]);

  const deleteReview = useCallback(async (id: number): Promise<void> => {
    try {
      await reviewApiService.deleteReview(id);
      await loadReviews(page); // Reload current page
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa đánh giá';
      throw new Error(errorMessage);
    }
  }, [loadReviews, page]);

  const markHelpful = useCallback(async (id: number): Promise<number> => {
    try {
      const result = await reviewApiService.markHelpful(id);
      // Update local state
      setReviews(prev => prev.map(r => 
        r.id === id ? { ...r, helpfulCount: result.helpfulCount } : r
      ));
      return result.helpfulCount;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể đánh dấu hữu ích';
      throw new Error(errorMessage);
    }
  }, []);

  const getUserReview = useCallback((): Review | null => {
    if (!user?.id) return null;
    const userId = parseInt(user.id);
    return reviews.find(r => r.userId === userId) || null;
  }, [reviews, user?.id]);

  return {
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
    loadReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getUserReview,
    setPage,
    setRatingFilter,
    setSortBy,
    setSortOrder,
  };
}

