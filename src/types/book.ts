export interface Book {
  id: number;
  title: string;
  description: string;
  coverImage?: string;
  isbn?: string;
  price: number;
  qualityScore?: number;
  approvalStatus: number;
  isActive: boolean;
  authorId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    fullName: string;
    email: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

export interface BookListDto extends Book {
  totalReviews: number;
  rating: number;
}

export interface BookDetailDto extends Book {
  isOwned: boolean;
  totalReviews: number;
  rating: number;
  bookChapters?: BookChapter[];
}

export interface BookChapter {
  id: number;
  bookId: number;
  title: string;
  content: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookChapterDto extends BookChapter {
  questionCount: number;
}

export interface BookQuestion {
  id: number;
  contextType: string;
  contextId: number;
  questionText: string;
  questionType: number;
  difficultyLevel: number;
  explanation?: string;
  explanationContent?: string;
  defaultPoints?: number;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  chapterId?: number;
  questionOptions: QuestionOption[];
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface BookQuestionDto extends BookQuestion {
  // Additional fields if needed
}

export interface ActivationCode {
  id: number;
  bookId: number;
  activationCode: string;
  isUsed: boolean;
  usedById?: number;
  usedBy?: {
    id: number;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ActivationCodeDto extends ActivationCode {
  // Additional fields if needed
}

export interface UserBook {
  id: number;
  activationCodeId: number;
  userId: number;
  isActive: boolean;
  activatedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserBookDto extends UserBook {
  bookId: number;
  book: BookInfoDto;
}

export interface BookInfoDto {
  id: number;
  title: string;
  description: string;
  coverImage?: string;
  author?: {
    id: number;
    fullName: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

export interface MyBooksResponseDto extends UserBookDto {
  // Additional fields if needed
}

export interface BookActivationRequestDto {
  activationCode: string;
}

export interface BookActivationResponseDto {
  userBook: UserBookDto;
  accessUrl: string;
}

export interface ActivateCodeResponseDto {
  success: boolean;
  message: string;
  userBookId?: number;
  expiresAt?: string;
}

export interface ValidateCodeResponseDto {
  isValid: boolean;
  isUsed: boolean;
  bookTitle?: string;
  usedByFullName?: string;
  expiresAt?: string;
}

export interface GenerateActivationCodeRequest {
  quantity: number;
}

export interface CreateBookRequest {
  title: string;
  description: string;
  coverImage?: string;
  isbn?: string;
  price: number;
  categoryId: number;
}

export interface UpdateBookRequest {
  title?: string;
  description?: string;
  coverImage?: string;
  isbn?: string;
  price?: number;
  categoryId?: number;
}

export interface CreateBookChapterRequest {
  title: string;
  content: string;
  orderIndex: number;
}

export interface UpdateBookChapterRequest {
  title?: string;
  content?: string;
  orderIndex?: number;
}

export interface CreateBookQuestionRequest {
  QuestionContent: string;
  QuestionType: number;
  DifficultyLevel: number;
  DefaultPoints: number;
  ExplanationContent: string;
  QuestionImage: string;
  VideoUrl: string;
  TimeLimit: number;
  SubjectType: string;
  OrderIndex: number;
  ChapterId: number;
  Options: CreateQuestionOptionRequest[];
}

export interface UpdateBookQuestionRequest {
  QuestionContent: string;
  QuestionType: number;
  DifficultyLevel: number;
  DefaultPoints: number;
  ExplanationContent: string;
  QuestionImage: string;
  VideoUrl: string;
  TimeLimit: number;
  SubjectType: string;
  OrderIndex: number;
  ChapterId: number;
  Options: UpdateQuestionOptionRequest[];
}

export interface UpdateQuestionOptionRequest {
  OptionText: string;
  IsCorrect: boolean;
  PointsValue: number;
  OrderIndex: number;
}

export interface CreateQuestionOptionRequest {
  OptionText: string;
  IsCorrect: boolean;
  PointsValue: number;
  OrderIndex: number;
}

export interface BookFilters {
  search?: string;
  categoryId?: number;
  approvalStatus?: number;
  authorId?: number;
  sortBy?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BookChaptersResponseDto {
  chapters: BookChapterDto[];
}
