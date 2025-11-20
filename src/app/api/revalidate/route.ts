import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// Secret token để bảo vệ API này
const BACKEND_JWT_SECRET = process.env.NEXT_PUBLIC_BACKEND_JWT_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra secret token
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${BACKEND_JWT_SECRET}`) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, id, path, tag } = body;

    // Revalidate theo path
    if (path) {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }

    // Revalidate theo tag
    if (tag) {
      revalidateTag(tag);
      console.log(`Revalidated tag: ${tag}`);
    }

    // Revalidate theo type và id
    if (type && id) {
      switch (type) {
        case 'course':
          revalidatePath(`/courses/${id}`);
          revalidatePath(`/courses/${id}`, 'page');
          revalidateTag(`course-${id}`);
          break;
        case 'lesson':
          revalidatePath(`/courses/${body.courseId}/lessons/${id}`);
          revalidatePath(`/courses/${body.courseId}/lessons/${id}`, 'page');
          revalidateTag(`lesson-${id}`);
          // Cũng revalidate course page vì lesson list có thể thay đổi
          if (body.courseId) {
            revalidatePath(`/courses/${body.courseId}`);
            revalidateTag(`course-${body.courseId}`);
          }
          break;
        case 'book':
          revalidatePath(`/books/${id}`);
          revalidatePath(`/books/${id}`, 'page');
          revalidateTag(`book-${id}`);
          break;
        case 'forum':
        case 'question':
          revalidatePath(`/forum/${id}`);
          revalidatePath(`/forum/${id}`, 'page');
          revalidateTag(`forum-${id}`);
          // Cũng revalidate forum list page
          revalidatePath('/forum');
          revalidateTag('forum-list');
          break;
        default:
          return NextResponse.json(
            { message: `Unknown type: ${type}` },
            { status: 400 }
          );
      }
    }

    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      type,
      id,
      path,
      tag
    });
  } catch (error) {
    console.error('Error revalidating:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

