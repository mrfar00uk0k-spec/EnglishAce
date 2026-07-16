// ─────────────────────────────────────────────────────────────────────────────
// src/utils/questionsApi.js
// Frontend client for /api/questions?type=<x> — fetches question banks from
// the backend instead of bundling them into the frontend. Includes:
//   • In-memory session cache (no duplicate network calls per assessment)
//   • Retry-once on failure
//   • Friendly, typed errors the UI can render
// ─────────────────────────────────────────────────────────────────────────────

const cache = new Map()

// ─────────────────────────────────────────────────────────────────────────────
// Seen-question history (localStorage-backed) — used so a user doesn't see
// the same question/topic/sentence repeatedly across attempts. Capped per
// type so the exclude list doesn't grow forever and eventually starve the
// backend's pool (the backend also falls back to the full bank if exclusion
// would leave too few items, so this is a soft preference, not a hard rule).
// ─────────────────────────────────────────────────────────────────────────────
const SEEN_CAP = 40
const SEEN_KEY_PREFIX = 'ace_seen_'

function getSeen(type) {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY_PREFIX + type)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function addSeen(type, ids = []) {
  if (!ids.length) return
  try {
    const current = getSeen(type)
    const merged = [...current, ...ids.map(String)]
    // Keep only the most recent SEEN_CAP entries so the list stays bounded.
    const trimmed = merged.slice(-SEEN_CAP)
    window.localStorage.setItem(SEEN_KEY_PREFIX + type, JSON.stringify(trimmed))
  } catch {
    // localStorage unavailable (private mode, etc.) — silently skip tracking.
  }
}

function excludeParam(type) {
  const seen = getSeen(type)
  return seen.length ? seen.join(',') : ''
}

async function fetchWithRetry(url, { retried = false } = {}) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    if (!retried) {
      // brief pause, then one retry
      await new Promise(r => setTimeout(r, 500))
      return fetchWithRetry(url, { retried: true })
    }
    throw new Error('friendly:Could not load questions. Please check your connection and try again.')
  }
}

async function cachedFetch(cacheKey, url) {
  if (cache.has(cacheKey)) return cache.get(cacheKey)
  const data = await fetchWithRetry(url)
  cache.set(cacheKey, data)
  return data
}

/**
 * Fetch a randomized set of grammar questions.
 * @param {number} count
 * @returns {Promise<Array>} questions — NOT cached (should differ per attempt)
 */
export async function fetchGrammarQuestions(count = 5) {
  const exclude = excludeParam('grammar')
  const url = `/api/questions?type=grammar&count=${count}${exclude ? `&exclude=${encodeURIComponent(exclude)}` : ''}`
  const data = await fetchWithRetry(url)
  addSeen('grammar', (data.questions || []).map(q => q.id))
  return data.questions
}

/**
 * Fetch a randomized set of vocabulary questions.
 * @param {number} count
 */
export async function fetchVocabularyQuestions(count = 5) {
  const exclude = excludeParam('vocabulary')
  const url = `/api/questions?type=vocabulary&count=${count}${exclude ? `&exclude=${encodeURIComponent(exclude)}` : ''}`
  const data = await fetchWithRetry(url)
  addSeen('vocabulary', (data.questions || []).map(q => q.id))
  return data.questions
}

/**
 * Fetch a randomized set of listening sentences.
 * @param {number} count
 */
export async function fetchListeningQuestions(count = 3) {
  const exclude = excludeParam('listening')
  const url = `/api/questions?type=listening&count=${count}${exclude ? `&exclude=${encodeURIComponent(exclude)}` : ''}`
  const data = await fetchWithRetry(url)
  addSeen('listening', (data.questions || []).map(q => q.id))
  return data.questions
}

/**
 * Fetch a random reading passage (with its questions).
 * @param {number} count
 */
export async function fetchReadingPassages(count = 1) {
  const exclude = excludeParam('reading')
  const url = `/api/questions?type=reading&count=${count}${exclude ? `&exclude=${encodeURIComponent(exclude)}` : ''}`
  const data = await fetchWithRetry(url)
  addSeen('reading', (data.passages || []).map(p => p.id))
  return data.passages
}

/**
 * Fetch a random speaking topic.
 * @param {number} count
 */
export async function fetchSpeakingTopics(count = 1) {
  const exclude = excludeParam('speaking')
  const url = `/api/questions?type=speaking&count=${count}${exclude ? `&exclude=${encodeURIComponent(exclude)}` : ''}`
  const data = await fetchWithRetry(url)
  addSeen('speaking', (data.topics || []).map(topic => topic.en))
  return data.topics
}

/**
 * Fetch the next writing prompt (tier depends on attemptCount, avoids repeats).
 * @param {number} attemptCount
 * @param {string[]} recentKeys
 */
export async function fetchWritingPrompt(attemptCount = 0, recentKeys = []) {
  const qs = new URLSearchParams({
    attemptCount: String(attemptCount),
    recentKeys: recentKeys.join(','),
  })
  const data = await fetchWithRetry(`/api/questions?type=writing&${qs.toString()}`)
  return data.prompt
}

/**
 * Fetch the HR interview question set (cached for the session — the same
 * 10 questions should stay fixed while the user progresses through them).
 * @param {number} count
 */
export async function fetchHRQuestions(count = 10) {
  const exclude = excludeParam('hr')
  const url = `/api/questions?type=hr&count=${count}${exclude ? `&exclude=${encodeURIComponent(exclude)}` : ''}`
  const data = await cachedFetch(`hr:${count}:${exclude}`, url)
  addSeen('hr', (data.questions || []).slice(1)) // keep the fixed opener out of the seen-history
  return data.questions
}

/**
 * Human-friendly error message extractor for use in UI error states.
 * @param {Error} err
 */
export function friendlyError(err, lang = 'en') {
  const msg = err?.message || ''
  if (msg.startsWith('friendly:')) return msg.slice('friendly:'.length)
  return lang === 'ar'
    ? 'تعذر تحميل الأسئلة. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.'
    : 'Could not load questions. Please check your connection and try again.'
}
