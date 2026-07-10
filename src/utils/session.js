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

/**
 * Fix #12: Clear previous result when user starts a new test attempt.
 * Call this at the beginning of each test component mount (when NOT resuming).
 * @param {string} type - assessment type
 */
export function clearOnStart(type) {
  try {
    clearSession(type)
  } catch(_) {}
}
