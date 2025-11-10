'use client';

import React, { useState } from 'react';
import { BookOpen, Key, User, Bug, Sparkles, Library, BookMarked } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookListShadcn from '../components/BookListShadcn';
import BookActivation from '../components/BookActivation';
import BookReader from '../components/BookReader';
import CartDebug from '../components/CartDebug';
import { Book } from '../services/bookApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const BooksPage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState('library');

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setActiveTab('reader');
  };

  const tabs = [
    {
      id: 'library',
      label: 'Thư viện sách',
      icon: <BookOpen className="mr-2" />,
      content: <BookListShadcn onBookSelect={handleBookSelect} />
    },
    {
      id: 'activation',
      label: 'Kích hoạt sách',
      icon: <Key className="mr-2" />,
      content: <BookActivation />
    },
    {
      id: 'reader',
      label: 'Đọc sách',
      icon: <User className="mr-2" />,
      content: selectedBook ? (
        <BookReader bookId={selectedBook.id} />
      ) : (
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa chọn sách</h3>
            <p className="text-gray-500">Vui lòng chọn một cuốn sách từ thư viện để đọc</p>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'debug',
      label: 'Debug Cart',
      icon: <Bug className="mr-2" />,
      content: <CartDebug />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-blue-600" />
                Chức năng
              </CardTitle>
              <CardDescription className="text-base">
                Chọn chức năng bạn muốn sử dụng từ menu bên dưới
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3 mb-8">
                {tabs.map((tab, index) => (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Button
                      variant={activeTab === tab.id ? "default" : "outline"}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center transition-all duration-300 ${
                        activeTab === tab.id 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg scale-105' 
                          : 'border-2 border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
              
              <Separator className="my-6 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              
              {/* Active Tab Content with Animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[600px]"
                >
                  {tabs.find(tab => tab.id === activeTab)?.content}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BooksPage;
