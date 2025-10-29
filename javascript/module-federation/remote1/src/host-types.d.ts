declare module "host/Card" {
  import * as React from "react";
  export type CardProps = { title: string; children?: React.ReactNode };
  const Card: React.FC<CardProps>;
  export default Card;
}

declare module "host/HostCounterPanel" {
  import * as React from "react";
  const HostCounterPanel: React.FC;
  export default HostCounterPanel;
}

declare module "host/HostPureCounterPanel" {
  import * as React from "react";
  const HostPureCounterPanel: React.FC;
  export default HostPureCounterPanel;
}


declare module "host/zustandStore" {
  import type { StoreApi } from "zustand/vanilla";

  export type CounterState = {
    count: number;
    inc: (delta?: number) => void;
    dec: (delta?: number) => void;
    reset: () => void;
  };

  export const zustandCounterStore: StoreApi<CounterState>;
}

declare module "host/pureStore" {
  export type PureCounterState = { count: number };

  export const counterStore: {
    get(): PureCounterState;
    set(patch: Partial<PureCounterState> | ((s: PureCounterState) => Partial<PureCounterState>)): void;
    subscribe(listener: () => void): () => void;
    inc(delta?: number): void;
    dec(delta?: number): void;
    reset(): void;
  };

  export const subscribe: (listener: () => void) => () => void;
  export const getSnapshot: () => number;
}