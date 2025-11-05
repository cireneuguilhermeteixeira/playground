import React from 'react'

/**
 * This component simulates a classic leak: an interval and a window event
 * listener that are not cleaned up on unmount.
 */
export function MemoryLeakDemo() {
  const [mounted, setMounted] = React.useState(true)
  const [fixLeaks, setFixLeaks] = React.useState(false)
  const [tick, setTick] = React.useState(0)

  return (
    <div>
      <h3>MemoryLeakDemo</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <button onClick={() => setMounted(m => !m)}>{mounted ? 'Unmount' : 'Mount'}</button>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={fixLeaks} onChange={e => setFixLeaks(e.target.checked)} />
          Fix leaks (clear interval/listener)
        </label>
      </div>
      {mounted && <LeakyWidget fix={fixLeaks} onTick={() => setTick(t => t + 1)} />}
      <p style={{ color: '#555', fontSize: 12, marginTop: 8 }}>
        Ticks totais: {tick}. Open the Chrome DevTools &rarr; Memory &rarr; Record allocations and
        perform several Mount/Unmount cycles to observe retention when correction is disabled.
      </p>
    </div>
  )
}

function LeakyWidget({ fix, onTick }: { fix: boolean; onTick: () => void }) {
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const id = window.setInterval(() => {
      onTick();
      // hold onto some memory
      (ref.current as any)?.dataset && ((ref.current as any).dataset.payload = new Array(50_000).fill('leak'))
    }, 500)

    function handler() {
      // do nothing, just hold reference
    }
    window.addEventListener('resize', handler)

    return () => {
      if (fix) {
        window.clearInterval(id)
        window.removeEventListener('resize', handler)
      }
      // if not fixing, this cleanup intentionally "forgets" to clear
      // interval and removeEventListener to simulate a leak.
    }
  }, [fix, onTick])

  return (
    <div ref={ref} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
      <p>LeakyWidget actived (fix = {String(fix)})</p>
    </div>
  )
}
