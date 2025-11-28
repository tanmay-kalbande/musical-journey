// src/services/modeDetection.ts

import { TutorMode } from '../types';

interface ModeDetectionResult {
  suggestedMode: TutorMode;
  confidence: number; // 0-1
  reason: string;
}

// Keywords for each mode (excluding 'clean')
const MODE_KEYWORDS: Record<Exclude<TutorMode, 'clean'>, string[]> = {
  standard: [
    'learn', 'understand', 'explain', 'how does', 'what is', 'why',
    'teach me', 'tell me about', 'concept', 'theory', 'definition',
    'what are', 'how to', 'can you explain', 'help me understand',
    'show me', 'describe', 'elaborate', 'clarify', 'demonstrate'
  ],
  
  mentor: [
    'homework', 'stuck', 'help me', 'confused', 'don\'t understand',
    'struggling', 'hard to', 'difficult', 'explain like', 'eli5',
    'simple terms', 'basics', 'beginner', 'i need help', 'can you help',
    'not sure', 'lost', 'don\'t get it', 'step by step', 'guide me',
    'walk me through', 'break it down', 'simplify', 'make it easier'
  ],
  
  cosmic: [
    'space', 'universe', 'cosmic', 'alien', 'sci-fi', 'star wars',
    'star trek', 'galaxy', 'astronomical', 'interstellar', 'nebula',
    'black hole', 'quantum', 'multiverse', 'dimension', 'wormhole',
    'celestial', 'planetary', 'orbital', 'asteroid', 'comet'
  ],
  
  ayanokoji: [
    'efficient', 'optimal', 'calculate', 'strategic', 'manipulate',
    'psychology', 'tactical', 'logical', 'rational', 'minimize',
    'maximize', 'optimize', 'best way', 'most effective', 'smartest',
    'analytical', 'systematic', 'methodical', 'precise', 'exact'
  ],
  
  innovator: [
    'innovate', 'disrupt', 'breakthrough', 'revolutionary', 'transform',
    'reimagine', 'what if', 'future', 'invent', 'create', 'design',
    '10x', 'moonshot', 'first principles', 'paradigm shift', 'game changer',
    'next generation', 'cutting edge', 'groundbreaking', 'pioneer',
    'radical', 'unconventional', 'bold idea', 'visionary', 'startup'
  ],
  
  strategist: [
    'decide', 'choice', 'should i', 'option', 'trade-off', 'risk',
    'probability', 'odds', 'chance', 'decision', 'weigh', 'compare',
    'pros and cons', 'expected value', 'scenario', 'outcome', 'strategy',
    'planning', 'analyze', 'evaluate', 'assess', 'consider alternatives',
    'best option', 'make a decision', 'which one', 'better choice'
  ],
  
  devil: [
    'challenge', 'debate', 'argue', 'oppose', 'counter', 'critique',
    'weakness', 'flaw', 'assumption', 'prove me wrong', 'disagree',
    'test my idea', 'play devil\'s advocate', 'what\'s wrong with',
    'criticism', 'skeptical', 'question', 'doubt', 'refute',
    'contradiction', 'logical fallacy', 'poke holes', 'scrutinize'
  ],
  
  brainstorm: [
    'ideas', 'brainstorm', 'creative', 'generate', 'think of',
    'possibilities', 'what could', 'alternatives', 'variations',
    'wild ideas', 'out of the box', 'lateral thinking', 'ideate',
    'conceptualize', 'imagine', 'envision', 'dream up', 'come up with',
    'suggestions', 'options', 'ways to', 'different approaches'
  ],
  
  coach: [
    'feeling', 'should i', 'life', 'career', 'personal', 'growth',
    'purpose', 'values', 'meaning', 'direction', 'reflection',
    'stuck in life', 'what should i do', 'self-help', 'motivation',
    'confidence', 'goals', 'dreams', 'aspirations', 'fulfillment',
    'happiness', 'balance', 'wellbeing', 'mindset', 'perspective',
    'advice', 'guidance', 'support', 'encouragement', 'inspiration'
  ],
  
  scientist: [
    'research', 'study', 'experiment', 'hypothesis', 'test', 'prove',
    'evidence', 'data', 'scientific', 'empirical', 'method', 'analysis',
    'investigate', 'measure', 'observe', 'validate', 'verify',
    'peer review', 'findings', 'results', 'conclusion', 'theory',
    'systematic', 'controlled', 'variable', 'correlation', 'causation'
  ],
  
  storyteller: [
    'tell me a story', 'example', 'case study', 'history of',
    'how did', 'narrative', 'metaphor', 'analogy', 'illustrate',
    'story', 'tale', 'anecdote', 'parable', 'fable', 'legend',
    'chronicle', 'describe how', 'walk me through', 'paint a picture',
    'give me an example', 'real world', 'practical example'
  ],
  
  drill: [
    'push me', 'discipline', 'focus', 'no excuses', 'tough love',
    'accountability', 'strict', 'force me', 'make me', 'drill',
    'intense', 'hardcore', 'demanding', 'rigorous', 'challenge me',
    'be tough', 'be hard on me', 'don\'t let me slack', 'hold me accountable',
    'no mercy', 'boot camp', 'train me', 'whip me into shape'
  ]
};

