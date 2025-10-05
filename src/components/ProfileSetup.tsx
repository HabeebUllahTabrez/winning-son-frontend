"use client";

import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { FaArrowRight, FaRocket, FaArrowLeft, FaCheck } from "react-icons/fa";
import { AVATAR_MAP } from "@/lib/avatars";
import { formatDateForAPI } from "@/lib/dateUtils";
import { format, parseISO, differenceInDays } from "date-fns";
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

type SetupStep = 'welcome' | 'name' | 'avatar' | 'goal_dates' | 'complete';

// 2. Define the key to be consistent with the ProfileSetupGuard
const GUEST_PROFILE_KEY = "guestProfileData";

const GOAL_EXAMPLES = [
  "Run 3 miles 3 times per week",
  "Lose 10 pounds",
  "Read 20 books this year",
  "Learn Python and build 3 projects",
  "Meditate for 20 minutes daily",
  "Save $5000 for vacation",
  "Get promoted to Senior Developer",
];

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

  const steps: SetupStep[] = ['welcome', 'name', 'avatar', 'goal_dates', 'complete'];

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const getStepNumber = () => {
    // Don't count 'welcome' and 'complete' as numbered steps
    const numberedSteps: SetupStep[] = ['name', 'avatar', 'goal_dates'];
    return numberedSteps.indexOf(currentStep) + 1;
  };

  const getTotalSteps = () => {
    return steps.filter(s => s !== 'welcome' && s !== 'complete').length;
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
  
  // Progress Indicator Component
  const ProgressIndicator = () => {
    if (currentStep === 'welcome' || currentStep === 'complete') return null;

    const stepNumber = getStepNumber();
    const totalSteps = getTotalSteps();
    const progress = (stepNumber / totalSteps) * 100;

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {stepNumber} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    // This entire render logic does not need to change, as the UI is the same for both users.
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="text-6xl mb-4 animate-bounce">🚀</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome to WinningSon!
            </h1>
            <div className="space-y-4 text-left max-w-lg mx-auto bg-blue-50 p-6 rounded-lg">
              <p className="text-lg text-gray-700 font-medium">
                Take control of your personal narrative.
              </p>
              <p className="text-gray-600">
                We help you learn from your own unique data, understand the &apos;why&apos; behind your patterns, and build a life of accountability, purpose, and deliberate progress.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Track your daily wins and activities effortlessly</span>
                </div>
                <div className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Get AI-powered insights from your own data</span>
                </div>
                <div className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>See your progress toward meaningful goals</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 italic">
              Let&apos;s set up your profile so you can start your journey!
            </p>
            <button onClick={handleNext} className="btn flex items-center gap-2 mx-auto text-lg px-6 py-3">
              Get Started <FaArrowRight />
            </button>
          </div>
        );

      case 'name':
        return (
          <div className="space-y-6">
            <ProgressIndicator />
            <div className="text-center space-y-6">
              <div className="text-4xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-gray-800">What&apos;s your name?</h2>
              <p className="text-gray-600">Let&apos;s start with the basics!</p>
              <div className="max-w-lg mx-auto space-y-4">
                <div>
                  <label className="block text-left text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Your first name"
                    className="input text-lg"
                    maxLength={20}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-left text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && profileData.first_name.trim() && profileData.last_name.trim()) {
                        handleNext();
                      }
                    }}
                    placeholder="Your last name"
                    className="input text-lg"
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleBack}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FaArrowLeft /> Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!profileData.first_name.trim() || !profileData.last_name.trim()}
                  className="btn flex items-center gap-2"
                >
                  Next <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        );

      case 'avatar':
        return (
          <div className="space-y-6">
            <ProgressIndicator />
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
                          ? "ring-2 ring-black bg-gray-200 scale-105"
                          : "hover:bg-gray-100 hover:scale-105"
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

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleBack}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FaArrowLeft /> Back
                </button>
                <button onClick={handleNext} className="btn flex items-center gap-2">
                  Next <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        );

      case 'goal_dates':
        const daysToGoal = profileData.start_date && profileData.end_date
          ? differenceInDays(parseISO(profileData.end_date), parseISO(profileData.start_date))
          : 0;

        return (
          <div className="space-y-6">
            <ProgressIndicator />
            <div className="text-center space-y-6">
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-gray-800">Let&apos;s define your goal and timeline!</h2>

              {/* Goal Section */}
              <div className="max-w-lg mx-auto text-left space-y-4">
                <div className="bg-amber-50 p-5 rounded-lg space-y-3">
                  <label className="block text-gray-700 font-medium">
                    What&apos;s the single most important goal you&apos;re ready to tackle?
                  </label>
                  <div className="bg-white p-3 rounded border border-amber-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">💡 Make it specific and measurable!</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        <span className="line-through">Get fit</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="font-medium">Run 3 miles 3 times per week</span>
                      </p>
                    </div>
                  </div>
                  <details className="text-sm text-gray-600">
                    <summary className="cursor-pointer font-medium hover:text-gray-800">
                      Need inspiration? Click for examples
                    </summary>
                    <div className="mt-2 space-y-1 pl-4">
                      {GOAL_EXAMPLES.map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleInputChange('goal', example)}
                          className="block text-left hover:text-blue-600 hover:underline w-full"
                        >
                          • {example}
                        </button>
                      ))}
                    </div>
                  </details>
                </div>

                <div>
                  <textarea
                    value={profileData.goal}
                    onChange={(e) => handleInputChange('goal', e.target.value)}
                    placeholder="Your goal here..."
                    className="input text-left text-base w-full min-h-[80px] resize-none"
                    maxLength={150}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {profileData.goal.length}/150 characters
                  </p>
                </div>

                {/* Dates Section */}
                <div className="pt-4 border-t-2 border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Set your timeline</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={profileData.start_date}
                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                        className="input text-base"
                        min={formatDateForAPI(new Date())}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={profileData.end_date}
                        onChange={(e) => handleInputChange('end_date', e.target.value)}
                        className="input text-base"
                        min={profileData.start_date || formatDateForAPI(new Date())}
                      />
                    </div>
                  </div>

                  {profileData.start_date && profileData.end_date && daysToGoal > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg text-center">
                      <p className="text-sm font-medium text-blue-800">
                        🎯 You&apos;ll have <span className="font-bold">{daysToGoal} days</span> to achieve your goal!
                      </p>
                    </div>
                  )}
                  {profileData.end_date && daysToGoal <= 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠️ End date must be after start date
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleBack}
                  className="btn-secondary flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  <FaArrowLeft /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!profileData.goal.trim() || !profileData.start_date.trim() || !profileData.end_date.trim() || isSubmitting || daysToGoal <= 0}
                  className="btn flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Setting Up...
                    </>
                  ) : (
                    <>
                      <FaRocket /> Complete Setup
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'complete':
        const totalDays = profileData.start_date && profileData.end_date
          ? differenceInDays(parseISO(profileData.end_date), parseISO(profileData.start_date))
          : 0;

        return (
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              You&apos;re all set, {profileData.first_name}!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your journey to becoming the architect of your own life starts now.
            </p>

            <div className="max-w-lg mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg space-y-4 border-2 border-blue-200">
                <div className="flex items-center justify-center gap-4">
                  <Image
                    src={`/avatars/${AVATAR_MAP.find(a => a.id === profileData.avatar_id)?.file}`}
                    alt="Your avatar"
                    width={80}
                    height={80}
                    className="rounded-full ring-4 ring-white shadow-lg"
                  />
                  <div className="text-left">
                    <p className="font-bold text-xl text-gray-800">
                      {profileData.first_name} {profileData.last_name}
                    </p>
                    <p className="text-sm text-gray-500">Ready to win!</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm space-y-2 text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🎯</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Your Goal</p>
                      <p className="font-medium text-gray-800">{profileData.goal}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Start Date</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {format(parseISO(profileData.start_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Target Date</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {format(parseISO(profileData.end_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-gray-500 uppercase">Timeline</p>
                    <p className="text-lg font-bold text-blue-600">
                      {totalDays} days to achieve your goal!
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">💡 What&apos;s next?</span> Start logging your daily wins and activities.
                  Our AI will analyze your patterns and help you learn from your own data to stay on track!
                </p>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/dashboard'}
              className="btn flex items-center gap-2 mx-auto text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-shadow"
            >
              <FaRocket /> Go to Dashboard
            </button>

            <p className="text-xs text-gray-500">
              You can update your profile anytime from settings
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="card p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
