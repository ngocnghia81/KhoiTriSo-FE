export interface CartItem {
  Id: number;  // Backend uses PascalCase
  ItemId: number;
  ItemType: number;
  AddedAt: string;
  CoverImage?: string;  // Backend returns this directly on CartItemDTO
  Title?: string;       // Backend returns this directly on CartItemDTO
  Price?: number;       // Backend returns this directly on CartItemDTO
  Item?: {
    Id: number;
    Title: string;
    Description?: string;
    Thumbnail?: string;
    Price: number;
    IsFree: boolean;
    StaticPagePath?: string;
    InstructorId?: number;
    CategoryId?: number;
    Level?: number;
    TotalLessons?: number;
    TotalStudents?: number;
    Rating?: number;
    TotalReviews?: number;
    IsPublished?: boolean;
    IsActive?: boolean;
    ApprovalStatus?: number;
    EstimatedDuration?: number;
    Language?: string;
    Requirements?: string[];
    WhatYouWillLearn?: string[];
    QualityScore?: number;
    Category?: any;
    CourseEnrollments?: any[];
    Instructor?: any;
    LearningPathCourses?: any[];
    Lessons?: any[];
    LiveClasses?: any[];
    CreatedBy?: string;
    CreatedAt?: string;
    UpdatedBy?: string;
    UpdatedAt?: string;
  };
}

export interface AddToCartRequest {
  ItemId: number;  // Backend expects ItemId instead of bookId
  ItemType: number; // Backend expects ItemType (0 = Book, 1 = Course)
}

export interface CartResponse {
  CartItems: CartItem[];  // Backend uses PascalCase
  TotalItems: number;     // Backend uses PascalCase
  TotalAmount: number;    // Backend uses PascalCase
}

export interface CartApiResponse {
  success: boolean;
  message: string;
  messageCode: string;
  result: CartResponse | null;
}