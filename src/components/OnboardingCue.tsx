"use client";

import { useState } from "react";
import { FaTimes, FaScroll, FaMagic, FaArrowRight, FaLightbulb } from "react-icons/fa";
import clsx from "clsx";

interface OnboardingCueProps {
  type: "first-log" | "analyzer";
  onDismiss: () => void;
}

/**
 * A dramatic, funny, and engaging onboarding cue component
 * that guides users to create their first log or use the analyzer.
 */
export default function OnboardingCue({ type, onDismiss }: OnboardingCueProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300); // Match animation duration
  };

  const content = type === "first-log" ? {
    icon: <FaScroll className="text-5xl text-yellow-600" />,
    title: "The Journey Begins Here...",
    message: "Every legend starts with a single entry. Your destiny awaits in the journal—don't leave it hanging! 📜",
    subtitle: "Create your first log and watch the magic unfold.",
    ctaText: "Begin My Saga",
    ctaLink: "/journal",
    dismissText: "Not today, destiny",
  } : {
    icon: <FaMagic className="text-5xl text-purple-600" />,
    title: "Behold! The Analyzer Beckons...",
    message: "You've documented your journey. Now, let the alchemist's console reveal the hidden patterns in your chaos. ⚗️",
    subtitle: "Transform your logs into actionable wisdom.",
    ctaText: "Unlock The Secrets",
    ctaLink: "/analyzer",
    dismissText: "Maybe later, wizard",
  };

  return (
    <div
      className={clsx(
        "fixed bottom-8 right-8 z-50 max-w-md transform transition-all duration-300",
        isExiting ? "translate-x-[120%] opacity-0" : "translate-x-0 opacity-100"
      )}
    >
      <div className="card bg-gradient-to-br from-yellow-50 via-white to-purple-50 border-4 border-black shadow-2xl p-6 space-y-4 relative">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Dismiss onboarding cue"
        >
          <FaTimes className="text-gray-600" />
        </button>

        {/* Icon */}
        <div className="flex justify-center animate-bounce-slow">
          {content.icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-center leading-tight">
          {content.title}
        </h3>

        {/* Message */}
        <p className="text-lg text-gray-700 text-center">
          {content.message}
        </p>

        {/* Subtitle with lightbulb */}
        <div className="flex items-center gap-2 justify-center text-sm text-gray-600 italic">
          <FaLightbulb className="text-yellow-500" />
          <span>{content.subtitle}</span>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <a
            href={content.ctaLink}
            className="btn text-lg flex items-center justify-center gap-2 group"
          >
            {content.ctaText}
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </a>
          <button
            onClick={handleDismiss}
            className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            {content.dismissText}
          </button>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-500 -translate-x-2 -translate-y-2"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 translate-x-2 translate-y-2"></div>
      </div>
    </div>
  );
}
