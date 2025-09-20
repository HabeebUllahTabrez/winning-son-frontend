// src/app/profile/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link"; // Import the Link component
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { FaBullseye, FaEdit, FaCloudUploadAlt, FaShieldAlt, FaCalendarCheck, FaCalendarPlus, FaUserShield, FaArrowRight } from "react-icons/fa"; // Added new icons
import { ProfileSkeleton } from "./_components/ProfileSkeleton";
import { AVATAR_MAP } from "@/lib/avatars";
import { isGuestUser } from "@/lib/guest";
import { CreateAccountForm } from "../../components/CreateAccountForm";
import { Modal } from "../../components/Modal";
import { format, parseISO } from "date-fns";
import { AvatarPicker } from "./_components/AvatarPicker";

// --- (No changes to types or helper components) ---
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

// --- MAIN PROFILE PAGE COMPONENT ---

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editData, setEditData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // --- (No changes to data loading, saving, or event handlers) ---
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
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load your profile."); } 
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadUserData(); }, [loadUserData]);

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
      setProfile(editData);
      setIsEditModalOpen(false);
    } catch (error) { toast.error(error instanceof Error ? error.message : "An error occurred."); } 
    finally { setIsSaving(false); }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => (prev ? { ...prev, [name]: value } : null));
  };
  
  const handleAvatarChange = (avatarId: number) => {
    setEditData(prev => (prev ? { ...prev, avatar_id: avatarId } : null));
  };
  
  const getAvatarFile = (id: number) => AVATAR_MAP.find(a => a.id === id)?.file || "avatar-1.png";
  const formatDate = (dateString: string | null) => dateString ? format(parseISO(dateString), 'MMM d, yyyy') : null;

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) return <div className="p-10 text-center"><p>Could not load profile.</p></div>;

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "New User";

  return (
    <>
      {/* --- MODALS (Unchanged) --- */}
      <Modal isOpen={isCreateAccountModalOpen} onClose={() => setIsCreateAccountModalOpen(false)} title="Create a Free Account" backdropClassName="backdrop-blur-sm">
        <CreateAccountForm closeModal={() => setIsCreateAccountModalOpen(false)} />
      </Modal>
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Your Profile" backdropClassName="backdrop-blur-sm">
        {editData && (
          <>
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                  <img src={`/avatars/${getAvatarFile(editData.avatar_id)}`} alt="Selected Avatar" className="w-24 h-24 rounded-full border-4 border-black shadow-lg" />
                  <AvatarPicker currentAvatarId={editData.avatar_id} onSelectAvatar={handleAvatarChange} />
              </div>
              <hr />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="First Name" name="first_name" value={editData.first_name} onChange={handleInputChange} />
                  <FormInput label="Last Name" name="last_name" value={editData.last_name} onChange={handleInputChange} />
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
                <button onClick={() => setIsEditModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="btn">{isSaving ? "Saving..." : "Save Changes"}</button>
            </div>
          </>
        )}
      </Modal>

      {/* --- MAIN PAGE LAYOUT --- */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4">
        <div className="w-full max-w-md space-y-6">

          {isGuest && (
             <div className="p-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left bg-yellow-50 border-2 border-black rounded-lg shadow-[4px_4px_0_0_#000]">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Your Progress is Local!</h3>
                  <p className="text-gray-600 mt-1">Create an account to save your wins permanently.</p>
                </div>
                <button onClick={() => setIsCreateAccountModalOpen(true)} className="btn mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                  <FaCloudUploadAlt className="mr-2"/> Save to Cloud
                </button>
              </div>
          )}

          <div className="relative w-full">
            <div className="pt-16">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                    <img
                        src={`/avatars/${getAvatarFile(profile.avatar_id)}`}
                        alt="User Avatar"
                        className="w-28 h-28 rounded-full border-4 border-black shadow-lg bg-white"
                    />
                </div>
                
                <div className="card p-6 pt-20 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
                    <p className="text-md text-gray-500 break-all">{profile.email}</p>
                    {profile.is_admin && (
                        <p className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-300">
                        <FaShieldAlt /> Administrator
                        </p>
                    )}

                    <div className="my-6">
                        <button onClick={openEditModal} className="btn btn-outline w-full flex items-center w-full m-auto justify-center sm:w-auto">
                            <FaEdit className="mr-2"/> Edit Profile
                        </button>
                    </div>

                    <dl className="text-left space-y-5">
                        <div>
                            <dt className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <FaBullseye /> Active Goal
                            </dt>
                            <dd className="mt-1 text-gray-800 text-lg">
                                {profile.goal || <span className="text-gray-400">Not set</span>}
                            </dd>
                        </div>
                        <div className="flex flex-wrap justify-between gap-4 pt-4 border-t-2 border-dashed">
                            <div className="flex-1 min-w-[120px]">
                                <dt className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <FaCalendarPlus /> Start Date
                                </dt>
                                <dd className="mt-1 text-gray-800 text-lg">
                                    {formatDate(profile.start_date) || <span className="text-gray-400">Not set</span>}
                                </dd>
                            </div>
                            <div className="flex-1 min-w-[120px]">
                                <dt className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <FaCalendarCheck /> Target Date
                                </dt>
                                <dd className="mt-1 text-gray-800 text-lg">
                                    {formatDate(profile.end_date) || <span className="text-gray-400">Not set</span>}
                                </dd>
                            </div>
                        </div>
                    </dl>
                </div>
            </div>
          </div>
          
          {/* --- NEW: ADMIN TOOLS PANEL (Conditionally Rendered) --- */}
          {profile.is_admin && (
            <div className="card p-6 text-center">
              <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                <FaUserShield />
                Administrator Tools
              </h2>
              <p className="text-gray-600 mt-2 mb-4">
                You have access to the admin panel to manage the application.
              </p>
              <Link href="/admin" className="btn w-full sm:w-auto inline-flex items-center justify-center">
                Access Admin Panel
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
