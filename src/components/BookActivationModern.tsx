'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
  Loader2,
  Gift,
  Zap
} from 'lucide-react';
import { useBookActivation } from '../hooks/useBooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

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
        toast.success('Kích hoạt sách thành công!');
        onActivationSuccess?.(validationResult.bookId!, validationResult.bookTitle!);
        
        setTimeout(() => {
          setActivationCode('');
          setValidationResult(null);
          setShowSuccess(false);
        }, 3000);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể kích hoạt sách');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Floating Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 max-w-4xl">
        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div
              key="activation-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <Key className="h-12 w-12 text-white" />
                </motion.div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Kích hoạt sách điện tử
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Nhập mã kích hoạt để truy cập video giải bài tập và nội dung số chất lượng cao
                </p>
              </div>

              {/* Main Card */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  {/* Input Section */}
                  <div className="mb-8">
                    <label className="block text-lg font-semibold text-slate-800 mb-4">
                      Mã kích hoạt
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Nhập mã kích hoạt sách..."
                        value={activationCode}
                        onChange={(e) => handleCodeChange(e.target.value.toUpperCase())}
                        className="h-16 text-lg pl-14 pr-14 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 font-mono tracking-wider"
                        maxLength={20}
                      />
                      <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                      {isValidating && (
                        <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-500 animate-spin" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
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
                        className="mb-8"
                      >
                        {validationResult.isValid ? (
                          <Card className="bg-green-50 border-2 border-green-200 rounded-2xl">
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-green-800 mb-1">
                                    Mã kích hoạt hợp lệ!
                                  </h3>
                                  <p className="text-green-700 font-semibold mb-2">
                                    {validationResult.bookTitle}
                                  </p>
                                  <p className="text-green-600 text-sm">
                                    Bạn có thể kích hoạt sách này ngay bây giờ
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="bg-red-50 border-2 border-red-200 rounded-2xl">
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-red-800 mb-1">
                                    Mã kích hoạt không hợp lệ
                                  </h3>
                                  <p className="text-red-600 text-sm">
                                    Vui lòng kiểm tra lại mã kích hoạt hoặc liên hệ hỗ trợ
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Activate Button */}
                  <Button
                    onClick={handleActivate}
                    disabled={!validationResult?.isValid || loading}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang kích hoạt...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Kích hoạt sách ngay
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <Separator className="my-8" />

                  {/* Instructions */}
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Info className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">
                          Hướng dẫn sử dụng
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">1</span>
                          </div>
                          <p className="text-slate-700">
                            Nhập mã kích hoạt được cung cấp khi mua sách
                          </p>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">2</span>
                          </div>
                          <p className="text-slate-700">
                            Mã kích hoạt chỉ có thể sử dụng một lần duy nhất
                          </p>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">3</span>
                          </div>
                          <p className="text-slate-700">
                            Sau khi kích hoạt, bạn có thể đọc sách ngay lập tức
                          </p>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">4</span>
                          </div>
                          <p className="text-slate-700">
                            Sách đã kích hoạt sẽ xuất hiện trong "Sách của tôi"
                          </p>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Benefits */}
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Kích hoạt nhanh</h3>
                    <p className="text-sm text-slate-600">Chỉ mất vài giây để kích hoạt</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Truy cập vĩnh viễn</h3>
                    <p className="text-sm text-slate-600">Đọc sách mọi lúc mọi nơi</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Nội dung độc quyền</h3>
                    <p className="text-sm text-slate-600">Video giải bài tập chi tiết</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
              >
                <CheckCircle className="h-16 w-16 text-white" />
              </motion.div>
              <h2 className="text-4xl font-bold text-green-600 mb-4">
                Kích hoạt thành công!
              </h2>
              <p className="text-xl text-slate-600 mb-2">
                Bạn đã kích hoạt thành công sách
              </p>
              <p className="text-2xl font-bold text-slate-800 mb-8">
                {validationResult?.bookTitle}
              </p>
              <Badge className="bg-green-100 text-green-800 px-6 py-2 text-base">
                Sách đã được thêm vào thư viện của bạn
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
