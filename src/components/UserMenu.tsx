'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDownIcon, ArrowRightOnRectangleIcon, UserCircleIcon, ShoppingCartIcon, LockClosedIcon, BookOpenIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  const isStudent = user.role === 'student';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || '/images/default-avatar.svg'} alt={user.name} />
            <AvatarFallback className="bg-blue-500 text-white text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-gray-700 hidden sm:block">{user.name}</span>
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <UserCircleIcon className="mr-2 h-4 w-4" />
            <span>Hồ sơ cá nhân</span>
          </Link>
        </DropdownMenuItem>
        {isStudent ? (
          <DropdownMenuItem asChild>
            <Link href="/my-purchases" className="flex items-center">
              <BookOpenIcon className="mr-2 h-4 w-4" />
              <span>Khóa học/Sách đã mua</span>
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center">
              <LockClosedIcon className="mr-2 h-4 w-4" />
              <span>Bảng điều khiển</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/cart" className="flex items-center">
            <ShoppingCartIcon className="mr-2 h-4 w-4" />
            <span>Giỏ hàng</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}