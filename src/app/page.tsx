// app/page.tsx
"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaRocket, FaChartLine, FaMagic, FaBolt, FaFire, FaTrophy } from "react-icons/fa";
import { getGuestId } from "@/lib/guest";

// Animated Feature Card with Tilt Effect
function FeatureCard({
  icon,
  title,
  description,
  color,
  delay
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: string;
}) {
  return (
    <div
      className={`card p-6 space-y-4 hover:scale-105 hover:-rotate-1 transition-all duration-300 ${delay}`}
      style={{ animationDelay: delay }}
    >
      <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center border-2 ${color.replace('bg-', 'border-')}`}>
        {icon}
      </div>
      <h3 className="text-xl md:text-2xl font-bold">{title}</h3>
      <p className="text-base text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
}

// Stats Counter Component
function StatBox({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-blue-600">{number}</div>
      <div className="text-sm md:text-base text-gray-600 mt-2">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const [authStatus, setAuthStatus] = useState<"loading" | "authed" | "unauthed">("loading");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiFetch("/api/auth/check");
        if (res.status === 200 && res.data?.authenticated) {
          setAuthStatus("authed");
          router.push("/dashboard");
        } else {
          setAuthStatus("unauthed");
        }
      } catch {
        setAuthStatus("unauthed");
      }
    };

    checkAuth();
  }, [router]);

  const handleGuestMode = () => {
    getGuestId();
    router.push("/dashboard");
  };

  if (authStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl animate-pulse">
        Loading...
      </div>
    );
  }

  if (authStatus === "authed") {
    return null;
  }

  return (
    <main className="bg-gray-50">

      {/* HERO SECTION - Dramatic & Funny */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-b-4 border-black">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">💪</div>
        <div className="absolute bottom-20 right-20 text-6xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }}>🔥</div>
        <div className="absolute top-1/2 left-1/4 text-4xl opacity-10">📊</div>
        <div className="absolute top-1/3 right-1/3 text-4xl opacity-10">🎯</div>

        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center space-y-8">

            {/* Eyebrow */}
            <div className="inline-block">
              <span className="bg-yellow-300 text-black px-4 py-2 font-bold text-sm md:text-base border-2 border-black transform -rotate-1 inline-block">
                ⚡ STOP LYING TO YOURSELF ⚡
              </span>
            </div>

            {/* Main Headline - Dramatic */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-none">
              <span className="block text-black">Are Ya</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-2">
                WINNING
              </span>
              <span className="block text-black mt-2">Son?</span>
            </h1>

            {/* Subheadline - Funny but Real */}
            <p className="text-xl md:text-3xl font-bold text-gray-800 max-w-4xl mx-auto leading-relaxed">
              Because "busy" doesn't mean "productive"<br className="hidden md:block" />
              and your to-do list is <span className="underline decoration-wavy decoration-red-500">lying</span> to you.
            </p>

            {/* Social Proof / Hook */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 pt-4">
              <StatBox number="30 sec" label="Daily Logging" />
              <StatBox number="7 days" label="To See Patterns" />
              <StatBox number="0%" label="Bullsh*t" />
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                href="/login"
                className="group card px-8 py-4 bg-black text-white hover:bg-white hover:text-black transition-all text-center font-bold text-lg md:text-xl w-full sm:w-auto border-4 border-black relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Winning <FaBolt className="group-hover:animate-pulse" />
                </span>
              </Link>

              <button
                onClick={handleGuestMode}
                className="card px-8 py-4 bg-white hover:bg-gray-100 transition-all text-center font-bold text-lg md:text-xl w-full sm:w-auto border-4 border-black"
              >
                Just Browsing 👀
              </button>
            </div>

            <p className="text-sm text-gray-600">
              No credit card. No commitment. No dad jokes... okay maybe one.
            </p>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION - Relatable & Funny */}
      <section className="py-16 md:py-20 bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Let's Be Honest For a Second...
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              (Don't worry, your therapist won't see this)
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Problem 1 */}
            <div className="card p-6 md:p-8 bg-gradient-to-br from-red-50 to-orange-50 hover:scale-105 transition-transform">
              <div className="text-5xl md:text-6xl mb-4">🎭</div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">The Busy-ness Theater</h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                You're in 47 meetings, sent 200 emails, and updated 12 spreadsheets.
                <span className="block mt-2 font-bold text-red-700">
                  But did you actually move the needle on what matters?
                </span>
              </p>
            </div>

            {/* Problem 2 */}
            <div className="card p-6 md:p-8 bg-gradient-to-br from-yellow-50 to-orange-50 hover:scale-105 transition-transform">
              <div className="text-5xl md:text-6xl mb-4">🔄</div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">The Groundhog Day Loop</h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Same mistakes. Same distractions. Same "I'll start tomorrow."
                <span className="block mt-2 font-bold text-orange-700">
                  Without data, you're just guessing why you keep failing.
                </span>
              </p>
            </div>

            {/* Problem 3 */}
            <div className="card p-6 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50 hover:scale-105 transition-transform">
              <div className="text-5xl md:text-6xl mb-4">🎢</div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">The Passenger Seat Life</h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Your calendar controls you. Urgent tasks hijack your day. You're reacting, not creating.
                <span className="block mt-2 font-bold text-purple-700">
                  When did you stop driving your own life?
                </span>
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* THE REVEAL - What We Do */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-green-50 to-blue-50 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="bg-green-300 text-black px-4 py-2 font-bold text-sm md:text-base border-2 border-black transform rotate-1 inline-block">
                🎯 HERE'S THE TWIST
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              You Don't Need Another Guru.<br />
              You Need a Mirror.
            </h2>
            <p className="text-lg md:text-2xl text-gray-700 max-w-3xl mx-auto">
              We don't tell you what to do. We show you <span className="font-bold underline">what you're actually doing</span> vs. what you <span className="italic">think</span> you're doing.
            </p>
          </div>

          {/* The Magic Explanation */}
          <div className="card p-8 md:p-12 bg-white max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-4xl">🔮</div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">The "Wait, WTF?" Moment</h3>
                <p className="text-lg text-gray-600 italic">
                  (Also known as: AI-powered self-awareness)
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
                <p className="text-base md:text-lg text-gray-800 font-semibold mb-2">💡 For Example:</p>
                <p className="text-base md:text-lg text-gray-700 italic">
                  "We noticed you're 3x more productive on days you work out in the morning. But you only did it twice this month. What's stopping you?"
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
                <p className="text-base md:text-lg text-gray-800 font-semibold mb-2">📊 Or This:</p>
                <p className="text-base md:text-lg text-gray-700 italic">
                  "You spent 40% of your time on 'urgent' tasks that contributed 0% to your main goal. Time to rethink priorities?"
                </p>
              </div>

              <div className="bg-red-50 p-6 rounded-lg border-2 border-red-300">
                <p className="text-base md:text-lg text-gray-800 font-semibold mb-2">🚨 And Sometimes:</p>
                <p className="text-base md:text-lg text-gray-700 italic">
                  "You haven't touched that 'important' project in 12 days. Maybe it's time to admit it's not important to you?"
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xl md:text-2xl font-bold text-gray-800">
                This isn't generic advice.<br />
                <span className="text-blue-600">This is YOUR truth.</span>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES - Quick & Visual */}
      <section className="py-16 md:py-20 bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              What You Actually Get
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              (Spoiler: It's stupidly simple)
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FaRocket className="text-3xl text-blue-600" />}
              title="Goal X-Ray Vision"
              description="See EXACTLY what % of your time goes to what actually matters. No more 'where did my week go?'"
              color="bg-blue-100"
              delay="0s"
            />

            <FeatureCard
              icon={<FaMagic className="text-3xl text-purple-600" />}
              title="Pattern Detective"
              description="Our AI finds the hidden connections. What makes you productive? What kills your momentum? You'll finally know."
              color="bg-purple-100"
              delay="0.1s"
            />

            <FeatureCard
              icon={<FaTrophy className="text-3xl text-yellow-600" />}
              title="BS Detector"
              description="No more lying to yourself about being 'productive.' Visual proof of what you did (and didn't) do."
              color="bg-yellow-100"
              delay="0.2s"
            />
          </div>

        </div>
      </section>

      {/* SOCIAL PROOF - Real Stories */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 to-pink-50 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Real People. Real Results.
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              (Names changed to protect the formerly unproductive)
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Alex's Story */}
            <div className="card p-6 md:p-8 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl md:text-5xl">💼</div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold">Alex, 32</h3>
                  <p className="text-sm md:text-base text-gray-600">Senior Manager → Director in 6 months</p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-base md:text-lg text-gray-700">
                  <span className="font-bold">"I thought I was killing it.</span> 60-hour weeks, always available, always in meetings."
                </p>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm md:text-base font-semibold text-red-800">The Truth:</p>
                  <p className="text-sm md:text-base text-red-700">Only 23% of time on high-impact work. The rest? Reactive busywork.</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm md:text-base font-semibold text-green-800">After Using This:</p>
                  <p className="text-sm md:text-base text-green-700">Ruthlessly cut meetings. Doubled impact work. Got the promotion.</p>
                </div>
              </div>
            </div>

            {/* Sarah's Story */}
            <div className="card p-6 md:p-8 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl md:text-5xl">🎨</div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold">Sarah, 28</h3>
                  <p className="text-sm md:text-base text-gray-600">Side Hustle → Full-Time Business</p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-base md:text-lg text-gray-700">
                  <span className="font-bold">"I felt so guilty</span> whenever I wasn't 'hustling.' Was I doing enough?"
                </p>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm md:text-base font-semibold text-red-800">The Truth:</p>
                  <p className="text-sm md:text-base text-red-700">Instagram 'marketing' had ZERO correlation with new clients.</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm md:text-base font-semibold text-green-800">After Using This:</p>
                  <p className="text-sm md:text-base text-green-700">Doubled down on direct outreach (80% success rate). Quit day job.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CTA - Dramatic */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-black to-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="text-9xl absolute top-10 left-10 animate-pulse">🏆</div>
          <div className="text-9xl absolute bottom-10 right-10 animate-pulse" style={{ animationDelay: "1s" }}>⚡</div>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            So... Are Ya Winning?
          </h2>

          <p className="text-xl md:text-2xl mb-4">
            Or are you just <span className="italic">really, really busy?</span>
          </p>

          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            30 seconds a day. 7 days to see patterns. Zero bullsh*t. <br />
            Your future self is watching. Don't let them down.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group card px-10 py-5 bg-white text-black hover:bg-yellow-300 transition-all text-center font-bold text-xl md:text-2xl w-full sm:w-auto border-4 border-white"
            >
              <span className="flex items-center justify-center gap-3">
                Start Winning Now <FaFire className="group-hover:animate-bounce" />
              </span>
            </Link>

            <button
              onClick={handleGuestMode}
              className="card px-10 py-5 bg-transparent text-white hover:bg-white hover:text-black transition-all text-center font-bold text-xl md:text-2xl w-full sm:w-auto border-4 border-white"
            >
              Try Guest Mode
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-8">
            Free forever. No credit card. No pressure. Just truth.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-700">
            <Link
              href="/help"
              className="text-base md:text-lg text-gray-300 hover:text-white underline"
            >
              Wait, how does this actually work? →
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}
