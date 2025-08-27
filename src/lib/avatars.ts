// src/lib/avatars.ts

export const AVATAR_MAP = [
  { id: 1, file: "1.jpeg" },
  { id: 2, file: "2.jpeg" },
  { id: 3, file: "3.jpeg" },
  { id: 4, file: "4.jpeg" },
  { id: 5, file: "5.jpeg" },
  { id: 6, file: "6.jpeg" },
];

/**
 * Gets the corresponding avatar filename for a given ID.
 * @param avatarId The user's avatar ID.
 * @returns The filename of the avatar, or a default if not found.
 */
export const getAvatarFile = (avatarId: number | null | undefined): string => {
  const defaultAvatar = AVATAR_MAP[0].file;
  if (avatarId === null || avatarId === undefined) {
    return defaultAvatar;
  }
  return AVATAR_MAP.find(avatar => avatar.id === avatarId)?.file || defaultAvatar;
};