/**
 * Analyzes user's first message to suggest the best tutor mode
 * Returns 'clean' if no strong mode match is found (confidence < threshold)
 */
export function detectBestMode(userMessage: string): ModeDetectionResult {
  const message = userMessage.toLowerCase().trim();
  
  // Skip detection for very short messages - default to clean
  if (message.length < 10) {
    return {
      suggestedMode: 'clean',
      confidence: 0.3,
      reason: 'Message too short to detect intent - using clean mode'
    };
  }
  
  // Score each mode with weighted scoring
  const scores: Record<Exclude<TutorMode, 'clean'>, number> = {
    standard: 0,
    mentor: 0,
    cosmic: 0,
    ayanokoji: 0,
    innovator: 0,
    strategist: 0,
    devil: 0,
    brainstorm: 0,
    coach: 0,
    scientist: 0,
    storyteller: 0,
    drill: 0
  };
  
  // Count keyword matches with phrase detection
  for (const [mode, keywords] of Object.entries(MODE_KEYWORDS)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      
      if (regex.test(message)) {
        const weight = keyword.split(' ').length;
        scores[mode as Exclude<TutorMode, 'clean'>] += weight;
      }
    }
  }
  
  // Boost scores for specific patterns
  if (/\b(my life|career path|personal growth|should i)\b/i.test(message)) {
    scores.coach += 3;
  }
  
  if (/\b(should i|which one|better option|decide between)\b/i.test(message)) {
    scores.strategist += 3;
  }
  
  if (/\b(ideas for|creative|story|write|imagine)\b/i.test(message)) {
    scores.brainstorm += 2;
    scores.storyteller += 2;
  }
  
  if (/\b(challenge|wrong with|critique|devil's advocate)\b/i.test(message)) {
    scores.devil += 3;
  }
  
  if (/\b(research|study|hypothesis|experiment|data)\b/i.test(message)) {
    scores.scientist += 3;
  }
  
  if (/\b(innovate|disrupt|startup|revolutionary|10x)\b/i.test(message)) {
    scores.innovator += 3;
  }
  
  // Find mode with highest score
  let bestMode: Exclude<TutorMode, 'clean'> = 'standard';
  let maxScore = scores.standard;
  
  for (const [mode, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestMode = mode as Exclude<TutorMode, 'clean'>;
    }
  }
  
  // Calculate confidence (0-1)
  const totalMatches = Object.values(scores).reduce((a, b) => a + b, 0);
  
  let confidence = 0.3; // baseline
  
  if (totalMatches > 0) {
    const dominance = maxScore / totalMatches;
    confidence = Math.min(0.95, 0.3 + (dominance * 0.7));
  }
  
  // Boost confidence if multiple strong keywords match
  if (maxScore >= 3) {
    confidence = Math.min(0.95, confidence + 0.15);
  }
  
  // IMPORTANT: If confidence is too low, return 'clean' mode
  const CONFIDENCE_THRESHOLD = 0.6; // Only suggest mode if confidence >= 60%
  
  if (confidence < CONFIDENCE_THRESHOLD || maxScore === 0) {
    return {
      suggestedMode: 'clean',
      confidence: confidence,
      reason: 'No strong mode detected - using clean mode for natural conversation'
    };
  }
  
  // Generate reason
  const reasons: Record<Exclude<TutorMode, 'clean'>, string> = {
    standard: 'General learning question detected',
    mentor: 'Detected help-seeking language and need for guidance',
    cosmic: 'Detected space/sci-fi interest',
    ayanokoji: 'Detected logical/strategic thinking',
    innovator: '🚀 Detected innovation/creative thinking keywords',
    strategist: '🎲 Detected decision-making/probabilistic thinking',
    devil: '😈 Detected need for critical analysis and challenge',
    brainstorm: '💡 Detected brainstorming/ideation intent',
    coach: '🧘 Detected personal growth/life guidance needs',
    scientist: '🔬 Detected research/scientific inquiry',
    storyteller: '📖 Detected storytelling/narrative preference',
    drill: '💪 Detected need for discipline/tough motivation'
  };
  
  return {
    suggestedMode: bestMode,
    confidence,
    reason: reasons[bestMode]
  };
}

