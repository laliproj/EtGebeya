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
      >
        <img
          src={safeImages[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Arrows (Desktop overlay) */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-surface-900/80 backdrop-blur text-surface-900 dark:text-white opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-lg"
            >
              <HiOutlineChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-surface-900/80 backdrop-blur text-surface-900 dark:text-white opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-lg"
            >
              <HiOutlineChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x">
          {safeImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden snap-start transition-all ${
                currentIndex === index
                  ? 'ring-2 ring-primary-500 opacity-100'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Zoom Modal (Simple implementation) */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={images[currentIndex]}
            alt={`${title} - Fullscreen`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
