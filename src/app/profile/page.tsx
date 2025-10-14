// src/app/profile/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, logout } from "@/lib/api";
import toast from "react-hot-toast";
import { FaBullseye, FaEdit, FaCloudUploadAlt, FaShieldAlt, FaCalendarCheck, FaCalendarPlus, FaCog, FaSignOutAlt, FaCamera } from "react-icons/fa";
import { ProfileSkeleton } from "./_components/ProfileSkeleton";
import { AVATAR_MAP, getAvatarFile } from "@/lib/avatars";
import { isGuestUser } from "@/lib/guest";
import { CreateAccountForm } from "../../components/CreateAccountForm";
import { Modal } from "../../components/Modal";
import { format, parseISO } from "date-fns";
import { trackEvent } from "@/lib/mixpanel";

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

type Section = "goal" | "settings";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editData, setEditData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("goal");

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

  const formatDate = (dateString: string | null) => dateString ? format(parseISO(dateString), 'MMM d, yyyy') : null;

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) return <div className="p-10 text-center"><p>Could not load profile.</p></div>;

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "New User";

  const tabItems = [
    { id: "goal" as Section, label: "Goal", icon: FaBullseye },
    { id: "settings" as Section, label: "Account Settings", icon: FaCog },
  ];

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
                <img src={`/avatars/${getAvatarFile(editData.avatar_id)}`} alt="Selected Avatar" className="w-20 h-20 rounded-full border-4 border-black shadow-lg" />
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
                      <img
                        src={`/avatars/${avatar.file}`}
                        alt={`Avatar ${avatar.id}`}
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
      <div className="min-h-[calc(100vh-150px)] p-4 md:p-8 pt-20 md:pt-24">
        <div className="max-w-3xl mx-auto">
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
          <div className="card p-6 sm:p-8">
            {/* Avatar - Centered at top */}
            <div className="flex justify-center -mt-16 sm:-mt-20 mb-6">
              <div className="relative group cursor-pointer" onClick={() => { setEditData(profile); setIsAvatarModalOpen(true); }}>
                <img
                  src={`/avatars/${getAvatarFile(profile.avatar_id)}`}
                  alt="User Avatar"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-black shadow-lg transition-all group-hover:blur-sm group-hover:grayscale"
                />
                {/* Camera icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-white border-4 border-black rounded-full p-3 sm:p-4">
                    <FaCamera className="text-black text-xl sm:text-2xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Name and Email */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{fullName}</h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1 break-all">{profile.email}</p>
              {profile.is_admin && (
                <p className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-semibold border-2 border-yellow-400">
                  <FaShieldAlt /> <span>Administrator</span>
                </p>
              )}
            </div>

            {/* Edit Profile Button */}
            <div className="flex justify-center mb-6">
              <button onClick={openEditModal} className="btn flex items-center gap-2">
                <FaEdit /> <span>Edit Profile</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-2 mb-6 border-b-2 border-gray-200 pb-2">
              {tabItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t transition-all ${
                      isActive
                        ? "bg-black text-white font-bold"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="text-base" />
                    <span className="text-sm sm:text-base">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              {/* Goal Section */}
              {activeSection === "goal" && (
                <div className="animate-fade-in">
                  <dl className="space-y-6">
                    <div>
                      <dt className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                        <FaBullseye /> Active Goal
                      </dt>
                      <dd className="text-gray-800 text-base sm:text-lg">
                        {profile.goal || <span className="text-gray-400 italic">Not set</span>}
                      </dd>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t-2 border-dashed">
                      <div>
                        <dt className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                          <FaCalendarPlus /> Start Date
                        </dt>
                        <dd className="text-gray-800 text-base sm:text-lg">
                          {formatDate(profile.start_date) || <span className="text-gray-400 italic">Not set</span>}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                          <FaCalendarCheck /> Target Date
                        </dt>
                        <dd className="text-gray-800 text-base sm:text-lg">
                          {formatDate(profile.end_date) || <span className="text-gray-400 italic">Not set</span>}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>
              )}

              {/* Account Settings Section */}
              {activeSection === "settings" && (
                <div className="animate-fade-in">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
              )}
            </div>

            {/* Logout Button at bottom of card */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded bg-red-50 hover:bg-red-100 border-2 border-red-300 hover:border-red-500 text-red-700 font-bold transition-all"
              >
                <FaSignOutAlt className="text-lg" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
