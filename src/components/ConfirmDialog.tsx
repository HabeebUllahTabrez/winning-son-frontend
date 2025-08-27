// src/components/ConfirmDialog.tsx
"use client";

import { FC, ReactNode } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  children,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Dialog */}
      <div className="card w-full max-w-md m-4">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">{title}</h2>
          <div className="text-lg text-gray-700">{children}</div>
          <div className="flex justify-end items-center gap-4 pt-4">
            <button 
              className="underline text-lg" 
              onClick={onCancel} 
              disabled={isConfirming}
            >
              {cancelText}
            </button>
            <button 
              className="btn text-lg bg-red-600 text-white border-red-600 hover:bg-red-700" 
              onClick={onConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? "Deleting..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
