declare module "host/Card" {
  import * as React from "react";
  export type CardProps = { title: string; children?: React.ReactNode };
  const Card: React.FC<CardProps>;
  export default Card;
}

declare module "host/store" {
  import { StateCreator } from "zustand";

  export type CounterState = {
    count: number;
    inc: (delta?: number) => void;
    dec: (delta?: number) => void;
    reset: () => void;
  };

  export const useCounterStore: () => CounterState;
}