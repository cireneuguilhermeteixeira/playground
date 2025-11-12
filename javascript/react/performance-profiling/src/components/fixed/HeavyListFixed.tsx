import React from 'react'

function heavyCompute(n: number) {
  let x = 0
  for (let i = 0; i < n; i++) x += Math.sqrt(i) % 3.14159
  return x
}

type Item = { id: number; label: string; cost: number }

type RowProps = {
  item: Item
  style: React.CSSProperties
}

const RowFixed: React.FC<RowProps> = React.memo(({ item, style }) => {
  return (
    <div
      style={{
        padding: '8px 12px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        ...style,
      }}
    >
      <span style={{ fontVariantNumeric: 'tabular-nums', width: 48 }}>{item.id}</span>
      <span>{item.label}</span>
      <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.6 }}>
        cost: {item.cost.toFixed(0)}
      </span>
    </div>
  )
})
RowFixed.displayName = 'RowFixed'

export function HeavyListFixed() {
  const [count, setCount] = React.useState(1000)

  const rowHeight = 36
  const viewportHeight = 300
  const overscan = 5

  const [scrollTop, setScrollTop] = React.useState(0)

  const items = React.useMemo<Item[]>(() => {
    const baseCost = heavyCompute(20_000)

    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      label: `Item #${i + 1}`,
      cost: baseCost + i,
    }))
  }, [count])

  const totalHeight = items.length * rowHeight

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan,
  )

  const visibleItems = items.slice(startIndex, endIndex)

  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget
      setScrollTop(target.scrollTop)
    },
    [setScrollTop],
  )

  const handleIncrease = React.useCallback(() => {
    setCount((c) => Math.min(10000, c + 500))
  }, [])

  const handleDecrease = React.useCallback(() => {
    setCount((c) => Math.max(100, c - 500))
  }, [])

  return (
    <div>
      <h3>HeavyListFixed (virtualized & memoized)</h3>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <button onClick={handleIncrease}>+500 rows</button>
        <button onClick={handleDecrease}>-500 rows</button>
        <span style={{ fontSize: 12, color: '#555' }}>
          Total rows: <strong>{count}</strong>
        </span>
      </div>

      <div
        style={{
          height: viewportHeight,
          overflow: 'auto',
          border: '1px solid #ddd',
          borderRadius: 8,
          position: 'relative',
        }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map((item, idx) => {
            const itemIndex = startIndex + idx
            const top = itemIndex * rowHeight

            return (
              <RowFixed
                key={item.id}
                item={item}
                style={{
                  position: 'absolute',
                  top,
                  left: 0,
                  right: 0,
                  height: rowHeight,
                  boxSizing: 'border-box',
                  background: itemIndex % 2 === 0 ? '#fff' : '#fafafa',
                }}
              />
            )
          })}
        </div>
      </div>

      <p style={{ color: '#555', fontSize: 12, marginTop: 8 }}>
        This fixed version:
        <br />
        – precomputes heavy work once per list change
        <br />
        – only renders visible rows (simple virtualization)
        <br />– uses <code>React.memo</code> + <code>useMemo</code> + <code>useCallback</code> to
        avoid unnecessary re-renders.
      </p>
    </div>
  )
}
