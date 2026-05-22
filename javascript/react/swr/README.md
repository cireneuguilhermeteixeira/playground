# SWR POC

POC em React para demonstrar `SWR`, a biblioteca da Vercel para fetch, cache e revalidação.

## O que a demo cobre

- `useSWR` para leitura com cache automático
- `refreshInterval` para revalidação periódica
- `revalidateOnFocus` via `SWRConfig`
- `useSWRMutation` para criação
- `mutate` com atualização otimista para troca de status

## Rodar localmente

```bash
npm install
npm run dev
```

## Estrutura

- `src/mockApi.ts`: mock assíncrono local que simula uma API
- `src/App.tsx`: demo principal com listagem, criação e mutation otimista
- `src/types.ts`: tipos do domínio

## Ideia da POC

Em vez de usar `useEffect` + `useState` + controle manual de loading/cache, o SWR centraliza:

- fetch inicial
- deduplicação
- revalidação em background
- atualização de cache após mutation

Isso deixa o componente mais declarativo e próximo do fluxo recomendado para dados remotos no React.
