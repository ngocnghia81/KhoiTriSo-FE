import {
  safeJsonParse,
  isSuccessfulResponse,
  extractResult,
  extractMessage,
  retryRequest,
  fetchWithAutoRefresh,
} from '@/utils/apiHelpers';

export interface Order {
  id: number;
  userId: number;
  orderCode: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  status: number;
  statusName: string;
  paymentMethod: string;
  paymentGateway: string;
  transactionId?: string;
  currency?: string;
  exchangeRate?: number;
  paidAt?: string;
  orderNotes?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: number;
  itemType: number;
  itemTypeName: string;
  itemId: number;
  itemName: string;
  price: number;
  quantity: number;
  subTotal: number;
}

export interface OrderPagedResponse {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  statusCounts: StatusCount[];
  monthlyRevenues: MonthlyRevenue[];
}

export interface StatusCount {
  status: number;
  statusName: string;
  count: number;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
}

export interface RevenueAnalyticsResponse {
  overview: {
    totalRevenue: number;
    todayRevenue: number;
    thisMonthRevenue: number;
    thisYearRevenue: number;
    averageDailyRevenue: number;
    totalOrders: number;
    todayOrders: number;
    thisMonthOrders: number;
    averageOrderValue: number;
  };
  revenueByItemType: Array<{
    itemType: number;
    itemTypeName: string;
    revenue: number;
    orderCount: number;
    itemCount: number;
  }>;
  revenueByInstructor: Array<{
    instructorId: number;
    instructorName: string;
    avatar?: string;
    revenue: number;
    orderCount: number;
    courseCount: number;
    bookCount: number;
  }>;
  dailyRevenues: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
  topSellingItems: Array<{
    itemId: number;
    itemName: string;
    itemType: number;
    itemTypeName: string;
    revenue: number;
    orderCount: number;
    quantitySold: number;
  }>;
}

class OrderApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return {} as HeadersInit;
    return { 'Authorization': `Bearer ${token}` } as HeadersInit;
  }

  async getOrders(params: {
    status?: number;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<OrderPagedResponse> {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) urlParams.append(k, String(v));
    });
    const url = `${this.baseUrl}/api/orders${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    const result = extractResult(parsed) || {};

    const items = (result.Items || result.items || []).map(this.mapOrder);
    const total = result.Total || result.total || 0;
    const page = result.Page || result.page || params.page || 1;
    const pageSize = result.PageSize || result.pageSize || params.pageSize || 20;

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getOrderById(id: number): Promise<Order> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/orders/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    const result = extractResult(parsed);
    return this.mapOrder(result);
  }

  async getOrderAnalytics(): Promise<OrderAnalytics> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/orders/analytics`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    const result = extractResult(parsed);

    return {
      totalOrders: result.TotalOrders || result.totalOrders || 0,
      totalRevenue: result.TotalRevenue || result.totalRevenue || 0,
      pendingOrders: result.PendingOrders || result.pendingOrders || 0,
      completedOrders: result.CompletedOrders || result.completedOrders || 0,
      cancelledOrders: result.CancelledOrders || result.cancelledOrders || 0,
      averageOrderValue: result.AverageOrderValue || result.averageOrderValue || 0,
      statusCounts: (result.StatusCounts || result.statusCounts || []).map((s: any) => ({
        status: s.Status || s.status,
        statusName: s.StatusName || s.statusName,
        count: s.Count || s.count,
      })),
      monthlyRevenues: (result.MonthlyRevenues || result.monthlyRevenues || []).map((r: any) => ({
        year: r.Year || r.year,
        month: r.Month || r.month,
        revenue: r.Revenue || r.revenue,
      })),
    };
  }

  async updateOrderStatus(id: number, status: number): Promise<Order> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    const result = extractResult(parsed);
    return this.mapOrder(result);
  }

  async cancelOrder(id: number): Promise<boolean> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/orders/${id}/cancel`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    return extractResult(parsed) === true;
  }

  async getRevenueAnalytics(days: number = 30): Promise<RevenueAnalyticsResponse> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/orders/revenue/analytics?days=${days}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    const result = extractResult(parsed);
    return {
      overview: {
        totalRevenue: result.Overview?.TotalRevenue || result.overview?.totalRevenue || 0,
        todayRevenue: result.Overview?.TodayRevenue || result.overview?.todayRevenue || 0,
        thisMonthRevenue: result.Overview?.ThisMonthRevenue || result.overview?.thisMonthRevenue || 0,
        thisYearRevenue: result.Overview?.ThisYearRevenue || result.overview?.thisYearRevenue || 0,
        averageDailyRevenue: result.Overview?.AverageDailyRevenue || result.overview?.averageDailyRevenue || 0,
        totalOrders: result.Overview?.TotalOrders || result.overview?.totalOrders || 0,
        todayOrders: result.Overview?.TodayOrders || result.overview?.todayOrders || 0,
        thisMonthOrders: result.Overview?.ThisMonthOrders || result.overview?.thisMonthOrders || 0,
        averageOrderValue: result.Overview?.AverageOrderValue || result.overview?.averageOrderValue || 0,
      },
      revenueByItemType: (result.RevenueByItemType || result.revenueByItemType || []).map((r: any) => ({
        itemType: r.ItemType || r.itemType,
        itemTypeName: r.ItemTypeName || r.itemTypeName,
        revenue: r.Revenue || r.revenue || 0,
        orderCount: r.OrderCount || r.orderCount || 0,
        itemCount: r.ItemCount || r.itemCount || 0,
      })),
      revenueByInstructor: (result.RevenueByInstructor || result.revenueByInstructor || []).map((r: any) => ({
        instructorId: r.InstructorId || r.instructorId,
        instructorName: r.InstructorName || r.instructorName,
        avatar: r.Avatar || r.avatar,
        revenue: r.Revenue || r.revenue || 0,
        orderCount: r.OrderCount || r.orderCount || 0,
        courseCount: r.CourseCount || r.courseCount || 0,
        bookCount: r.BookCount || r.bookCount || 0,
      })),
      dailyRevenues: (result.DailyRevenues || result.dailyRevenues || []).map((r: any) => ({
        date: r.Date || r.date,
        revenue: r.Revenue || r.revenue || 0,
        orderCount: r.OrderCount || r.orderCount || 0,
      })),
      topSellingItems: (result.TopSellingItems || result.topSellingItems || []).map((r: any) => ({
        itemId: r.ItemId || r.itemId,
        itemName: r.ItemName || r.itemName,
        itemType: r.ItemType || r.itemType,
        itemTypeName: r.ItemTypeName || r.itemTypeName,
        revenue: r.Revenue || r.revenue || 0,
        orderCount: r.OrderCount || r.orderCount || 0,
        quantitySold: r.QuantitySold || r.quantitySold || 0,
      })),
    };
  }

  private mapOrder(order: any): Order {
    // Handle both PascalCase and camelCase, and also handle 'items' (lowercase) from API
    const orderItems = order.OrderItems || order.orderItems || order.items || order.Items || [];
    
    return {
      id: order.Id || order.id,
      userId: order.UserId || order.userId,
      orderCode: order.OrderCode || order.orderCode,
      totalAmount: order.TotalAmount || order.totalAmount || 0,
      discountAmount: order.DiscountAmount || order.discountAmount || 0,
      taxAmount: order.TaxAmount || order.taxAmount || 0,
      finalAmount: order.FinalAmount || order.finalAmount || 0,
      status: order.Status || order.status || 0,
      statusName: order.StatusName || order.statusName || '',
      paymentMethod: order.PaymentMethod || order.paymentMethod || '',
      paymentGateway: order.PaymentGateway || order.paymentGateway || '',
      transactionId: order.TransactionId || order.transactionId,
      currency: order.Currency || order.currency,
      exchangeRate: order.ExchangeRate || order.exchangeRate,
      paidAt: order.PaidAt || order.paidAt,
      orderNotes: order.OrderNotes || order.orderNotes,
      createdAt: order.CreatedAt || order.createdAt,
      updatedAt: order.UpdatedAt || order.updatedAt,
      user: order.User
        ? {
            id: order.User.Id || order.User.id,
            username: order.User.Username || order.User.username,
            fullName: order.User.FullName || order.User.fullName,
            email: order.User.Email || order.User.email,
            avatar: order.User.Avatar || order.User.avatar,
          }
        : undefined,
      orderItems: Array.isArray(orderItems) ? orderItems.map((item: any) => ({
        id: item.Id || item.id,
        itemType: item.ItemType || item.itemType,
        itemTypeName: item.ItemTypeName || item.itemTypeName,
        itemId: item.ItemId || item.itemId,
        itemName: item.ItemName || item.itemName,
        price: item.Price || item.price || 0,
        quantity: item.Quantity || item.quantity || 0,
        subTotal: item.SubTotal || item.subTotal || 0,
      })) : [],
    };
  }
}

export const orderApi = new OrderApiService();

