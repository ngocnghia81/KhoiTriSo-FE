"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { vi } from "@/locales/vi";
import { en } from "@/locales/en";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Award,
  Play,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Clock,
  Star,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
} from "lucide-react";
import HomeHeroCarouselModern from "@/components/home/HomeHeroCarouselModern";
import UserNotificationsWidget from "@/components/notifications/UserNotificationsWidget";

// Icon mapping cho categories
const categoryIcons: { [key: string]: string } = {
  "Toán học": "📐",
  "Mathematics": "📐",
  "Vật lý": "⚛️",
  "Physics": "⚛️",
  "Hóa học": "🧪",
  "Chemistry": "🧪",
  "Sinh học": "🧬",
  "Biology": "🧬",
  "Văn học": "📚",
  "Literature": "📚",
  "Tiếng Anh": "🗣️",
  "English": "🗣️",
  "Lịch sử": "📜",
  "History": "📜",
  "Địa lý": "🌍",
  "Geography": "🌍",
};

// Color mapping cho categories
const categoryColors: { [key: string]: string } = {
  "Toán học": "from-blue-500 to-cyan-500",
  "Mathematics": "from-blue-500 to-cyan-500",
  "Vật lý": "from-purple-500 to-pink-500",
  "Physics": "from-purple-500 to-pink-500",
  "Hóa học": "from-green-500 to-emerald-500",
  "Chemistry": "from-green-500 to-emerald-500",
  "Sinh học": "from-red-500 to-orange-500",
  "Biology": "from-red-500 to-orange-500",
  "Văn học": "from-yellow-500 to-amber-500",
  "Literature": "from-yellow-500 to-amber-500",
  "Tiếng Anh": "from-indigo-500 to-blue-500",
  "English": "from-indigo-500 to-blue-500",
  "Lịch sử": "from-pink-500 to-rose-500",
  "History": "from-pink-500 to-rose-500",
  "Địa lý": "from-teal-500 to-cyan-500",
  "Geography": "from-teal-500 to-cyan-500",
};

export default function HomePageModern() {
  const { language } = useLanguage();
  const t = language === 'vi' ? vi : en;
  const { categories, loading: categoriesLoading } = useCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Floating Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Carousel */}
      <HomeHeroCarouselModern />

      {/* Notifications for signed-in users */}
      <section className="relative -mt-10 z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1">
            <UserNotificationsWidget />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {[
              { icon: Users, value: "15K+", label: t.home.stats.students, color: "from-blue-500 to-cyan-500" },
              { icon: BookOpen, value: "500+", label: t.home.stats.courses, color: "from-green-500 to-emerald-500" },
              { icon: Award, value: "50+", label: t.home.stats.instructors, color: "from-purple-500 to-pink-500" },
              { icon: Star, value: "98%", label: t.home.stats.satisfaction, color: "from-orange-500 to-red-500" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden group">
                  <CardContent className="p-8">
                    <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="h-10 w-10 text-white" />
                    </div>
                    <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-slate-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 mr-2 inline" />
              {t.home.categories.title}
            </Badge>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {t.home.categories.title}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t.home.categories.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {categoriesLoading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-4 animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              categories.map((category, index) => {
                const categoryName = language === 'vi' ? category.name : category.nameEn || category.name;
                const icon = categoryIcons[categoryName] || categoryIcons[category.name] || "📚";
                const color = categoryColors[categoryName] || categoryColors[category.name] || "from-blue-500 to-cyan-500";
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10, scale: 1.05 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 text-3xl`}>
                          {icon}
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">
                          {categoryName}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {(category as any).courseCount || 0} {language === 'vi' ? 'khóa học' : 'courses'}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {t.home.features.title}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t.home.features.subtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: t.home.features.support247,
                description: t.home.features.supportDesc,
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Shield,
                title: t.home.features.topQuality,
                description: t.home.features.qualityDesc,
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Clock,
                title: t.home.features.flexible,
                description: t.home.features.flexibleDesc,
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Award,
                title: t.home.features.certificate,
                description: t.home.features.certificateDesc,
                color: "from-orange-500 to-red-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden group h-full">
                  <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {t.home.cta.title}
            </h2>
            <p className="text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              {t.home.cta.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-7 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1"
              >
                <Link href="/auth/register">
                  <GraduationCap className="mr-3 h-6 w-6" />
                  {t.home.cta.registerNow}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 px-10 py-7 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1"
              >
                <Link href="/courses">
                  <BookOpen className="mr-3 h-6 w-6" />
                  {t.home.hero.exploreCourses}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-32 h-32 bg-white/20 rounded-full blur-xl"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </section>

      {/* Trust Badges */}
      <section className="relative py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: language === 'vi' ? 'Đảm bảo chất lượng' : 'Quality Guaranteed',
                description: language === 'vi' ? 'Nội dung được kiểm duyệt kỹ lưỡng' : 'Thoroughly reviewed content',
              },
              {
                icon: Shield,
                title: language === 'vi' ? 'Bảo mật thông tin' : 'Secure Information',
                description: language === 'vi' ? 'Dữ liệu được mã hóa và bảo vệ' : 'Encrypted and protected data',
              },
              {
                icon: TrendingUp,
                title: language === 'vi' ? 'Cập nhật liên tục' : 'Continuous Updates',
                description: language === 'vi' ? 'Nội dung mới được thêm hàng tuần' : 'New content added weekly',
              },
            ].map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <badge.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">{badge.title}</h3>
                      <p className="text-sm text-slate-600">{badge.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
