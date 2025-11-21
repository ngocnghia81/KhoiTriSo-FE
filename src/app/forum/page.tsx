import ForumListClient from './ForumListClient';

interface ForumQuestion {
  id: string;
  title: string;
  content: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  views: number;
  voteCount: number;
  answerCount: number;
  isSolved: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt?: string;
  lastActivityAt?: string;
  acceptedAnswerId?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  questionCount?: number;
}

interface Tag {
  id: string;
  name: string;
  description?: string;
  questionCount?: number;
}

interface ForumStats {
  totalQuestions: number;
  totalAnswers: number;
  totalUsers: number;
  solvedQuestions: number;
}

interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Revalidate mỗi giờ hoặc on-demand (khi BE gọi revalidate API)
export const revalidate = 3600; // 1 giờ

// Fetch initial forum data ở server với ISR
async function fetchInitialForumData(): Promise<{
  questions: ForumQuestion[];
  categories: Category[];
  tags: Tag[];
  stats: ForumStats | null;
  pagination: PaginationInfo;
} | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // Fetch questions với default filters: page=1, pageSize=20, sortBy=createdAt, desc=true
    const questionsParams = new URLSearchParams({
      page: '1',
      pageSize: '20',
      sortBy: 'createdAt',
      desc: 'true',
    });
    
    const [questionsRes, categoriesRes, tagsRes, statsRes] = await Promise.all([
      fetch(`${baseUrl}/forum/questions?${questionsParams.toString()}`, {
        next: { 
          revalidate: 3600, // Cache 1 giờ
          tags: ['forum-list'] // Tag để on-demand revalidation
        },
        headers: {
          'Accept-Language': 'vi',
        }
      }),
      fetch(`${baseUrl}/forum/categories`, {
        next: { revalidate: 3600 },
        headers: {
          'Accept-Language': 'vi',
        }
      }),
      fetch(`${baseUrl}/forum/tags?limit=30`, {
        next: { revalidate: 3600 },
        headers: {
          'Accept-Language': 'vi',
        }
      }),
      fetch(`${baseUrl}/forum/stats`, {
        next: { revalidate: 3600 },
        headers: {
          'Accept-Language': 'vi',
        }
      }),
    ]);
    
    // Parse questions
    let questions: ForumQuestion[] = [];
    let pagination: PaginationInfo = { total: 0, totalPages: 1, currentPage: 1, pageSize: 20 };
    
    if (questionsRes.ok) {
      const questionsData = await questionsRes.json();
      const result = questionsData?.Result || questionsData;

      if (result?.Items) {
        questions = result.Items.map((q: any) => ({
          id: q.Id || q.id,
          title: q.Title || q.title,
          content: q.Content || q.content,
          userId: q.UserId || q.userId,
          userName: q.UserName || q.userName,
          userAvatar: q.UserAvatar || q.userAvatar,
          categoryId: q.CategoryId || q.categoryId,
          categoryName: q.CategoryName || q.categoryName,
          tags: q.Tags || q.tags || [],
          views: q.Views || q.views || 0,
          voteCount: q.Votes || q.votes || q.VoteCount || q.voteCount || 0,
          answerCount: q.AnswersCount || q.answersCount || q.AnswerCount || q.answerCount || 0,
          isSolved: q.IsSolved || q.isSolved || false,
          isPinned: q.IsPinned || q.isPinned || false,
          createdAt: q.CreatedAt || q.createdAt,
          updatedAt: q.UpdatedAt || q.updatedAt,
          lastActivityAt: q.LastActivityAt || q.lastActivityAt,
          acceptedAnswerId: q.AcceptedAnswerId || q.acceptedAnswerId,
        }));
        
        pagination = {
          total: result.Total || result.total || 0,
          totalPages: result.TotalPages || result.totalPages || 1,
          currentPage: result.Page || result.page || 1,
          pageSize: result.PageSize || result.pageSize || 20,
        };
      }
    }
    
    // Parse categories
    let categories: Category[] = [];
    if (categoriesRes.ok) {
      const categoriesData = await categoriesRes.json();
      const result = categoriesData?.Result || categoriesData;
      if (Array.isArray(result)) {
        categories = result.map((c: any) => ({
          id: c.Id || c.id,
          name: c.Name || c.name,
          description: c.Description || c.description,
          color: c.Color || c.color,
          icon: c.Icon || c.icon,
          questionCount: c.QuestionCount || c.questionCount,
        }));
      }
      }

    // Parse tags
    let tags: Tag[] = [];
    if (tagsRes.ok) {
      const tagsData = await tagsRes.json();
      const result = tagsData?.Result || tagsData;
      if (Array.isArray(result)) {
        tags = result.map((t: any) => ({
          id: t.Id || t.id,
          name: t.Name || t.name,
          description: t.Description || t.description,
          questionCount: t.QuestionCount || t.questionCount,
        }));
      }
      }

    // Parse stats
    let stats: ForumStats | null = null;
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      const result = statsData?.Result || statsData;
      if (result) {
        stats = {
          totalQuestions: result.totalQuestions || result.TotalQuestions || 0,
          totalAnswers: result.totalAnswers || result.TotalAnswers || 0,
          totalUsers: result.totalUsers || result.TotalUsers || 0,
          solvedQuestions: result.solvedQuestions || result.SolvedQuestions || 0,
        };
      }
    }
    
    return {
      questions,
      categories,
      tags,
      stats,
      pagination,
    };
  } catch (error) {
    console.error('Error fetching initial forum data:', error);
    return null;
  }
}

// Server Component - Fetch initial data và render
export default async function ForumPage() {
  const initialData = await fetchInitialForumData();
  
  // Nếu không fetch được data, vẫn render client component (nó sẽ tự fetch)
  // Không cần notFound() vì client component sẽ handle error state

  return (
    <ForumListClient 
      initialQuestions={initialData?.questions}
      initialCategories={initialData?.categories}
      initialTags={initialData?.tags}
      initialStats={initialData?.stats}
      initialPagination={initialData?.pagination}
    />
  );
}
