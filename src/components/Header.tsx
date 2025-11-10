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
    },
    {
        name: "Khóa học",
        href: "/courses",
        children: [
            { name: "Khóa học miễn phí", href: "/courses/free" },
            { name: "Khóa học trả phí", href: "/courses/paid" },
            { name: "Toán học", href: "/courses/math" },
            { name: "Vật lý", href: "/courses/physics" },
            { name: "Hóa học", href: "/courses/chemistry" },
        ],
    },
    {
        name: "Sách điện tử",
        href: "/books",
        children: [
            { name: "Danh sách sách", href: "/books" },
            { name: "Kích hoạt sách", href: "/books/activation" },
            { name: "Sách Toán", href: "/books/math" },
            { name: "Sách Lý", href: "/books/physics" },
            { name: "Sách Hóa", href: "/books/chemistry" },
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

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
                {/* Logo */}
                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5">
                        <Logo size="md" variant="light" showText={true} />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex lg:gap-x-8 lg:items-center">
                    {navigation.map((item) => (
                        <div 
                            key={item.name}
                            className="relative group"
                        >
                            {item.children ? (
                                <div>
                                    <Button 
                                        variant="ghost" 
                                        className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
                                        onMouseEnter={() => handleMouseEnter(item.name)}
                                    >
                                        {item.name}
                                        <ChevronDownIcon className="h-4 w-4" />
                                    </Button>
                                    <DropdownMenu open={openDropdown === item.name} modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <button className="absolute inset-0 opacity-0 pointer-events-none"></button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent 
                                            align="center" 
                                            className="w-56"
                                            onMouseEnter={() => handleMouseEnter(item.name)}
                                            onMouseLeave={handleMouseLeave}
                                            sideOffset={5}
                                        >
                                            {item.children.map((child) => (
                                                <DropdownMenuItem key={child.name} asChild>
                                                    <Link href={child.href} className="w-full">
                                                        {child.name}
                                                    </Link>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <Button variant="ghost" asChild className="text-gray-700 hover:text-blue-600">
                                    <Link href={item.href}>{item.name}</Link>
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative" ref={searchRef}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="text-gray-700 hover:text-blue-600"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </Button>
                        
                        {searchOpen && (
                            <Card className="absolute right-0 top-full mt-2 w-80 shadow-lg border-0">
                                <CardContent className="p-4">
                                    <form onSubmit={handleSearch} className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm khóa học, sách..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="flex-1 border-0 outline-none text-sm"
                                                autoFocus
                                            />
                                        </div>
                                        <Separator />
                                        <div className="flex justify-end">
                                            <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                                                Tìm kiếm
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Cart */}
                    <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:text-blue-600">
                        <Link href="/cart">
                            <ShoppingBagIcon className="h-5 w-5" />
                        </Link>
                    </Button>

                    {/* Language Switcher */}
                    <LanguageSwitcher />

                    {/* User Menu */}
                    {isClient && (
                        <>
                            {isAuthenticated ? (
                                <UserMenu />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" asChild size="sm">
                                        <Link href="/auth/login">Đăng nhập</Link>
                                    </Button>
                                </div>
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
                                
                                <div className="flex-1 space-y-4">
                                    {navigation.map((item) => (
                                        <div key={item.name}>
                                            {item.children ? (
                                                <div className="space-y-2">
                                                    <div className="font-semibold text-gray-900">{item.name}</div>
                                                    <div className="pl-4 space-y-1">
                                                        {item.children.map((child) => (
                                                            <Link
                                                                key={child.name}
                                                                href={child.href}
                                                                className="block py-2 text-sm text-gray-600 hover:text-blue-600"
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
                                                    className="block py-2 font-semibold text-gray-900 hover:text-blue-600"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {item.name}
                                                </Link>
                                            )}
                                        </div>
                                    ))}
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