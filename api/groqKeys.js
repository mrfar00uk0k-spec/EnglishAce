// ─────────────────────────────────────────────────────────────────────────────
// EnglishAce — api/groqKeys.js
// Shared Groq API key management: collection, round-robin rotation, failover.
// ─────────────────────────────────────────────────────────────────────────────

let _roundRobinIndex = 0

export function getAllKeys() {
  const raw = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.VITE_GROQ_API_KEY,
  ]
  const seen  = new Set()
  const valid = []
  for (const k of raw) {
    const s = (k || '').trim()
    if (s && !seen.has(s)) { seen.add(s); valid.push(s) }
  }
  return valid
}

// Status codes where rotating to the next key may help.
function isRotatableStatus(status) {
  return status === 429 || status === 401 || status === 403 || status >= 500
}

// Throw a non-rotatable error — rotating to another key won't help
// (e.g. JSON parse errors, bad-request errors caused by our payload).
function noRotateError(msg) {
  const e  = new Error(msg)
  e._noRotate = true
  return e
}

export async function withKeyRotation(requestFn) {
  const keys = getAllKeys()
  if (!keys.length) {
    throw noRotateError('No Groq API key configured. Set GROQ_API_KEY in your environment variables.')
  }

  const startIdx = _roundRobinIndex % keys.length
  let   lastErr  = null

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const idx = (startIdx + attempt) % keys.length
    const key = keys[idx]

    try {
      const result = await requestFn(key)
      // Advance counter on success for true round-robin on warm instances.
      _roundRobinIndex = (idx + 1) % keys.length
      return result
    } catch (err) {
      // Non-rotatable errors (parse failures, bad payload, etc.) propagate immediately.
      if (err._noRotate) throw err

      lastErr = err
      console.warn(
        `[groqKeys] Key index ${idx} failed` +
        (err.status ? ` (HTTP ${err.status})` : ' (network)') +
        `: ${err.message}.` +
        (attempt + 1 < keys.length ? ' Trying next key.' : ' All keys exhausted.')
      )
    }
  }

  const e = new Error(`[groqKeys] All ${keys.length} key(s) exhausted. Last: ${lastErr?.message}`)
  throw e
}

export async function groqChat(systemPrompt, userPrompt, opts = {}) {
  const model       = opts.model       || 'llama-3.3-70b-versatile'
  const temperature = opts.temperature ?? 0.1
  const max_tokens  = opts.maxTokens   || 1200

  return withKeyRotation(async (key) => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + key,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt   },
        ],
      }),
    })

    // Rotatable: rate limit, auth errors, server errors
    if (isRotatableStatus(res.status)) {
      const body = await res.json().catch(() => ({}))
      const e    = new Error(body?.error?.message || `Groq HTTP ${res.status}`)
      e.status   = res.status
      throw e
    }

    // Non-rotatable: bad request, payload issue — rotating won't help
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw noRotateError(body?.error?.message || `Groq HTTP ${res.status}`)
    }

    const data = await res.json()
    const raw  = data?.choices?.[0]?.message?.content || ''
    if (!raw.trim()) {
      // Empty response is transient — let rotation try another key
      const e = new Error('Empty response from Groq model')
      e.status = 503
      throw e
    }

    // Parse errors are non-rotatable — another key won't produce a different schema
    try {
      return parseGroqJSON(raw)
    } catch (parseErr) {
      throw noRotateError(`JSON parse failed: ${parseErr.message}. Raw: ${raw.slice(0, 120)}`)
    }
  })
}

export async function groqWhisper(multipartBody, boundary) {
  return withKeyRotation(async (key) => {
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method:  'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type':  'multipart/form-data; boundary=' + boundary,
      },
      body: multipartBody,
    })

    if (isRotatableStatus(res.status)) {
      const body = await res.json().catch(() => ({}))
      const e    = new Error(body?.error?.message || `Groq Whisper HTTP ${res.status}`)
      e.status   = res.status
      throw e
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw noRotateError(body?.error?.message || `Groq Whisper HTTP ${res.status}`)
    }

    const data = await res.json()
    return (data.text || '').trim()
  })
}

function parseGroqJSON(raw) {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const start   = cleaned.indexOf('{')
  const end     = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in response')
  }
  return JSON.parse(cleaned.slice(start, end + 1))
}
