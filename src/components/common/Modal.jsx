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

