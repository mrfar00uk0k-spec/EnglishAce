// ─────────────────────────────────────────────────────────────────────────────
// GET /api/questions?type=<grammar|vocabulary|listening|reading|speaking|writing|hr>
//
// Consolidates what used to be 7 separate files under api/questions/*.js into
// a single Vercel Serverless Function, dispatched internally on `type`. This
// was done purely to reduce the number of deployed functions (Vercel Hobby
// plan caps at 12); every type's selection/tiering algorithm below is copied
// over UNCHANGED from its original standalone file — only the file layout
// and the URL shape (`?type=x` instead of `/questions/x`) changed.
//
// Data banks live in ./_lib/data/ (underscore-prefixed so Vercel excludes
// them from the function count — see api/_lib/groqKeys.js for the same
// pattern applied to the other shared module).
// ─────────────────────────────────────────────────────────────────────────────
import grammarQuestions          from './_lib/data/grammar.js'
import vocabularyQuestions       from './_lib/data/vocabulary.js'
import listeningQuestions        from './_lib/data/listening.js'
import readingPassages           from './_lib/data/reading.js'
import speakingTopics            from './_lib/data/speaking.js'
import { writingPromptsBank }    from './_lib/data/writing.js'
import hrQuestions               from './_lib/data/hr.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function parseExclude(req) {
  const raw = typeof req.query?.exclude === 'string' ? req.query.exclude : ''
  return new Set(raw.split(',').map(s => s.trim()).filter(Boolean).map(s => (isNaN(Number(s)) ? s : Number(s))))
}

// ── GET /api/questions?type=grammar&count=5 ─────────────────────────────────
// Returns a randomized subset of grammar questions.
function handleGrammar(req, res) {
  try {
    const count = Math.max(1, Math.min(50, parseInt(req.query?.count, 10) || 5))
    const exclude = parseExclude(req)

    // Avoid repeating questions the client has already seen recently, unless
    // doing so would leave too few items to satisfy the requested count.
    const availablePool = grammarQuestions.filter(q => !exclude.has(q.id))
    const bank = availablePool.length >= count ? availablePool : grammarQuestions

    const total    = bank.length
    const easyEnd  = Math.floor(total * 0.40)
    const medEnd   = Math.floor(total * 0.70)
    const easy     = bank.slice(0, easyEnd)
    const medium   = bank.slice(easyEnd, medEnd)
    const hard     = bank.slice(medEnd)

    const easyPick = Math.min(2, easy.length)
    const medPick  = Math.min(2, medium.length)
    const hardPick = Math.min(count - easyPick - medPick, hard.length)

    let picked = [
      ...shuffle(easy).slice(0, easyPick),
      ...shuffle(medium).slice(0, medPick),
      ...shuffle(hard).slice(0, Math.max(0, hardPick)),
    ]
    // Backfill if the tiered pick came up short (small pools)
    if (picked.length < count) {
      const pickedIds = new Set(picked.map(q => q.id))
      const remainder = shuffle(bank.filter(q => !pickedIds.has(q.id)))
      picked = [...picked, ...remainder].slice(0, count)
    }
    picked = shuffle(picked).slice(0, count)

    // Only send fields the frontend actually renders during the quiz.
    // (answer + explanation ARE needed client-side today for instant local
    // scoring/review, so we keep parity with current behaviour — nothing
    // client-invisible like difficulty tier or internal notes is exposed.)
    const payload = picked.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
    }))

    return res.status(200).json({ questions: payload })
  } catch (err) {
    console.error('questions?type=grammar error:', err.message)
    return res.status(500).json({ error: 'Failed to load grammar questions' })
  }
}

