import React from 'react'

/**
 * Fixed version: no memory leak.
 * - Interval is always cleared on unmount
 * - Event listener is always removed
 * - Large payload is reused and cleaned up
 */
export function MemoryLeakDemoFixed() {
  const [mounted, setMounted] = React.useState(true)
  const [tick, setTick] = React.useState(0)

  const handleTick = React.useCallback(() => {
    setTick((t) => t + 1)
  }, [])

  return (
    <div>
      <h3>MemoryLeakFixed</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <button onClick={() => setMounted((m) => !m)}>{mounted ? 'Unmount' : 'Mount'}</button>
      </div>
      {mounted && <SafeWidget onTick={handleTick} />}
      <p style={{ color: '#555', fontSize: 12, marginTop: 8 }}>
        Total ticks: {tick}. With this fixed version, repeated mount/unmount cycles should NOT
        cause the JS heap to grow over time in Chrome DevTools &rarr; Memory.
      </p>
    </div>
  )
}

function SafeWidget({ onTick }: { onTick: () => void }) {
  const ref = React.useRef<HTMLDivElement | null>(null)

  // Reuse a single payload array instead of allocating a new one every tick
  const payloadRef = React.useRef<string[] | null>(null)

  React.useEffect(() => {
    if (!payloadRef.current) {
      payloadRef.current = new Array(50_000).fill('safe-payload')
    }

    const id = window.setInterval(() => {
      onTick()
      const el: any = ref.current
      if (el?.dataset && payloadRef.current) {
        // Just reference something stable, no unbounded growth
        el.dataset.payload = String(payloadRef.current.length)
      }
    }, 500)

    function handler() {
      // no-op, but exists to mimic the previous example
    }
    window.addEventListener('resize', handler)

    return () => {
      //  ALWAYS clear side-effects
      window.clearInterval(id)
      window.removeEventListener('resize', handler)

      const el: any = ref.current
      if (el?.dataset && 'payload' in el.dataset) {
        delete el.dataset.payload
      }
    }
  }, [onTick])

  return (
    <div ref={ref} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
      <p>SafeWidget active (no leaks)</p>
    </div>
  )
}
