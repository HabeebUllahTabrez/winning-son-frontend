// src/app/profile/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { FaEdit, FaSave, FaShieldAlt, FaTimes } from "react-icons/fa";
import { AvatarPicker } from "./_components/AvatarPicker";
import { ProfileSkeleton } from "./_components/ProfileSkeleton";
import { AVATAR_MAP } from "@/lib/avatars";

// Updated type to include is_admin
type UserProfile = {
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_id: number;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  is_admin: boolean; // <-- Added is_admin flag
};

const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!isEditing) setIsLoading(true);
    try {
      const res = await apiFetch("/api/me");
      if (!res.ok) throw new Error("Failed to load profile.");
      const data: UserProfile = await res.json();
      setProfile(data);
      setInitialProfile(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load your profile.");
    } finally {
      setIsLoading(false);
    }
  }, [isEditing]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const payload = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        avatar_id: profile.avatar_id,
        goal: profile.goal || "",
        start_date: profile.start_date || "",
        end_date: profile.end_date || "",
      };
      const res = await apiFetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status !== 204) throw new Error(await res.text() || "Failed to save profile.");
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      await loadProfile();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const getAvatarFile = (avatarId: number) => {
    return AVATAR_MAP.find(avatar => avatar.id === avatarId)?.file || "avatar-1.png";
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-lg">Could not load profile. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-10">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Your Profile</h1>
            <p className="text-lg text-gray-600">Manage your personal information and goals.</p>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn flex items-center gap-2">
              <FaEdit /> Edit
            </button>
          )}
        </header>

        <div className="card p-6 sm:p-8 space-y-6">
          {/* ... (rest of the form remains the same) ... */}
          <div className="flex flex-col items-center gap-4">
            <img
              src={`/avatars/${getAvatarFile(profile.avatar_id)}`}
              alt="Selected Avatar"
              className="w-32 h-32 rounded-full border-4 border-black bg-gray-100 object-cover"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/128x128/e2e8f0/333?text=...'; }}
            />
            {isEditing && (
              <AvatarPicker
                currentAvatarId={profile.avatar_id}
                onSelectAvatar={(avatarId) => setProfile({ ...profile, avatar_id: avatarId })}
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input type="text" id="first_name" name="first_name" className="input" value={profile.first_name || ""} onChange={handleInputChange} disabled={!isEditing} maxLength={10} />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input type="text" id="last_name" name="last_name" className="input" value={profile.last_name || ""} onChange={handleInputChange} disabled={!isEditing} maxLength={10} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" className="input" value={profile.email} disabled />
            </div>
            <div className="form-group">
              <label htmlFor="goal">Your Goal</label>
              <input type="text" id="goal" name="goal" className="input" value={profile.goal || ""} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Run 5k daily" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="start_date">Start Date</label>
                <input type="date" id="start_date" name="start_date" className="input" value={formatDateForInput(profile.start_date)} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label htmlFor="end_date">End Date</label>
                <input type="date" id="end_date" name="end_date" className="input" value={formatDateForInput(profile.end_date)} onChange={handleInputChange} disabled={!isEditing} />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-end gap-4 pt-4 border-t-2 border-gray-100">
              <button onClick={handleCancel} className="btn-secondary flex items-center gap-2">
                <FaTimes /> Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="btn flex items-center gap-2">
                <FaSave /> {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* --- Admin Panel Link --- */}
        {profile.is_admin && (
          <section className="card p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Tools</h2>
            <p className="text-gray-600 mb-4">You have access to the system administration panel.</p>
            <a href="/admin" className="btn-secondary flex items-center gap-2 w-fit">
              <FaShieldAlt /> Go to Admin Panel
            </a>
          </section>
        )}
      </div>
    </div>
  );
}
