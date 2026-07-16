import { useEffect, useRef, useState } from 'react'

/**
 * useAudioLevels
 * ─────────────────────────────────────────────────────────────────────────
 * Attaches a Web Audio AnalyserNode to a live MediaStream (microphone) and
 * continuously samples real amplitude data, exposing it as an array of
 * normalized bar heights (0–1) suitable for driving a waveform visualizer.
 *
 * This replaces a purely decorative CSS @keyframes animation with bars that
 * actually rise and fall with the user's real voice: silence -> flat bars,
 * speaking -> bars react to loudness, in real time.
 *
 * @param {MediaStream|null} stream - the live microphone stream (or null/undefined when not recording)
 * @param {number} barCount - how many bars to produce (default 12, matches existing UI)
 * @returns {number[]} array of length barCount, each value in [0, 1]
 */
export function useAudioLevels(stream, barCount = 12) {
  const [levels, setLevels] = useState(() => new Array(barCount).fill(0))

  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef    = useRef(null)
  const rafRef       = useRef(null)
  const dataArrayRef = useRef(null)
  // Smoothing memory per-bar so bars don't jitter erratically frame-to-frame
  const smoothedRef  = useRef(new Array(barCount).fill(0))

  useEffect(() => {
    // No active stream (not recording, or mic denied) — reset to flat and do nothing else.
    if (!stream || !stream.getAudioTracks || stream.getAudioTracks().length === 0) {
      setLevels(new Array(barCount).fill(0))
      return
    }

    let cancelled = false

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return // Web Audio unsupported — bars simply stay flat, no crash

      const audioCtx = new AudioContextClass()
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 128
      // Lower smoothing = the analyser itself reacts closer to instantly to
      // real volume changes, instead of gliding — makes the bars feel alive.
      analyser.smoothingTimeConstant = 0.4

      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      // Intentionally NOT connecting analyser to audioCtx.destination — we only
      // want to read levels, not play the mic back through the speakers.

      audioCtxRef.current = audioCtx
      analyserRef.current = analyser
      sourceRef.current   = source
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)

      const tick = () => {
        if (cancelled) return
        const analyserNode = analyserRef.current
        const dataArray     = dataArrayRef.current
        if (!analyserNode || !dataArray) return

        analyserNode.getByteFrequencyData(dataArray)

        // Bucket the frequency bins into `barCount` groups and average each,
        // so every bar reflects a slice of the real spectrum rather than one raw sample.
        const bucketSize = Math.floor(dataArray.length / barCount) || 1
        const next = new Array(barCount)

        for (let i = 0; i < barCount; i++) {
          let sum = 0
          const start = i * bucketSize
          const end   = Math.min(start + bucketSize, dataArray.length)
          for (let j = start; j < end; j++) sum += dataArray[j]
          const avg = end > start ? sum / (end - start) : 0
          const normalized = Math.min(1, avg / 115) // lower divisor = more gain, so normal speech swings bars much closer to full height

          // Favor the live signal over the previous frame so bars react quickly
          // to real volume changes, while still avoiding a single-frame flicker.
          const prev = smoothedRef.current[i] || 0
          const smoothed = prev * 0.3 + normalized * 0.7
          smoothedRef.current[i] = smoothed
          next[i] = smoothed
        }

        setLevels(next)
        rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      // Any Web Audio failure (e.g. browser quirk) should never break the recording flow —
      // bars just stay flat, the actual recording/transcription is unaffected.
      console.warn('[useAudioLevels] Web Audio analysis unavailable:', err && err.message)
    }

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      try { sourceRef.current && sourceRef.current.disconnect() } catch (_) {}
      try { analyserRef.current && analyserRef.current.disconnect() } catch (_) {}
      try { audioCtxRef.current && audioCtxRef.current.state !== 'closed' && audioCtxRef.current.close() } catch (_) {}
      audioCtxRef.current = null
      analyserRef.current = null
      sourceRef.current = null
      dataArrayRef.current = null
      smoothedRef.current = new Array(barCount).fill(0)
      setLevels(new Array(barCount).fill(0))
    }
  }, [stream, barCount])

  return levels
}
