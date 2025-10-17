"use client";

import { useState } from "react";
import { FaTimes, FaScroll, FaMagic, FaArrowRight, FaStar } from "react-icons/fa";
import clsx from "clsx";

interface OnboardingBannerProps {
  type: "first-log" | "analyzer";
  onDismiss: () => void;
}

/**
 * An inline banner version of the onboarding cue
 * for better integration into page layouts.
 */
export default function OnboardingBanner({ type, onDismiss }: OnboardingBannerProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const content = type === "first-log" ? {
    bgGradient: "from-yellow-100 via-yellow-50 to-white",
    borderColor: "border-yellow-600",
    icon: <FaScroll className="text-4xl text-yellow-600" />,
    badge: "🎭 QUEST UNLOCKED",
    title: "Your First Log Awaits, Brave Soul!",
    message: "The blank page trembles with anticipation. Will you write your first entry, or leave it weeping in the void? (Spoiler: The page has feelings. Don't be that person.)",
    ctaText: "Yes, I Shall Write!",
    ctaLink: "/journal",
    accentColor: "yellow",
  } : {
    bgGradient: "from-purple-100 via-purple-50 to-white",
    borderColor: "border-purple-600",
    icon: <FaMagic className="text-4xl text-purple-600" />,
    badge: "✨ POWER-UP AVAILABLE",
    title: "The Analyzer Hungers for Your Data...",
    message: "You've been journaling like a champion. But are you ready to see what dark secrets (or brilliant insights) lie within? Our mystical analyzer awaits—think of it as a fortune cookie, but with actual advice.",
    ctaText: "Show Me The Magic!",
    ctaLink: "/analyzer",
    accentColor: "purple",
  };

  return (
    <div
      className={clsx(
        "overflow-hidden transition-all duration-300",
        isExiting ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
      )}
    >
      <div className={clsx(
        "relative card border-4 p-6 space-y-4 bg-gradient-to-r",
        content.bgGradient,
        content.borderColor
      )}>
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/50 transition-colors"
          aria-label="Dismiss banner"
        >
          <FaTimes className="text-gray-600" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
          <FaStar className="text-yellow-400" />
          {content.badge}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Icon */}
          <div className="flex-shrink-0 animate-pulse">
            {content.icon}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <h3 className="text-2xl font-bold leading-tight">
              {content.title}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {content.message}
            </p>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <a
              href={content.ctaLink}
              className={clsx(
                "btn text-lg flex items-center gap-2 group whitespace-nowrap",
                content.accentColor === "yellow" && "bg-yellow-600 hover:bg-yellow-700 border-yellow-800",
                content.accentColor === "purple" && "bg-purple-600 hover:bg-purple-700 border-purple-800 text-white"
              )}
            >
              {content.ctaText}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Decorative sparkles */}
        <div className="absolute top-2 left-2 text-2xl opacity-50">✨</div>
        <div className="absolute bottom-2 right-16 text-2xl opacity-50">⚡</div>
      </div>
    </div>
  );
}
