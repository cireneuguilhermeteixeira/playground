# React Performance POC

POC para investigar performance de uma app React: FPS, re-renders desnecessários, render lento de listas e vazamentos de memória.

## 🔧 Setup

```bash
pnpm i # ou npm i / yarn
pnpm dev # ou npm run dev / yarn dev
```

Abra http://localhost:5173

> Em modo DEV, o overlay do **ReactScan** estará ativo.

## 📦 O que tem aqui

- **ReactScan**: overlay em tempo real de render count/duration
- **React Profiler**: logs por commit no console + use o Profiler nas DevTools
- **Web Vitals**: CLS, FID, LCP, INP, TTFB logados no console
- **FPSMeter**: medidor simples de FPS por `requestAnimationFrame`
- **useMemoryTracker**: coleta *heap usage* (Chrome) e `measureUserAgentSpecificMemory` (experimental)

## 🧪 Componentes de teste

- `ReRenderTest`: mostra re-renders causados por identidade de props e como estabilizar com `useMemo/useCallback`.
- `HeavyList`: renderiza uma lista grande (sem virtualização) e simula linhas pesadas para observar FPS/tempo de render.
- `MemoryLeakDemo`: simula vazamentos clássicos (interval + event listener) com opção para corrigir via cleanup.

## 🕵️ Roteiro de investigação

1. Habilite/desabilite as otimizações e compare os gráficos no Profiler.
2. No **HeavyList**, aumente o número de linhas e ative "linhas pesadas" para provocar queda de FPS.
3. No **MemoryLeakDemo**, faça vários ciclos de mount/unmount e grave um *Allocation profile* na aba **Memory**.
4. Use o overlay do **ReactScan** para identificar componentes com picos de render.

## 📈 Próximos passos
- Exportar métricas do Profiler para um endpoint e visualizar no Grafana.
- Introduzir *virtualization* (ex.: `react-window`) para comparar.
- Rodar build de produção e comparar métricas.

---
Feito para estudos e diagnósticos rápidos de performance em React.
