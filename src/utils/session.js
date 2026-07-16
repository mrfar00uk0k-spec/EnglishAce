// ─────────────────────────────────────────────────────────────────────────────
// SESSION STORAGE — EnglishAce assessment state persistence
// Namespace: englishace_assessment
// Sessions expire after 24 hours automatically.
// ─────────────────────────────────────────────────────────────────────────────

const NS         = 'englishace_assessment'
const LAST_KEY   = 'englishace_last_result'
const MAX_AGE    = 24 * 60 * 60 * 1000 // 24 hours in ms — applies to in-progress sessions only

/**
 * Save assessment session state.
 * @param {string} type   – assessment type: 'speaking' | 'writing' | 'hr' | etc.
 * @param {object} data   – arbitrary state to persist
 */
export function saveSession(type, data) {
  try {
    const existing = _loadRaw() || {}
    existing[type] = { ...data, _savedAt: Date.now() }
    localStorage.setItem(NS, JSON.stringify(existing))
  } catch(_) {}
}

/**
 * Load a previously saved session for the given assessment type.
 * Returns null if not found or expired.
 * @param {string} type
 * @returns {object|null}
 */
export function loadSession(type) {
  try {
    const all = _loadRaw()
    if (!all || !all[type]) return null
    const sess = all[type]
    if (!sess._savedAt || Date.now() - sess._savedAt > MAX_AGE) {
      clearSession(type)
      return null
    }
    return sess
  } catch(_) {
    return null
  }
}

/**
 * Clear session for a specific assessment type.
 * @param {string} type
 */
export function clearSession(type) {
  try {
    const all = _loadRaw()
    if (!all) return
    delete all[type]
    if (Object.keys(all).length === 0) {
      localStorage.removeItem(NS)
    } else {
      localStorage.setItem(NS, JSON.stringify(all))
    }
  } catch(_) {}
}

/**
 * Clear ALL saved sessions (called when assessment suite finishes).
 */
export function clearAllSessions() {
  try { localStorage.removeItem(NS) } catch(_) {}
}

/**
 * Purge any sessions older than MAX_AGE.
 * Call this once on app init.
 */
export function purgeExpiredSessions() {
  try {
    const all = _loadRaw()
    if (!all) return
    let changed = false
    for (const type in all) {
      const sess = all[type]
      if (!sess._savedAt || Date.now() - sess._savedAt > MAX_AGE) {
        delete all[type]
        changed = true
      }
    }
    if (changed) {
      if (Object.keys(all).length === 0) {
        localStorage.removeItem(NS)
      } else {
        localStorage.setItem(NS, JSON.stringify(all))
      }
    }
  } catch(_) {}
}

// ── Internal ──────────────────────────────────────────────────────────────────
function _loadRaw() {
  try {
    const raw = localStorage.getItem(NS)
    return raw ? JSON.parse(raw) : null
  } catch(_) {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LAST RESULT — durable memory of the most recently completed assessment.
// Unlike the in-progress session above, this does NOT expire after 24h and is
// NOT cleared automatically — it persists until a newer assessment overwrites
// it. This is what powers the "Welcome back" summary shown on the start screen.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Save a snapshot of the most recently completed assessment result.
 * @param {{ overall:number, level:string, scores:object }} data
 */
export function saveLastResult(data) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ ...data, _savedAt: Date.now() }))
  } catch(_) {}
}

/**
 * Load the most recently completed assessment result, if any.
 * @returns {object|null}
 */
export function loadLastResult() {
  try {
    const raw = localStorage.getItem(LAST_KEY)
    return raw ? JSON.parse(raw) : null
  } catch(_) {
    return null
  }
}

/**
 * Clear the last-result memory entirely.
 */
export function clearLastResult() {
  try { localStorage.removeItem(LAST_KEY) } catch(_) {}
}

// ─────────────────────────────────────────────────────────────────────────────
// PER-TEST LAST RESULT — durable memory of the most recently completed
// attempt for a SPECIFIC test type (speaking, writing, grammar, vocabulary,
// listening, reading, hr). This is distinct from saveLastResult/loadLastResult
// above, which tracks the combined 6-test suite average only.
//
// Only genuinely valid, completed results should ever be saved here — an
// empty/skipped/off-topic/errored attempt must NEVER be remembered, so the
// caller is responsible for checking isValidTestResult() before saving.
// ─────────────────────────────────────────────────────────────────────────────
const PER_TEST_LAST_KEY_PREFIX = 'englishace_last_result_'

/**
 * Decide whether a just-finished attempt is a genuine, trustworthy result
 * worth remembering — as opposed to a skip, an empty/too-short answer, or an
 * off-topic speaking/HR answer (all of which this codebase represents as an
 * overall score of exactly 0 for the AI-graded tests: speaking, writing, hr).
 *
 * Grammar/Vocabulary/Listening/Reading are deterministic scored tests with no
 * "off-topic" concept, so a completed 0 there is a real (if very poor) score
 * and IS valid — only AI-graded types treat 0 as "not a real answer".
 *
 * @param {string} type - 'speaking'|'writing'|'hr'|'grammar'|'vocabulary'|'listening'|'reading'
 * @param {number} score - the overall score for this attempt (0-100)
 * @returns {boolean}
 */
export function isValidTestResult(type, score) {
  if (typeof score !== 'number' || !Number.isFinite(score)) return false
  if (score < 0 || score > 100) return false

  const aiGradedTypes = ['speaking', 'writing', 'hr']
  if (aiGradedTypes.includes(type) && score === 0) {
    // For these types, 0 always means: skipped, empty/too-short, or off-topic — never a real graded attempt.
    return false
  }
  return true
}

/**
 * Save the most recent VALID result for a specific test type.
 * Caller must have already confirmed isValidTestResult(type, score) is true —
 * this function itself does not silently skip invalid saves, so callers
 * should gate the call site rather than rely on this to filter.
 *
 * @param {string} type
 * @param {{ overall:number, level?:string, [key:string]:any }} data
 */
export function saveLastResultForTest(type, data) {
  try {
    localStorage.setItem(PER_TEST_LAST_KEY_PREFIX + type, JSON.stringify({ ...data, _savedAt: Date.now() }))
  } catch(_) {}
}

/**
 * Load the most recently saved VALID result for a specific test type.
 * Returns null if none was ever saved for this type (never taken, or every
 * past attempt was invalid/skipped/off-topic and therefore never persisted).
 *
 * @param {string} type
 * @returns {object|null}
 */
export function loadLastResultForTest(type) {
  try {
    const raw = localStorage.getItem(PER_TEST_LAST_KEY_PREFIX + type)
    return raw ? JSON.parse(raw) : null
  } catch(_) {
    return null
  }
}

/**
 * Clear the per-test last-result memory for a specific test type.
 * @param {string} type
 */
export function clearLastResultForTest(type) {
  try { localStorage.removeItem(PER_TEST_LAST_KEY_PREFIX + type) } catch(_) {}
}