// ── GET /api/questions?type=vocabulary&count=5 ──────────────────────────────
// Returns a randomized subset of vocabulary questions (tiered by position:
// first 40% easy, next 30% medium, remainder hard — same rule as before).
function handleVocabulary(req, res) {
  try {
    const count = Math.max(1, Math.min(50, parseInt(req.query?.count, 10) || 5))
    const exclude = parseExclude(req)

    const availablePool = vocabularyQuestions.filter(q => !exclude.has(q.id))
    const bankSource = availablePool.length >= count ? availablePool : vocabularyQuestions

    // The bank is authored in ascending difficulty by id (1 = simplest word,
    // 20 = hardest). To honour "first two questions must be easy, then
    // gradually increase", we draw the OPENING slots from a small pool of the
    // most basic items, then progress through medium and harder tiers —
    // while still randomizing which specific items appear each time.
    const sorted     = [...bankSource].sort((a, b) => a.id - b.id)
    const total      = sorted.length
    const superEasy  = sorted.slice(0, Math.max(4, Math.ceil(total * 0.2)))   // simplest ~20%
    const mediumTier = sorted.slice(superEasy.length, Math.ceil(total * 0.7))
    const hardTier   = sorted.slice(Math.ceil(total * 0.7))

    const openPick = Math.min(2, count, superEasy.length)
    const medPick  = Math.min(Math.max(0, count - openPick - 1), mediumTier.length)
    const hardPick = Math.min(count - openPick - medPick, hardTier.length)

    let picked = [
      ...shuffle(superEasy).slice(0, openPick),
      ...shuffle(mediumTier).slice(0, medPick),
      ...shuffle(hardTier).slice(0, Math.max(0, hardPick)),
    ]
    if (picked.length < count) {
      const pickedIds = new Set(picked.map(q => q.id))
      const remainder = shuffle(sorted.filter(q => !pickedIds.has(q.id)))
      picked = [...picked, ...remainder].slice(0, count)
    }

    const payload = picked.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
    }))

    return res.status(200).json({ questions: payload })
  } catch (err) {
    console.error('questions?type=vocabulary error:', err.message)
    return res.status(500).json({ error: 'Failed to load vocabulary questions' })
  }
}

// ── GET /api/questions?type=listening&count=3 ───────────────────────────────
// Returns a randomized subset of listening sentences. For the default 3-question
// shape: the first two are short/simple, and the third is exactly two words
// longer than them (not just "somewhat longer") — matching the requested rule.
// The bank itself is authored in ascending order by id (id 1 = shortest,
// id 30 = longest/most complex).
function handleListening(req, res) {
  try {
    const count = Math.max(1, Math.min(30, parseInt(req.query?.count, 10) || 3))
    const exclude = parseExclude(req)

    const availablePool = listeningQuestions.filter(q => !exclude.has(q.id))
    const bankSource = availablePool.length >= count ? availablePool : listeningQuestions
    const sorted = [...bankSource].sort((a, b) => a.id - b.id)
    const wordCount = s => s.trim().split(/\s+/).filter(Boolean).length

    if (count === 3) {
      // First two: short sentences (shortest quartile of the bank).
      const shortPool = sorted.slice(0, Math.max(2, Math.ceil(sorted.length * 0.3)))
      const firstTwo = shuffle(shortPool).slice(0, 2)

      if (firstTwo.length === 2) {
        const baseLen = Math.max(wordCount(firstTwo[0].sentence), wordCount(firstTwo[1].sentence))
        const targetLen = baseLen + 2
        const usedIds = new Set(firstTwo.map(q => q.id))
        const remaining = sorted.filter(q => !usedIds.has(q.id))

        // Prefer an exact +2 match; otherwise the closest sentence at or above that length.
        const exact = remaining.filter(q => wordCount(q.sentence) === targetLen)
        let third
        if (exact.length > 0) {
          third = shuffle(exact)[0]
        } else {
          const sortedByCloseness = [...remaining].sort((a, b) =>
            Math.abs(wordCount(a.sentence) - targetLen) - Math.abs(wordCount(b.sentence) - targetLen)
          )
          third = sortedByCloseness[0]
        }

        if (third) {
          const picked = [...firstTwo, third]
          const payload = picked.map(q => ({ id: q.id, sentence: q.sentence }))
          return res.status(200).json({ questions: payload })
        }
      }
      // Fall through to generic tiered selection below if the bank was too small.
    }

    const total     = sorted.length
    const easyTier  = sorted.slice(0, Math.ceil(total * 0.4))
    const medTier   = sorted.slice(Math.ceil(total * 0.4), Math.ceil(total * 0.75))
    const hardTier  = sorted.slice(Math.ceil(total * 0.75))

    // Default shape (count=3): 2 easy + 1 medium — mirrors prior behaviour.
    // For other counts, scale proportionally so difficulty still ramps up.
    const easyPick = Math.max(1, Math.round(count * (2 / 3)))
    const medPick  = Math.max(0, Math.min(count - easyPick, medTier.length))
    const hardPick = Math.max(0, count - easyPick - medPick)

    let picked = [
      ...shuffle(easyTier).slice(0, Math.min(easyPick, easyTier.length)),
      ...shuffle(medTier).slice(0, medPick),
      ...shuffle(hardTier).slice(0, hardPick),
    ]
    if (picked.length < count) {
      const pickedIds = new Set(picked.map(q => q.id))
      const remainder = shuffle(sorted.filter(q => !pickedIds.has(q.id)))
      picked = [...picked, ...remainder].slice(0, count)
    }
    // Keep ascending order by id so the sentence the user hears first is
    // always the simplest of the picked set, gradually increasing.
    picked = picked.slice(0, count).sort((a, b) => a.id - b.id)

    const payload = picked.map(q => ({ id: q.id, sentence: q.sentence }))

    return res.status(200).json({ questions: payload })
  } catch (err) {
    console.error('questions?type=listening error:', err.message)
    return res.status(500).json({ error: 'Failed to load listening questions' })
  }
}

