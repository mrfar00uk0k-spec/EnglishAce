import React, { useRef, useState } from 'react'

/**
 * Wrap any card with <GlowCard> to get the purple/blue spotlight glow on hover.
 * Works exactly like the screenshot reference.
 */
export default function GlowCard({ children, style = {}, className = '', borderRadius = 16 }) {
  const cardRef = useRef(null)
  const [glow, setGlow] = useState({ x: 0, y: 0, opacity: 0 })

  const handleMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    setGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    })
  }
  const handleLeave = () => setGlow(g => ({ ...g, opacity: 0 }))

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius,
        ...style,
      }}
    >
      {/* Spotlight glow */}
      <div style={{
        position: 'absolute',
        pointerEvents: 'none',
        width: 340,
        height: 340,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(56,189,248,0.10) 40%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        left: glow.x,
        top: glow.y,
        opacity: glow.opacity,
        transition: 'opacity 0.35s ease',
        zIndex: 1,
      }}/>
      {/* Content above glow */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}
