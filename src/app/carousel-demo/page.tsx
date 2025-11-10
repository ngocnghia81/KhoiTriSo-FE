"use client";

import React from "react";
import ImageCarousel from "@/components/home/ImageCarousel";
import FeatureCarousel from "@/components/home/FeatureCarousel";
import HeroCarousel from "@/components/home/HeroCarousel";

export default function CarouselDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Section spacing */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Feature Carousel</h2>
          <FeatureCarousel />
        </div>
      </div>

      {/* Section spacing */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Image Carousel</h2>
          <ImageCarousel />
        </div>
      </div>
    </div>
  );
}

