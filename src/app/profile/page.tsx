// src/app/profile/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, logout } from "@/lib/api";
import toast from "react-hot-toast";
import { FaBullseye, FaEdit, FaCloudUploadAlt, FaShieldAlt, FaCalendarCheck, FaCalendarPlus, FaCog, FaSignOutAlt, FaCamera, FaWhatsapp, FaQuestionCircle, FaCommentDots } from "react-icons/fa";
import { ProfileSkeleton } from "./_components/ProfileSkeleton";
import { AVATAR_MAP, getAvatarFile } from "@/lib/avatars";
import { isGuestUser, clearGuestData } from "@/lib/guest";
import { CreateAccountForm } from "../../components/CreateAccountForm";
import { Modal } from "../../components/Modal";
import { format, parseISO } from "date-fns";
import { trackEvent } from "@/lib/mixpanel";
import Image from "next/image";

const GUEST_PROFILE_KEY = "guestProfileData";

type UserProfile = {
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_id: number;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  is_admin: boolean;
};

type FormInputProps = {
  label: string;
  name: string;
  value: string | number | null | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
};

const FormInput = ({ label, name, value, onChange, type = "text", placeholder = "" }: FormInputProps) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      className="input w-full"
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editData, setEditData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    const guestMode = isGuestUser();
    setIsGuest(guestMode);
    try {
      let data: UserProfile;
      if (guestMode) {
        const localData = JSON.parse(localStorage.getItem(GUEST_PROFILE_KEY) || "{}");
        data = { email: "guest@example.com", avatar_id: 1, is_admin: false, ...localData };
      } else {
        const res = await apiFetch("/api/me");
        if (!(res.status >= 200 && res.status < 300)) throw new Error("Failed to load profile.");
        data = res.data;
      }
      setProfile(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load your profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
    trackEvent("Profile Page Viewed");
  }, [loadUserData]);

  const openEditModal = () => {
    setEditData(profile);
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!editData) return;
    setIsSaving(true);
    try {
      const payload = {
        first_name: editData.first_name,
        last_name: editData.last_name,
        avatar_id: editData.avatar_id,
        goal: editData.goal,
        start_date: editData.start_date,
        end_date: editData.end_date,
      };
      if (isGuest) {
        localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(payload));
        toast.success("Profile updated on this device!");
      } else {
        const res = await apiFetch("/api/me", { method: "PUT", data: payload });
        if (res.status !== 204) throw new Error(res.data?.detail || "Failed to save profile.");
        toast.success("Profile updated successfully!");
      }
      trackEvent("Profile Updated", { isGuest, hasGoal: !!editData.goal });
      setProfile(editData);
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleAvatarChange = (avatarId: number) => {
    setEditData(prev => (prev ? { ...prev, avatar_id: avatarId } : null));
  };

  const handleLogout = () => {
    trackEvent("User Logout from Profile");
    logout();
  };

  const handleExitGuestMode = () => {
    trackEvent("Exit Guest Mode from Profile");
    clearGuestData();
    window.location.href = "/";
  };

  const formatDate = (dateString: string | null) => dateString ? format(parseISO(dateString), 'MMM d, yyyy') : null;

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) return <div className="p-10 text-center"><p>Could not load profile.</p></div>;

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "New User";

  const handleAvatarSave = async () => {
    if (!editData) return;
    setIsSaving(true);
    try {
      const payload = {
        avatar_id: editData.avatar_id,
      };
      if (isGuest) {
        const currentData = JSON.parse(localStorage.getItem(GUEST_PROFILE_KEY) || "{}");
        localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify({ ...currentData, ...payload }));
        toast.success("Avatar updated on this device!");
      } else {
        const res = await apiFetch("/api/me", { method: "PUT", data: payload });
        if (res.status !== 204) throw new Error(res.data?.detail || "Failed to save avatar.");
        toast.success("Avatar updated successfully!");
      }
      trackEvent("Avatar Updated", { isGuest });
      setProfile({ ...profile, avatar_id: editData.avatar_id });
      setIsAvatarModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* MODALS */}
      <Modal isOpen={isCreateAccountModalOpen} onClose={() => setIsCreateAccountModalOpen(false)} title="Create a Free Account" backdropClassName="backdrop-blur-sm">
        <CreateAccountForm closeModal={() => setIsCreateAccountModalOpen(false)} />
      </Modal>

      {/* Edit Profile Modal (without avatar) */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Your Profile" backdropClassName="backdrop-blur-sm">
        {editData && (
          <>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="First Name" name="first_name" value={editData.first_name} onChange={handleInputChange} placeholder="Enter your first name" />
                <FormInput label="Last Name" name="last_name" value={editData.last_name} onChange={handleInputChange} placeholder="Enter your last name" />
              </div>
              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Your Goal</label>
                <textarea id="goal" name="goal" value={editData.goal || ""} onChange={handleInputChange} className="input w-full" rows={3} placeholder="e.g., Master React Hooks"/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="Start Date" name="start_date" value={editData.start_date?.split("T")[0]} onChange={handleInputChange} type="date"/>
                <FormInput label="End Date" name="end_date" value={editData.end_date?.split("T")[0]} onChange={handleInputChange} type="date"/>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="btn">{isSaving ? "Saving..." : "Save Changes"}</button>
            </div>
          </>
        )}
      </Modal>

      {/* Avatar Change Modal */}
      <Modal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)} title="Change Your Avatar" backdropClassName="backdrop-blur-sm">
        {editData && (
          <>
            <div className="space-y-6">
              {/* Currently Selected Avatar */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-gray-600">Currently Selected:</p>
                <Image 
                  src={`/avatars/${getAvatarFile(editData.avatar_id)}`} 
                  alt="Selected Avatar" 
                  width={80} 
                  height={80} 
                  className="w-20 h-20 rounded-full border-4 border-black shadow-lg" 
                />
              </div>

              <hr />

              {/* All Available Avatars */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-4">Choose an avatar:</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 max-h-[400px] overflow-y-auto pr-2 py-2">
                  {AVATAR_MAP.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarChange(avatar.id)}
                      className={`relative rounded-full transition-all p-1 ${
                        editData.avatar_id === avatar.id
                          ? "ring-4 ring-black scale-110"
                          : "hover:ring-2 hover:ring-gray-400 hover:scale-105"
                      }`}
                    >
                      <Image
                        src={`/avatars/${avatar.file}`}
                        alt={`Avatar ${avatar.id}`}
                        width={80}
                        height={80}
                        className="w-full h-full rounded-full border-2 border-black"
                      />
                      {editData.avatar_id === avatar.id && (
                        <div className="absolute -top-1 -right-1 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <button onClick={() => setIsAvatarModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleAvatarSave} disabled={isSaving} className="btn">{isSaving ? "Saving..." : "Save Avatar"}</button>
            </div>
          </>
        )}
      </Modal>

      {/* MAIN PAGE LAYOUT */}
      <div className="min-h-[calc(100vh-150px)] p-4 md:p-6 pt-16 md:pt-20">
        <div className="max-w-2xl mx-auto">
          {/* Guest Mode Banner */}
          {isGuest && (
            <div className="mb-6 p-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left bg-yellow-50 border-2 border-black rounded-lg shadow-[4px_4px_0_0_#000]">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Your Progress is Local!</h3>
                <p className="text-gray-600 mt-1">Create an account to save your wins permanently.</p>
              </div>
              <button onClick={() => setIsCreateAccountModalOpen(true)} className="btn mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                <FaCloudUploadAlt className="mr-2"/> Save to Cloud
              </button>
            </div>
          )}

          {/* Single Profile Card */}
          <div className="card p-6">
            {/* Avatar - Centered at top */}
            <div className="flex justify-center -mt-16 mb-4">
              <div className="relative group cursor-pointer" onClick={() => { setEditData(profile); setIsAvatarModalOpen(true); }}>
                <Image
                  src={`/avatars/${getAvatarFile(profile.avatar_id)}`}
                  alt="User Avatar"
                  width={112}
                  height={112}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-black shadow-lg transition-all group-hover:blur-sm group-hover:grayscale"
                />
                {/* Camera icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-white border-4 border-black rounded-full p-3">
                    <FaCamera className="text-black text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Name and Email */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 break-words">{fullName}</h1>
              {/* <p className="text-base text-gray-500 mt-1 break-all">{profile.email}</p> */}
              {profile.is_admin && (
                <p className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold border-2 border-yellow-400">
                  <FaShieldAlt /> <span>Administrator</span>
                </p>
              )}
            </div>

            {/* UNIFIED CONTENT */}
            <div className="space-y-6">
              {/* Profile Details Section */}
              <div className="animate-fade-in">
                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50/50 shadow-[2px_2px_0_0_#e5e7eb]">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <FaCog /> Profile Details
                  </h2>
                  <div className="space-y-3 pl-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-bold text-gray-500 uppercase tracking-wide text-xs">First Name</span>
                        <p className="text-gray-800 mt-1 text-base">{profile.first_name || <span className="text-gray-400 italic">Not set</span>}</p>
                      </div>
                      <div>
                        <span className="font-bold text-gray-500 uppercase tracking-wide text-xs">Last Name</span>
                        <p className="text-gray-800 mt-1 text-base">{profile.last_name || <span className="text-gray-400 italic">Not set</span>}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-bold text-gray-500 uppercase tracking-wide text-xs">Email</span>
                        <p className="text-gray-800 mt-1 break-all text-base">{profile.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goal Section */}
              <div className="animate-fade-in">
                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50/50 shadow-[2px_2px_0_0_#e5e7eb]">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <FaBullseye /> Your Goal
                  </h2>
                  <p className="text-gray-800 text-base mb-4 pl-1">
                    {profile.goal || <span className="text-gray-400 italic">No goal set. Click &apos;Edit Profile&apos; to add one.</span>}
                  </p>
                  {(profile.start_date || profile.end_date) && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-sm text-gray-600 pt-3 border-t border-dashed">
                      <div className="flex items-center gap-2">
                        <FaCalendarPlus className="text-gray-400" />
                        <strong>Start:</strong>
                        <span>{formatDate(profile.start_date) || <span className="italic">Not set</span>}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <FaCalendarCheck className="text-gray-400" />
                        <strong>Target:</strong>
                        <span>{formatDate(profile.end_date) || <span className="italic">Not set</span>}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Support & Resources Section */}
            <div className="mt-8 animate-fade-in">
              <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50/50 shadow-[2px_2px_0_0_#e5e7eb]">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <FaQuestionCircle /> Support & Resources
                </h2>
                <div className="space-y-3">
                  <a
                    href="/help"
                    className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-colors shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  >
                    <FaQuestionCircle className="text-blue-600 text-xl flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-bold text-gray-900">Help & Guide</p>
                      <p className="text-sm text-gray-600">Learn the basics and get comfortable using the app.</p>
                    </div>
                  </a>

                  <a
                    href="https://chat.whatsapp.com/KJQdLKOXZYh3M6aRzLnMQD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded-lg hover:bg-green-50 transition-colors shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  >
                    <FaWhatsapp className="text-green-600 text-xl flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-bold text-gray-900">WhatsApp Community</p>
                      <p className="text-sm text-gray-600">Join for updates, tips, and what&apos;s coming next.</p>
                    </div>
                  </a>

                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdYfPojaZjr_j3SDM8ODkVTzX34Cch6xivOpmfq-_ZIJnEUEw/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded-lg hover:bg-purple-50 transition-colors shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  >
                    <FaCommentDots className="text-purple-600 text-xl flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-bold text-gray-900">Facing an Issue?</p>
                      <p className="text-sm text-gray-600">Fill out the form — we&apos;ll get back to you ASAP!</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons at bottom of card */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200 flex flex-col sm:flex-row gap-3 w-full">
              <button onClick={openEditModal} className="btn flex items-center justify-center gap-2 flex-1">
                <FaEdit /> <span>Edit Profile</span>
              </button>
              {isGuest ? (
                <button
                  onClick={handleExitGuestMode}
                  className="flex items-center justify-center gap-2 flex-1 px-6 py-3 rounded-lg bg-red-50 hover:bg-red-100 border-2 border-black text-red-700 font-bold shadow-[4px_4px_0_0_#000] cursor-pointer transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Exit Guest Mode</span>
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 flex-1 px-6 py-3 rounded-lg bg-red-50 hover:bg-red-100 border-2 border-black text-red-700 font-bold shadow-[4px_4px_0_0_#000] cursor-pointer transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
