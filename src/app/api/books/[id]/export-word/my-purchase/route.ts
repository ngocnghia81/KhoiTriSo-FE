import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization') || '';
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    
    if (!authHeader) {
      return NextResponse.json(
        { Message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const includeExplanation = searchParams.get('includeExplanation') === 'true';

    const response = await fetch(
      `${API_URL}/api/books/${id}/export-word/my-purchase?includeExplanation=${includeExplanation}`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept-Language': acceptLanguage,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }

    // Get the blob from response
    const blob = await response.blob();
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `book_${id}.docx`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Return the file as a response
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting book to Word:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi xuất sách sang Word', Error: error.message },
      { status: 500 }
    );
  }
}

