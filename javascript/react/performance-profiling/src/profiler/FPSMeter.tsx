import React from 'react'

export function FPSMeter() {
  const [fps, setFps] = React.useState(0)
  const rafRef = React.useRef(0)
  const lastRef = React.useRef(performance.now())
  const framesRef = React.useRef(0)

  React.useEffect(() => {
    function loop(now: number) {
      framesRef.current += 1
      if (now - lastRef.current >= 1000) {
        setFps(framesRef.current)
        framesRef.current = 0
        lastRef.current = now
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div style={{
      position: 'fixed', right: 12, top: 12, padding: '6px 10px',
      background: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: 8,
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
      fontSize: 12
    }}>
      FPS: <strong>{fps}</strong>
    </div>
  )
}
