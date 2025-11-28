'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Info,
  Loader2,
  Shield,
  Zap
} from 'lucide-react';
import { useBookActivation } from '../hooks/useBooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import ActivationCodesPanel from '@/app/books/activation/ActivationCodesPanel';

interface BookActivationProps {
  onActivationSuccess?: (bookId: number, bookTitle: string) => void;
}

export default function BookActivationModern({ onActivationSuccess }: BookActivationProps) {
  const [activationCode, setActivationCode] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    bookId?: number;
    bookTitle?: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { validateCode, activateBook, loading } = useBookActivation();

  const handleCodeChange = async (value: string) => {
    setActivationCode(value);
    setValidationResult(null);
    
    if (value.length >= 8) {
      setIsValidating(true);
      try {
        const result = await validateCode(value);
        setValidationResult(result);
      } catch (err) {
        setValidationResult({ isValid: false });
      } finally {
        setIsValidating(false);
      }
    }
  };

  const handleActivate = async () => {
    if (!validationResult?.isValid) {
      toast.error('Mã kích hoạt không hợp lệ');
      return;
    }

    try {
      const result = await activateBook(activationCode);
      
      if (result.success) {
        setShowSuccess(true);
        toast.success('Kích hoạt sách thành công! Đang chuyển hướng...');
        onActivationSuccess?.(validationResult.bookId!, validationResult.bookTitle!);
        
        // Redirect to book detail page after 2 seconds
        setTimeout(() => {
          if (validationResult.bookId) {
            window.location.href = `/books/${validationResult.bookId}`;
          } else {
            window.location.href = '/my-purchases';
          }
        }, 2000);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể kích hoạt sách');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Unused Activation Codes Panel */}
        <div className="mb-8">
          <ActivationCodesPanel />
        </div>

        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div
              key="activation-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Key className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Kích hoạt sách điện tử
                </h1>
                <p className="text-lg text-gray-600">
                  Nhập mã kích hoạt để truy cập toàn bộ nội dung sách
                </p>
              </div>

              {/* Main Card */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardContent className="p-8">
                  {/* Input Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Mã kích hoạt
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Nhập mã kích hoạt..."
                        value={activationCode}
                        onChange={(e) => handleCodeChange(e.target.value.toUpperCase())}
                        className="h-14 text-lg pl-12 pr-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-mono tracking-wider"
                        maxLength={20}
                      />
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      {isValidating && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 animate-spin" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Mã kích hoạt gồm 8-20 ký tự (chữ và số)
                    </p>
                  </div>

                  {/* Validation Status */}
                  <AnimatePresence mode="wait">
                    {validationResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                      >
                        {validationResult.isValid ? (
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base font-bold text-green-800 mb-1">
                                  Mã kích hoạt hợp lệ!
                                </h3>
                                <p className="text-green-700 font-medium mb-1">
                                  {validationResult.bookTitle}
                                </p>
                                <p className="text-green-600 text-sm">
                                  Bạn có thể kích hoạt sách này ngay
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base font-bold text-red-800 mb-1">
                                  Mã kích hoạt không hợp lệ
                                </h3>
                                <p className="text-red-600 text-sm">
                                  Vui lòng kiểm tra lại mã kích hoạt
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Activate Button */}
                  <Button
                    onClick={handleActivate}
                    disabled={!validationResult?.isValid || loading}
                    className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang kích hoạt...
                      </>
                    ) : (
                      <>
                        Kích hoạt sách
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  {/* Instructions */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-5 w-5 text-blue-600" />
                      <h3 className="text-base font-bold text-gray-900">
                        Hướng dẫn sử dụng
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Nhập mã kích hoạt được cung cấp khi mua sách
                        </p>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Mã kích hoạt chỉ có thể sử dụng một lần duy nhất
                        </p>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Sau khi kích hoạt, bạn có thể đọc sách và xem đáp án
                        </p>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">4</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Sách đã kích hoạt sẽ xuất hiện trong "Sách của tôi"
                        </p>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">Kích hoạt nhanh</h3>
                  <p className="text-xs text-gray-500">Chỉ mất vài giây</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">Truy cập vĩnh viễn</h3>
                  <p className="text-xs text-gray-500">Đọc mọi lúc mọi nơi</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">Bảo mật cao</h3>
                  <p className="text-xs text-gray-500">Mã chống sao chép</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center py-16"
            >
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardContent className="p-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Kích hoạt thành công!
                  </h2>
                  <p className="text-lg text-gray-600 mb-2">
                    Bạn đã kích hoạt thành công sách
                  </p>
                  <p className="text-xl font-bold text-gray-900 mb-6">
                    {validationResult?.bookTitle}
                  </p>
                  <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
                    Đang chuyển đến trang sách...
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
