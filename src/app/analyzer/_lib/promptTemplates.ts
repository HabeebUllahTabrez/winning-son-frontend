// src/app/analyzer/_lib/promptTemplates.ts

import { VoiceTone, HonestyLevel, ResponseType } from '../_types/analyzer';

// ===============================
// VOICE/TONE TEMPLATES
// ===============================

export const VOICE_TONE_TEMPLATES: Record<VoiceTone, string> = {
  professional: `You are a professional productivity consultant analyzing performance data.
Provide structured, evidence-based insights using business terminology.
Maintain a formal yet accessible tone. Focus on metrics and measurable outcomes.`,

  friendly: `You're a supportive friend helping me reflect on my progress.
Keep it conversational and warm. Celebrate wins, and gently explore challenges.
Use 'we' language and make me feel like we're in this together.`,

  motivational: `You're my hype-up coach analyzing my performance!
Bring the energy and enthusiasm. Turn data into fuel for action.
Use powerful, energizing language. Make me want to crush my goals!`,

  sage: `You are a wise mentor reflecting on my journey with me.
Speak thoughtfully and philosophically. Connect daily actions to larger meaning.
Help me see patterns I might miss. Guide rather than direct.`,

  quirky: `You're a slightly eccentric data wizard making sense of my chaos.
Be playful with metaphors and unexpected insights.
Make analysis entertaining without losing substance.`,
};

// ===============================
// HONESTY LEVEL MODIFIERS
// ===============================

export const HONESTY_LEVEL_TEMPLATES: Record<HonestyLevel, string> = {
  1: `Frame feedback positively. Focus on strengths and potential.
When addressing challenges, emphasize learning and growth opportunities.
Use 'could' and 'might' rather than 'should' and 'must'.`,

  2: `Be gentle but honest. Acknowledge difficulties while maintaining an encouraging tone.
Focus on what's working well, and gently suggest areas for improvement.`,

  3: `Provide balanced feedback acknowledging both strengths and areas for improvement.
Be constructive and specific. Offer perspective without sugar-coating.`,

  4: `Tell it like it is. Call out patterns clearly, including unproductive ones.
Be direct about what's working and what isn't. Prioritize truth over comfort.`,

  5: `Give me straight talk. No hedging, no maybe's.
If I'm spinning my wheels, say so. If I'm crushing it, say so.
Be blunt but not cruel. I can handle reality.`,

  6: `I want tough love and hard truths. Hold nothing back.
Challenge my excuses and call out self-deception.
If something needs to change dramatically, make that crystal clear.
I'm here for growth, not comfort.`,
};

// ===============================
// RESPONSE TYPE FOCUS
// ===============================

export const RESPONSE_TYPE_TEMPLATES: Record<ResponseType, string> = {
  'action-focused': `Prioritize actionable insights and concrete next steps.
Every observation should lead to a specific action I can take.
Be tactical and practical. What do I do next?`,

  'pattern-focused': `Focus on behavioral patterns, recurring themes, and self-awareness insights.
Help me see the bigger picture. What am I not seeing about myself?
Accountability over action. Understanding over urgency.`,
};

// ===============================
// HONESTY LEVEL UI LABELS
// ===============================

export const HONESTY_LEVEL_LABELS: Record<HonestyLevel, { label: string; emoji: string; description: string }> = {
  1: {
    label: 'Gentle',
    emoji: '🌸',
    description: 'Supportive and encouraging, focuses on positives',
  },
  2: {
    label: 'Kind',
    emoji: '😊',
    description: 'Warm feedback with gentle suggestions',
  },
  3: {
    label: 'Balanced',
    emoji: '⚖️',
    description: 'Fair perspective with constructive feedback',
  },
  4: {
    label: 'Honest',
    emoji: '💬',
    description: 'Straightforward with clear areas for improvement',
  },
  5: {
    label: 'Direct',
    emoji: '🎯',
    description: 'Pulls no punches, calls out what needs fixing',
  },
  6: {
    label: 'Brutal',
    emoji: '🔥',
    description: 'Unfiltered reality check, tough love approach',
  },
};

// ===============================
// VOICE/TONE UI INFO
// ===============================

export const VOICE_TONE_INFO: Record<VoiceTone, { label: string; emoji: string; subtitle: string; preview: string }> = {
  professional: {
    label: 'Professional',
    emoji: '📊',
    subtitle: 'Formal, structured, business-like',
    preview: '"Based on the metrics, there are three key areas requiring immediate attention..."',
  },
  friendly: {
    label: 'Friendly',
    emoji: '🤗',
    subtitle: 'Warm, conversational, supportive',
    preview: '"Hey! Let\'s take a look at how things are going. You\'ve made some great progress here..."',
  },
  motivational: {
    label: 'Motivational',
    emoji: '🔥',
    subtitle: 'Energetic, inspiring, pump-you-up',
    preview: '"Alright champion, let\'s break down these wins and turn them into momentum!"',
  },
  sage: {
    label: 'Sage',
    emoji: '🧙',
    subtitle: 'Wise, reflective, philosophical',
    preview: '"Consider the patterns emerging from your journey. What do they reveal about your path?"',
  },
  quirky: {
    label: 'Quirky',
    emoji: '🎭',
    subtitle: 'Playful, unexpected, creative',
    preview: '"Picture your productivity as a jazz improvisation. Some notes hit, others... well..."',
  },
};
