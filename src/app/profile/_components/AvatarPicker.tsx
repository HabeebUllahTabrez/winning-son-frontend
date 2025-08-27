// src/app/profile/_components/AvatarPicker.tsx
"use client";

import { useState } from "react";
import clsx from "clsx";

// --- IMPORTANT ---
// This map converts the integer ID from the API to a filename.
// Ensure the files exist in your /public/avatars folder.

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
        <div className="absolute bottom-full mb-3 w-64 p-3 card bg-white z-10 left-1/2 -translate-x-1/2">
          <p className="font-bold text-center mb-2">Choose an Avatar</p>
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_MAP.map(({ id, file }) => (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className={clsx(
                  "p-1 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black",
                  currentAvatarId === id
                    ? "ring-2 ring-black bg-gray-200"
                    : "hover:bg-gray-100"
                )}
              >
                <img
                  src={`/avatars/${file}`}
                  alt={`Avatar option ${id}`}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/64x64/e2e8f0/333?text=...'; }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
