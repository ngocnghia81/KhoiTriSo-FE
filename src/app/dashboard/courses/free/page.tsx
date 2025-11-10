'use client';

import { Suspense } from 'react';
import CoursesManagementPage from '../page';

function FreeCoursesContent() {
  return <CoursesManagementPage />;
}

export default function FreeCoursesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FreeCoursesContent />
    </Suspense>
  );
}

