import { useEffect, useRef } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';

/**
 * Reusable Modal Component
 */
const Modal = ({ isOpen, onClose, title, children, maxWidth = 'md' }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-surface-900 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800 shrink-0">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-full transition-colors"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
