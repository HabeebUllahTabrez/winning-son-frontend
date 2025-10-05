// src/app/help/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FaQuestion,
  FaPlay,
  FaComments,
  FaChevronDown,
  FaChevronUp,
  FaRocket
} from "react-icons/fa";

// FAQ Item Component
function FAQItem({
  question,
  answer,
  defaultOpen = false
}: {
  question: string;
  answer: string | React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="card p-4 md:p-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left hover:opacity-70 transition-opacity gap-4"
      >
        <h3 className="text-lg md:text-xl font-bold">{question}</h3>
        {isOpen ? <FaChevronUp className="text-lg flex-shrink-0" /> : <FaChevronDown className="text-lg flex-shrink-0" />}
      </button>

      {isOpen && (
        <div className="mt-4 text-base md:text-lg text-gray-700 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="space-y-12">

        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">How to Use WinningSon-inator</h1>
          <p className="text-lg md:text-xl text-gray-600">
            Everything you need to succeed with your personal progress tracking
          </p>
        </header>

        {/* Quick Start Guide */}
        <section className="card p-6 md:p-8 bg-gradient-to-br from-green-50 to-blue-50 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-3">
              <FaPlay className="text-green-600" />
              Your First Week: A Simple Plan
            </h2>
            <p className="text-lg text-gray-600">Build the feedback loop in 7 days</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border-2 border-black space-y-3">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-bold text-center">Define Your Goals</h3>
              <p className="text-base text-gray-700">
                What do you actually want to achieve? Write 2-3 real goals (promotion, launch a project, learn a skill). Be specific.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-black space-y-3">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-bold text-center">Log Daily (60 sec)</h3>
              <p className="text-base text-gray-700">
                Every evening, log what you worked on and link it to your goals. Rate your satisfaction. That&apos;s it. Build the habit.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-black space-y-3">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-bold text-center">Review & Learn</h3>
              <p className="text-base text-gray-700">
                After 7 days, check your insights. What % of time went to each goal? What patterns emerge? Adjust and repeat.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-3">
              <FaQuestion className="text-blue-600" />
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">Everything you need to know</p>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="I already use a to-do list. Why do I need this?"
              answer="To-do lists tell you what to do. We tell you what you actually DID—and whether it mattered. There's a huge difference between being busy and making progress. We help you see which is which."
              defaultOpen={true}
            />

            <FAQItem
              question="Will I actually stick with this? (I've tried other apps...)"
              answer={
                <div>
                  <p className="mb-2">Fair question. Here&apos;s why this is different:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>60 seconds to log.</strong> Not 10 minutes of &quot;deep reflection.&quot;</li>
                    <li><strong>You see results fast.</strong> After just 7 days, you&apos;ll discover patterns you never knew existed.</li>
                    <li><strong>No guilt trips.</strong> We&apos;re not here to shame you. We&apos;re here to show you the truth so you can choose better.</li>
                  </ul>
                </div>
              }
            />

            <FAQItem
              question="How is the AI different from generic productivity advice?"
              answer="Generic advice says 'wake up at 5am.' Our AI says 'on days you started work at 10am, you completed 3x more high-impact tasks.' It's YOUR data, YOUR patterns, YOUR insights. Not someone else's blueprint."
            />

            <FAQItem
              question="What if the insights are obvious? Like 'you work more on weekdays'..."
              answer="We're obsessed with avoiding 'so what' insights. Our AI digs deeper: WHICH activities correlate with your satisfaction? What time of day do you do your best work? Which goals are you avoiding and why? These are the insights that change behavior."
            />

            <FAQItem
              question="I'm not a data person. Is this too complicated?"
              answer="If you can rate a movie on a scale of 1-10, you can use this app. The logging is brain-dead simple. The AI does all the heavy lifting. You just read the insights and say 'huh, didn't realize that.'"
            />

            <FAQItem
              question="Does this work for personal goals or just work stuff?"
              answer="Both! Track fitness goals, creative projects, learning new skills, building relationships—anything you want to make progress on. The AI finds patterns across ALL of it."
            />

            <FAQItem
              question="What about my privacy?"
              answer="Your journal is private to your account. We use your data to generate YOUR insights, not to train models or sell to advertisers. Your struggles and wins stay yours."
            />

            <FAQItem
              question="How do I know this will actually help me change?"
              answer="You can't change what you can't see. We give you radical clarity about where your time and energy go. Once you see that only 10% of your week goes to your 'top priority,' change becomes obvious. Self-awareness is the first step to self-improvement."
            />
          </div>
        </section>

        {/* Support & Feedback */}
        <section className="grid md:grid-cols-2 gap-6">
          {/* Dashboard */}
          <div className="card p-6 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50 text-center space-y-4">
            <FaRocket className="text-5xl text-blue-600 mx-auto" />
            <h2 className="text-2xl md:text-3xl font-bold">Ready to Start?</h2>
            <p className="text-base md:text-lg text-gray-700">
              Head to your dashboard and create your first entry!
            </p>
            <Link
              href="/dashboard"
              className="card px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors inline-block font-bold text-lg"
            >
              Go to Dashboard
            </Link>
          </div>

          {/* Feedback */}
          <div className="card p-6 md:p-8 bg-gradient-to-br from-green-50 to-teal-50 text-center space-y-4">
            <FaComments className="text-5xl text-green-600 mx-auto" />
            <h2 className="text-2xl md:text-3xl font-bold">Have Feedback?</h2>
            <p className="text-base md:text-lg text-gray-700">
              We&apos;d love to hear your thoughts and suggestions!
            </p>
            <a
              href="https://winningsoninator.featurebase.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="card px-6 py-3 bg-green-600 text-white hover:bg-green-700 transition-colors inline-block font-bold text-lg"
            >
              Share Your Feedback
            </a>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-gray-600 space-y-2">
          <p className="text-lg font-semibold">
            Still have questions?
          </p>
          <p className="text-base">
            <Link href="/" className="underline hover:text-gray-900">
              ← Back to Home
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
