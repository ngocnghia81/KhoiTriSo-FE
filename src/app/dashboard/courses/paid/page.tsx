'use client';

import { Suspense } from 'react';
import CoursesManagementPage from '../page';

function PaidCoursesContent() {
  return <CoursesManagementPage />;
}

export default function PaidCoursesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaidCoursesContent />
    </Suspense>
  );
}

