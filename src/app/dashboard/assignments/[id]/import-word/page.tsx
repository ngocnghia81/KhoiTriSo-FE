'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ImportQuestionsFromWord } from '@/components/ImportQuestionsFromWord';

export default function ImportWordPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? parseInt(params.id as string) : 0;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ImportQuestionsFromWord
          assignmentId={id}
          onClose={() => router.push(`/dashboard/assignments/${id}`)}
          onImported={() => router.push(`/dashboard/assignments/${id}`)}
        />
      </div>
    </div>
  );
}


