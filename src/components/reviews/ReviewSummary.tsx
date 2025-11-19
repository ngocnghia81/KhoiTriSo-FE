'use client';

import { StarRating } from './StarRating';
import { ReviewSummaryData } from '@/services/reviewApi';
import { cn } from '@/lib/utils';

interface ReviewSummaryProps {
  summary: ReviewSummaryData;
  onRatingFilter?: (rating: number | null) => void;
  selectedRating?: number | null;
}

export function ReviewSummary({
  summary,
  onRatingFilter,
  selectedRating,
}: ReviewSummaryProps) {
  const { averageRating, totalReviews, ratingDistribution } = summary;

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center md:border-r md:pr-6">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="lg" showValue={false} />
          <div className="text-sm text-gray-600 mt-2">
            {totalReviews} {totalReviews === 1 ? 'đánh giá' : 'đánh giá'}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Phân bổ đánh giá
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = getPercentage(count);
              const isSelected = selectedRating === rating;

              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => onRatingFilter?.(isSelected ? null : rating)}
                  className={cn(
                    'flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2 rounded-md transition-colors',
                    isSelected && 'bg-blue-50 border border-blue-200'
                  )}
                >
                  <div className="flex items-center gap-1 min-w-[60px]">
                    <span className="text-sm font-medium text-gray-700">
                      {rating}
                    </span>
                    <StarRating rating={1} maxRating={1} size="sm" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 min-w-[60px] text-right">
                    {count} ({percentage}%)
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

