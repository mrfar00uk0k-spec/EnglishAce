// ─────────────────────────────────────────────────────────────────────────────
// EnglishAce — LexiTipEngine.js
// 60+ tips organized by category with smart rotation (no recent repeats)
// ─────────────────────────────────────────────────────────────────────────────

const RECENT_KEY = 'lexi_recent_tips'
const GREETING_KEY = 'lexi_last_greeting'

export const ALL_TIPS = {
  grammar: [
    "Use present perfect for experiences: 'I have been to London' not 'I went to London' without a time.",
    "Modal auxiliaries (can, will, should, must) are always followed by a base verb — no -s or -ed.",
    "Use 'the' when both speaker and listener know exactly what you're referring to.",
    "In second conditionals, the 'if' clause uses past tense for hypothetical situations: 'If I were you...'",
    "Avoid double negatives. Say 'I don't have anything' not 'I don't have nothing.'",
    "Adjectives always go before nouns in English: 'a beautiful red car', not 'a car red beautiful'.",
    "Use 'much' with uncountable nouns and 'many' with countable ones.",
    "'Since' refers to a point in time; 'for' refers to a duration. Both pair with present perfect.",
    "Subject and verb must always agree: 'She works hard', not 'She work hard'.",
    "Articles matter! Omitting 'a' or 'the' is one of the most common errors in spoken English.",
  ],
  vocabulary: [
    "Learning words in context is 3× more effective than memorizing isolated word lists.",
    "When you learn a new word, also learn its noun, verb, and adjective forms.",
    "Phrasal verbs are very common in spoken English. Learn 3 new ones each week.",
    "Use a vocabulary notebook: write the word, its meaning, and one example sentence.",
    "Collocations are natural word pairs. Don't say 'make homework' — say 'do homework'.",
    "Aim to learn 10 words per week consistently rather than cramming 100 at once.",
    "Using a new word within 24 hours of learning it dramatically improves retention.",
    "Read English articles on topics you enjoy — passive exposure builds vocabulary fast.",
    "Synonyms give you flexibility. Learn 2–3 alternatives for every common word you use.",
    "Idioms make your English sound natural. Learn one idiom a day and use it in a sentence.",
  ],
  speaking: [
    "Record yourself speaking for 2 minutes daily. Play it back and note areas to improve.",
    "Clarity matters more than accent. Focus on being understood, not on sounding 'native'.",
    "Shadowing — repeating after native speakers immediately — is one of the fastest fluency builders.",
    "Think in English rather than translating from your native language in your head.",
    "Filler words like 'um' are normal occasionally. Focus on reducing long unnatural pauses.",
    "Listen to English podcasts at native speed to train your ear for rhythm and connected speech.",
    "The more you speak, the more natural it feels. Aim for 20 minutes of speaking daily.",
    "Use linking words to connect ideas: 'however', 'in addition', 'on the other hand'.",
    "Vary your intonation — flat monotone speech is harder to follow than natural ups and downs.",
    "Ask yourself: 'Would a native speaker say it this way?' when unsure about a phrase.",
  ],
  writing: [
    "Start every paragraph with a clear topic sentence that states the main idea.",
    "Vary your sentence length — mix short punchy sentences with longer detailed ones.",
    "Read your writing aloud to catch grammar mistakes your eyes might miss.",
    "Transition words like 'however', 'therefore', 'consequently' make writing flow smoothly.",
    "Avoid starting too many sentences with 'I' — vary your sentence openings for style.",
    "Write a full draft first, then revise. Editing while writing slows you down significantly.",
    "Use specific examples to support every point — vague claims are weak writing.",
    "Check subject-verb agreement carefully, especially with collective nouns and long sentences.",
    "Proofread for comma splices: don't join two complete sentences with just a comma.",
    "Strong writing uses active voice more than passive: 'She wrote the report' beats 'The report was written'.",
  ],
  listening: [
    "Watch English content with English subtitles — not your native language — for better comprehension.",
    "Start with slower speakers, then gradually work up to native-speed content.",
    "If you mishear something, replay it 3 times before checking the transcript.",
    "Focus on understanding meaning, not every word — even native speakers miss words.",
    "Podcasts on topics you're passionate about make listening practice feel like entertainment.",
    "Predict what a speaker will say next — this trains active, engaged listening.",
  ],
  reading: [
    "Skim for main ideas first, then read for details on your second pass.",
    "Don't look up every unknown word — try to guess meaning from context first.",
    "Read a variety of text types: news, essays, fiction, and opinion pieces for versatility.",
    "After reading, summarize the main points from memory. Great for retention.",
    "Practice timed reading to improve your speed and accuracy under test conditions.",
    "Comprehension questions often use synonyms for key words in the passage — train yourself to spot this.",
  ],
  motivation: [
    "Progress feels slow daily but looks enormous yearly. Trust the process and keep showing up. 🦊",
    "Every mistake is data, not failure. Each one tells you exactly what to work on next.",
    "Fluency is built in thousands of small moments. Every single practice session counts.",
    "Compare yourself to who you were last month, not to native speakers.",
    "Celebrate small wins. Completing any test is already a meaningful step forward.",
    "The best language learners aren't the most talented — they're the most consistent.",
    "You don't need to be perfect to communicate. Good enough is already great.",
    "Confidence comes from repetition, not from waiting until you feel ready.",
  ],
  studyHabits: [
    "Study for 25 minutes, rest for 5. The Pomodoro technique works great for language learning.",
    "Study at the same time each day. Routine helps your brain know when to focus.",
    "Spaced repetition boosts retention: review material on day 1, 3, 7, and 21.",
    "Morning study sessions are often more effective — your brain retains more when fresh.",
    "Passive exposure (podcasts, music) while commuting builds familiarity with English rhythms.",
    "Set a specific goal for each session: 'Today I will practice 5 new grammar structures.'",
    "Teaching someone else what you learned is the strongest test of real understanding.",
    "20 minutes daily beats 3 hours on weekends. Consistency always wins over intensity.",
  ],
}

