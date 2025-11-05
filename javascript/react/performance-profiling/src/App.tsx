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
          Use o overlay do <strong>ReactScan</strong> (DEV) para ver contagens de render por componente.
          Utilize o Profiler das DevTools para capturar commits e flamecharts.
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
            Nota: algumas métricas de memória são específicas do Chrome e podem exigir flags experimentais.
          </p>
        </section>

        <section style={{ marginTop: 32 }}>
          <h3>Passos sugeridos para investigar</h3>
          <ol>
            <li>Abrir React DevTools &rarr; Profiler e gravar interações nos componentes acima.</li>
            <li>Observar no ReactScan componentes com alto <em>render count</em> e duração de render.</li>
            <li>Trocar os toggles (ex.: otimização no ReRenderTest, rows pesadas) e comparar a diferença.</li>
            <li>Usar a aba Memory do Chrome para verificar retainers após unmount no MemoryLeakDemo.</li>
          </ol>
        </section>
      </div>
    </ReactScanProvider>
  )
}
