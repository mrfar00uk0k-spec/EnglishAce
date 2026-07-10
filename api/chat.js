// ─────────────────────────────────────────────────────────────────────────────
// EnglishAce — /api/chat  (Fixed version)
// Fixes: #2A relevance detection, #2B pronunciation, #2C faster (parallel),
//        #2D complete grammar, #2E complete pronunciation report,
//        #5 #6 dynamic result messages, #13 accurate scores
// ─────────────────────────────────────────────────────────────────────────────
import { groqChat, getAllKeys } from './_lib/groqKeys.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' })

  if (!getAllKeys().length) {
    return res.status(500).json({ error: 'No Groq API key configured.' })
  }

  try {
    const body       = req.body || {}
    const mode       = typeof body.mode       === 'string' ? body.mode.trim().toLowerCase() : 'hr'
    const question   = typeof body.question   === 'string' ? body.question.trim()           : ''
    const topicEn    = typeof body.topicEn    === 'string' ? body.topicEn.trim()            : ''
    const topicPrompt= typeof body.topicPrompt=== 'string' ? body.topicPrompt.trim()        : ''
    const rawTranscript = typeof body.transcript === 'string' ? body.transcript.trim() : ''
    const transcript = rawTranscript.split(/\s+/).slice(0, 1200).join(' ')

    if (!transcript) return res.status(400).json({ error: 'No transcript provided' })

    const wordCount = countWords(transcript)

    if (mode === 'writing') {
      if (wordCount <= 10) {
        return res.status(200).json({ result: buildTooShortWritingResult(wordCount) })
      }
      const result = await groqChat(
        buildWritingSystemPrompt(),
        buildWritingPrompt(question || 'Write in English', transcript, wordCount)
      )
      return res.status(200).json({ result: normalizeWritingResult(result, wordCount) })
    }

    if (mode === 'speaking') {
      if (wordCount <= 5) {
        return res.status(200).json({ result: buildTooShortSpeakingResult(wordCount) })
      }
      // Fix #2C: Use optimised token limit for faster speaking analysis
      const result = await groqChat(
        buildSpeakingSystemPrompt(),
        buildSpeakingPrompt(question || 'English speaking topic', transcript, wordCount, topicEn, topicPrompt),
        { maxTokens: 900 }
      )
      return res.status(200).json({ result: normalizeSpeakingResult(result, wordCount) })
    }

    // default → 'hr'
    if (wordCount <= 10) {
      return res.status(200).json({ result: buildTooShortHRResult(wordCount) })
    }
    const result = await groqChat(
      buildHRSystemPrompt(),
      buildHRPrompt(question || 'HR interview question', transcript, wordCount)
    )
    return res.status(200).json({ result: normalizeHRResult(result, wordCount) })

  } catch (err) {
    console.error('chat.js error:', err.message)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UTILS
// ─────────────────────────────────────────────────────────────────────────────
function cleanText(v = '')   { return String(v).replace(/\s+/g, ' ').trim() }
function countWords(t = '')  { return cleanText(t).split(/\s+/).filter(Boolean).length }
function toNum(v, fb = 0)    { const n = Number(v); return Number.isFinite(n) ? n : fb }
function clamp(v, mn, mx)    { return Math.max(mn, Math.min(mx, v)) }
function normalizeArray(v) {
  if (Array.isArray(v))     return v.map(i => cleanText(String(i))).filter(Boolean)
  if (typeof v === 'string') { const t = cleanText(v); return t ? [t] : [] }
  return []
}
function scoreToLevel(s) {
  if (s >= 80) return 'C1'
  if (s >= 60) return 'B2'
  if (s >= 40) return 'B1'
  if (s >= 20) return 'A2'
  return 'A1'
}

// ─────────────────────────────────────────────────────────────────────────────
// SPEAKING — Fixes #2A #2B #2D #2E #13
// ─────────────────────────────────────────────────────────────────────────────
function buildSpeakingSystemPrompt() {
  return `You are a STRICT PROFESSIONAL ENGLISH SPEAKING EVALUATOR and IELTS examiner.

Evaluate the spoken English transcript. Judge: fluency, grammar, vocabulary, pronunciation clarity, coherence, relevance to topic, and confidence.

CRITICAL RULES:
1. RELEVANCE CHECK (Fix #2A): Check if the answer actually addresses the given topic/question.
   - If the answer is completely off-topic or irrelevant, set relevance_warning to a clear explanation.
   - Off-topic answers must receive a lower overall_score (max 35).
   - Leave relevance_warning as "" if the answer is on topic.

2. GRAMMAR — List ALL mistakes, not just a few (Fix #2D):
   - Every tense error, article error, preposition, agreement, word form mistake.
   - Format each: "wrong phrase → corrected phrase (explanation)"
   - NEVER invent mistakes. Only what's genuinely wrong in the transcript.

3. PRONUNCIATION — Comprehensive report (Fix #2B, #2E):
   - Identify ALL words likely mispronounced based on common patterns for Arabic speakers.
   - Common issues: th-sounds (θ/ð), p/b confusion, long/short vowels, silent letters, word stress, consonant clusters.
   - Format pronunciation_notes as separate items, NOT mixed with grammar mistakes.

4. SCORES — Must be accurate and consistent (Fix #13):
   - overall_score ≈ average of the six category scores (±5 max).
   - Off-topic: overall_score ≤ 35 regardless of language quality.
   - Short answer (< 20 words): overall_score ≤ 40.

5. corrected_answer = a more fluent, natural rewrite of what the user said.
6. level must match: A1<20, A2 20-39, B1 40-59, B2 60-79, C1 80+

Return ONLY valid JSON — no markdown, no extra text:
{
  "professionalism_score": 0,
  "fluency_score": 0,
  "grammar_score": 0,
  "vocabulary_score": 0,
  "confidence_score": 0,
  "communication_score": 0,
  "overall_score": 0,
  "level": "A1",
  "relevance_warning": "",
  "strengths": [],
  "weaknesses": [],
  "mistakes": [],
  "pronunciation_notes": [],
  "corrected_answer": "",
  "tips": []
}`
}

function buildSpeakingPrompt(topic, transcript, wordCount, topicEn, topicPrompt) {
  return `Evaluate this English speaking test response.

SPEAKING TOPIC: ${topicEn || topic}
TOPIC QUESTION: ${topicPrompt || topic}
FULL TOPIC CONTEXT: ${topic}

USER TRANSCRIPT:
${transcript}

WORD COUNT: ${wordCount}

RELEVANCE CHECK (Fix #2A):
- Does the answer actually address the topic above?
- If NOT, set relevance_warning to: "Your answer does not address the question about [topic]. You talked about [what they said] instead. Please focus on [key aspects of the question]."
- If YES, leave relevance_warning as "".

GRAMMAR MISTAKES (Fix #2D — find ALL of them):
- Check every sentence for errors: tense, articles (a/an/the), prepositions, word form, agreement, missing words.
- Quote the exact wrong phrase → corrected phrase (reason).
- If no real mistakes, return [].
- Do NOT add "too short" or "off-topic" as grammar mistakes.

PRONUNCIATION NOTES (Fix #2B, #2E):
- Based on transcript text, identify words Arabic speakers typically mispronounce.
- Include: th-sounds, p/b, silent letters, stress patterns, vowel length, consonant clusters.
- Format: "word → /IPA/ — issue explanation — tip to fix it"
- Be thorough — list every word with a likely pronunciation issue.

SCORING (Fix #13):
- 1-20 words: scores 15-35 range
- 21-40 words: scores 30-55 range  
- 41+ words: quality-based, strong answers 60-85
- Off-topic answer: overall_score max 35, communication_score max 25

TIPS (Fix #7):
- If score ≥ 80: Give ADVANCED tips only (discourse markers, intonation, field vocabulary).
- If score < 80: Give tips specific to the actual mistakes found above.

Return ONLY the JSON schema from the system message.`
}

function buildTooShortSpeakingResult(wordCount) {
  return {
    professionalism_score: 0, fluency_score: 0, grammar_score: 0,
    vocabulary_score: 0, confidence_score: 0, communication_score: 0,
    overall_score: 0, level: 'A1',
    relevance_warning: '',
    strengths: [],
    weaknesses: [wordCount === 0 ? 'No speech detected.' : 'Answer too short to evaluate.'],
    mistakes: [],
    pronunciation_notes: [],
    corrected_answer: 'Please speak for at least 20 seconds about the topic.',
    tips: ['Allow microphone access', 'Speak clearly', 'Speak for at least 20 seconds', 'Stay on topic']
  }
}

function normalizeSpeakingResult(parsed, wordCount) {
  const s = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  const r = {
    professionalism_score: clamp(toNum(s.professionalism_score, 0), 0, 100),
    fluency_score:         clamp(toNum(s.fluency_score,         0), 0, 100),
    grammar_score:         clamp(toNum(s.grammar_score,         0), 0, 100),
    vocabulary_score:      clamp(toNum(s.vocabulary_score,      0), 0, 100),
    confidence_score:      clamp(toNum(s.confidence_score,      0), 0, 100),
    communication_score:   clamp(toNum(s.communication_score,   0), 0, 100),
    overall_score:         clamp(toNum(s.overall_score,         0), 0, 100),
    level:                cleanText(s.level),
    relevance_warning:    cleanText(s.relevance_warning || ''),
    strengths:            normalizeArray(s.strengths),
    weaknesses:           normalizeArray(s.weaknesses),
    mistakes:             normalizeArray(s.mistakes),
    pronunciation_notes:  normalizeArray(s.pronunciation_notes),
    corrected_answer:     cleanText(s.corrected_answer),
    tips:                 normalizeArray(s.tips),
  }

  if (!Number.isFinite(Number(s.overall_score))) {
    r.overall_score = Math.round(
      (r.professionalism_score + r.fluency_score + r.grammar_score +
       r.vocabulary_score + r.confidence_score + r.communication_score) / 6
    )
  }

  // Fix #13: Accurate score capping
  if      (wordCount <= 5)  r.overall_score = 0
  else if (wordCount <= 20) r.overall_score = Math.min(r.overall_score, 38)
  else if (wordCount <= 40) r.overall_score = Math.min(r.overall_score, 58)

  // Fix #2A: Off-topic penalty
  if (r.relevance_warning && r.relevance_warning.length > 10) {
    r.overall_score = Math.min(r.overall_score, 35)
    r.communication_score = Math.min(r.communication_score, 30)
  }

  r.overall_score         = clamp(Math.round(r.overall_score),         0, 100)
  r.professionalism_score = clamp(Math.round(r.professionalism_score), 0, 100)
  r.fluency_score         = clamp(Math.round(r.fluency_score),         0, 100)
  r.grammar_score         = clamp(Math.round(r.grammar_score),         0, 100)
  r.vocabulary_score      = clamp(Math.round(r.vocabulary_score),      0, 100)
  r.confidence_score      = clamp(Math.round(r.confidence_score),      0, 100)
  r.communication_score   = clamp(Math.round(r.communication_score),   0, 100)
  r.level = scoreToLevel(r.overall_score)

  if (!r.corrected_answer) r.corrected_answer = 'Try to speak more fluently and structure your answer clearly.'
  if (!r.strengths.length) r.strengths  = ['You attempted the speaking test.']
  if (!r.weaknesses.length) r.weaknesses = ['Try to speak for longer and add more detail.']
  if (!r.tips.length)      r.tips       = ['Practice speaking 20-30 seconds minimum', 'Use full sentences', 'Stay on topic']
  return r
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITING
// ─────────────────────────────────────────────────────────────────────────────
function buildWritingSystemPrompt() {
  return `You are a STRICT PROFESSIONAL ENGLISH WRITING EVALUATOR for an online English proficiency test.

CRITICAL RULES:
1. EVALUATE ONLY WHAT THE USER WROTE. Never invent content.
2. mistakes array: ONLY real language errors (wrong verb form, misspelling, wrong preposition, article errors, agreement errors).
   Format: "wrong phrase → correct phrase (reason)"
   If zero real mistakes, return [].
3. weaknesses: structural/content problems (too short, vague, off-topic, no organisation).
   NEVER put "too short" or "lacks detail" inside mistakes.
4. SCORING — be strict:
   - overall_score must be approximately the average of the six scores (±5 max).
   - Do NOT inflate scores.
5. level must match: 0-19→A1, 20-39→A2, 40-59→B1, 60-79→B2, 80+→C1
6. corrected_answer: rewrite in better English, based on the user's own ideas.
7. Return ONLY valid JSON — no markdown.

SCHEMA:
{
  "grammar_score": 0,
  "vocabulary_score": 0,
  "structure_score": 0,
  "clarity_score": 0,
  "coherence_score": 0,
  "task_response_score": 0,
  "overall_score": 0,
  "level": "A1",
  "strengths": [],
  "weaknesses": [],
  "mistakes": [],
  "corrected_answer": "",
  "tips": []
}`
}

function buildWritingPrompt(question, text, wordCount) {
  return `Evaluate this English writing test answer strictly.

WRITING PROMPT: ${question}
USER WRITTEN ANSWER: ${text}
WORD COUNT: ${wordCount}

SCORING RULES:
- 1-10 words   → overall_score = 0
- 11-20 words  → overall_score max 18
- 21-40 words  → overall_score max 34
- 41-70 words  → quality-based; max 55
- 71-120 words → quality-based; max 72
- 121+ words   → quality-based; max 85

MISTAKES: Only REAL language errors found in the text. Format: "wrong → corrected (reason)". Empty array if none.
TIPS (Fix #7): If score ≥ 80, give advanced writing tips only. Otherwise give specific tips based on the mistakes found.
Return ONLY the JSON schema from the system message.`
}

function buildTooShortWritingResult(wordCount) {
  return {
    grammar_score: 0, vocabulary_score: 0, structure_score: 0,
    clarity_score: 0, coherence_score: 0, task_response_score: 0,
    overall_score: 0, level: 'A1', strengths: [],
    weaknesses: [wordCount === 0 ? 'No text submitted.' : 'Answer too short to evaluate.'],
    mistakes: [],
    corrected_answer: 'Write at least 3-4 full sentences directly responding to the prompt.',
    tips: ['Write at least 40 words', 'Answer the prompt directly', 'Add details and examples', 'Check spelling before submitting']
  }
}

function normalizeWritingResult(parsed, wordCount) {
  const s = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  const r = {
    grammar_score:       clamp(toNum(s.grammar_score,       0), 0, 100),
    vocabulary_score:    clamp(toNum(s.vocabulary_score,    0), 0, 100),
    structure_score:     clamp(toNum(s.structure_score,     0), 0, 100),
    clarity_score:       clamp(toNum(s.clarity_score,       0), 0, 100),
    coherence_score:     clamp(toNum(s.coherence_score,     0), 0, 100),
    task_response_score: clamp(toNum(s.task_response_score, 0), 0, 100),
    overall_score:       clamp(toNum(s.overall_score,       0), 0, 100),
    level:            cleanText(s.level),
    strengths:        normalizeArray(s.strengths),
    weaknesses:       normalizeArray(s.weaknesses),
    mistakes:         normalizeArray(s.mistakes),
    corrected_answer: cleanText(s.corrected_answer),
    tips:             normalizeArray(s.tips),
  }

  if (!Number.isFinite(Number(s.overall_score))) {
    r.overall_score = Math.round(
      (r.grammar_score + r.vocabulary_score + r.structure_score +
       r.clarity_score + r.coherence_score + r.task_response_score) / 6
    )
  }

  if      (wordCount <= 10) r.overall_score = 0
  else if (wordCount <= 20) r.overall_score = Math.min(r.overall_score, 30)
  else if (wordCount <= 40) r.overall_score = Math.min(r.overall_score, 50)
  else if (wordCount <= 70) r.overall_score = Math.min(r.overall_score, 65)

  r.overall_score         = clamp(Math.round(r.overall_score),         0, 100)
  r.grammar_score         = clamp(Math.round(r.grammar_score),         0, 100)
  r.vocabulary_score      = clamp(Math.round(r.vocabulary_score),      0, 100)
  r.structure_score       = clamp(Math.round(r.structure_score),       0, 100)
  r.clarity_score         = clamp(Math.round(r.clarity_score),         0, 100)
  r.coherence_score       = clamp(Math.round(r.coherence_score),       0, 100)
  r.task_response_score   = clamp(Math.round(r.task_response_score),   0, 100)
  r.level = scoreToLevel(r.overall_score)

  r.mistakes = r.mistakes.filter(m => {
    const low = m.toLowerCase()
    return !low.includes('too short') && !low.includes('lack of detail') &&
           !low.includes('more detail') && !low.includes('not enough') &&
           !low.includes('insufficient')
  })

  if (!r.corrected_answer) r.corrected_answer = 'Write a clearer, well-organised response with correct grammar and specific details.'
  if (!r.strengths.length)  r.strengths  = ['You submitted a written response in English.']
  if (!r.weaknesses.length) r.weaknesses = ['Try to write more sentences and add specific details.']
  if (!r.tips.length)       r.tips       = ['Write at least 5-6 sentences', 'Check grammar and spelling', 'Stay focused on the prompt']
  return r
}

// ─────────────────────────────────────────────────────────────────────────────
// HR INTERVIEW — Fix #3 (complete analysis), #14 (no empty corrections)
// ─────────────────────────────────────────────────────────────────────────────
function buildHRSystemPrompt() {
  return `You are a STRICT, EXPERIENCED HR INTERVIEW COACH evaluating a candidate's spoken answer.

CRITICAL RULES:
1. EVALUATE ONLY WHAT THE CANDIDATE SAID.
2. mistakes: ONLY real language errors spoken by the candidate.
   Format: "wrong phrase → corrected (explanation)"
   Empty array [] if no real language mistakes.
3. weaknesses: content problems (vague, not relevant, no examples, too short).
   NEVER put content issues inside mistakes.
4. transcript must always be echoed back in the response.
5. corrections array: ALWAYS provide at least 1 correction/improvement even if language is perfect.
   Focus on: content structure, professional vocabulary, impact statements, STAR method.
6. SCORING — accurate and consistent (Fix #13):
   overall_score ≈ average of six scores ±5. Do NOT inflate.
7. level: 0-19→A1, 20-39→A2, 40-59→B1, 60-79→B2, 80+→C1

Return ONLY valid JSON:
{
  "professionalism_score": 0,
  "fluency_score": 0,
  "grammar_score": 0,
  "vocabulary_score": 0,
  "confidence_score": 0,
  "communication_score": 0,
  "overall_score": 0,
  "level": "A1",
  "strengths": [],
  "weaknesses": [],
  "mistakes": [],
  "corrections": [{"category":"","issue":"","improvement":"","example":""}],
  "corrected_answer": "",
  "tips": []
}`
}

function buildHRPrompt(question, transcript, wordCount) {
  return `Evaluate this HR interview answer.

INTERVIEW QUESTION: ${question}
CANDIDATE'S ANSWER: ${transcript}
WORD COUNT: ${wordCount}

SCORING:
- 1-10 words   → overall_score = 0
- 11-20 words  → max 22
- 21-40 words  → max 40
- 41-80 words  → quality-based; max 62
- 81-150 words → quality-based; max 78
- 151+ words   → exceptional; max 95

CORRECTIONS (Fix #14 — never empty):
Always provide at least 1 correction in this format:
{ "category": "Content/Grammar/Vocabulary/Structure/Professionalism", "issue": "specific problem", "improvement": "how to fix it", "example": "example of the improvement" }
Even for strong answers, suggest how they could be even better professionally.

TIPS (Fix #7): If score ≥ 80, give advanced professional development tips. Otherwise give specific tips based on the actual weaknesses found.

Return ONLY the JSON schema from the system message.`
}

function buildTooShortHRResult(wordCount) {
  return {
    professionalism_score: 0, fluency_score: 0, grammar_score: 0,
    vocabulary_score: 0, confidence_score: 0, communication_score: 0,
    overall_score: 0, level: 'A1', strengths: [],
    weaknesses: [wordCount === 0 ? 'No answer was recorded.' : 'Answer too short to evaluate.'],
    mistakes: [],
    corrections: [{ category: 'Content', issue: 'No answer provided', improvement: 'Speak for at least 30 seconds with 3-4 full sentences', example: 'Tell me about yourself → "I am a [role] with [X] years of experience in [field]. My key achievement was..."' }],
    corrected_answer: 'Answer in at least 3-4 full sentences with specific details.',
    tips: ['Speak for at least 30 seconds', 'Answer the question directly', 'Add specific examples', 'Use full sentences']
  }
}

function normalizeHRResult(parsed, wordCount) {
  const s = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  const toArr = (v) => {
    if (!Array.isArray(v)) { if (typeof v === 'string' && v.trim()) return [v.trim()]; return [] }
    return v.map(i => typeof i === 'string' ? i.trim() : (typeof i === 'object' ? i : String(i))).filter(Boolean)
  }

  const r = {
    professionalism_score: clamp(toNum(s.professionalism_score, 0), 0, 100),
    fluency_score:         clamp(toNum(s.fluency_score,         0), 0, 100),
    grammar_score:         clamp(toNum(s.grammar_score,         0), 0, 100),
    vocabulary_score:      clamp(toNum(s.vocabulary_score,      0), 0, 100),
    confidence_score:      clamp(toNum(s.confidence_score,      0), 0, 100),
    communication_score:   clamp(toNum(s.communication_score,   0), 0, 100),
    overall_score:         clamp(toNum(s.overall_score,         0), 0, 100),
    level:            cleanText(s.level),
    strengths:        normalizeArray(s.strengths),
    weaknesses:       normalizeArray(s.weaknesses),
    mistakes:         normalizeArray(s.mistakes),
    corrections:      toArr(s.corrections),
    corrected_answer: cleanText(s.corrected_answer),
    tips:             normalizeArray(s.tips),
  }

  if (!Number.isFinite(Number(s.overall_score))) {
    r.overall_score = Math.round(
      (r.professionalism_score + r.fluency_score + r.grammar_score +
       r.vocabulary_score + r.confidence_score + r.communication_score) / 6
    )
  }

  if      (wordCount <= 10) r.overall_score = 0
  else if (wordCount <= 20) r.overall_score = Math.min(r.overall_score, 35)
  else if (wordCount <= 40) r.overall_score = Math.min(r.overall_score, 55)
  else if (wordCount <= 80) r.overall_score = Math.min(r.overall_score, 72)

  r.overall_score         = clamp(Math.round(r.overall_score),         0, 100)
  r.professionalism_score = clamp(Math.round(r.professionalism_score), 0, 100)
  r.fluency_score         = clamp(Math.round(r.fluency_score),         0, 100)
  r.grammar_score         = clamp(Math.round(r.grammar_score),         0, 100)
  r.vocabulary_score      = clamp(Math.round(r.vocabulary_score),      0, 100)
  r.confidence_score      = clamp(Math.round(r.confidence_score),      0, 100)
  r.communication_score   = clamp(Math.round(r.communication_score),   0, 100)
  r.level = scoreToLevel(r.overall_score)

  r.mistakes = r.mistakes.filter(m => {
    const low = typeof m === 'string' ? m.toLowerCase() : ''
    return !low.includes('too short') && !low.includes('lack of detail') &&
           !low.includes('not enough') && !low.includes('insufficient')
  })

  // Fix #14: Corrections never empty
  if (!r.corrections || r.corrections.length === 0) {
    r.corrections = [{ category: 'Structure', issue: 'Answer structure could be more impactful', improvement: 'Use the STAR method: Situation → Task → Action → Result', example: '"In my previous role [Situation], I was responsible for [Task]. I [Action], which resulted in [Result]."' }]
  }

  if (!r.corrected_answer) r.corrected_answer = 'Answer the question directly with a clear example and a confident closing statement.'
  if (!r.strengths.length && r.overall_score >= 30) r.strengths = ['You attempted to answer the question in English.']
  if (!r.weaknesses.length) r.weaknesses = ['Try to answer with more detail and specific examples.']
  if (!r.tips.length) r.tips = ['Answer in full sentences', 'Give at least one specific example', 'Structure: point → reason → example']
  return r
}
