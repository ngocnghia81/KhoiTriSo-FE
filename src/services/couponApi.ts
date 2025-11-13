import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage, retryRequest, fetchWithAutoRefresh } from '@/utils/apiHelpers';

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountType: number; // 0: Percentage, 1: FixedAmount
  discountTypeName: string;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  applicableItemTypes?: number[]; // 0: Book, 1: Course
  applicableItemIds?: number[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCouponRequest {
  code: string;
  name: string;
  description?: string;
  discountType: number;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  applicableItemTypes?: number[];
  applicableItemIds?: number[];
}

export interface UpdateCouponRequest {
  name?: string;
  description?: string;
  discountType?: number;
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  validFrom?: string;
  validTo?: string;
  usageLimit?: number;
  applicableItemTypes?: number[];
  applicableItemIds?: number[];
  isActive?: boolean;
}

export interface PagedCouponResult {
  items: Coupon[];
  total: number;
  page: number;
  pageSize: number;
}

const mapCoupon = (data: any): Coupon => ({
  id: data.id ?? data.Id,
  code: data.code ?? data.Code,
  name: data.name ?? data.Name,
  description: data.description ?? data.Description,
  discountType: data.discountType ?? data.DiscountType ?? 0,
  discountTypeName: data.discountTypeName ?? data.DiscountTypeName ?? 'Percentage',
  discountValue: data.discountValue ?? data.DiscountValue ?? 0,
  maxDiscountAmount: data.maxDiscountAmount ?? data.MaxDiscountAmount,
  minOrderAmount: data.minOrderAmount ?? data.MinOrderAmount,
  validFrom: data.validFrom ?? data.ValidFrom,
  validTo: data.validTo ?? data.ValidTo,
  usageLimit: data.usageLimit ?? data.UsageLimit,
  usedCount: data.usedCount ?? data.UsedCount ?? 0,
  isActive: data.isActive ?? data.IsActive ?? false,
  applicableItemTypes: data.applicableItemTypes ?? data.ApplicableItemTypes,
  applicableItemIds: data.applicableItemIds ?? data.ApplicableItemIds,
  createdAt: data.createdAt ?? data.CreatedAt,
  updatedAt: data.updatedAt ?? data.UpdatedAt,
});

class CouponApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  private getLanguage(): string {
    if (typeof window === 'undefined') {
      return 'vi';
    }

    try {
      const storedLang = localStorage.getItem('lang');
      if (storedLang === 'en') {
        return 'en';
      }

      if (typeof document !== 'undefined') {
        const cookieLang = document.cookie
          .split('; ')
          .find((row) => row.startsWith('lang='))?.split('=')[1];
        if (cookieLang === 'en') {
          return 'en';
        }
      }
    } catch {
      // ignore storage errors and fall back to default
    }

    return 'vi';
  }

  private getAuthHeaders() {
    const headers: Record<string, string> = {
      'Accept-Language': this.getLanguage(),
    };

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers as HeadersInit;
  }

  async getCoupons(params: {
    page?: number;
    pageSize?: number;
    isActive?: boolean;
    search?: string;
  } = {}): Promise<PagedCouponResult> {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', String(params.page));
    if (params.pageSize) urlParams.append('pageSize', String(params.pageSize));
    if (params.isActive !== undefined) urlParams.append('isActive', String(params.isActive));
    if (params.search) urlParams.append('search', params.search);

    const url = `${this.baseUrl}/api/coupons${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

    const response = await retryRequest(async () => fetchWithAutoRefresh(url, {
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() }
    }));

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    
    const result = extractResult(parsed);
    const items = Array.isArray(result?.Items) ? result.Items : Array.isArray(result?.items) ? result.items : [];
    const total = result?.Total ?? result?.total ?? 0;
    const page = result?.Page ?? result?.page ?? 1;
    const pageSize = result?.PageSize ?? result?.pageSize ?? 20;

    return {
      items: items.map(mapCoupon),
      total,
      page,
      pageSize
    };
  }

  async getCouponById(id: number): Promise<Coupon> {
    const response = await retryRequest(async () => fetchWithAutoRefresh(`${this.baseUrl}/api/coupons/${id}`, {
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() }
    }));

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    
    const result = extractResult(parsed);
    return mapCoupon(result);
  }

  async createCoupon(data: CreateCouponRequest): Promise<Coupon> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/coupons`, {
        method: 'POST',
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    
    const result = extractResult(parsed);
    return mapCoupon(result);
  }

  async updateCoupon(id: number, data: UpdateCouponRequest): Promise<Coupon> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/coupons/${id}`, {
        method: 'PUT',
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    
    const result = extractResult(parsed);
    return mapCoupon(result);
  }

  async deleteCoupon(id: number): Promise<boolean> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' }
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    
    const result = extractResult(parsed);
    return result === true || result === 'true' || (result as any)?.success === true;
  }
}

export const couponApi = new CouponApiService();

