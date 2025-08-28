// src/app/help/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { FaRocket, FaChartLine, FaBrain, FaThLarge, FaLightbulb, FaTrophy, FaCalendarCheck, FaMagic } from "react-icons/fa";

export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="space-y-12">
        {/* Hero Section */}
        <header className="text-center space-y-6">
          <div className="flex justify-center">
            <Image
              src="/are-ya-winning.jpeg"
              alt="Are ya winning, son?"
              width={120}
              height={120}
              className="rounded-full border-4 border-black"
            />
          </div>
          <h1 className="text-5xl font-bold">Help & Why This App is Actually Useful</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Look, I get it. Another productivity app? But hear me out - this one actually works because it's built by someone who hates productivity apps.
          </p>
        </header>

        {/* Why Track Progress Section */}
        <section className="card p-8 space-y-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FaRocket className="text-blue-500" />
            Why Bother Tracking Your Progress?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">The Problem with "Just Remembering"</h3>
              <p className="text-lg leading-relaxed">
                Your brain is like a leaky bucket when it comes to progress. You think you're making progress, 
                but you're probably just spinning your wheels. It's like debugging without console.log - 
                you're flying blind, my friend.
              </p>
              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                <p className="font-semibold text-yellow-800">
                  💡 Pro Tip: If you can't measure it, you can't improve it. 
                  This isn't just corporate BS - it's science.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">The Self-Awareness Superpower</h3>
              <p className="text-lg leading-relaxed">
                Ever wonder why some developers seem to level up faster? They're not necessarily smarter - 
                they're just more aware of their patterns. They know when they're productive, 
                what drains their energy, and how to optimize their workflow.
              </p>
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                <p className="font-semibold text-green-800">
                  🚀 Knowledge is power, but self-knowledge is superpower.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How the App Works */}
        <section className="card p-8 space-y-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FaMagic className="text-purple-500" />
            How This App Actually Helps You Win
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <FaCalendarCheck className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">Daily Journaling</h3>
              <p className="text-gray-600">
                Quick daily check-ins that take 2 minutes but give you insights for years. 
                Track what you worked on and how you felt about it.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FaChartLine className="text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold">Progress Visualization</h3>
              <p className="text-gray-600">
                See your progress over time with charts and stats. 
                Because sometimes you need to see the data to believe you're actually improving.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <FaBrain className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">AI Analysis</h3>
              <p className="text-gray-600">
                Get personalized insights and actionable advice based on your actual data. 
                No generic productivity tips here.
              </p>
            </div>
          </div>
        </section>

        {/* The Science Behind It */}
        <section className="card p-8 space-y-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FaLightbulb className="text-yellow-500" />
            The Science Behind Why This Works
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">🧠 The Zeigarnik Effect</h3>
              <p className="text-lg">
                Your brain remembers incomplete tasks better than completed ones. 
                By tracking your progress, you're essentially telling your brain "this is complete" 
                and freeing up mental bandwidth for the next challenge.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">📊 The Hawthorne Effect</h3>
              <p className="text-lg">
                Simply observing and measuring something changes behavior. 
                When you track your progress, you naturally become more conscious of your actions 
                and tend to make better choices.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">🎯 Goal Gradient Effect</h3>
              <p className="text-lg">
                People are more motivated as they get closer to their goals. 
                Visual progress tracking creates this effect, making you more likely to push through 
                when things get tough.
              </p>
            </div>
          </div>
        </section>

        {/* Real Benefits */}
        <section className="card p-8 space-y-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FaTrophy className="text-yellow-500" />
            What You Actually Get Out of This
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Immediate Benefits</h3>
              <ul className="space-y-2 text-lg">
                <li>• Clear picture of your actual productivity patterns</li>
                <li>• Identify your most productive times and conditions</li>
                <li>• Spot when you're just busy vs. actually productive</li>
                <li>• Celebrate small wins (they add up!)</li>
                <li>• Reduce decision fatigue about what to work on</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Long-term Benefits</h3>
              <ul className="space-y-2 text-lg">
                <li>• Build sustainable habits that actually stick</li>
                <li>• Make data-driven decisions about your career</li>
                <li>• Develop better self-awareness and emotional intelligence</li>
                <li>• Create a personal knowledge base of what works for you</li>
                <li>• Level up faster than your peers</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How to Use Effectively */}
        <section className="card p-8 space-y-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FaThLarge className="text-red-500" />
            How to Use This App Like a Pro
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-bold mb-2">1. Start Small, Stay Consistent</h3>
              <p className="text-lg">
                Don't try to track everything at once. Start with daily journaling for 2 weeks. 
                Once that's a habit, add goal setting. Consistency beats perfection every time.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-bold mb-2">2. Be Honest with Yourself</h3>
              <p className="text-lg">
                Rate your satisfaction honestly. A 3/10 day is valuable data - it tells you what to avoid. 
                Don't sugarcoat it; the data is only useful if it's real.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-bold mb-2">3. Use the Analyzer Regularly</h3>
              <p className="text-lg">
                Run the AI analyzer every 2-4 weeks. It's like having a personal coach who actually 
                knows your patterns and can give you specific, actionable advice.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-6">
              <h3 className="text-xl font-bold mb-2">4. Review and Adjust</h3>
              <p className="text-lg">
                Look at your trends monthly. What patterns do you see? What's working? What's not? 
                Use this data to optimize your approach.
              </p>
            </div>
          </div>
        </section>

        {/* Common Objections */}
        <section className="card p-8 space-y-6">
          <h2 className="text-3xl font-bold">Common Objections (And Why They're Wrong)</h2>
          
          <div className="space-y-6">
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-red-800 mb-2">"I don't have time to track my progress"</h3>
              <p className="text-lg text-red-700">
                <strong>Reality:</strong> You're spending more time being unproductive than it takes to track. 
                2 minutes a day could save you hours of wasted effort. It's like unit testing - 
                the upfront cost saves you debugging time later.
              </p>
            </div>
            
            <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-orange-800 mb-2">"I already know what I need to work on"</h3>
              <p className="text-lg text-orange-700">
                <strong>Reality:</strong> Your brain is biased. You remember the wins and forget the struggles. 
                Data doesn't lie. You might be surprised by what the numbers actually show.
              </p>
            </div>
            
            <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-800 mb-2">"This feels like micromanaging myself"</h3>
              <p className="text-lg text-blue-700">
                <strong>Reality:</strong> This is about awareness, not control. You're not trying to optimize 
                every minute - you're trying to understand your patterns so you can work smarter, not harder.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Winning?</h2>
            <p className="text-xl mb-6">
              Stop guessing and start knowing. Your future self will thank you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard" className="btn bg-white text-blue-600 hover:bg-gray-100">
                Go to Dashboard
              </Link>
              <Link href="/journal" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                Start Journaling
              </Link>
            </div>
          </div>
          
          <p className="text-gray-600 text-lg">
            Remember: The best time to start was yesterday. The second best time is now. 
            And yes, that's a cliché, but clichés become clichés because they're true.
          </p>
        </section>
      </div>
    </div>
  );
}

