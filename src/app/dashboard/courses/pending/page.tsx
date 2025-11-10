'use client';

import { Suspense } from 'react';
import CoursesManagementPage from '../page';

function PendingCoursesContent() {
  return <CoursesManagementPage />;
}

export default function PendingCoursesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PendingCoursesContent />
    </Suspense>
  );
}

