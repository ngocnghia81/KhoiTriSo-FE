'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Award, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

const aboutSlides = [
  {
    id: 1,
    title: "Giảng viên chuyên nghiệp",
    description: "Đội ngũ giảng viên có nhiều năm kinh nghiệm và bằng cấp cao, luôn tận tâm với học viên",
    image: "/images/about/about-1/about-img.png",
    shapes: [
      "/images/about/about-1/shape-1.svg",
      "/images/about/about-1/shape-2.svg",
      "/images/about/about-1/shape-3.svg"
    ],
    features: [
      { icon: Users, text: "50+ Giảng viên" },
      { icon: Award, text: "Chứng chỉ quốc tế" },
      { icon: BookOpen, text: "Kinh nghiệm 10+ năm" }
    ],
    bgColor: "from-blue-500 to-purple-600"
  },
  {
    id: 2,
    title: "Phương pháp học hiện đại",
    description: "Áp dụng công nghệ tiên tiến và phương pháp giảng dạy hiện đại để mang lại hiệu quả học tập tối ưu",
    image: "/images/about/about-2/about-img-1.png",
    shapes: [
      "/images/about/about-2/shape-1.svg",
      "/images/about/about-2/shape-2.svg",
      "/images/about/about-2/shape-3.svg"
    ],
    features: [
      { icon: Play, text: "Video HD chất lượng cao" },
      { icon: BookOpen, text: "Sách điện tử tương tác" },
      { icon: Users, text: "Cộng đồng học tập" }
    ],
    bgColor: "from-purple-500 to-pink-600"
  },
  {
    id: 3,
    title: "Môi trường học tập lý tưởng",
    description: "Tạo dựng môi trường học tập tích cực, khuyến khích sự sáng tạo và phát triển toàn diện",
    image: "/images/about/about-3/about-img.png",
    shapes: [],
    features: [
      { icon: Award, text: "Chứng chỉ uy tín" },
      { icon: Users, text: "Hỗ trợ 24/7" },
      { icon: BookOpen, text: "Tài liệu phong phú" }
    ],
    bgColor: "from-green-500 to-teal-600"
  },
  {
    id: 4,
    title: "Thành tích xuất sắc",
    description: "Với nhiều giải thưởng và chứng nhận chất lượng, chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất",
    image: "/images/about/about-4/about-img.png",
    shapes: [
      "/images/about/about-4/award-1.png",
      "/images/about/about-4/award-2.png",
      "/images/about/about-4/award-3.png",
      "/images/about/about-4/award-4.png"
    ],
    features: [
      { icon: Award, text: "Giải thưởng giáo dục" },
      { icon: Users, text: "98% học viên hài lòng" },
      { icon: BookOpen, text: "500+ khóa học chất lượng" }
    ],
    bgColor: "from-orange-500 to-red-600"
  }
];

export default function AboutCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const autoplayRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Autoplay functionality
  React.useEffect(() => {
    if (!api) return;

    const startAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }

      autoplayRef.current = setInterval(() => {
        api.scrollNext();
      }, 5000);
    };

    startAutoplay();

    // Reset interval when slide changes
    api.on("select", startAutoplay);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [api]);

  return (
    <section className="pt-48 pb-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Tại sao chọn Khởi Trí Số?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá những điểm nổi bật làm nên sự khác biệt của nền tảng giáo dục hàng đầu Việt Nam
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {aboutSlides.map((slide) => (
              <CarouselItem key={slide.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden rounded-2xl hover:-translate-y-2">
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Animated Shapes */}
                    {slide.shapes.map((shape, index) => (
                      <div
                        key={index}
                        className={`absolute animate-pulse ${
                          index === 0 ? 'top-4 right-4 w-12 h-12' :
                          index === 1 ? 'bottom-4 left-4 w-8 h-8' :
                          index === 2 ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6' :
                          'top-1/4 right-1/4 w-10 h-10'
                        }`}
                        style={{
                          animationDelay: `${index * 0.5}s`,
                          animationDuration: '3s'
                        }}
                      >
                        <Image
                          src={shape}
                          alt={`Shape ${index + 1}`}
                          fill
                          className="object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                    ))}
                    
                    {/* Floating Elements */}
                    <div className="absolute top-2 right-2 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-2 w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${slide.bgColor} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-gray-800 font-semibold px-3 py-1 animate-pulse">
                        Slide {slide.id}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {slide.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {slide.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-3">
                      {slide.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                            <feature.icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div className="mt-6">
                      <Button 
                        className={`w-full bg-gradient-to-r ${slide.bgColor} hover:opacity-90 text-white font-semibold rounded-xl transition-all duration-300 hover:-translate-y-1`}
                      >
                        Tìm hiểu thêm
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation */}
          <div className="flex justify-center mt-8 space-x-4">
            <CarouselPrevious className="relative translate-y-0 left-0 bg-white/90 hover:bg-white text-gray-800 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" />
            <CarouselNext className="relative translate-y-0 right-0 bg-white/90 hover:bg-white text-gray-800 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" />
          </div>
          
          {/* Pagination Indicators */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`transition-all duration-300 ${
                  current === index 
                    ? "h-3 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" 
                    : "h-3 w-3 rounded-full bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center group hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse group-hover:scale-110 transition-transform duration-300">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">15K+</div>
            <div className="text-gray-600 group-hover:text-gray-800 transition-colors">Học viên tin tưởng</div>
          </div>
          
          <div className="text-center group hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: '0.5s' }}>
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">500+</div>
            <div className="text-gray-600 group-hover:text-gray-800 transition-colors">Khóa học chất lượng</div>
          </div>
          
          <div className="text-center group hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: '1s' }}>
              <Award className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">50+</div>
            <div className="text-gray-600 group-hover:text-gray-800 transition-colors">Giảng viên chuyên nghiệp</div>
          </div>
          
          <div className="text-center group hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: '1.5s' }}>
              <Play className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">98%</div>
            <div className="text-gray-600 group-hover:text-gray-800 transition-colors">Tỷ lệ hài lòng</div>
          </div>
        </div>
      </div>
    </section>
  );
}
