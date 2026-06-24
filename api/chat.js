// ─────────────────────────────────────────────────────────────────────────────
// EnglishAce — /api/chat
// Handles three evaluation modes: 'speaking', 'writing', 'hr'
// Key rotation is handled entirely by groqKeys.js
// ─────────────────────────────────────────────────────────────────────────────
import { groqChat, getAllKeys } from './groqKeys.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' })

  if (!getAllKeys().length) {
    return res.status(500).json({ error: 'No Groq API key configured. Set GROQ_API_KEY in environment variables.' })
  }

  try {
    const body       = req.body || {}
    const mode       = typeof body.mode       === 'string' ? body.mode.trim().toLowerCase() : 'hr'
    const question   = typeof body.question   === 'string' ? body.question.trim()           : ''
    const rawTranscript = typeof body.transcript === 'string' ? body.transcript.trim() : ''
    const transcript = rawTranscript.split(/\s+/).slice(0, 1200).join(' ')

    if (!transcript) return res.status(400).json({ error: 'No transcript provided' })

    const wordCount = countWords(transcript)

    // ── ROUTE BY MODE ────────────────────────────────────────────────────────

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
      const result = await groqChat(
        buildSpeakingSystemPrompt(),
        buildSpeakingPrompt(question || 'English speaking topic', transcript, wordCount)
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
// SPEAKING
// ─────────────────────────────────────────────────────────────────────────────
function buildSpeakingSystemPrompt() {
  return `You are a STRICT PROFESSIONAL ENGLISH SPEAKING EVALUATOR.

Evaluate the spoken English transcript below. This is a SPEAKING test.
Judge: fluency, grammar accuracy, vocabulary range, pronunciation clarity (inferred from text), coherence, and confidence.

CRITICAL RULES:
- Evaluate ONLY what was transcribed. NEVER invent words the user did not say.
- If the transcript has no mistakes, return an empty mistakes array.
- Do not create fake mistakes.
- corrected_answer = a more fluent, natural version of what the user said.
- Be strict but fair. Reward real fluency and penalise very short or off-topic answers.
- overall_score must be consistent with the six category scores (roughly their average ± 10).
- level must match overall_score: A1<20, A2 20-39, B1 40-59, B2 60-79, C1 80+

SCORE SCHEMA (0-100 each):
professionalism_score, fluency_score, grammar_score, vocabulary_score, confidence_score, communication_score, overall_score

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
  "strengths": [],
  "weaknesses": [],
  "mistakes": [],
  "corrected_answer": "",
  "tips": []
}`
}

function buildSpeakingPrompt(topic, transcript, wordCount) {
  return `Evaluate this English speaking test response.

SPEAKING TOPIC: ${topic}

USER TRANSCRIPT:
${transcript}

WORD COUNT: ${wordCount}

SCORING GUIDANCE:
- 1-20 words: scores should usually stay between 20-40
- 21-40 words: scores should usually stay between 35-60
- 41+ words: score mainly based on quality and relevance; strong fluent answers can reach 70-90
- Off-topic or incoherent: overall_score below 30 regardless of length
- For mistakes: quote the exact phrase → explain the error → give corrected version
  Example: "I am work here → I work here (wrong verb form)"
- NEVER invent mistakes. Only report what is genuinely wrong in the transcript.
- Return ONLY the JSON schema from the system message.`
}

function buildTooShortSpeakingResult(wordCount) {
  return {
    professionalism_score: 0, fluency_score: 0, grammar_score: 0,
    vocabulary_score: 0, confidence_score: 0, communication_score: 0,
    overall_score: 0, level: 'A1', strengths: [],
    weaknesses: [wordCount === 0 ? 'No speech detected.' : 'Answer too short to evaluate.'],
    mistakes: [],
    corrected_answer: 'Please speak for at least 15-20 seconds about the topic.',
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
    level:            cleanText(s.level),
    strengths:        normalizeArray(s.strengths),
    weaknesses:       normalizeArray(s.weaknesses),
    mistakes:         normalizeArray(s.mistakes),
    corrected_answer: cleanText(s.corrected_answer),
    tips:             normalizeArray(s.tips),
  }

  if (!Number.isFinite(Number(s.overall_score))) {
    r.overall_score = Math.round(
      (r.professionalism_score + r.fluency_score + r.grammar_score +
       r.vocabulary_score + r.confidence_score + r.communication_score) / 6
    )
  }

  if      (wordCount <= 5)  r.overall_score = 0
  else if (wordCount <= 20) r.overall_score = Math.min(r.overall_score, 35)
  else if (wordCount <= 40) r.overall_score = Math.min(r.overall_score, 55)

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
  if (!r.tips.length)      r.tips       = ['Practice speaking for 20-30 seconds minimum', 'Use full sentences', 'Stay on topic']
  return r
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITING
// ─────────────────────────────────────────────────────────────────────────────
function buildWritingSystemPrompt() {
  return `You are a STRICT PROFESSIONAL ENGLISH WRITING EVALUATOR for an online English proficiency test.

Your job: evaluate the written answer below honestly and without inflation.

==============================
CRITICAL RULES — READ CAREFULLY
==============================

1. EVALUATE ONLY WHAT THE USER WROTE.
   - Never invent words, sentences, or ideas the user did not write.
   - Never assume what the user "meant" to write.

2. MISTAKES vs WEAKNESSES — these are DIFFERENT:
   - mistakes array: ONLY real language errors — wrong verb form, misspelling, wrong preposition, subject-verb disagreement, article errors, etc.
     Example of a valid mistake: "I am go to school → I go to school (wrong verb form)"
     Example of NOT a mistake: "The answer is too short" — this belongs in weaknesses.
   - weaknesses array: structural problems, lack of detail, off-topic content, poor organisation, generic writing, insufficient length.
   - NEVER put "lack of detail" or "short answer" inside mistakes.
   - If you find zero real language mistakes, return an empty mistakes array [].

3. SCORING — be strict and realistic:
   - A one-sentence or generic answer must score low across all categories.
   - Scores should reflect the actual quality of the text.
   - overall_score must be approximately the average of the six category scores (± 5 points maximum).
   - Do NOT inflate scores for short or vague answers.

4. LEVEL must match overall_score:
   - 0-19  → A1
   - 20-39 → A2
   - 40-59 → B1
   - 60-79 → B2
   - 80+   → C1

5. corrected_answer: rewrite the user's actual response in better English.
   - If the answer is too short, write what a good answer to the prompt would look like.
   - Always base it on the user's own ideas, not new invented content.

6. Return ONLY valid JSON — no markdown, no extra text, no explanation outside the JSON.

==============================
REQUIRED JSON SCHEMA (all fields mandatory)
==============================
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
  return `Evaluate this English writing test answer strictly and honestly.

WRITING PROMPT:
${question}

USER WRITTEN ANSWER:
${text}

WORD COUNT: ${wordCount}

==============================
SCORING RULES
==============================

Word count guidance:
- 1-10 words   → overall_score must be 0 (too short to evaluate)
- 11-20 words  → overall_score must not exceed 18
- 21-40 words  → overall_score must not exceed 34
- 41-70 words  → score based on quality; well-written responses can reach up to 55
- 71-120 words → well-written responses can reach up to 72
- 121+ words   → well-written responses can reach up to 85

Quality guidance:
- Generic, vague, or off-topic answers: task_response_score below 25, regardless of length.
- Repetitive or padded answers: structure_score and coherence_score below 30.
- If the answer is strong in all areas: overall_score can reach 75-85.

Mistakes guidance:
- Report ONLY real language mistakes found in the text (wrong verb form, misspelling, wrong article, wrong preposition, subject-verb disagreement).
- Format each mistake as: "wrong phrase → corrected phrase (reason)"
  Example: "I am go to school → I go to school (incorrect verb form)"
- If you find no real mistakes, return an empty array.
- DO NOT report "too short" or "lacks detail" as mistakes — those go in weaknesses.

Return ONLY the JSON schema from the system message. No extra text.`
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
    return !low.includes('too short')      && !low.includes('lack of detail') &&
           !low.includes('more detail')    && !low.includes('not enough') &&
           !low.includes('insufficient')
  })

  if (!r.corrected_answer) r.corrected_answer = 'Write a clearer, better-organised response with correct grammar, specific details, and a clear structure.'
  if (!r.strengths.length)  r.strengths  = ['You submitted a written response in English.']
  if (!r.weaknesses.length) r.weaknesses = ['Try to write more sentences and add specific details.']
  if (!r.tips.length)       r.tips       = ['Write at least 5-6 sentences', 'Check grammar and spelling carefully', 'Stay focused on the prompt']
  return r
}

// ─────────────────────────────────────────────────────────────────────────────
// HR INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────
function buildHRSystemPrompt() {
  return `You are a STRICT, EXPERIENCED HR INTERVIEW COACH evaluating a candidate's spoken answer.

Your evaluation must be honest, professional, and based only on what the candidate actually said.

==============================
EVALUATION DIMENSIONS (0-100 each)
==============================

- professionalism_score: Is the tone, language, and approach appropriate for a professional interview?
- fluency_score: Does the candidate speak smoothly, or are there hesitations, fillers, repetition?
- grammar_score: Are grammar structures correct? Are there agreement, tense, or article errors?
- vocabulary_score: Does the candidate use varied, professional vocabulary, or only basic words?
- confidence_score: Does the answer sound assured and clear, or vague and uncertain?
- communication_score: Is the answer clear, structured, and easy to understand?
- overall_score: A single number reflecting the overall quality of the interview answer (approximate average of above ± 5).

==============================
CRITICAL RULES
==============================

1. EVALUATE ONLY WHAT THE CANDIDATE SAID.
   - Never invent words, ideas, or examples the candidate did not mention.
   - If the candidate said nothing or very little, reflect that in LOW scores across all categories.

2. MISTAKES vs WEAKNESSES — strictly separate:
   - mistakes: ONLY real language errors spoken by the candidate.
     Format: "wrong spoken phrase → corrected version (explanation)"
     Example: "I am work in sales → I work in sales (wrong verb form)"
   - weaknesses: content problems — vague answer, not relevant to question, no examples, too short, poor structure.
   - NEVER put content issues inside mistakes. If no real language errors found, return [].

3. SCORING RULES:
   - Short/vague/off-topic answers must score LOW. Do not inflate scores to be encouraging.
   - A very strong, professional, well-structured answer can score 70-85.
   - Exceptional answers (native-level fluency, excellent vocabulary, perfect structure) can reach 85-95.
   - overall_score must be within ±5 of the average of the six category scores.

4. LEVEL must match overall_score:
   - 0-19  → A1
   - 20-39 → A2
   - 40-59 → B1
   - 60-79 → B2
   - 80+   → C1

5. corrected_answer:
   - Rewrite the candidate's actual answer in polished, professional English.
   - If the answer was too short or vague, show what a strong answer to the question would look like.
   - Always base it on the candidate's own ideas — do not invent new facts.

6. tips: Give 2-4 specific, actionable improvements the candidate can make for this type of question.

7. Return ONLY valid JSON. No markdown, no explanations outside the JSON object.

==============================
REQUIRED JSON SCHEMA
==============================
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
  "corrected_answer": "",
  "tips": []
}`
}

function buildHRPrompt(question, transcript, wordCount) {
  return `Evaluate the following HR interview answer honestly and strictly.

INTERVIEW QUESTION:
${question}

CANDIDATE'S SPOKEN ANSWER:
${transcript}

WORD COUNT: ${wordCount}

==============================
SCORING RULES
==============================

Word count guidance:
- 1-10 words   → overall_score must be 0 (too short to evaluate)
- 11-20 words  → overall_score must not exceed 22
- 21-40 words  → overall_score must not exceed 40 (only if relevant and structured)
- 41-80 words  → quality-based; strong answers can reach up to 62
- 81-150 words → quality-based; professional answers can reach up to 78
- 151+ words   → quality-based; exceptional answers can reach 85-95

Quality guidance:
- Off-topic answer: overall_score below 25, communication_score below 20.
- Generic answer with no examples: professionalism_score and communication_score below 40.
- Clear, relevant, well-structured answer with examples: can score 60-78.
- Fluent, professional, native-sounding answer with strong vocabulary: can score 78-95.

Mistakes guidance:
- Only report REAL language mistakes that appear in the transcript text above.
- Format each mistake as: "spoken error → correct version (reason)"
  Example: "I am work in this company → I work in this company (wrong verb form)"
- Each mistake must be quoted directly from the candidate's actual words.
- If no real language mistakes exist, return an empty mistakes array [].
- DO NOT put vague content, short length, or lack of examples into mistakes — those go in weaknesses.

Strengths guidance:
- Only list genuine strengths visible in this answer.
- If the answer is weak, strengths can be empty or contain only one simple observation.
- Never fabricate strengths to soften a poor evaluation.

Return ONLY the JSON schema from the system message. No extra text outside the JSON.`
}

function buildTooShortHRResult(wordCount) {
  return {
    professionalism_score: 0, fluency_score: 0, grammar_score: 0,
    vocabulary_score: 0, confidence_score: 0, communication_score: 0,
    overall_score: 0, level: 'A1', strengths: [],
    weaknesses: [wordCount === 0 ? 'No answer was recorded.' : 'Answer too short to evaluate.'],
    mistakes: [],
    corrected_answer: 'Answer in at least 3-4 full sentences with specific details.',
    tips: ['Speak for at least 20 seconds', 'Answer the question directly', 'Add specific examples', 'Use full sentences']
  }
}

function normalizeHRResult(parsed, wordCount) {
  const s = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
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
    const low = m.toLowerCase()
    return !low.includes('too short')   && !low.includes('lack of detail') &&
           !low.includes('not enough')  && !low.includes('insufficient') &&
           !low.includes('more detail') && !low.includes('no example')
  })

  if (!r.corrected_answer) r.corrected_answer = 'Answer the question directly with 2-3 sentences, give a specific example, and end with a confident closing statement.'
  if (!r.strengths.length && r.overall_score >= 30) r.strengths = ['You attempted to answer the question in English.']
  if (!r.weaknesses.length) r.weaknesses = ['Try to answer with more detail and specific examples.']
  if (!r.tips.length) r.tips = ['Answer in full sentences', 'Give at least one specific example', 'Structure your answer: point → reason → example']
  return r
}
