export type CounterState = { count: number };

type Listener = () => void;

const state: CounterState = { count: 0 };
const listeners = new Set<Listener>();

function emit() {
  for (const l of Array.from(listeners)) l();
}

export const counterStore = {
  get(): CounterState {
    return state;
  },

  set(patch: Partial<CounterState> | ((s: CounterState) => Partial<CounterState>)) {
    const next = typeof patch === "function" ? patch(state) : patch;
    Object.assign(state, next);
    emit();
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  inc(delta = 1) {
    counterStore.set((s) => ({ count: s.count + delta }));
  },
  dec(delta = 1) {
    counterStore.set((s) => ({ count: Math.max(0, s.count - delta) }));
  },
  reset() {
    counterStore.set({ count: 0 });
  }
};

export const subscribe = counterStore.subscribe;
export const getSnapshot = () => counterStore.get().count;
