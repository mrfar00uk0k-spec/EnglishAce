import { groqWhisper, getAllKeys } from './groqKeys.js'

export const config = { api: { bodyParser: false } }

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
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const rawBody = Buffer.concat(chunks)

    if (!rawBody.length) return res.status(400).json({ error: 'Empty request body' })

    const contentType = req.headers['content-type'] || ''
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Expected multipart/form-data' })
    }

    // Fix: strip optional quotes and trailing semicolons/spaces from boundary value
    const boundaryMatch = contentType.match(/boundary=["']?([^"';\s,]+)["']?/)
    if (!boundaryMatch) return res.status(400).json({ error: 'No boundary in Content-Type' })
    const boundary = boundaryMatch[1].trim()

    const { audioBuffer, audioFilename, audioMime } = parseMultipart(rawBody, boundary)

    if (!audioBuffer || !audioBuffer.length) {
      return res.status(400).json({ error: 'No audio data found. Field name must be "audio".' })
    }

    const groqBoundary = 'EnglishAceAudio' + Date.now()
    const groqBody     = buildWhisperFormData(
      audioBuffer,
      audioFilename || 'audio.webm',
      audioMime     || 'audio/webm',
      groqBoundary
    )

    const transcript = await groqWhisper(groqBody, groqBoundary)
    return res.status(200).json({ transcript })

  } catch (err) {
    console.error('transcribe.js error:', err.message)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}

function parseMultipart(body, boundary) {
  const sep = Buffer.from('--' + boundary)
  let pos = 0
  let audioBuffer = null, audioFilename = null, audioMime = null

  while (pos < body.length) {
    const start = bufIndexOf(body, sep, pos)
    if (start === -1) break
    pos = start + sep.length

    if (body[pos] === 0x0d && body[pos + 1] === 0x0a) pos += 2
    if (body[pos] === 0x2d && body[pos + 1] === 0x2d) break

    const headerEnd = bufIndexOf(body, Buffer.from('\r\n\r\n'), pos)
    if (headerEnd === -1) break

    const headerStr = body.slice(pos, headerEnd).toString('utf8')
    pos = headerEnd + 4

    const nextBound = bufIndexOf(body, sep, pos)
    const partEnd   = nextBound === -1 ? body.length : nextBound - 2

    // Match field name — handle both single and double quotes
    const nameMatch = headerStr.match(/[Nn]ame=["']?([^"';\r\n]+?)["']?(?:\s*;|\s*$)/m)
    const fieldName = nameMatch ? nameMatch[1].trim() : ''

    if (fieldName === 'audio') {
      audioBuffer = body.slice(pos, partEnd)

      const fnMatch = headerStr.match(/filename\*?=["']?([^"';\r\n]+?)["']?(?:\s*;|\s*$)/im)
      if (fnMatch) audioFilename = fnMatch[1].trim()

      const ctMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i)
      if (ctMatch) audioMime = ctMatch[1].trim()
    }

    pos = partEnd + 2
  }

  return { audioBuffer, audioFilename, audioMime }
}

function buildWhisperFormData(audioBuffer, filename, mimeType, boundary) {
  const fileHeader = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`
  )
  const modelPart = Buffer.from(
    `\r\n--${boundary}\r\n` +
    `Content-Disposition: form-data; name="model"\r\n\r\n` +
    `whisper-large-v3-turbo` +
    `\r\n--${boundary}\r\n` +
    `Content-Disposition: form-data; name="response_format"\r\n\r\n` +
    `json` +
    `\r\n--${boundary}--\r\n`
  )
  return Buffer.concat([fileHeader, audioBuffer, modelPart])
}

function bufIndexOf(buf, search, start = 0) {
  const sl = search.length
  outer: for (let i = start; i <= buf.length - sl; i++) {
    for (let j = 0; j < sl; j++) {
      if (buf[i + j] !== search[j]) continue outer
    }
    return i
  }
  return -1
}
