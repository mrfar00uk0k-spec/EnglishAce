// ─────────────────────────────────────────────────────────────────────────────
// EnglishAce — /api/chat
// Handles three evaluation modes: 'speaking', 'writing', 'hr'
// Key rotation is handled entirely by groqKeys.js
// ─────────────────────────────────────────────────────────────────────────────
import { groqChat, getAllKeys } from './_lib/groqKeys.js'

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
      const topicEn     = typeof body.topicEn     === 'string' ? body.topicEn.trim()     : ''
      const topicPrompt = typeof body.topicPrompt === 'string' ? body.topicPrompt.trim() : ''
      const fullTopic   = [question, topicEn, topicPrompt].filter(Boolean).join(' — ') || 'English speaking topic'
      const result = await groqChat(
        buildSpeakingSystemPrompt(),
        buildSpeakingPrompt(fullTopic, transcript, wordCount),
        { temperature: 0, seed: 42 } // STEP 17 — maximise determinism/stability for evaluation scoring
      )
      return res.status(200).json({ result: normalizeSpeakingResult(result, wordCount) })
    }

    // default → 'hr'
    if (wordCount <= 10) {
      return res.status(200).json({ result: buildTooShortHRResult(wordCount) })
    }
    const result = await groqChat(
      buildHRSystemPrompt(),
      buildHRPrompt(question || 'HR interview question', transcript, wordCount),
      { temperature: 0, seed: 42 } // STEP 17 — maximise determinism/stability for evaluation scoring
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
// STEP 11 — Overall Score is a WEIGHTED composite, never a plain arithmetic average.
// Speaking weights: Grammar 20% / Vocabulary 20% / Fluency 20% / Pronunciation 15% / Communication 15% / Confidence 10%
const SPEAKING_WEIGHTS = {
  grammar_score:       0.20,
  vocabulary_score:    0.20,
  fluency_score:       0.20,
  pronunciation_score: 0.15,
  communication_score: 0.15,
  confidence_score:    0.10,
}

// HR weights: same base distribution, but Professionalism replaces part of Confidence
// (Confidence's 10% is split evenly between Confidence and Professionalism, 5% each).
const HR_WEIGHTS = {
  grammar_score:         0.20,
  vocabulary_score:      0.20,
  fluency_score:         0.20,
  pronunciation_score:   0.15,
  communication_score:   0.15,
  confidence_score:      0.05,
  professionalism_score: 0.05,
}

function weightedOverall(scores, weights) {
  let total = 0
  let weightSum = 0
  for (const key of Object.keys(weights)) {
    const v = scores[key]
    if (typeof v === 'number' && Number.isFinite(v)) {
      total += v * weights[key]
      weightSum += weights[key]
    }
  }
  // Re-normalise in case a category is missing, so the weights actually used still sum to 1.
  if (weightSum <= 0) return 0
  return total / weightSum
}

// STEP 12 — CEFR mapping (exact bands, including High/Mid B2 sub-levels)
//   95–100 → C1
//   85–94  → High B2
//   75–84  → Mid B2
//   65–74  → B1
//   50–64  → A2
//   <50    → A1
// This detailed value is returned as `level` (matches the spec's canonical
// CEFR band exactly, including the High/Mid B2 distinction).
function scoreToLevel(s) {
  if (s >= 95) return 'C1'
  if (s >= 85) return 'High B2'
  if (s >= 75) return 'Mid B2'
  if (s >= 65) return 'B1'
  if (s >= 50) return 'A2'
  return 'A1'
}

// Base CEFR letter only (collapses High/Mid B2 into plain B2) — returned
// alongside `level` as `level_base`, for any UI element (like a small fixed-size
// badge) that needs the compact 6-point scale rather than the descriptive sub-band.
function scoreToBaseLevel(s) {
  if (s >= 95) return 'C1'
  if (s >= 75) return 'B2'
  if (s >= 65) return 'B1'
  if (s >= 50) return 'A2'
  return 'A1'
}

// ─────────────────────────────────────────────────────────────────────────────
// SPEAKING
// ─────────────────────────────────────────────────────────────────────────────
function buildSpeakingSystemPrompt() {
  return `You are an EXPERT ENGLISH SPEAKING EXAMINER, evaluating as close as possible to the official IELTS Speaking Band Descriptors, adapted for EnglishAce learners.

Your evaluation must be consistent, fair, explainable, stable, and resistant to random scoring. The SAME quality answer should receive nearly the SAME score every time you evaluate it — avoid large fluctuations, reason deterministically from the evidence in the transcript, not from guesswork.

=====================================================
STEP 1 — EVALUATE THE TRANSCRIPT, NOT THE RAW STT OUTPUT
=====================================================
Speech-to-text is imperfect. Before judging anything, silently identify any part of the transcript that is CLEARLY a transcription error (a real word replaced by a similar-sounding wrong word), and evaluate what the user almost certainly INTENDED to say instead.
Example: if the transcript reads "I leaf in Egypt" but the person obviously meant "I live in Egypt", treat this as a likely STT error, not as a double grammar-AND-pronunciation failure. Do not penalise the same probable transcription slip twice (once as a grammar mistake and once as a pronunciation mistake).
Only flag something as a real user mistake when it is not plausibly just a transcription artifact.

=====================================================
STEP 2 — ACCENT IS NEVER A SCORING CRITERION
=====================================================
NEVER penalise Egyptian, Gulf, Indian, Pakistani, African, Asian, or any other regional accent. Judge pronunciation ONLY on intelligibility — could a listener understand what was said? Reduce the pronunciation score only when speech would genuinely be difficult for a listener to understand, never because it doesn't sound "native" or "Western".

=====================================================
STEP 3 — SCORE EVERY CATEGORY INDEPENDENTLY
=====================================================
Calculate each of the following categories independently, based on its own specific rubric below. NEVER invent one overall impression first and then split it across categories — each score must be justified on its own terms by the transcript evidence.
Categories: Grammar, Vocabulary, Fluency, Pronunciation, Communication, Confidence, Overall Score, CEFR Level.

=====================================================
STEP 4 — GRAMMAR RUBRIC (grammar_score)
=====================================================
Evaluate: sentence structure, verb tenses, subject–verb agreement, articles, prepositions, word order, plural forms, and grammatical complexity attempted.
Score guide:
  95–100 → almost no grammar mistakes
  80–94  → minor mistakes that do not affect meaning
  65–79  → noticeable mistakes but still understandable
  45–64  → frequent grammar problems
  below 45 → grammar prevents communication
Never count the same underlying mistake more than once toward the score.

=====================================================
STEP 5 — VOCABULARY RUBRIC (vocabulary_score)
=====================================================
Evaluate: vocabulary range, word choice accuracy, topic relevance, collocations, phrasal verbs, idiomatic expressions (bonus, not required), repetition of the same words, and overall appropriateness.
Do NOT reward difficult/advanced words used incorrectly — that is a vocabulary weakness, not a strength. Reward natural, accurate vocabulary use over showy but wrong vocabulary.

=====================================================
STEP 6 — FLUENCY RUBRIC (fluency_score)
=====================================================
Evaluate: natural pace, long unnatural pauses, hesitation, repetition, self-correction, sentence continuity, and logical flow between ideas.
Small, natural pauses are completely normal and must NOT be penalised. Only reduce the score for genuinely excessive hesitation that disrupts communication.

=====================================================
STEP 7 — PRONUNCIATION RUBRIC (pronunciation_score)
=====================================================
Evaluate: clarity, word stress, sentence stress, intelligibility, and connected speech — inferred from the transcript and any disfluency markers present.
NEVER judge accent. Only judge understandability. A strong regional accent that is still perfectly intelligible must score HIGH here.

=====================================================
STEP 8 — COMMUNICATION RUBRIC (communication_score)
=====================================================
Evaluate: did the user actually answer the question? Did they stay on topic? Did they explain their ideas? Did they support opinions with reasoning? Did they give examples? Did they organise ideas logically?

=====================================================
STEP 9 — CONFIDENCE RUBRIC (confidence_score)
=====================================================
Evaluate confidence using LINGUISTIC indicators only: natural delivery, assured phrasing, speaking rhythm, absence of excessive hedging or hesitation markers. Do NOT assume confidence from voice volume or loudness — you only have the transcript, so infer confidence from how the ideas are expressed, not how loud they were spoken.

=====================================================
STEP 11 — OVERALL SCORE (weighted composite — NOT a plain average)
=====================================================
overall_score must be computed as this weighted composite, not a simple average:
  Grammar 20% + Vocabulary 20% + Fluency 20% + Pronunciation 15% + Communication 15% + Confidence 10%
Round to the nearest whole number. NEVER return an impossible combination — for example, Grammar 40, Vocabulary 35, Fluency 30 can NEVER produce an Overall Score of 95. If your category scores are all low, the weighted overall_score must also be low; verify this arithmetically before responding.

=====================================================
STEP 16 — FAIRNESS RULES
=====================================================
Never reward: length alone, complex words alone, fast speech alone.
Never punish: accent, age, gender, country, speaking speed alone, or shyness.
Always reward: correct English, clear communication, logical answers, natural speaking.

=====================================================
STEP 17 — STABILITY
=====================================================
If this same transcript were evaluated again, your overall_score should vary by no more than ±2 points. Reason from concrete evidence in the text (specific mistakes found, specific strengths observed) rather than an impressionistic overall feeling, so your scoring is reproducible.

=====================================================
STEP 18 — FINAL VALIDATION (do this silently before answering)
=====================================================
Before returning your JSON, internally check:
- Do all category scores agree with each other and with the weighted overall_score formula in STEP 11?
- Does the CEFR level match the evidence (STEP 12 mapping)?
- Do the strengths and weaknesses actually reference this specific transcript, not generic filler?
- Are the grammar mistakes listed genuinely present in the transcript (not invented)?
- Is the corrected_answer actually better than what the user said?
If anything is inconsistent, silently revise your evaluation before producing the final JSON. Never show this reasoning — output ONLY the JSON.

=====================================================
RELEVANCE / OFF-TOPIC CHECK (decide this first, before any of the above)
=====================================================
- Does the answer actually engage with the given speaking topic/question at all?
- If the transcript is about a COMPLETELY DIFFERENT subject (not the topic asked), set "off_topic": true.
- If off_topic is true: set every score to 0, leave mistakes/pronunciation_notes/strengths/weaknesses empty, leave corrected_answer empty, and put a short clear explanation in "off_topic_reason" (e.g. "You spoke about X instead of Y").
- If the answer does engage with the topic (even briefly or imperfectly), set "off_topic": false and evaluate normally using STEPS 1–18 above.
- Being brief or simple is NOT the same as off-topic — only mark off_topic true when the subject matter itself is unrelated.

=====================================================
GRAMMAR MISTAKES LIST (mistakes array)
=====================================================
For every real, important mistake found, provide: the wrong sentence/phrase, the correct version, and a short explanation. Format: "wrong phrase → corrected phrase (reason why)". Do NOT invent mistakes that are not genuinely present. Do NOT flag "i" vs "I" capitalisation as a mistake — ignore that entirely (it is a transcription artifact, per STEP 1).

=====================================================
PRONUNCIATION NOTES (pronunciation_notes array)
=====================================================
Based on the text, identify words the speaker likely mispronounced in a way that affects intelligibility (never accent alone). Common issues: th-sounds (θ/ð), p/b confusion, silent letters, word stress, long/short vowels, consonant clusters at word end. Format: "word → /IPA/ — issue description — tip to fix it". Put these in "pronunciation_notes", NOT in "mistakes".

=====================================================
CEFR LEVEL (STEP 12 — exact bands, must match overall_score exactly)
=====================================================
  95–100 → C1
  85–94  → High B2
  75–84  → Mid B2
  65–74  → B1
  50–64  → A2
  below 50 → A1
Do not assign the CEFR level arbitrarily — it must be the exact band containing overall_score.

Return ONLY valid JSON — no markdown, no extra text, no reasoning shown:
{
  "off_topic": false,
  "off_topic_reason": "",
  "grammar_score": 0,
  "vocabulary_score": 0,
  "fluency_score": 0,
  "pronunciation_score": 0,
  "communication_score": 0,
  "confidence_score": 0,
  "professionalism_score": 0,
  "overall_score": 0,
  "level": "A1",
  "strengths": [],
  "weaknesses": [],
  "mistakes": [],
  "pronunciation_notes": [],
  "corrected_answer": "",
  "tips": []
}`
}

function buildSpeakingPrompt(topic, transcript, wordCount) {
  return `Evaluate this English speaking test response.

SPEAKING TOPIC: ${topic}

USER TRANSCRIPT (raw speech-to-text — may contain transcription slips, see STEP 1):
${transcript}

WORD COUNT: ${wordCount}

STEP 0 — OFF-TOPIC CHECK (decide this first):
Does the transcript actually talk about the topic above, even loosely? If it is about something else entirely, set off_topic:true, off_topic_reason to a one-sentence explanation naming what they actually talked about vs. what was asked, and set every score to 0 with empty arrays. Skip everything below for an off-topic answer.

STEP 1 — CLEAN OBVIOUS TRANSCRIPTION ERRORS FIRST:
Before scoring, mentally correct any word that is clearly a speech-to-text mistake (a similar-sounding wrong word in place of the obviously intended one), and evaluate the INTENDED sentence. Do not deduct grammar AND pronunciation for the same likely transcription slip.

STEP 2 — IGNORE ACCENT ENTIRELY:
Do not penalise any regional accent (Egyptian, Gulf, Indian, Pakistani, African, Asian, or any other). Judge pronunciation only by whether the message would be intelligible to a listener.

STEP 3–9 — SCORE EACH CATEGORY INDEPENDENTLY using its own rubric from the system message:
grammar_score, vocabulary_score, fluency_score, pronunciation_score, communication_score, confidence_score.
(professionalism_score is not scored for Speaking — set it to 0.)

GRAMMAR MISTAKES (mistakes array — find ALL real ones):
- Every tense error, article error, preposition error, agreement error, missing word.
- Format: "wrong phrase → corrected phrase (explanation)"
- Only real mistakes found in the transcript, after applying STEP 1's STT-cleaning. Return [] if none.
- Do NOT flag "i" vs "I" capitalisation as a mistake.

PRONUNCIATION NOTES (pronunciation_notes array):
- All words likely mispronounced in a way that affects intelligibility (never accent alone): th-sounds, p/b, stress, silent letters, vowels, consonant clusters.
- Format: "word → /IPA/ — issue — tip"
- Be comprehensive but only report genuine intelligibility issues, not accent variation.

STEP 11 — OVERALL SCORE (weighted composite, NOT a plain average):
overall_score = grammar_score×0.20 + vocabulary_score×0.20 + fluency_score×0.20 + pronunciation_score×0.15 + communication_score×0.15 + confidence_score×0.10
Round to the nearest whole number. Verify this arithmetic before answering — the category scores and the overall_score must be mutually consistent.

WORD-COUNT GUIDANCE (applies on top of the weighted formula above, as a ceiling for short answers):
- 1–20 words: overall_score max 38
- 21–40 words: overall_score max 58
- 41+ words: quality-based, max 90

STEP 12 — CEFR LEVEL (must be the exact band containing overall_score):
95–100→C1, 85–94→High B2, 75–84→Mid B2, 65–74→B1, 50–64→A2, below 50→A1

STEP 18 — Before answering, silently verify: do the category scores, the weighted overall_score, and the CEFR level all agree? Are the mistakes and pronunciation notes genuinely present in the transcript? Revise silently if not.

Return ONLY the JSON schema from the system message.`
}

function buildTooShortSpeakingResult(wordCount) {
  return {
    off_topic: false, off_topic_reason: '',
    professionalism_score: 0, fluency_score: 0, grammar_score: 0,
    vocabulary_score: 0, pronunciation_score: 0, confidence_score: 0, communication_score: 0,
    overall_score: 0, level: 'A1', strengths: [],
    weaknesses: [wordCount === 0 ? 'No speech detected.' : 'Answer too short to evaluate.'],
    mistakes: [], pronunciation_notes: [],
    corrected_answer: 'Please speak for at least 15-20 seconds about the topic.',
    tips: ['Allow microphone access', 'Speak clearly', 'Speak for at least 20 seconds', 'Stay on topic']
  }
}

function normalizeSpeakingResult(parsed, wordCount) {
  const s = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}

  const offTopic = s.off_topic === true || s.off_topic === 'true'

  // Off-topic short-circuit: no score, no Lexi-worthy feedback, just the reason.
  if (offTopic) {
    return {
      off_topic: true,
      off_topic_reason: cleanText(s.off_topic_reason) || 'Your answer does not match the given topic.',
      professionalism_score: 0, fluency_score: 0, grammar_score: 0,
      vocabulary_score: 0, pronunciation_score: 0, confidence_score: 0, communication_score: 0,
      overall_score: 0, level: 'A1',
      strengths: [], weaknesses: [], mistakes: [], pronunciation_notes: [],
      corrected_answer: '', tips: [], corrections: [],
    }
  }

  const r = {
    off_topic:             false,
    off_topic_reason:      '',
    professionalism_score: clamp(toNum(s.professionalism_score, 0), 0, 100),
    fluency_score:         clamp(toNum(s.fluency_score,         0), 0, 100),
    grammar_score:         clamp(toNum(s.grammar_score,         0), 0, 100),
    vocabulary_score:      clamp(toNum(s.vocabulary_score,      0), 0, 100),
    pronunciation_score:   clamp(toNum(s.pronunciation_score,   0), 0, 100),
    confidence_score:      clamp(toNum(s.confidence_score,      0), 0, 100),
    communication_score:   clamp(toNum(s.communication_score,   0), 0, 100),
    overall_score:         0, // recomputed below via the STEP 11 weighted formula — never trust the raw AI value directly
    level:                 '', // recomputed below from the authoritative weighted overall_score
    strengths:            normalizeArray(s.strengths),
    weaknesses:           normalizeArray(s.weaknesses),
    mistakes:             normalizeArray(s.mistakes),
    pronunciation_notes:  normalizeArray(s.pronunciation_notes),
    corrected_answer:     cleanText(s.corrected_answer),
    tips:                 normalizeArray(s.tips),
    corrections:          Array.isArray(s.corrections) ? s.corrections.map(c => {
      if (typeof c === 'string') return c
      if (typeof c === 'object' && c) {
        return { category: c.category || '', issue: c.issue || '', improvement: c.improvement || '', example: c.example || '' }
      }
      return String(c)
    }).filter(Boolean) : [],
  }

  // STEP 11 — overall_score is ALWAYS the weighted composite of the six categories,
  // computed here in code rather than trusted from the AI response, so an "impossible
  // combination" (all categories low but overall high, or vice versa) can never occur.
  r.overall_score = Math.round(weightedOverall(r, SPEAKING_WEIGHTS))

  if      (wordCount <= 5)  r.overall_score = 0
  else if (wordCount <= 20) r.overall_score = Math.min(r.overall_score, 38)
  else if (wordCount <= 40) r.overall_score = Math.min(r.overall_score, 58)

  r.overall_score         = clamp(Math.round(r.overall_score),         0, 100)
  r.professionalism_score = clamp(Math.round(r.professionalism_score), 0, 100)
  r.fluency_score         = clamp(Math.round(r.fluency_score),         0, 100)
  r.grammar_score         = clamp(Math.round(r.grammar_score),         0, 100)
  r.vocabulary_score      = clamp(Math.round(r.vocabulary_score),      0, 100)
  r.pronunciation_score   = clamp(Math.round(r.pronunciation_score),   0, 100)
  r.confidence_score      = clamp(Math.round(r.confidence_score),      0, 100)
  r.communication_score   = clamp(Math.round(r.communication_score),   0, 100)
  // STEP 12 — level is always derived from the same authoritative overall_score,
  // never taken as-is from the AI (which could otherwise disagree with the number above).
  r.level = scoreToLevel(r.overall_score)

  // Fix: ignore "i" vs "I" capitalisation mistakes if the model reported one anyway
  r.mistakes = r.mistakes.filter(m => {
    const low = String(m).toLowerCase()
    return !(/\bi\s*→\s*i\b/.test(low) && /capital/.test(low)) &&
           !(low.includes('"i"') && low.includes('capital'))
  })

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
   - Do NOT flag lowercase "i" vs capital "I" (the first-person pronoun) as a mistake — ignore that capitalisation entirely.
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
    corrections:      Array.isArray(s.corrections) ? s.corrections.map(c => {
      if (typeof c === 'string') return c
      if (typeof c === 'object' && c) {
        const parts = [c.issue, c.improvement, c.example].filter(Boolean)
        return { category: c.category || '', issue: c.issue || '', improvement: c.improvement || '', example: c.example || '' }
      }
      return String(c)
    }).filter(Boolean) : [],
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
  r.level = scoreToBaseLevel(r.overall_score) // Writing keeps the original simple CEFR scale — this overhaul targets Speaking & HR only

  r.mistakes = r.mistakes.filter(m => {
    const low = m.toLowerCase()
    const isShortnessNote = low.includes('too short')      || low.includes('lack of detail') ||
                            low.includes('more detail')    || low.includes('not enough') ||
                            low.includes('insufficient')
    const isCapitalisationNote = (/\bi\s*→\s*i\b/.test(low) && /capital/.test(low)) ||
                                 (low.includes('"i"') && low.includes('capital'))
    return !isShortnessNote && !isCapitalisationNote
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
  return `You are an EXPERT HR INTERVIEW COACH, evaluating a candidate's spoken answer as close as possible to official IELTS Speaking Band Descriptors adapted for a professional interview context, for EnglishAce learners.

Your evaluation must be consistent, fair, explainable, stable, and resistant to random scoring. The SAME quality answer should receive nearly the SAME score every time — avoid large fluctuations, reason deterministically from the evidence in the transcript.

=====================================================
STEP 1 — EVALUATE THE TRANSCRIPT, NOT THE RAW STT OUTPUT
=====================================================
Speech-to-text is imperfect. Silently identify any part of the transcript that is CLEARLY a transcription error (a similar-sounding wrong word replacing the obviously intended one), and evaluate what the candidate almost certainly INTENDED to say. Do not penalise the same probable transcription slip twice (once as grammar, once as pronunciation).

=====================================================
STEP 2 — ACCENT IS NEVER A SCORING CRITERION
=====================================================
NEVER penalise Egyptian, Gulf, Indian, Pakistani, African, Asian, or any other regional accent. Judge pronunciation ONLY on intelligibility.

=====================================================
STEP 3 — SCORE EVERY CATEGORY INDEPENDENTLY
=====================================================
Calculate each category independently using its own rubric below. NEVER invent one overall impression first and split it across categories.
Categories: Grammar, Vocabulary, Fluency, Pronunciation, Communication, Confidence, Professionalism, Overall Score, CEFR Level.

=====================================================
STEP 4 — GRAMMAR RUBRIC (grammar_score)
=====================================================
Evaluate: sentence structure, verb tenses, subject–verb agreement, articles, prepositions, word order, plural forms, grammatical complexity.
  95–100 → almost no grammar mistakes | 80–94 → minor mistakes, meaning unaffected | 65–79 → noticeable but understandable | 45–64 → frequent problems | below 45 → grammar prevents communication.
Never count the same mistake twice.

=====================================================
STEP 5 — VOCABULARY RUBRIC (vocabulary_score)
=====================================================
Evaluate: range, word choice, topic/professional relevance, collocations, phrasal verbs, idiomatic expressions (bonus), repetition, appropriateness. Do not reward difficult words used incorrectly.

=====================================================
STEP 6 — FLUENCY RUBRIC (fluency_score)
=====================================================
Evaluate: natural pace, long pauses, hesitation, repetition, self-correction, sentence continuity, logical flow. Small natural pauses are normal; only penalise excessive hesitation.

=====================================================
STEP 7 — PRONUNCIATION RUBRIC (pronunciation_score)
=====================================================
Evaluate: clarity, word stress, sentence stress, intelligibility, connected speech. NEVER judge accent, only understandability.

=====================================================
STEP 8 — COMMUNICATION RUBRIC (communication_score)
=====================================================
Did the candidate answer the actual question? Stay on topic? Explain ideas? Support opinions? Give examples? Organise ideas logically?

=====================================================
STEP 9 — CONFIDENCE RUBRIC (confidence_score)
=====================================================
Use linguistic indicators only: natural delivery, assured phrasing, rhythm, absence of excessive hedging. Do not infer confidence from voice volume.

=====================================================
STEP 10 — PROFESSIONALISM RUBRIC (professionalism_score, HR ONLY)
=====================================================
Evaluate: professional tone, business language, interview-appropriate framing, STAR-style thinking when relevant (Situation/Task/Action/Result), problem-solving, leadership, teamwork, conflict handling, decision-making.
Reward AUTHENTIC professional communication grounded in the candidate's own real experience. Do NOT reward answers that sound like a memorised script with no genuine specific content — a generic, rehearsed-sounding answer with no real substance should score LOWER here than a slightly less polished but authentic, specific answer.

=====================================================
STEP 11 — OVERALL SCORE (weighted composite — NOT a plain average)
=====================================================
overall_score must be computed as this weighted composite, not a simple average:
  Grammar 20% + Vocabulary 20% + Fluency 20% + Pronunciation 15% + Communication 15% + Confidence 5% + Professionalism 5%
(Professionalism replaces part of Confidence's weight, per HR-specific weighting — Confidence and Professionalism each carry half of the base Confidence share.)
Round to the nearest whole number. NEVER return an impossible combination (e.g. all categories in the 30s producing an overall_score near 95) — verify the arithmetic before responding.

=====================================================
STEP 16 — FAIRNESS RULES
=====================================================
Never reward: length alone, complex words alone, fast speech alone, memorised/rehearsed-sounding answers with no real content.
Never punish: accent, age, gender, country, speaking speed alone, shyness.
Always reward: correct English, clear communication, logical answers, natural speaking, authentic professional substance.

=====================================================
STEP 17 — STABILITY
=====================================================
If this same transcript were evaluated again, overall_score should vary by no more than ±2 points. Reason from concrete evidence, not an impressionistic feeling.

=====================================================
STEP 18 — FINAL VALIDATION (silently, before answering)
=====================================================
Check: do all category scores agree with the weighted overall_score formula (STEP 11)? Does the CEFR level match the evidence (STEP 12)? Do strengths/weaknesses reference this specific answer? Are grammar mistakes genuinely present? Is the corrected_answer actually better than the candidate's answer? Is the professionalism_score based on authentic substance, not just polished-sounding phrasing? Revise silently if anything disagrees. Never show this reasoning — output ONLY the JSON.

=====================================================
MISTAKES vs WEAKNESSES — strictly separate
=====================================================
- mistakes: ONLY real language errors spoken by the candidate, after applying STEP 1's STT-cleaning.
  Format: "wrong spoken phrase → corrected version (explanation)"
  Example: "I am work in sales → I work in sales (wrong verb form)"
- weaknesses: content problems — vague answer, not relevant to question, no examples, too short, poor structure, memorised-sounding with no real substance.
- NEVER put content issues inside mistakes. If no real language errors found, return [].
- Do NOT flag lowercase "i" vs capital "I" as a mistake (transcription artifact, STEP 1).

=====================================================
PRONUNCIATION NOTES (pronunciation_notes array)
=====================================================
Identify words likely mispronounced in a way that affects intelligibility (never accent alone): th-sounds, p/b, silent letters, stress, vowels, consonant clusters. Format: "word → /IPA/ — issue — tip".

=====================================================
CEFR LEVEL (STEP 12 — exact bands, must match overall_score exactly)
=====================================================
  95–100 → C1
  85–94  → High B2
  75–84  → Mid B2
  65–74  → B1
  50–64  → A2
  below 50 → A1

=====================================================
CORRECTED ANSWER & TIPS
=====================================================
- corrected_answer: rewrite the candidate's actual answer in polished, professional English, based on their own real ideas — never invent new facts. If too short/vague, show what a strong answer would look like using the same premise.
- tips: 2-4 specific, actionable improvements for this type of question.
- corrections: ALWAYS provide at least one, even for a strong answer — focus on content structure, professional vocabulary, STAR method, impact statements.

Return ONLY valid JSON. No markdown, no explanations outside the JSON object.

==============================
REQUIRED JSON SCHEMA
==============================
{
  "grammar_score": 0,
  "vocabulary_score": 0,
  "fluency_score": 0,
  "pronunciation_score": 0,
  "communication_score": 0,
  "confidence_score": 0,
  "professionalism_score": 0,
  "overall_score": 0,
  "level": "A1",
  "strengths": [],
  "weaknesses": [],
  "mistakes": [],
  "pronunciation_notes": [],
  "corrected_answer": "",
  "tips": [],
  "corrections": [{"category":"","issue":"","improvement":"","example":""}]
}`
}

function buildHRPrompt(question, transcript, wordCount) {
  return `Evaluate the following HR interview answer honestly and strictly.

INTERVIEW QUESTION:
${question}

CANDIDATE'S SPOKEN ANSWER (raw speech-to-text — may contain transcription slips, see STEP 1):
${transcript}

WORD COUNT: ${wordCount}

STEP 1 — Clean obvious transcription errors mentally before scoring; evaluate the intended sentence, don't double-penalise a likely STT slip as both a grammar and a pronunciation mistake.
STEP 2 — Ignore accent entirely; judge pronunciation only by intelligibility.

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
- Generic, memorised-sounding answer with no real examples: professionalism_score and communication_score below 40.
- Clear, relevant, well-structured, AUTHENTIC answer with examples: can score 60-78.
- Fluent, professional, native-sounding answer with strong vocabulary and genuine substance: can score 78-95.

STEP 11 — OVERALL SCORE (weighted composite, NOT a plain average):
overall_score = grammar_score×0.20 + vocabulary_score×0.20 + fluency_score×0.20 + pronunciation_score×0.15 + communication_score×0.15 + confidence_score×0.05 + professionalism_score×0.05
Round to the nearest whole number. Verify this arithmetic before answering.

STEP 12 — CEFR LEVEL (must be the exact band containing overall_score):
95–100→C1, 85–94→High B2, 75–84→Mid B2, 65–74→B1, 50–64→A2, below 50→A1

Mistakes guidance:
- Only report REAL language mistakes that appear in the transcript text above, after STEP 1's STT-cleaning.
- Format each mistake as: "spoken error → correct version (reason)"
  Example: "I am work in this company → I work in this company (wrong verb form)"
- Each mistake must be quoted directly from the candidate's actual words.
- If no real language mistakes exist, return an empty mistakes array [].
- DO NOT put vague content, short length, or lack of examples into mistakes — those go in weaknesses.

Pronunciation notes guidance:
- Identify words likely mispronounced in a way that affects intelligibility (never accent alone): th-sounds, p/b, silent letters, stress, vowels, consonant clusters.
- Format: "word → /IPA/ — issue — tip"

Strengths guidance:
- Only list genuine strengths visible in this answer.
- If the answer is weak, strengths can be empty or contain only one simple observation.
- Never fabricate strengths to soften a poor evaluation.

Corrections (NEVER empty):
- Always provide at least 1 correction/improvement even if language is perfect.
- Focus on: content structure, professional vocabulary, the STAR method, impact statements.
- Format each: { "category": "Content/Grammar/Vocabulary/Structure/Professionalism", "issue": "what is wrong or missing", "improvement": "how to fix it", "example": "example of the improved version" }

STEP 18 — Before answering, silently verify the category scores, weighted overall_score, and CEFR level all agree, and that professionalism_score reflects authentic substance rather than just polished phrasing.

Return ONLY the JSON schema from the system message. No extra text outside the JSON.`
}

function buildTooShortHRResult(wordCount) {
  return {
    professionalism_score: 0, fluency_score: 0, grammar_score: 0,
    vocabulary_score: 0, pronunciation_score: 0, confidence_score: 0, communication_score: 0,
    overall_score: 0, level: 'A1', strengths: [],
    weaknesses: [wordCount === 0 ? 'No answer was recorded.' : 'Answer too short to evaluate.'],
    mistakes: [], pronunciation_notes: [],
    corrected_answer: 'Answer in at least 3-4 full sentences with specific details.',
    tips: ['Speak for at least 20 seconds', 'Answer the question directly', 'Add specific examples', 'Use full sentences'],
    corrections: []
  }
}

function normalizeHRResult(parsed, wordCount) {
  const s = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  const r = {
    professionalism_score: clamp(toNum(s.professionalism_score, 0), 0, 100),
    fluency_score:         clamp(toNum(s.fluency_score,         0), 0, 100),
    grammar_score:         clamp(toNum(s.grammar_score,         0), 0, 100),
    vocabulary_score:      clamp(toNum(s.vocabulary_score,      0), 0, 100),
    pronunciation_score:   clamp(toNum(s.pronunciation_score,   0), 0, 100),
    confidence_score:      clamp(toNum(s.confidence_score,      0), 0, 100),
    communication_score:   clamp(toNum(s.communication_score,   0), 0, 100),
    overall_score:         0, // recomputed below via the STEP 11 weighted formula — never trust the raw AI value directly
    level:                 '', // recomputed below from the authoritative weighted overall_score
    strengths:        normalizeArray(s.strengths),
    weaknesses:       normalizeArray(s.weaknesses),
    mistakes:         normalizeArray(s.mistakes),
    pronunciation_notes: normalizeArray(s.pronunciation_notes),
    corrected_answer: cleanText(s.corrected_answer),
    tips:             normalizeArray(s.tips),
    corrections:      Array.isArray(s.corrections) ? s.corrections.map(c => {
      if (typeof c === 'string') return c
      if (typeof c === 'object' && c) {
        return { category: c.category || '', issue: c.issue || '', improvement: c.improvement || '', example: c.example || '' }
      }
      return String(c)
    }).filter(Boolean) : [],
  }

  // STEP 11 — overall_score is ALWAYS the weighted composite (professionalism replacing
  // part of confidence's weight), computed here in code rather than trusted from the AI,
  // so an "impossible combination" can never occur.
  r.overall_score = Math.round(weightedOverall(r, HR_WEIGHTS))

  if      (wordCount <= 10) r.overall_score = 0
  else if (wordCount <= 20) r.overall_score = Math.min(r.overall_score, 35)
  else if (wordCount <= 40) r.overall_score = Math.min(r.overall_score, 55)
  else if (wordCount <= 80) r.overall_score = Math.min(r.overall_score, 72)

  r.overall_score         = clamp(Math.round(r.overall_score),         0, 100)
  r.professionalism_score = clamp(Math.round(r.professionalism_score), 0, 100)
  r.fluency_score         = clamp(Math.round(r.fluency_score),         0, 100)
  r.grammar_score         = clamp(Math.round(r.grammar_score),         0, 100)
  r.vocabulary_score      = clamp(Math.round(r.vocabulary_score),      0, 100)
  r.pronunciation_score   = clamp(Math.round(r.pronunciation_score),   0, 100)
  r.confidence_score      = clamp(Math.round(r.confidence_score),      0, 100)
  r.communication_score   = clamp(Math.round(r.communication_score),   0, 100)
  // STEP 12 — level is always derived from the same authoritative overall_score.
  r.level = scoreToLevel(r.overall_score)

  r.mistakes = r.mistakes.filter(m => {
    const low = m.toLowerCase()
    const isContentNote = low.includes('too short')   || low.includes('lack of detail') ||
                           low.includes('not enough')  || low.includes('insufficient') ||
                           low.includes('more detail') || low.includes('no example')
    const isCapitalisationNote = (/\bi\s*→\s*i\b/.test(low) && /capital/.test(low)) ||
                                 (low.includes('"i"') && low.includes('capital'))
    return !isContentNote && !isCapitalisationNote
  })

  if (!r.corrected_answer) r.corrected_answer = 'Answer the question directly with 2-3 sentences, give a specific example, and end with a confident closing statement.'
  if (!r.strengths.length && r.overall_score >= 30) r.strengths = ['You attempted to answer the question in English.']
  if (!r.weaknesses.length) r.weaknesses = ['Try to answer with more detail and specific examples.']
  if (!r.tips.length) r.tips = ['Answer in full sentences', 'Give at least one specific example', 'Structure your answer: point → reason → example']
  // Corrections must never be empty
  if (!r.corrections || r.corrections.length === 0) {
    r.corrections = [{ category: 'Structure', issue: 'Answer structure could be more impactful', improvement: 'Use the STAR method: Situation → Task → Action → Result', example: 'In my previous role [Situation], I was tasked with [Task]. I [Action], which resulted in [measurable Result].' }]
  }
  return r
}