/**
 * Checks if we should show mode suggestion to user
 * Only suggest if:
 * 1. Detected mode is not 'clean'
 * 2. Current mode is 'clean' (not manually selected)
 * 3. Confidence is high enough
 */
export function shouldSuggestMode(
  detectionResult: ModeDetectionResult,
  currentMode: TutorMode,
  isManuallySelected: boolean
): boolean {
  // Never suggest if user manually selected a mode
  if (isManuallySelected) {
    return false;
  }
  
  // Don't suggest if detected mode is clean
  if (detectionResult.suggestedMode === 'clean') {
    return false;
  }
  
  // Don't suggest if already using the detected mode
  if (detectionResult.suggestedMode === currentMode) {
    return false;
  }
  
  // Only suggest if confidence is high enough
  const SUGGESTION_THRESHOLD = 0.6; // 60% confidence minimum
  return detectionResult.confidence >= SUGGESTION_THRESHOLD;
}

/**
 * Get friendly suggestion message for UI
 */
export function getModeSuggestionMessage(mode: TutorMode): string {
  const messages: Record<TutorMode, string> = {
    clean: '🔘 Want natural conversation? Stay in Clean mode!',
    standard: '📘 Want structured learning? Try Standard Tutor mode!',
    mentor: '🧑‍🏫 Need patient step-by-step help? Try Friendly Mentor mode!',
    cosmic: '🌌 Love space? Try Cosmic Nerd mode for stellar explanations!',
    ayanokoji: '😐 Want efficient, tactical answers? Try Ayanokoji mode!',
    innovator: '🚀 Want breakthrough thinking? Try The Innovator mode!',
    strategist: '🎲 Need help deciding? Try The Strategist for probabilistic analysis!',
    devil: '😈 Want your ideas challenged? Try Devil\'s Advocate mode!',
    brainstorm: '💡 Want endless creative ideas? Try Brainstorm Buddy mode!',
    coach: '🧘 Need self-reflection guidance? Try The Coach mode!',
    scientist: '🔬 Want hypothesis-driven learning? Try The Scientist mode!',
    storyteller: '📖 Learn through stories? Try The Storyteller mode!',
    drill: '💪 Need tough motivation? Try Drill Sergeant mode!'
  };
  
  return messages[mode];
}
