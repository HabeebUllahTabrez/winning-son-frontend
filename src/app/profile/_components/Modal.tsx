"use client";

import { FaTimes } from "react-icons/fa";
import { useEffect } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  backdropClassName?: string;
};

export function Modal({ isOpen, onClose, title, children, backdropClassName }: ModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${backdropClassName || "bg-black bg-opacity-60 backdrop-blur-sm"} animate-in fade-in-0`}
      onClick={onClose}
    >
      {/* --- UPDATED: Scrolling is now handled by the main modal container --- */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 overflow-y-auto"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>
        {/* --- UPDATED: Removed overflow and max-height from the content area --- */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
