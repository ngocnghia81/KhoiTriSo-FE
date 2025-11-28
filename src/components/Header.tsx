"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useClientOnly } from "@/hooks/useClientOnly";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import {
    Bars3Icon,
    XMarkIcon,
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    BookOpenIcon,
    HomeIcon,
    AcademicCapIcon,
    MapIcon,
    ChatBubbleLeftRightIcon,
    BookmarkIcon,
} from "@heroicons/react/24/outline";
import { Key } from "lucide-react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import BackdropBlur from "./BackdropBlur";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
import { useCategories } from "@/hooks/useCategories";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
    {
        name: "Trang chủ",
        href: "/",
        icon: HomeIcon,
    },
    {
        name: "Khóa học",
        href: "/courses",
        icon: AcademicCapIcon,
        children: [
            { name: "Tất cả khóa học", href: "/courses" },
            { name: "Khóa học miễn phí", href: "/courses?isFree=true" },
            { name: "Khóa học trả phí", href: "/courses?isFree=false" },
        ],
    },
    {
        name: "Lộ trình học",
        href: "/learning-paths",
        icon: MapIcon,
    },
    {
        name: "Sách điện tử",
        href: "/books",
        icon: BookOpenIcon,
        children: [
            { name: "Danh sách sách", href: "/books" },
            { name: "Kích hoạt sách", href: "/books/activation" },
        ],
    },
    {
        name: "Diễn đàn",
        href: "/forum",
        icon: ChatBubbleLeftRightIcon,
        children: [
            { name: "Danh sách câu hỏi", href: "/forum" },
            { name: "Bookmarks của tôi", href: "/forum/bookmarks" },
        ],
    },
    {
        name: "Liên hệ",
        href: "/contact",
    },
];

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { user, isAuthenticated } = useAuth();
    const { language } = useLanguage();
    const pathname = usePathname();
    const isClient = useClientOnly();
    const { categories, loading: categoriesLoading } = useCategories();
    const { cart } = useCart();
    // Calculate cart count from actual CartItems array to ensure accuracy
    const cartCount = cart?.CartItems?.length || 0;

    const handleMouseEnter = (itemName: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setOpenDropdown(itemName);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setOpenDropdown(null);
        }, 100);
    };

    // Close search when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Implement search logic here
            console.log("Searching for:", searchQuery);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname?.startsWith(href);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8" aria-label="Global">
                {/* Logo */}
                <div className="flex lg:flex-1 mr-6 lg:mr-8">
                    <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 transition-transform duration-200 hover:scale-105">
                        <Logo size="md" variant="light" showText={true} />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex lg:gap-x-1 lg:items-center">
                    {navigation.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <div 
                                key={item.name}
                                className="relative group"
                            >
                                {item.children ? (
                                    <div>
                                        <Button 
                                            variant="ghost" 
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out ${
                                                active 
                                                    ? "text-blue-600 bg-blue-50 font-medium" 
                                                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                            }`}
                                            onMouseEnter={() => handleMouseEnter(item.name)}
                                        >
                                            {Icon && <Icon className="h-4 w-4" />}
                                            {item.name}
                                            <ChevronDownIcon className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu open={openDropdown === item.name} modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <button className="absolute inset-0 opacity-0 pointer-events-none"></button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent 
                                                align="start" 
                                                className="w-56 mt-1 shadow-lg border border-gray-200 transition-all duration-200 ease-in-out"
                                                onMouseEnter={() => handleMouseEnter(item.name)}
                                                onMouseLeave={handleMouseLeave}
                                                sideOffset={5}
                                            >
                                                {item.children.map((child) => (
                                                    <DropdownMenuItem 
                                                        key={child.name} 
                                                        asChild
                                                        className="cursor-pointer"
                                                    >
                                                        <Link 
                                                            href={child.href} 
                                                            className="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-50 rounded-md transition-all duration-200 ease-in-out"
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ) : (
                                    <Button 
                                        variant="ghost" 
                                        asChild 
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out ${
                                            active 
                                                ? "text-blue-600 bg-blue-50 font-medium" 
                                                : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Link href={item.href} className="flex items-center gap-1.5">
                                            {Icon && <Icon className="h-4 w-4" />}
                                            {item.name}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2 lg:gap-3">
                    {/* Search */}
                    <div className="relative" ref={searchRef}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200 ease-in-out"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </Button>
                        
                        {searchOpen && (
                            <Card className="absolute right-0 top-full mt-2 w-80 lg:w-96 shadow-xl border border-gray-200 rounded-xl overflow-hidden">
                                <CardContent className="p-4">
                                    <form onSubmit={handleSearch} className="space-y-3">
                                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm khóa học, sách, lộ trình..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="flex-1 border-0 outline-none text-sm bg-transparent"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setSearchOpen(false)}
                                            >
                                                Hủy
                                            </Button>
                                            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                                Tìm kiếm
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Book Activation */}
                    {/* <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild 
                        className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                    >
                        <Link href="/books/activation" className="flex items-center gap-1.5">
                            <Key className="h-4 w-4" />
                            <span className="hidden lg:inline">Kích hoạt sách</span>
                        </Link>
                    </Button> */}

                    {/* Notifications */}
                    {isClient && isAuthenticated && <NotificationBell />}

                    {/* Cart */}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild 
                        className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg relative transition-all duration-200 ease-in-out"
                    >
                        <Link href="/cart" className="relative">
                            <ShoppingBagIcon className={`h-5 w-5 transition-transform ${cartCount > 0 ? 'animate-pulse-once' : ''}`} />
                            {cartCount > 0 && (
                                <span 
                                    className="absolute -top-1.5 -right-1.5 h-5 min-w-[24px] px-1.5 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full border-2 border-white shadow-lg"
                                    style={{
                                        animation: 'cart-badge-pulse 2s ease-in-out infinite',
                                        boxShadow: '0 6px 18px rgba(249, 115, 22, 0.45)',
                                    }}
                                >
                                    {cartCount > 99 ? '99+' : cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </Button>

                    {/* Language Switcher */}
                    <div className="hidden lg:block">
                        <LanguageSwitcher />
                    </div>

                    {/* User Menu */}
                    {isClient && (
                        <>
                            {isAuthenticated ? (
                                <UserMenu />
                            ) : (
                                <Button 
                                    variant="ghost" 
                                    asChild 
                                    size="sm"
                                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200 ease-in-out"
                                >
                                    <Link href="/auth/login">Đăng nhập</Link>
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <div className="flex lg:hidden">
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-700">
                                <Bars3Icon className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-80">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <Logo size="md" variant="light" showText={true} />
                                </div>
                                
                                <div className="flex-1 space-y-2 overflow-y-auto">
                                    {navigation.map((item) => {
                                        const active = isActive(item.href);
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.name}>
                                                {item.children ? (
                                                    <div className="space-y-2">
                                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold ${
                                                            active ? "text-blue-600 bg-blue-50" : "text-gray-900"
                                                        }`}>
                                                            {Icon && <Icon className="h-5 w-5" />}
                                                            {item.name}
                                                        </div>
                                                        <div className="pl-4 space-y-1">
                                                            {item.children.map((child) => (
                                                                <Link
                                                                    key={child.name}
                                                                    href={child.href}
                                                                    className="block py-2 px-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={item.href}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-colors ${
                                                            active 
                                                                ? "text-blue-600 bg-blue-50" 
                                                                : "text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                                                        }`}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        {Icon && <Icon className="h-5 w-5" />}
                                                        {item.name}
                                                    </Link>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-4">
                                    {isClient && isAuthenticated && (
                                        <div className="px-3">
                                            <NotificationBell />
                                        </div>
                                    )}
                                    <Button variant="ghost" asChild className="w-full justify-start relative">
                                        <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between w-full">
                                            <div className="flex items-center">
                                                <ShoppingBagIcon className="mr-2 h-4 w-4" />
                                                Giỏ hàng
                                            </div>
                                            {cartCount > 0 && (
                                                <span className="ml-auto h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full border border-white shadow-md">
                                                    {cartCount > 99 ? '99+' : cartCount > 9 ? '9+' : cartCount}
                                                </span>
                                            )}
                                        </Link>
                                    </Button>
                                    
                                    {isClient && (
                                        <>
                                            {isAuthenticated ? (
                                                <UserMenu />
                                            ) : (
                                                <div className="space-y-2">
                                                    <Button variant="ghost" asChild className="w-full">
                                                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                                            Đăng nhập
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}