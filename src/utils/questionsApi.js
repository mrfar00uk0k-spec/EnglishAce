// ─────────────────────────────────────────────────────────────────────────────
// src/utils/questionsApi.js
// Frontend client for /api/questions?type=<x> — fetches question banks from
// the backend instead of bundling them into the frontend. Includes:
//   • In-memory session cache (no duplicate network calls per assessment)
//   • Retry-once on failure
//   • Friendly, typed errors the UI can render
// ─────────────────────────────────────────────────────────────────────────────

const cache = new Map()

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
  const data = await fetchWithRetry(`/api/questions?type=grammar&count=${count}`)
  return data.questions
}

/**
 * Fetch a randomized set of vocabulary questions.
 * @param {number} count
 */
export async function fetchVocabularyQuestions(count = 5) {
  const data = await fetchWithRetry(`/api/questions?type=vocabulary&count=${count}`)
  return data.questions
}

/**
 * Fetch a randomized set of listening sentences.
 * @param {number} count
 */
export async function fetchListeningQuestions(count = 3) {
  const data = await fetchWithRetry(`/api/questions?type=listening&count=${count}`)
  return data.questions
}

/**
 * Fetch a random reading passage (with its questions).
 * @param {number} count
 */
export async function fetchReadingPassages(count = 1) {
  const data = await fetchWithRetry(`/api/questions?type=reading&count=${count}`)
  return data.passages
}

/**
 * Fetch a random speaking topic.
 * @param {number} count
 */
export async function fetchSpeakingTopics(count = 1) {
  const data = await fetchWithRetry(`/api/questions?type=speaking&count=${count}`)
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
  return cachedFetch(`hr:${count}`, `/api/questions?type=hr&count=${count}`).then(d => d.questions)
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
