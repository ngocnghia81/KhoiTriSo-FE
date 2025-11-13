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
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import BackdropBlur from "./BackdropBlur";
import UserMenu from "./UserMenu";
import { useCategories } from "@/hooks/useCategories";
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
                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5 flex items-center">
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
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
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
                                                className="w-56 mt-1 shadow-lg border border-gray-200"
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
                                                            className="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-50 rounded-md"
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
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
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
                            className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
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

                    {/* Cart */}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild 
                        className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg relative"
                    >
                        <Link href="/cart">
                            <ShoppingBagIcon className="h-5 w-5" />
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
                                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-50"
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
                                    <Button variant="ghost" asChild className="w-full justify-start">
                                        <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
                                            <ShoppingBagIcon className="mr-2 h-4 w-4" />
                                            Giỏ hàng
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