// ── GET /api/questions?type=reading&count=1 ─────────────────────────────────
// Returns one (or more) random reading passage(s), each with its questions.
function handleReading(req, res) {
  try {
    const count = Math.max(1, Math.min(readingPassages.length, parseInt(req.query?.count, 10) || 1))
    const exclude = parseExclude(req)

    const availablePool = readingPassages.filter(p => !exclude.has(p.id))
    const bank = availablePool.length >= count ? availablePool : readingPassages
    const picked = shuffle(bank).slice(0, count)

    return res.status(200).json({ passages: picked })
  } catch (err) {
    console.error('questions?type=reading error:', err.message)
    return res.status(500).json({ error: 'Failed to load reading passages' })
  }
}

// ── GET /api/questions?type=speaking&count=1 ────────────────────────────────
// Returns one (or more) random speaking topic(s).
function handleSpeaking(req, res) {
  try {
    const count = Math.max(1, Math.min(speakingTopics.length, parseInt(req.query?.count, 10) || 1))
    const exclude = parseExclude(req)

    const availablePool = speakingTopics.filter(topic => !exclude.has(topic.en))
    const bank = availablePool.length >= count ? availablePool : speakingTopics
    const picked = shuffle(bank).slice(0, count)

    return res.status(200).json({ topics: picked })
  } catch (err) {
    console.error('questions?type=speaking error:', err.message)
    return res.status(500).json({ error: 'Failed to load speaking topics' })
  }
}

// ── GET /api/questions?type=writing&attemptCount=0&recentKeys=easy:0,easy:3 ─
// Returns one writing prompt, tier-selected by attemptCount (0-1 → easy,
// 2-4 → medium, 5+ → hard) and avoiding recently-seen prompts when possible.
function handleWriting(req, res) {
  try {
    const attemptCount = Math.max(0, parseInt(req.query?.attemptCount, 10) || 0)
    const recentKeysRaw = typeof req.query?.recentKeys === 'string' ? req.query.recentKeys : ''
    const recentKeys = recentKeysRaw.split(',').map(s => s.trim()).filter(Boolean)

    const tier = attemptCount < 2 ? 'easy' : attemptCount < 5 ? 'medium' : 'hard'
    const pool = writingPromptsBank[tier] || writingPromptsBank.easy

    const fresh = pool.filter((_, i) => !recentKeys.includes(`${tier}:${i}`))
    const choices = fresh.length > 0 ? fresh : pool
    const idx = Math.floor(Math.random() * choices.length)
    const chosen = choices[idx]
    const originalIndex = pool.indexOf(chosen)

    return res.status(200).json({
      prompt: { ...chosen, tier, key: `${tier}:${originalIndex}` }
    })
  } catch (err) {
    console.error('questions?type=writing error:', err.message)
    return res.status(500).json({ error: 'Failed to load writing prompt' })
  }
}

// ── GET /api/questions?type=hr&count=10 ─────────────────────────────────────
// Returns a randomized set of HR interview questions. The very first question
// is always the standard "Tell me about yourself" opener (as in a real
// interview), the rest are a random, differently-ordered subset each time.
function handleHR(req, res) {
  try {
    const count = Math.max(1, Math.min(hrQuestions.length, parseInt(req.query?.count, 10) || 10))
    const exclude = parseExclude(req)

    const opener = hrQuestions[0] // "Tell me about yourself." — always first, regardless of exclusion
    const restFull = hrQuestions.slice(1)
    const restAvailable = restFull.filter(q => !exclude.has(q))
    const restPool = restAvailable.length >= (count - 1) ? restAvailable : restFull

    const picked = [opener, ...shuffle(restPool).slice(0, count - 1)]

    return res.status(200).json({ questions: picked })
  } catch (err) {
    console.error('questions?type=hr error:', err.message)
    return res.status(500).json({ error: 'Failed to load HR questions' })
  }
}

const DISPATCH = {
  grammar:    handleGrammar,
  vocabulary: handleVocabulary,
  listening:  handleListening,
  reading:    handleReading,
  speaking:   handleSpeaking,
  writing:    handleWriting,
  hr:         handleHR,
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET')     return res.status(405).json({ error: 'Method not allowed' })

  const type = req.query?.type
  const fn = DISPATCH[type]

  if (!fn) {
    return res.status(400).json({
      error: `Missing or unknown "type" query parameter. Valid values: ${Object.keys(DISPATCH).join(', ')}`,
    })
  }

  return fn(req, res)
}
