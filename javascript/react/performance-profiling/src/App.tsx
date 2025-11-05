import React from 'react'
import { ReactScanProvider } from './profiler/ReactScanProvider'
import { FPSMeter } from './profiler/FPSMeter'
import { useMemoryTracker } from './profiler/useMemoryTracker'
import { HeavyList } from './components/HeavyList'
import { MemoryLeakDemo } from './components/MemoryLeakDemo'
import { ReRenderTest } from './components/ReRenderTest'

// Web Vitals example
import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals'
onCLS(console.log)
onFID(console.log)
onLCP(console.log)
onINP(console.log)
onTTFB(console.log)

export default function App() {
  const snapshots = useMemoryTracker(2000)

  return (
    <ReactScanProvider>
      <FPSMeter />
      <div style={{ maxWidth: 980, margin: '40px auto', padding: '0 16px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial' }}>
        <h1>React Performance POC</h1>
        <p style={{ color: '#555' }}>
          Use the overlay of <strong>ReactScan</strong> (DEV) to view render counts per component..
          Use the DevTools Profiler to capture commits and flamecharts.
        </p>

        <section style={{ display: 'grid', gap: 24 }}>
          <ReRenderTest />
          <HeavyList />
          <MemoryLeakDemo />
        </section>

        <section style={{ marginTop: 32 }}>
          <h3>Memory tracker (amostras recentes)</h3>
          <div style={{ display: 'grid', gap: 6 }}>
            {snapshots.slice(-5).map((s, i) => (
              <code key={i} style={{ fontSize: 12 }}>
                t={Math.round(s.timestamp)}ms | usedJSHeap={s.usedJSHeapSize ?? '-'} | totalJSHeap={s.totalJSHeapSize ?? '-'} | estimate={s.jsMemoryEstimate ?? '-'}
              </code>
            ))}
          </div>
          <p style={{ color: '#555', fontSize: 12 }}>
            Note: Some memory metrics are specific to Chrome and may require experimental flags.
          </p>
        </section>

        
      </div>
    </ReactScanProvider>
  )
}
