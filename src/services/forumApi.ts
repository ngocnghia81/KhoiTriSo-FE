import { authenticatedFetch } from '../utils/authenticatedFetch';
import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage } from '../utils/apiHelpers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// ===== TYPES =====
export interface ForumQuestion {
  id: string;
  title: string;
  content: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  isSolved: boolean;
  isPinned: boolean;
  isClosed: boolean;
  viewCount: number;
  voteCount: number;
  answerCount: number;
  acceptedAnswerId?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  attachments?: ForumAttachment[];
}

export interface ForumAnswer {
  id: string;
  questionId: string;
  content: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  isAccepted: boolean;
  voteCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  attachments?: ForumAttachment[];
}

export interface ForumComment {
  id: string;
  parentId: string;
  parentType: number; // 1 = Question, 2 = Answer
  content: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ForumTag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

export interface ForumAttachment {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType?: string;
}

export interface ForumVote {
  targetId: string;
  targetType: number; // 1 = Question, 2 = Answer, 3 = Comment
  userId: number;
  voteType: number; // -1 = downvote, 1 = upvote
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ForumQuestionFilters {
  search?: string;
  categoryId?: string;
  tag?: string;
  isSolved?: boolean;
  isPinned?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string; // 'newest', 'oldest', 'votes', 'activity', 'unanswered'
  desc?: boolean;
}

// ===== API SERVICE =====
class ForumApiService {
  private baseUrl = API_BASE_URL;

  // Normalize response data
  private normalizeQuestion(item: any): ForumQuestion {
    return {
      id: item.Id || item.id || '',
      title: item.Title || item.title || '',
      content: item.Content || item.content || '',
      userId: item.UserId || item.userId || 0,
      userName: item.UserName || item.userName || '',
      userAvatar: item.UserAvatar || item.userAvatar,
      categoryId: item.CategoryId || item.categoryId,
      categoryName: item.CategoryName || item.categoryName,
      tags: item.Tags || item.tags || [],
      isSolved: item.IsSolved || item.isSolved || false,
      isPinned: item.IsPinned || item.isPinned || false,
      isClosed: item.IsClosed || item.isClosed || false,
      viewCount: item.ViewCount || item.viewCount || 0,
      voteCount: item.VoteCount || item.voteCount || 0,
      answerCount: item.AnswerCount || item.answerCount || 0,
      acceptedAnswerId: item.AcceptedAnswerId || item.acceptedAnswerId,
      createdAt: item.CreatedAt || item.createdAt || '',
      updatedAt: item.UpdatedAt || item.updatedAt || '',
      lastActivityAt: item.LastActivityAt || item.lastActivityAt,
      attachments: item.Attachments || item.attachments || [],
    };
  }

  private normalizeAnswer(item: any): ForumAnswer {
    return {
      id: item.Id || item.id || '',
      questionId: item.QuestionId || item.questionId || '',
      content: item.Content || item.content || '',
      userId: item.UserId || item.userId || 0,
      userName: item.UserName || item.userName || '',
      userAvatar: item.UserAvatar || item.userAvatar,
      isAccepted: item.IsAccepted || item.isAccepted || false,
      voteCount: item.VoteCount || item.voteCount || 0,
      commentCount: item.CommentCount || item.commentCount || 0,
      createdAt: item.CreatedAt || item.createdAt || '',
      updatedAt: item.UpdatedAt || item.updatedAt || '',
      attachments: item.Attachments || item.attachments || [],
    };
  }

  // Questions
  async getQuestions(filters?: ForumQuestionFilters): Promise<PagedResult<ForumQuestion>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.tag) params.append('tag', filters.tag);
    if (filters?.isSolved !== undefined) params.append('isSolved', filters.isSolved.toString());
    if (filters?.isPinned !== undefined) params.append('isPinned', filters.isPinned.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.desc !== undefined) params.append('desc', filters.desc.toString());

    const url = `${this.baseUrl}/api/forum/questions?${params.toString()}`;
    const response = await authenticatedFetch(url);
    const result = await safeJsonParse(response);

    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch questions');
    }

    const data = extractResult(result);
    const items = Array.isArray(data) ? data : (data?.Items || data?.items || []);
    const total = data?.Total || data?.total || items.length;
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;

