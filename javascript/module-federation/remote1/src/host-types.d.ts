declare module "host/Card" {
  import * as React from "react";
  export type CardProps = { title: string; children?: React.ReactNode };
  const Card: React.FC<CardProps>;
  export default Card;
}
