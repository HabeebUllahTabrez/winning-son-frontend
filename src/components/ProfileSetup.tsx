"use client";

import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { FaArrowRight, FaRocket } from "react-icons/fa";
import { AVATAR_MAP } from "@/lib/avatars";
import { formatDateForAPI } from "@/lib/dateUtils";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import { isGuestUser } from "@/lib/guest"; // 1. Import the guest check function

const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

type ProfileSetupData = {
  first_name: string;
  last_name: string;
  avatar_id: number;
  goal: string;
  start_date: string;
  end_date: string;
};

type SetupStep = 'welcome' | 'first_name' | 'last_name' | 'avatar' | 'goal' | 'start_date' | 'end_date' | 'complete';

// 2. Define the key to be consistent with the ProfileSetupGuard
const GUEST_PROFILE_KEY = "guestProfileData";

export function ProfileSetup() {
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
  const [profileData, setProfileData] = useState<ProfileSetupData>({
    first_name: '',
    last_name: '',
    avatar_id: 1,
    goal: '',
    start_date: '',
    end_date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth header no longer needed - httpOnly cookies handle authentication
  // Keeping this function for backward compatibility but it returns empty object
  const authHeader = useCallback(() => {
    return {};
  }, []);

  const handleNext = () => {
    const steps: SetupStep[] = ['welcome', 'first_name', 'last_name', 'avatar', 'goal', 'start_date', 'end_date', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (currentStep === 'welcome' ||
          (currentStep === 'first_name' && profileData.first_name.trim()) ||
          (currentStep === 'last_name' && profileData.last_name.trim()) ||
          (currentStep === 'avatar') ||
          (currentStep === 'goal' && profileData.goal.trim()) ||
          (currentStep === 'start_date' && profileData.start_date.trim()) ||
          (currentStep === 'end_date' && profileData.end_date.trim())) {
        handleNext();
      } else if (currentStep === 'end_date' && profileData.end_date.trim()) {
        handleSubmit();
      }
    }
  };

  const handleInputChange = (field: keyof ProfileSetupData, value: string | number) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // 3. Update the handleSubmit function to handle both guest and authenticated users
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const isGuest = isGuestUser();

    try {
      // --- GUEST LOGIC ---
      if (isGuest) {
        console.log("Saving profile for guest user to localStorage.");
        localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profileData));
        // also update user in object in dashboard stats
        const guestStats = localStorage.getItem("guestStats");
        if (guestStats) {
          const stats = JSON.parse(guestStats);
          stats.user = { ...stats.user, 
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            avatar_id: profileData.avatar_id,
            goal: profileData.goal,
            start_date: profileData.start_date,
            end_date: profileData.end_date,
            is_admin: false
           };
          localStorage.setItem("guestStats", JSON.stringify(stats));
        }
      } 
      // --- AUTHENTICATED USER LOGIC ---
      else {
        const payload = {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          avatar_id: profileData.avatar_id,
          goal: profileData.goal,
          start_date: profileData.start_date,
          end_date: profileData.end_date,
        };

        const res = await apiFetch("/api/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeader() },
          data: payload,
        });

        if (res.status !== 204) throw new Error(res.data || "Failed to save profile.");
      }
      
      toast.success("Profile setup complete! 🎉");
      setCurrentStep('complete');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStep = () => {
    // This entire render logic does not need to change, as the UI is the same for both users.
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🚀</div>
            <h1 className="text-3xl font-bold text-gray-800">Alright, future goal-crusher!</h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Let&apos;s get this show on the road. I&apos;m here to help you set up your profile so we can track your epic journey to success!
            </p>
            <button onClick={handleNext} className="btn flex items-center gap-2 mx-auto">
              Let&apos;s Do This! <FaArrowRight />
            </button>
          </div>
        );

      case 'first_name':
        return (
          <div className="text-center space-y-6">
            <div className="text-4xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-gray-800">What&apos;s the name I should be cheering for?</h2>
            <div className="max-w-sm mx-auto">
              <input
                type="text"
                value={profileData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Your first name"
                className="input text-center text-lg"
                maxLength={20}
                autoFocus
              />
            </div>
            <button 
              onClick={handleNext} 
              disabled={!profileData.first_name.trim()}
              className="btn flex items-center gap-2 mx-auto"
            >
              Next <FaArrowRight />
            </button>
          </div>
        );

      case 'last_name':
        return (
          <div className="text-center space-y-6">
            <div className="text-4xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Perfect, {profileData.first_name}! Now for the grand finale of your name.
            </h2>
            <p className="text-gray-600">What&apos;s the last name so I can make this official?</p>
            <div className="max-w-sm mx-auto">
              <input
                type="text"
                value={profileData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Your last name"
                className="input text-center text-lg"
                maxLength={20}
                autoFocus
              />
            </div>
            <button 
              onClick={handleNext} 
              disabled={!profileData.last_name.trim()}
              className="btn flex items-center gap-2 mx-auto"
            >
              Next <FaArrowRight />
            </button>
          </div>
        );

      case 'avatar':
        return (
          <div className="text-center space-y-6">
            <div className="text-4xl mb-4">🎭</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Awesome, {profileData.first_name}! Now let&apos;s put a face to that soon-to-be-famous name!
            </h2>
            <p className="text-gray-600">Pick an avatar that represents your winning spirit:</p>
            
            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {AVATAR_MAP.map(({ id, file }) => (
                  <button
                    key={id}
                    onClick={() => handleInputChange('avatar_id', id)}
                    className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black ${
                      profileData.avatar_id === id
                        ? "ring-2 ring-black bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Image
                      src={`/avatars/${file}`}
                      alt={`Avatar option ${id}`}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <button onClick={handleNext} className="btn flex items-center gap-2 mx-auto">
              Next <FaArrowRight />
            </button>
          </div>
        );

      case 'goal':
        return (
          <div className="text-center space-y-6">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-800">Alright, the big one!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              What&apos;s the single most important goal you&apos;re ready to tackle right now? 
              <br /><br />
              <strong>Tip:</strong> Make it specific and measurable! Instead of &quot;get fit&quot;, try &quot;run 3 miles 3 times per week&quot; or &quot;lose 10 pounds&quot;. This helps our AI give you better insights!
            </p>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={profileData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Run 3 miles 3 times per week, Lose 10 pounds, Read 20 books"
                className="input text-center text-lg"
                maxLength={100}
                autoFocus
              />
            </div>
            <button 
              onClick={handleNext} 
              disabled={!profileData.goal.trim()}
              className="btn flex items-center gap-2 mx-auto"
            >
              Next <FaArrowRight />
            </button>
          </div>
        );

      case 'start_date':
        return (
          <div className="text-center space-y-6">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-800">When do you want to start?</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Pick the date you want to begin your journey. You can start today or pick a future date!
            </p>
            <div className="max-w-md mx-auto">
              <input
                type="date"
                value={profileData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                onKeyPress={handleKeyPress}
                className="input text-center text-lg"
                min={formatDateForAPI(new Date())}
                autoFocus
              />
            </div>
            <button 
              onClick={handleNext} 
              disabled={!profileData.start_date.trim()}
              className="btn flex items-center gap-2 mx-auto"
            >
              Next <FaArrowRight />
            </button>
          </div>
        );

      case 'end_date':
        return (
          <div className="text-center space-y-6">
            <div className="text-4xl mb-4">🏁</div>
            <h2 className="text-2xl font-bold text-gray-800">When do you want to finish?</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Set your finish line! When do you want to accomplish this goal?
            </p>
            <div className="max-w-md mx-auto">
              <input
                type="date"
                value={profileData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                onKeyPress={handleKeyPress}
                className="input text-center text-lg"
                min={profileData.start_date || formatDateForAPI(new Date())}
                autoFocus
              />
            </div>
            <button 
              onClick={handleSubmit} 
              disabled={!profileData.end_date.trim() || isSubmitting}
              className="btn flex items-center gap-2 mx-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Setting Up...
                </>
              ) : (
                <>
                  <FaRocket /> Let&apos;s Get Started!
                </>
              )}
            </button>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800">And just like that, you&apos;re all set!</h2>
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Image
                  src={`/avatars/${AVATAR_MAP.find(a => a.id === profileData.avatar_id)?.file}`}
                  alt="Your avatar"
                  width={64}
                  height={64}
                />
                  <div className="text-left">
                    <p className="font-semibold">{profileData.first_name} {profileData.last_name}</p>
                    <p className="text-sm text-gray-600">Goal: {profileData.goal}</p>
                    <p className="text-sm text-gray-600">Start: {format(parseISO(profileData.start_date),"dd/MM/yyyy")}</p>
                    <p className="text-sm text-gray-600">End: {format(parseISO(profileData.end_date), "dd/MM/yyyy")}</p>
                  </div>
              </div>
              <p className="text-gray-600">
                I&apos;ve got your info logged and your mission locked in. Remember, you can tweak any of this from your profile page anytime.
              </p>
              <p className="font-bold text-lg">Now, go get &apos;em! 🚀</p>
            </div>
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="btn flex items-center gap-2 mx-auto"
            >
              <FaRocket /> Go to Dashboard
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card p-8 space-y-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
