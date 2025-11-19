import { authenticatedFetch } from '../utils/authenticatedFetch';
import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage } from '../utils/apiHelpers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// ===== TYPES =====
export interface Review {
  id: number;
  userId: number;
  username?: string;
  fullName?: string;
  avatar?: string;
  itemType: number; // 1: Course, 2: Book, 3: LearningPath
  itemId: number;
  rating: number; // 1-5
  reviewTitle?: string;
  reviewContent?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>; // { 5: 10, 4: 5, ... }
}

export interface ReviewSummaryData {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface PagedReviews {
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

export interface ReviewFilters {
  itemType: number;
  itemId: number;
  rating?: number; // Filter by specific rating (1-5)
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateReviewRequest {
  itemType: number;
  itemId: number;
  rating: number; // 1-5
  reviewTitle?: string;
  reviewContent?: string;
}

export interface UpdateReviewRequest {
  rating: number; // 1-5
  reviewTitle?: string;
  reviewContent?: string;
}

// ===== API SERVICE =====
class ReviewApiService {
  private baseUrl = API_BASE_URL;

  private buildUrl(path: string): string {
    // If running on client, use Next.js API routes for better auth handling
    if (typeof window !== 'undefined') {
      return path;
    }
    return `${this.baseUrl}${path}`;
  }

  private normalizeReview(item: any): Review {
    return {
      id: item.Id || item.id || 0,
      userId: item.UserId || item.userId || 0,
      username: item.Username || item.username,
      fullName: item.FullName || item.fullName,
      avatar: item.Avatar || item.avatar,
      itemType: item.ItemType || item.itemType || 0,
      itemId: item.ItemId || item.itemId || 0,
      rating: item.Rating || item.rating || 0,
      reviewTitle: item.ReviewTitle || item.reviewTitle,
      reviewContent: item.ReviewContent || item.reviewContent,
      isVerifiedPurchase: item.IsVerifiedPurchase || item.isVerifiedPurchase || false,
      helpfulCount: item.HelpfulCount || item.helpfulCount || 0,
      isApproved: item.IsApproved || item.isApproved || true,
      createdAt: item.CreatedAt || item.createdAt || '',
      updatedAt: item.UpdatedAt || item.updatedAt,
    };
  }

  async getReviews(filters: ReviewFilters): Promise<PagedReviews> {
    const params = new URLSearchParams();
    params.append('itemType', filters.itemType.toString());
    params.append('itemId', filters.itemId.toString());
    if (filters.rating) params.append('rating', filters.rating.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = this.buildUrl(`/api/Reviews?${params.toString()}`);
    const response = await authenticatedFetch(url);
    const result = await safeJsonParse(response);

    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch reviews');
    }

    const data = extractResult(result);
    const items = Array.isArray(data.Data) ? data.Data : (data.Items || data.items || []);
    const total = data.Total || data.total || items.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const averageRating = data.AverageRating || data.averageRating || 0;
    const ratingDistribution = data.RatingDistribution || data.ratingDistribution || {};

    return {
      items: items.map((item: any) => this.normalizeReview(item)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      averageRating,
      ratingDistribution,
    };
  }

  async createReview(request: CreateReviewRequest): Promise<Review> {
    const url = this.buildUrl('/api/Reviews');
    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ItemType: request.itemType,
        ItemId: request.itemId,
        Rating: request.rating,
        ReviewTitle: request.reviewTitle,
        ReviewContent: request.reviewContent,
      }),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to create review');
    }

    const data = extractResult(result);
    return this.normalizeReview(data);
  }

  async updateReview(id: number, request: UpdateReviewRequest): Promise<Review> {
    const url = this.buildUrl(`/api/Reviews/${id}`);
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Rating: request.rating,
        ReviewTitle: request.reviewTitle,
        ReviewContent: request.reviewContent,
      }),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to update review');
    }

    const data = extractResult(result);
    return this.normalizeReview(data);
  }

  async deleteReview(id: number): Promise<void> {
    const url = this.buildUrl(`/api/Reviews/${id}`);
    const response = await authenticatedFetch(url, {
      method: 'DELETE',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to delete review');
    }
  }

  async markHelpful(id: number): Promise<{ helpfulCount: number }> {
    const url = this.buildUrl(`/api/Reviews/${id}/helpful`);
    const response = await authenticatedFetch(url, {
      method: 'POST',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to mark review as helpful');
    }

    const data = extractResult(result);
    return {
      helpfulCount: data.HelpfulCount || data.helpfulCount || 0,
    };
  }
}

export const reviewApiService = new ReviewApiService();

