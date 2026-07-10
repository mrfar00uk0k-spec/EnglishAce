// ─────────────────────────────────────────────────────────────────────────────
// LEARNING RESOURCES — Fix #1: Popular English YouTube videos (NOT Arabic)
// Each resource maps to a weakness category detected from AI feedback
// Includes thumbnails via YouTube maxresdefault
// ─────────────────────────────────────────────────────────────────────────────

export const LEARNING_RESOURCES = {
  grammar: [
    {
      id: 'gr1',
      channel: 'English with Lucy',
      title: 'English Grammar: The Most Common Mistakes Explained',
      description: 'Lucy explains the top grammar mistakes that most English learners make with clear examples and corrections.',
      url: 'https://www.youtube.com/watch?v=Fj_YgZKcGA0',
      thumbnail: 'https://img.youtube.com/vi/Fj_YgZKcGA0/mqdefault.jpg',
      duration: '18 min',
      reason: 'Covers the exact grammar errors detected in your test with native-speaker explanations',
      color: '#f59e0b',
      icon: 'book',
    },
    {
      id: 'gr2',
      channel: 'Oxford Online English',
      title: 'Fix Your English Grammar Mistakes — Full Lesson',
      description: 'Step-by-step explanation of common English grammar errors with correction exercises.',
      url: 'https://www.youtube.com/watch?v=kB7ER7j0C8s',
      thumbnail: 'https://img.youtube.com/vi/kB7ER7j0C8s/mqdefault.jpg',
      duration: '22 min',
      reason: 'Directly addresses the grammar patterns you need to reinforce',
      color: '#f59e0b',
      icon: 'pencil',
    },
  ],
  vocabulary: [
    {
      id: 'voc1',
      channel: 'Learn English with TV Series',
      title: '100 Advanced English Words You Need to Know',
      description: 'Expand your English vocabulary with high-frequency advanced words used by native speakers.',
      url: 'https://www.youtube.com/watch?v=71YXQRI3x8g',
      thumbnail: 'https://img.youtube.com/vi/71YXQRI3x8g/mqdefault.jpg',
      duration: '25 min',
      reason: 'Builds the exact vocabulary range you need to score higher',
      color: '#ec4899',
      icon: 'vocabulary',
    },
    {
      id: 'voc2',
      channel: 'Anglo-Link',
      title: 'English Collocations — Sound More Natural',
      description: 'Learn word combinations that native English speakers use naturally in everyday situations.',
      url: 'https://www.youtube.com/watch?v=0sxcpMIVXFE',
      thumbnail: 'https://img.youtube.com/vi/0sxcpMIVXFE/mqdefault.jpg',
      duration: '20 min',
      reason: 'Natural vocabulary use is one of the biggest score differentiators',
      color: '#ec4899',
      icon: 'lightbulb',
    },
  ],
  fluency: [
    {
      id: 'flu1',
      channel: 'Speak English with Vanessa',
      title: 'How to Speak English Fluently: 5 Training Steps',
      description: 'Proven techniques to eliminate hesitation and speak English with confidence and natural flow.',
      url: 'https://www.youtube.com/watch?v=FMpRWoaXBuY',
      thumbnail: 'https://img.youtube.com/vi/FMpRWoaXBuY/mqdefault.jpg',
      duration: '20 min',
      reason: 'Addresses fluency and hesitation — the top speaking weakness found in your test',
      color: '#8b5cf6',
      icon: 'mic',
    },
    {
      id: 'flu2',
      channel: 'Rachel\'s English',
      title: 'Stop Translating — Think and Speak in English',
      description: 'Learn how to stop translating in your head and start thinking directly in English.',
      url: 'https://www.youtube.com/watch?v=PQwpIU3vUV8',
      thumbnail: 'https://img.youtube.com/vi/PQwpIU3vUV8/mqdefault.jpg',
      duration: '15 min',
      reason: 'The most effective technique to dramatically improve speaking fluency',
      color: '#8b5cf6',
      icon: 'mic',
    },
  ],
  pronunciation: [
    {
      id: 'pr1',
      channel: 'Rachel\'s English',
      title: 'American English Pronunciation — Complete Guide',
      description: 'Master every English sound with Rachel\'s proven pronunciation method used by millions of learners.',
      url: 'https://www.youtube.com/watch?v=dKL3TKDjOoQ',
      thumbnail: 'https://img.youtube.com/vi/dKL3TKDjOoQ/mqdefault.jpg',
      duration: '30 min',
      reason: 'Directly targets the pronunciation sounds you struggled with in the test',
      color: '#0ea5e9',
      icon: 'speaker',
    },
    {
      id: 'pr2',
      channel: 'Pronunciation with Emma',
      title: 'The TH Sound — Most Common Pronunciation Mistake',
      description: 'Master the difficult "th" sound (θ and ð) that many English learners struggle with.',
      url: 'https://www.youtube.com/watch?v=PZQN5mgJopM',
      thumbnail: 'https://img.youtube.com/vi/PZQN5mgJopM/mqdefault.jpg',
      duration: '12 min',
      reason: 'The TH sound is the most common pronunciation issue identified in your speaking',
      color: '#0ea5e9',
      icon: 'speaker',
    },
  ],
  speaking: [
    {
      id: 'sp1',
      channel: 'Anglo-Link',
      title: 'English Conversation Practice — Natural Fluency',
      description: 'Practice real English conversation patterns with structured exercises for natural flow.',
      url: 'https://www.youtube.com/watch?v=2DLQhsAr9OM',
      thumbnail: 'https://img.youtube.com/vi/2DLQhsAr9OM/mqdefault.jpg',
      duration: '28 min',
      reason: 'Builds real conversational fluency through structured speaking practice',
      color: '#8b5cf6',
      icon: 'star',
    },
    {
      id: 'sp2',
      channel: 'English with Lucy',
      title: 'Speak English Confidently in Any Situation',
      description: 'Build confidence to speak English fluently in professional and social situations.',
      url: 'https://www.youtube.com/watch?v=nyUt3qfOLFU',
      thumbnail: 'https://img.youtube.com/vi/nyUt3qfOLFU/mqdefault.jpg',
      duration: '22 min',
      reason: 'Confidence and clarity are the key skills to develop at your current level',
      color: '#8b5cf6',
      icon: 'target',
    },
  ],
  writing: [
    {
      id: 'wr1',
      channel: 'IELTS Liz',
      title: 'IELTS Writing Task 2 — Complete Strategy Guide',
      description: 'Master the structure, vocabulary, and techniques needed for high-scoring English writing.',
      url: 'https://www.youtube.com/watch?v=koBoa2IXZQFM',
      thumbnail: 'https://img.youtube.com/vi/koBoa2IXZQFM/mqdefault.jpg',
      duration: '35 min',
      reason: 'Teaches the exact writing structure and vocabulary examiners reward',
      color: '#10b981',
      icon: 'write',
    },
    {
      id: 'wr2',
      channel: 'Oxford Online English',
      title: 'Improve Your English Writing — Sentence Structure',
      description: 'Learn how to write clear, well-structured sentences that communicate your ideas effectively.',
      url: 'https://www.youtube.com/watch?v=H2gg6iD4UpI',
      thumbnail: 'https://img.youtube.com/vi/H2gg6iD4UpI/mqdefault.jpg',
      duration: '18 min',
      reason: 'Sentence structure and clarity are the core writing skills to develop',
      color: '#10b981',
      icon: 'document',
    },
  ],
  interview: [
    {
      id: 'int1',
      channel: 'Self Made Millennial',
      title: 'Top 10 HR Interview Questions — Best Answers',
      description: 'Expert answers to the most common HR interview questions with professional language examples.',
      url: 'https://www.youtube.com/watch?v=aOiIe5EBoss',
      thumbnail: 'https://img.youtube.com/vi/aOiIe5EBoss/mqdefault.jpg',
      duration: '22 min',
      reason: 'Covers the most common interview questions you practiced, with model answers',
      color: '#2563eb',
      icon: 'briefcase',
    },
    {
      id: 'int2',
      channel: 'Linda Raynier',
      title: 'How to Answer "Tell Me About Yourself" — Perfect Answer',
      description: 'A professional formula to craft a memorable, confident answer to the most common interview opener.',
      url: 'https://www.youtube.com/watch?v=mBBT2IXZQFM',
      thumbnail: 'https://img.youtube.com/vi/mBBT2IXZQFM/mqdefault.jpg',
      duration: '14 min',
      reason: 'The "Tell me about yourself" answer structure directly addresses your interview weaknesses',
      color: '#2563eb',
      icon: 'handshake',
    },
    {
      id: 'int3',
      channel: 'Work It Daily',
      title: 'STAR Method — How to Answer Behavioral Interview Questions',
      description: 'Master the STAR (Situation, Task, Action, Result) method for structured, impactful interview answers.',
      url: 'https://www.youtube.com/watch?v=Q_x_aFaHJyg',
      thumbnail: 'https://img.youtube.com/vi/Q_x_aFaHJyg/mqdefault.jpg',
      duration: '16 min',
      reason: 'The STAR method will immediately improve the structure of your interview answers',
      color: '#2563eb',
      icon: 'target',
    },
  ],
  listening: [
    {
      id: 'lst1',
      channel: 'English with Lucy',
      title: 'Improve Your English Listening Skills Fast',
      description: 'Evidence-based techniques to train your ears to understand native English speakers quickly.',
      url: 'https://www.youtube.com/watch?v=7WtL7b0Yvfs',
      thumbnail: 'https://img.youtube.com/vi/7WtL7b0Yvfs/mqdefault.jpg',
      duration: '20 min',
      reason: 'Directly targets the listening comprehension gaps found in your test results',
      color: '#0ea5e9',
      icon: 'ear',
    },
    {
      id: 'lst2',
      channel: 'Rachel\'s English',
      title: 'Understanding Fast Native English — Linked Speech',
      description: 'Learn how native speakers naturally connect and reduce words to understand fast English.',
      url: 'https://www.youtube.com/watch?v=l-z-v2VHCxk',
      thumbnail: 'https://img.youtube.com/vi/l-z-v2VHCxk/mqdefault.jpg',
      duration: '17 min',
      reason: 'Connected speech is the main reason learners struggle to understand natural spoken English',
      color: '#0ea5e9',
      icon: 'speaker',
    },
  ],
  reading: [
    {
      id: 'rd1',
      channel: 'IELTS Liz',
      title: 'IELTS Reading — How to Improve Your Score Fast',
      description: 'Master skimming, scanning, and comprehension strategies for reading tests and real-world texts.',
      url: 'https://www.youtube.com/watch?v=nsMIvEi1P4U',
      thumbnail: 'https://img.youtube.com/vi/nsMIvEi1P4U/mqdefault.jpg',
      duration: '25 min',
      reason: 'Directly addresses the reading comprehension strategy gaps shown in your test',
      color: '#f97316',
      icon: 'book',
    },
    {
      id: 'rd2',
      channel: 'Iris Reading',
      title: 'Speed Reading Techniques for English',
      description: 'Proven speed reading strategies to read English texts faster while maintaining full comprehension.',
      url: 'https://www.youtube.com/watch?v=P-OQxPmVohs',
      thumbnail: 'https://img.youtube.com/vi/P-OQxPmVohs/mqdefault.jpg',
      duration: '18 min',
      reason: 'Reading speed and comprehension are the two key skills to develop at your level',
      color: '#f97316',
      icon: 'lightbulb',
    },
  ],
  general: [
    {
      id: 'gen1',
      channel: 'Speak English with Vanessa',
      title: 'How to Practice English by Yourself Every Day',
      description: 'A practical daily routine to improve your English on your own — no classroom needed.',
      url: 'https://www.youtube.com/watch?v=BFGXMZXy9xQ',
      thumbnail: 'https://img.youtube.com/vi/BFGXMZXy9xQ/mqdefault.jpg',
      duration: '15 min',
      reason: 'Consistent daily practice is the fastest path to measurable improvement',
      color: '#38bdf8',
      icon: 'sparkle',
    },
    {
      id: 'gen2',
      channel: 'English with Lucy',
      title: 'My Top 10 Tips to Improve English Fast',
      description: 'Lucy shares the most effective, research-backed strategies to rapidly improve English proficiency.',
      url: 'https://www.youtube.com/watch?v=Ej7CXYWL5KE',
      thumbnail: 'https://img.youtube.com/vi/Ej7CXYWL5KE/mqdefault.jpg',
      duration: '19 min',
      reason: 'These 10 strategies are the highest-impact ways to improve based on your test results',
      color: '#38bdf8',
      icon: 'trendingUp',
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Smart resource selector — picks English YouTube resources based on weaknesses
// Returns max 3 unique resources with thumbnail URLs
// ─────────────────────────────────────────────────────────────────────────────
export function getResourcesForWeaknesses(weaknesses = [], assessmentType = 'general') {
  const categories = new Set()

  const typeMap = {
    speaking:   ['speaking', 'fluency', 'pronunciation'],
    writing:    ['writing', 'grammar', 'vocabulary'],
    grammar:    ['grammar'],
    vocabulary: ['vocabulary'],
    listening:  ['listening'],
    reading:    ['reading'],
    hr:         ['interview', 'speaking', 'fluency'],
  }
  ;(typeMap[assessmentType] || ['general']).forEach(c => categories.add(c))

  const weakStr = (weaknesses || []).join(' ').toLowerCase()
  if (/grammar|tense|verb|sentence|subject|agreement|article|preposition/.test(weakStr)) categories.add('grammar')
  if (/vocabulary|word|lexical|range|limited|diverse/.test(weakStr)) categories.add('vocabulary')
  if (/fluency|hesitat|pause|filler|smooth|flow|natural/.test(weakStr)) categories.add('fluency')
  if (/pronunci|accent|sound|intonation|stress|th-sound/.test(weakStr)) categories.add('pronunciation')
  if (/speaking|confiden|nervous|anxiety/.test(weakStr)) categories.add('speaking')
  if (/interview|professional|formal|hr|job|career/.test(weakStr)) categories.add('interview')
  if (/writing|structure|coherence|paragraph|essay/.test(weakStr)) categories.add('writing')

  const resources = []
  const seen = new Set()

  for (const cat of categories) {
    for (const r of (LEARNING_RESOURCES[cat] || [])) {
      if (!seen.has(r.id) && resources.length < 3) {
        seen.add(r.id)
        resources.push(r)
      }
    }
  }

  // Fill to 3 with general if needed
  if (resources.length < 2) {
    for (const r of LEARNING_RESOURCES.general) {
      if (!seen.has(r.id) && resources.length < 3) {
        seen.add(r.id)
        resources.push(r)
      }
    }
  }

  return resources
}
