import type { ReactNode, HTMLAttributes } from "react";
import "./styles.css";

export type RootProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function Root({ children, className = "", ...rest }: RootProps) {
  return (
    <div className={`notification-root ${className}`} {...rest}>
      {children}
    </div>
  );
}