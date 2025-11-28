'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { safeJsonParse, isSuccessfulResponse, extractResult } from '@/utils/apiHelpers';
import Image from 'next/image';

interface UnusedActivationCode {
  activationCode: string;
  bookId: number;
  bookTitle: string;
  bookCoverImage?: string;
  authorName?: string;
  categoryName?: string;
  receivedAt: string;
}

export default function ActivationCodesPanel() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [codes, setCodes] = useState<UnusedActivationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchUnusedCodes();
  }, []);

  const fetchUnusedCodes = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/books/my-activation-codes');
      const result = await safeJsonParse(response);

      if (isSuccessfulResponse(result)) {
        const data = extractResult(result);
        if (Array.isArray(data)) {
          setCodes(data.map((c: any) => ({
            activationCode: c.ActivationCode || c.activationCode,
            bookId: c.BookId || c.bookId,
            bookTitle: c.BookTitle || c.bookTitle,
            bookCoverImage: c.BookCoverImage || c.bookCoverImage,
            authorName: c.AuthorName || c.authorName,
            categoryName: c.CategoryName || c.categoryName,
            receivedAt: c.ReceivedAt || c.receivedAt
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching activation codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Đã copy mã kích hoạt');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error('Không thể copy mã');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải...</p>
        </CardContent>
      </Card>
    );
  }

  if (codes.length === 0) {
    return null; // Don't show panel if no codes
  }

  return (
    <Card className="bg-blue-50 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Mã kích hoạt chưa sử dụng ({codes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {codes.map((code, index) => (
            <motion.div
              key={code.activationCode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  {/* Book Cover */}
                  {code.bookCoverImage && (
                    <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                      <Image
                        src={code.bookCoverImage}
                        alt={code.bookTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {code.bookTitle}
                    </h4>
                    {code.authorName && (
                      <p className="text-sm text-gray-600 mb-2">
                        {code.authorName}
                      </p>
                    )}
                    
                    {/* Activation Code */}
                    <div className="flex items-center gap-2 mb-2">
                      <code className="bg-gray-100 px-3 py-1.5 rounded text-sm font-mono font-bold text-blue-700 border border-gray-300">
                        {code.activationCode}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyCode(code.activationCode)}
                        className="h-8"
                      >
                        {copiedCode === code.activationCode ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Nhận ngày {formatDate(code.receivedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            💡 <strong>Hướng dẫn:</strong> Copy mã kích hoạt và nhập vào ô bên trên để kích hoạt sách
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

