"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { FaBullseye, FaEdit, FaCloudUploadAlt, FaShieldAlt } from "react-icons/fa";
import { ProfileSkeleton } from "./_components/ProfileSkeleton";
import { AVATAR_MAP } from "@/lib/avatars";
import { isGuestUser } from "@/lib/guest";
import { CreateAccountForm } from "./_components/CreateAccountForm";
import { Modal } from "./_components/Modal";
import { format, parseISO } from "date-fns";
import { AvatarPicker } from "./_components/AvatarPicker";

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

// HELPER: Renders a field's value or a placeholder.
const DisplayValue = ({ children, className = "text-gray-800" }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children || <span className="text-gray-400">Not set</span>}</div>
);

// HELPER: An input field for the edit modal.
const FormInput = ({ label, name, value, onChange, type = "text", placeholder = "" }: any) => (
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

  // --- Data Loading Logic (Unchanged) ---
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

  // --- Modal & Saving Logic (Unchanged) ---
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
  
  // --- Helpers (Unchanged) ---
  const getAvatarFile = (id: number) => AVATAR_MAP.find(a => a.id === id)?.file || "avatar-1.png";
  const formatDate = (dateString: string | null) => dateString ? format(parseISO(dateString), 'MMM d, yyyy') : null;

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) return <div className="p-10 text-center"><p>Could not load profile.</p></div>;

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "New User";

  return (
    <>
      {/* --- Modals (Unchanged) --- */}
      <Modal isOpen={isCreateAccountModalOpen} onClose={() => setIsCreateAccountModalOpen(false)} title="Create a Free Account" backdropClassName="backdrop-blur-sm">
        <CreateAccountForm />
      </Modal>
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Your Profile" backdropClassName="backdrop-blur-sm">
        {editData && (
          <>
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                  <img
                      src={`/avatars/${getAvatarFile(editData.avatar_id)}`}
                      alt="Selected Avatar"
                      className="w-24 h-24 rounded-full border-4 border-white shadow-md"
                  />
                  <AvatarPicker
                      currentAvatarId={editData.avatar_id}
                      onSelectAvatar={handleAvatarChange}
                  />
              </div>
              <hr />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="First Name" name="first_name" value={editData.first_name} onChange={handleInputChange} />
                  <FormInput label="Last Name" name="last_name" value={editData.last_name} onChange={handleInputChange} />
              </div>
              <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Your Goal</label>
                  <textarea id="goal" name="goal" value={editData.goal || ""} onChange={handleInputChange} className="input w-full" rows={3} placeholder="e.g., Complete a marathon"/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="Start Date" name="start_date" value={editData.start_date?.split("T")[0]} onChange={handleInputChange} type="date"/>
                  <FormInput label="End Date" name="end_date" value={editData.end_date?.split("T")[0]} onChange={handleInputChange} type="date"/>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3 -mx-6 -mb-6 mt-6">
                <button onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="btn">{isSaving ? "Saving..." : "Save Changes"}</button>
            </div>
          </>
        )}
      </Modal>

      {/* --- Main Page Content --- */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {isGuest && (
             <div className="p-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Your Progress is Saved Locally</h3>
                  <p className="text-gray-600 mt-1">Create an account to sync across devices.</p>
                </div>
                <button onClick={() => setIsCreateAccountModalOpen(true)} className="btn mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 flex items-center">
                  <FaCloudUploadAlt className="mr-2"/> Create Free Account
                </button>
              </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="flex-shrink-0">
                    <img
                        src={`/avatars/${getAvatarFile(profile.avatar_id)}`}
                        alt="User Avatar"
                        className="w-28 h-28 rounded-full border-4 border-white shadow-md"
                    />
                </div>
                <div className="flex-grow text-center sm:text-left w-full">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
                            <p className="text-md text-gray-500">{profile.email}</p>
                             {profile.is_admin && (
                               <p className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                <FaShieldAlt /> Administrator
                              </p>
                            )}
                        </div>
                        {/* --- UPDATED: Edit button now stacks vertically on mobile --- */}
                        <button onClick={openEditModal} className="btn-secondary w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center p-2 sm:p-2 sm:px-4 rounded-lg">
                            <FaEdit className="mb-1 sm:mb-0 sm:mr-2 h-5 w-5"/>
                            <span className="text-sm sm:text-base">Edit Profile</span>
                        </button>
                    </div>
                </div>
            </div>

            <hr className="my-8" />

            <div className="space-y-8">
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3"><FaBullseye/> Active Goal</h3>
                    <DisplayValue className="text-gray-700 text-lg leading-relaxed">{profile.goal}</DisplayValue>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Start Date</h3>
                        <DisplayValue className="font-semibold text-gray-700 mt-2">{formatDate(profile.start_date)}</DisplayValue>
                     </div>
                     <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">End Date</h3>
                        <DisplayValue className="font-semibold text-gray-700 mt-2">{formatDate(profile.end_date)}</DisplayValue>
                     </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
