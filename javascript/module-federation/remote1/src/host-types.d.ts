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