    return {
      items: items.map((item: any) => this.normalizeQuestion(item)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getQuestionById(id: string): Promise<ForumQuestion> {
    const url = `${this.baseUrl}/api/forum/questions/${id}`;
    const response = await authenticatedFetch(url);
    const result = await safeJsonParse(response);

    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch question');
    }

    const data = extractResult(result);
    return this.normalizeQuestion(data);
  }

  async createQuestion(request: {
    title: string;
    content: string;
    userId: number;
    userName: string;
    userAvatar?: string;
    tags?: string[];
    categoryId?: string;
    categoryName?: string;
  }): Promise<ForumQuestion> {
    const url = `${this.baseUrl}/api/forum/questions`;
    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Title: request.title,
        Content: request.content,
        UserId: request.userId,
        UserName: request.userName,
        UserAvatar: request.userAvatar,
        Tags: request.tags,
        CategoryId: request.categoryId,
        CategoryName: request.categoryName,
      }),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to create question');
    }

    const data = extractResult(result);
    return this.normalizeQuestion(data);
  }

  async updateQuestion(id: string, request: {
    title?: string;
    content?: string;
    tags?: string[];
    categoryId?: string;
    categoryName?: string;
    isPinned?: boolean;
    isClosed?: boolean;
  }): Promise<ForumQuestion> {
    const url = `${this.baseUrl}/api/forum/questions/${id}`;
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Title: request.title,
        Content: request.content,
        Tags: request.tags,
        CategoryId: request.categoryId,
        CategoryName: request.categoryName,
        IsPinned: request.isPinned,
        IsClosed: request.isClosed,
      }),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to update question');
    }

    const data = extractResult(result);
    return this.normalizeQuestion(data);
  }

  async deleteQuestion(id: string): Promise<void> {
    const url = `${this.baseUrl}/api/forum/questions/${id}`;
    const response = await authenticatedFetch(url, {
      method: 'DELETE',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to delete question');
    }
  }

  // Answers
  async getAnswers(questionId: string): Promise<ForumAnswer[]> {
    const url = `${this.baseUrl}/api/forum/questions/${questionId}/answers`;
    const response = await authenticatedFetch(url);
    const result = await safeJsonParse(response);

    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch answers');
    }

    const data = extractResult(result);
    const items = Array.isArray(data) ? data : (data?.Items || data?.items || []);
    return items.map((item: any) => this.normalizeAnswer(item));
  }

  async createAnswer(questionId: string, request: {
    content: string;
    userId: number;
    userName: string;
    userAvatar?: string;
  }): Promise<ForumAnswer> {
    const url = `${this.baseUrl}/api/forum/questions/${questionId}/answers`;
    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Content: request.content,
        UserId: request.userId,
        UserName: request.userName,
        UserAvatar: request.userAvatar,
      }),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to create answer');
    }

    const data = extractResult(result);
    return this.normalizeAnswer(data);
  }

  async updateAnswer(id: string, request: { content: string }): Promise<ForumAnswer> {
    const url = `${this.baseUrl}/api/forum/answers/${id}`;
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Content: request.content,
      }),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to update answer');
    }

    const data = extractResult(result);
    return this.normalizeAnswer(data);
  }

  async deleteAnswer(id: string): Promise<void> {
    const url = `${this.baseUrl}/api/forum/answers/${id}`;
    const response = await authenticatedFetch(url, {
      method: 'DELETE',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to delete answer');
    }
  }

  async acceptAnswer(id: string): Promise<void> {
    const url = `${this.baseUrl}/api/forum/answers/${id}/accept`;
    const response = await authenticatedFetch(url, {
      method: 'POST',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to accept answer');
    }
  }

  // Comments
  async getComments(parentType: number, parentId: string): Promise<ForumComment[]> {
    const url = `${this.baseUrl}/api/forum/${parentType}/${parentId}/comments`;
    const response = await authenticatedFetch(url);
    const result = await safeJsonParse(response);

    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch comments');
    }

    const data = extractResult(result);
    const items = Array.isArray(data) ? data : (data?.Items || data?.items || []);
    return items.map((item: any) => ({
      id: item.Id || item.id || '',
      parentId: item.ParentId || item.parentId || '',
      parentType: item.ParentType || item.parentType || 0,
      content: item.Content || item.content || '',
      userId: item.UserId || item.userId || 0,
      userName: item.UserName || item.userName || '',
      userAvatar: item.UserAvatar || item.userAvatar,
      createdAt: item.CreatedAt || item.createdAt || '',
      updatedAt: item.UpdatedAt || item.updatedAt || '',
    }));
  }

  async createComment(request: {
    parentId: string;
    parentType: number;
    content: string;
    userId: number;
    userName: string;
    userAvatar?: string;
  }): Promise<ForumComment> {
    const url = `${this.baseUrl}/api/forum/comments`;
    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ParentId: request.parentId,
        ParentType: request.parentType,
        Content: request.content,
        UserId: request.userId,
        UserName: request.userName,
        UserAvatar: request.userAvatar,
      }),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to create comment');
    }

    const data = extractResult(result);
    return {
      id: data.Id || data.id || '',
      parentId: data.ParentId || data.parentId || '',
      parentType: data.ParentType || data.parentType || 0,
      content: data.Content || data.content || '',
      userId: data.UserId || data.userId || 0,
      userName: data.UserName || data.userName || '',
      userAvatar: data.UserAvatar || data.userAvatar,
      createdAt: data.CreatedAt || data.createdAt || '',
      updatedAt: data.UpdatedAt || data.updatedAt || '',
    };
  }

  // Votes
  async vote(request: {
    targetId: string;
    targetType: number;
    userId: number;
    voteType: number;
  }): Promise<void> {
    const url = `${this.baseUrl}/api/forum/votes`;
    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        TargetId: request.targetId,
        TargetType: request.targetType,
        UserId: request.userId,
        VoteType: request.voteType,
      }),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to vote');
    }
  }

  async getVotes(targetType: number, targetId: string): Promise<{ total: number }> {
    const url = `${this.baseUrl}/api/forum/${targetType}/${targetId}/votes`;
    const response = await authenticatedFetch(url);
    const result = await safeJsonParse(response);

    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch votes');
    }

    const data = extractResult(result);
    return {
      total: data?.Total || data?.total || 0,
    };
  }

  // Bookmarks
  async addBookmark(questionId: string, userId: number): Promise<void> {
    const url = `${this.baseUrl}/api/forum/bookmarks`;
    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        QuestionId: questionId,
        UserId: userId,
      }),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to add bookmark');
    }
  }

  async removeBookmark(questionId: string, userId: number): Promise<void> {
    const url = `${this.baseUrl}/api/forum/bookmarks/${questionId}?userId=${userId}`;
    const response = await authenticatedFetch(url, {
      method: 'DELETE',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to remove bookmark');
    }
  }

  async isBookmarked(questionId: string, userId: number): Promise<boolean> {
    const url = `${this.baseUrl}/api/forum/questions/${questionId}/bookmarked?userId=${userId}`;
    const response = await authenticatedFetch(url);
    const result = await safeJsonParse(response);

    if (!isSuccessfulResponse(result)) {
      return false;
    }

    const data = extractResult(result);
    return data?.IsBookmarked || data?.isBookmarked || false;
  }

  // Categories
  async getCategories(): Promise<ForumCategory[]> {
    const url = `${this.baseUrl}/api/forum/categories`;
    const response = await authenticatedFetch(url);
    const result = await safeJsonParse(response);

    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch categories');
    }

    const data = extractResult(result);
    const items = Array.isArray(data) ? data : (data?.Items || data?.items || []);
    return items.map((item: any) => ({
      id: item.Id || item.id || '',
      name: item.Name || item.name || '',
      description: item.Description || item.description,
      color: item.Color || item.color,
      icon: item.Icon || item.icon,
      isActive: item.IsActive !== undefined ? item.IsActive : item.isActive !== undefined ? item.isActive : true,
      sortOrder: item.SortOrder || item.sortOrder || 0,
    }));
  }

  // Tags
  async getTags(limit: number = 20): Promise<ForumTag[]> {
    const url = `${this.baseUrl}/api/forum/tags?limit=${limit}`;
    const response = await authenticatedFetch(url);
    const result = await safeJsonParse(response);

    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch tags');
    }

    const data = extractResult(result);
    const items = Array.isArray(data) ? data : (data?.Items || data?.items || []);
    return items.map((item: any) => ({
      id: item.Id || item.id || '',
      name: item.Name || item.name || '',
      description: item.Description || item.description,
      color: item.Color || item.color,
      isActive: item.IsActive !== undefined ? item.IsActive : item.isActive !== undefined ? item.isActive : true,
    }));
  }

  // Analytics
  async getAnalytics(userId?: number): Promise<any> {
    const params = new URLSearchParams();
    if (userId) {
      params.append('userId', userId.toString());
    }

    const url = `${this.baseUrl}/api/forum/analytics${params.toString() ? '?' + params.toString() : ''}`;
    const response = await authenticatedFetch(url);
    const result = await safeJsonParse(response);

    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch analytics');
    }

    return extractResult(result);
  }
}

export const forumApiService = new ForumApiService();

