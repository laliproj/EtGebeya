import { useState } from 'react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

const ProductGallery = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const safeImages = Array.isArray(images) && images.length > 0 ? images : null;

  if (!safeImages) {
    return (
      <div className="aspect-square md:aspect-[4/3] bg-surface-100 dark:bg-surface-800 rounded-2xl flex flex-col items-center justify-center text-surface-400 dark:text-surface-600">
        <span className="text-6xl mb-3">📷</span>
        <p className="text-sm font-medium">ፎቶ አልተጨመረም (No photos)</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div 
        className="relative aspect-square md:aspect-[4/3] bg-surface-100 dark:bg-surface-800 rounded-2xl overflow-hidden group cursor-zoom-in"
        onClick={() => setIsZoomed(true)}
