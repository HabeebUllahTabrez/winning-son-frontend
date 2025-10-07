// src/app/dashboard/_components/CallToAction.tsx
"use client";

import { trackEvent } from "@/lib/mixpanel";

type CallToActionProps = {
    hasEntryToday: boolean;
};

export function CallToAction({ hasEntryToday }: CallToActionProps) {
    // --- State 1: User HAS logged their accomplishments for the day ---
    if (hasEntryToday) {
        return (
            <div className="card bg-green-50 border-green-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    {/* A fun, game-like "level complete" heading */}
                    <h2 className="text-xl font-bold text-green-800">Productivity Level: Max!</h2>
                    {/* Acknowledges their hard work and encourages rest */}
                    <p className="text-green-700">
                        Another productive day in the books. Time to recharge for tomorrow&apos;s mission.
                    </p>
                </div>
                {/* A powerful and funny button text */}
                <a href="/submissions" className="btn-secondary whitespace-nowrap" onClick={() => trackEvent("Review Submission Clicked from Dashboard")}>
                    Review My Submission
                </a>
            </div>
        );
    }

    // --- State 2: User has NOT YET logged their accomplishments ---
    return (
        <div className="card bg-blue-50 border-blue-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                {/* An empowering, action-oriented headline */}
                <h2 className="text-xl font-bold text-blue-800">What Did You Conquer Today?</h2>
                {/* A clever and motivating call to action */}
                <p className="text-blue-700">
                    Turn that to-do list into a ta-da list. Let&apos;s get your wins on the record.
                </p>
            </div>
            {/* A clear and exciting button text */}
            <a href="/journal" className="btn whitespace-nowrap" onClick={() => trackEvent("Log Wins Clicked from Dashboard")}>
                Log My Wins
            </a>
        </div>
    );
}