export const GREETINGS = [
  { text: "Welcome back! Ready to improve your English today? 🦊", mood: 'friendly' },
  { text: "Let's discover your real English level together.", mood: 'confident' },
  { text: "I'll help you analyze your skills step by step.", mood: 'professional' },
  { text: "Every practice session gets you one step closer to fluency. Let's go! ✨", mood: 'motivating' },
  { text: "Your progress matters. I'm here to guide every step.", mood: 'caring' },
  { text: "Ready to see how much your English has improved? 🦊", mood: 'curious' },
]

export const THINKING_MESSAGES = [
  "Hmm... analyzing your grammar carefully.",
  "Checking your sentence structure...",
  "Looking for vocabulary patterns...",
  "Reviewing your overall performance...",
  "Comparing your answers with CEFR standards...",
  "Evaluating fluency and coherence...",
  "Identifying your strongest areas...",
  "Almost done! 🦊",
]

// Returns a random tip, avoiding recently shown ones
export function getRandomTip(category = null, recentLimit = 5) {
  try {
    const recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    const pool = category && ALL_TIPS[category]
      ? ALL_TIPS[category]
      : Object.values(ALL_TIPS).flat()

    const fresh = pool.filter(t => !recent.includes(t))
    const chosen = (fresh.length > 0 ? fresh : pool)[Math.floor(Math.random() * (fresh.length || pool.length))]

    const updated = [chosen, ...recent].slice(0, recentLimit)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
    return chosen
  } catch {
    const pool = Object.values(ALL_TIPS).flat()
    return pool[Math.floor(Math.random() * pool.length)]
  }
}

// Returns a tip appropriate to the score and test type
export function getTipForScore(score, testType = 'speaking') {
  const cat = score < 40 ? 'motivation'
    : testType === 'grammar'    ? 'grammar'
    : testType === 'vocabulary' ? 'vocabulary'
    : testType === 'writing'    ? 'writing'
    : testType === 'speaking'   ? 'speaking'
    : testType === 'listening'  ? 'listening'
    : testType === 'reading'    ? 'reading'
    : 'studyHabits'
  return getRandomTip(cat)
}

// Returns a greeting that hasn't been shown recently
export function getNextGreeting() {
  try {
    const lastIdx = Number(localStorage.getItem(GREETING_KEY) || -1)
    const nextIdx = (lastIdx + 1) % GREETINGS.length
    localStorage.setItem(GREETING_KEY, String(nextIdx))
    return GREETINGS[nextIdx]
  } catch {
    return GREETINGS[0]
  }
}
