import React from 'react'

function heavyCompute(n: number) {
  // Intentionally heavy synchronous work
  let x = 0
  for (let i = 0; i < n; i++) x += Math.sqrt(i) % 3.14159
  return x
}

type Item = { id: number, label: string }

const Row: React.FC<{ item: Item; slow?: boolean }> = React.memo(({ item, slow }) => {
  if (slow) {
    // simulate heavy work on each row render
    heavyCompute(75_000)
  }
  return (
    <div style={{
      padding: '8px 12px', borderBottom: '1px solid #eee',
      display: 'flex', alignItems: 'center', gap: 12
    }}>
      <span style={{ fontVariantNumeric: 'tabular-nums', width: 48 }}>{item.id}</span>
      <span>{item.label}</span>
    </div>
  )
})
Row.displayName = 'Row'

export function HeavyList() {
  const [count, setCount] = React.useState(1000)
  const [slowRows, setSlowRows] = React.useState(true)
  const [items, setItems] = React.useState<Item[]>(() =>
    Array.from({ length: count }, (_, i) => ({ id: i + 1, label: `Item #${i + 1}` }))
  )

  React.useEffect(() => {
    setItems(Array.from({ length: count }, (_, i) => ({ id: i + 1, label: `Item #${i + 1}` })))
  }, [count])

  return (
    <div>
      <h3>HeavyList (no virtualization)</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <button onClick={() => setCount(c => Math.min(10000, c + 500))}>+500 rows</button>
        <button onClick={() => setCount(c => Math.max(100, c - 500))}>-500 rows</button>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={slowRows} onChange={e => setSlowRows(e.target.checked)} />
          Simular linhas pesadas
        </label>
      </div>
      <div style={{
        height: 300, overflow: 'auto', border: '1px solid #ddd', borderRadius: 8
      }}>
        {items.map(it => <Row key={it.id} item={it} slow={slowRows} />)}
      </div>
      <p style={{ color: '#555', fontSize: 12, marginTop: 8 }}>
        Dica: experimente rolar com <code>slowRows</code> ativado para observar o FPS cair.
      </p>
    </div>
  )
}
