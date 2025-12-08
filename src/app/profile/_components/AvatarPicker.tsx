// src/app/profile/_components/AvatarPicker.tsx
"use client";

import { useState } from "react";
import clsx from "clsx";
import { AVATAR_MAP } from "@/lib/avatars";

type AvatarPickerProps = {
  currentAvatarId: number;
  onSelectAvatar: (avatarId: number) => void;
};

export function AvatarPicker({ currentAvatarId, onSelectAvatar }: AvatarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (avatarId: number) => {
    onSelectAvatar(avatarId);
    setIsOpen(false); // Close the picker after selection
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="btn-secondary text-lg">
        Change Avatar
      </button>

      {isOpen && (
        // --- UPDATED: Changed positioning from bottom-full to top-full ---
        <div className="absolute top-full mt-3 w-72 p-4 card bg-white z-10 left-1/2 -translate-x-1/2">
          <p className="font-bold text-center mb-3">Choose an Avatar</p>
          <div className="grid grid-cols-3 gap-3">
            {AVATAR_MAP.map(({ id, file }) => (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className={clsx(
                  "relative w-[72px] h-[72px] rounded-full transition-all duration-300 focus:outline-none flex items-center justify-center mx-auto",
                  currentAvatarId === id
                    ? "scale-110"
                    : "hover:scale-105 opacity-70 hover:opacity-100"
                )}
              >
                {/* Gradient ring for selected state */}
                <div className={clsx(
                  "absolute inset-0 rounded-full transition-all duration-300",
                  currentAvatarId === id
                    ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-md shadow-blue-500/30"
                    : "bg-transparent"
                )} />
                
                {/* White inner circle for ring effect */}
                {currentAvatarId === id && (
                  <div className="absolute inset-[3px] rounded-full bg-white" />
                )}
                
                <img
                  src={`/avatars/${file}`}
                  alt={`Avatar option ${id}`}
                  className="relative w-16 h-16 rounded-full object-cover transition-all duration-300"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/64x64/e2e8f0/333?text=...'; }}
                />
                
                {/* Checkmark badge for selected avatar */}
                {currentAvatarId === id && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-1 shadow-md">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
