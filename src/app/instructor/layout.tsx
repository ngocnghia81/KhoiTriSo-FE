import { Metadata } from 'next';
import InstructorSidebar from '@/components/instructor/InstructorSidebar';
import InstructorHeader from '@/components/instructor/InstructorHeader';
import { SidebarProvider } from '@/contexts/SidebarContext';

export const metadata: Metadata = {
  title: 'Instructor Dashboard - Khởi Trí Số',
  description: 'Bảng điều khiển giảng viên - Tạo và quản lý khóa học, sách điện tử',
};

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="flex-shrink-0">
            <InstructorSidebar />
          </div>
          
          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <InstructorHeader />
            <main className="flex-1 overflow-y-auto p-4">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
