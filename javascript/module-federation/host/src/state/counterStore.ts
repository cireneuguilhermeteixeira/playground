import { createStore } from "zustand/vanilla";

export type CounterState = {
  count: number;
  inc: (delta?: number) => void;
  dec: (delta?: number) => void;
  reset: () => void;
};

export const counterStore = createStore<CounterState>((set) => ({
  count: 0,
  inc: (d = 1) => set((s) => ({ count: s.count + d })),
  dec: (d = 1) => set((s) => ({ count: Math.max(0, s.count - d) })),
  reset: () => set({ count: 0 }),
}));
