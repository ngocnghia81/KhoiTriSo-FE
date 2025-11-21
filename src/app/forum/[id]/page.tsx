import { notFound } from 'next/navigation';
import ForumDetailClient from './ForumDetailClient';
import { ForumQuestion, ForumAnswer, ForumComment } from '@/services/forumApi';

// Revalidate mỗi giờ hoặc on-demand (khi BE gọi revalidate API)
export const revalidate = 3600; // 1 giờ

// Fetch initial forum question data ở server với ISR
async function fetchForumQuestionData(id: string): Promise<{
  question: ForumQuestion | null;
  answers: ForumAnswer[];
  comments: Record<string, ForumComment[]>;
} | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // Fetch question
    const questionRes = await fetch(`${baseUrl}/forum/questions/${id}`, {
      next: { 
        revalidate: 3600, // Cache 1 giờ
        tags: [`forum-${id}`] // Tag để on-demand revalidation
      },
      headers: {
        'Accept-Language': 'vi',
      }
    });
    
    if (!questionRes.ok) {
      console.warn('Failed to fetch question:', questionRes.status);
      return null;
    }
    
    const questionData = await questionRes.json();
    const questionResult = questionData?.Result || questionData;
    
    if (!questionResult) {
      return null;
    }
    
    // Transform question
    const question: ForumQuestion = {
      id: questionResult.Id || questionResult.id || id,
      title: questionResult.Title || questionResult.title || '',
      content: questionResult.Content || questionResult.content || '',
      userId: questionResult.UserId || questionResult.userId || 0,
      userName: questionResult.UserName || questionResult.userName || '',
      userAvatar: questionResult.UserAvatar || questionResult.userAvatar,
      categoryId: questionResult.CategoryId || questionResult.categoryId,
      categoryName: questionResult.CategoryName || questionResult.categoryName,
      tags: questionResult.Tags || questionResult.tags || [],
      isSolved: questionResult.IsSolved || questionResult.isSolved || false,
      isPinned: questionResult.IsPinned || questionResult.isPinned || false,
      isClosed: questionResult.IsClosed || questionResult.isClosed || false,
      isDeleted: questionResult.IsDeleted || questionResult.isDeleted || false,
      viewCount: questionResult.ViewCount || questionResult.viewCount || 0,
      voteCount: questionResult.VoteCount || questionResult.voteCount || questionResult.Votes || questionResult.votes || 0,
      answerCount: questionResult.AnswerCount || questionResult.answerCount || questionResult.AnswersCount || questionResult.answersCount || 0,
      acceptedAnswerId: questionResult.AcceptedAnswerId || questionResult.acceptedAnswerId,
      createdAt: questionResult.CreatedAt || questionResult.createdAt || '',
      updatedAt: questionResult.UpdatedAt || questionResult.updatedAt || '',
      lastActivityAt: questionResult.LastActivityAt || questionResult.lastActivityAt,
      attachments: questionResult.Attachments || questionResult.attachments || [],
    };
    
    // Fetch answers
    const answersRes = await fetch(`${baseUrl}/forum/questions/${id}/answers`, {
      next: { 
        revalidate: 3600,
        tags: [`forum-${id}`]
      },
      headers: {
        'Accept-Language': 'vi',
      }
    });
    
    let answers: ForumAnswer[] = [];
    if (answersRes.ok) {
      const answersData = await answersRes.json();
      const answersResult = answersData?.Result || answersData;
      const answersItems = Array.isArray(answersResult) ? answersResult : (answersResult?.Items || answersResult?.items || []);
      
      answers = answersItems.map((a: {
        Id?: string;
        id?: string;
        QuestionId?: string;
        questionId?: string;
        Content?: string;
        content?: string;
        UserId?: number;
        userId?: number;
        UserName?: string;
        userName?: string;
        UserAvatar?: string;
        userAvatar?: string;
        IsAccepted?: boolean;
        isAccepted?: boolean;
        IsDeleted?: boolean;
        isDeleted?: boolean;
        VoteCount?: number;
        voteCount?: number;
        Votes?: number;
        votes?: number;
        CommentCount?: number;
        commentCount?: number;
        CreatedAt?: string;
        createdAt?: string;
        UpdatedAt?: string;
        updatedAt?: string;
        Attachments?: unknown[];
        attachments?: unknown[];
      }) => ({
        id: a.Id || a.id || '',
        questionId: a.QuestionId || a.questionId || id,
        content: a.Content || a.content || '',
        userId: a.UserId || a.userId || 0,
        userName: a.UserName || a.userName || '',
        userAvatar: a.UserAvatar || a.userAvatar,
        isAccepted: a.IsAccepted || a.isAccepted || false,
        isDeleted: a.IsDeleted || a.isDeleted || false,
        voteCount: a.VoteCount || a.voteCount || a.Votes || a.votes || 0,
        commentCount: a.CommentCount || a.commentCount || 0,
        createdAt: a.CreatedAt || a.createdAt || '',
        updatedAt: a.UpdatedAt || a.updatedAt || '',
        attachments: a.Attachments || a.attachments || [],
      }));
    }
    
    // Fetch comments for question and all answers (especially accepted answer)
    const comments: Record<string, ForumComment[]> = {};
    
    // Fetch comments for question
    try {
      const questionCommentsRes = await fetch(`${baseUrl}/forum/1/${id}/comments`, {
        next: { revalidate: 3600 },
        headers: {
          'Accept-Language': 'vi',
        }
      });
      
      if (questionCommentsRes.ok) {
        const questionCommentsData = await questionCommentsRes.json();
        const questionCommentsResult = questionCommentsData?.Result || questionCommentsData;
        const questionCommentsItems = Array.isArray(questionCommentsResult) ? questionCommentsResult : (questionCommentsResult?.Items || questionCommentsResult?.items || []);
        
        comments[id] = questionCommentsItems.map((c: {
          Id?: string;
          id?: string;
          ParentId?: string;
          parentId?: string;
          ParentType?: number;
          parentType?: number;
          Content?: string;
          content?: string;
          UserId?: number;
          userId?: number;
          UserName?: string;
          userName?: string;
          UserAvatar?: string;
          userAvatar?: string;
          CreatedAt?: string;
          createdAt?: string;
          UpdatedAt?: string;
          updatedAt?: string;
        }) => ({
          id: c.Id || c.id || '',
          parentId: c.ParentId || c.parentId || id,
          parentType: c.ParentType || c.parentType || 1,
          content: c.Content || c.content || '',
          userId: c.UserId || c.userId || 0,
          userName: c.UserName || c.userName || '',
          userAvatar: c.UserAvatar || c.userAvatar,
          createdAt: c.CreatedAt || c.createdAt || '',
          updatedAt: c.UpdatedAt || c.updatedAt || '',
        }));
      }
    } catch (err) {
      console.error('Error fetching question comments:', err);
      comments[id] = [];
    }
    
    // Fetch comments for each answer (especially accepted answer)
    for (const answer of answers) {
      try {
        const answerCommentsRes = await fetch(`${baseUrl}/forum/2/${answer.id}/comments`, {
          next: { revalidate: 3600 },
          headers: {
            'Accept-Language': 'vi',
          }
        });
        
        if (answerCommentsRes.ok) {
          const answerCommentsData = await answerCommentsRes.json();
          const answerCommentsResult = answerCommentsData?.Result || answerCommentsData;
          const answerCommentsItems = Array.isArray(answerCommentsResult) ? answerCommentsResult : (answerCommentsResult?.Items || answerCommentsResult?.items || []);
          
          comments[answer.id] = answerCommentsItems.map((c: {
            Id?: string;
            id?: string;
            ParentId?: string;
            parentId?: string;
            ParentType?: number;
            parentType?: number;
            Content?: string;
            content?: string;
            UserId?: number;
            userId?: number;
            UserName?: string;
            userName?: string;
            UserAvatar?: string;
            userAvatar?: string;
            CreatedAt?: string;
            createdAt?: string;
            UpdatedAt?: string;
            updatedAt?: string;
          }) => ({
            id: c.Id || c.id || '',
            parentId: c.ParentId || c.parentId || answer.id,
            parentType: c.ParentType || c.parentType || 2,
            content: c.Content || c.content || '',
            userId: c.UserId || c.userId || 0,
            userName: c.UserName || c.userName || '',
            userAvatar: c.UserAvatar || c.userAvatar,
            createdAt: c.CreatedAt || c.createdAt || '',
            updatedAt: c.UpdatedAt || c.updatedAt || '',
          }));
        } else {
          comments[answer.id] = [];
        }
      } catch (err) {
        console.error(`Error fetching comments for answer ${answer.id}:`, err);
        comments[answer.id] = [];
      }
    }
    
    return {
      question,
      answers,
      comments,
    };
  } catch (error) {
    console.error('Error fetching forum question data:', error);
    return null;
  }
}

// Server Component - Fetch initial data và render
export default async function ForumQuestionPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const initialData = await fetchForumQuestionData(id);
  
  if (!initialData || !initialData.question) {
    notFound();
  }
  
    return (
    <ForumDetailClient 
      initialQuestion={initialData.question}
      initialAnswers={initialData.answers}
      initialComments={initialData.comments}
      questionId={id}
    />
  );
}
