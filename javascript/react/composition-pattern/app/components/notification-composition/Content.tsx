import type { ReactNode, HTMLAttributes } from "react";
import "./styles.css";

type ContentProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function Content({ children, className = "", ...rest }: ContentProps) {
  return (
    <div className={`notification-content ${className}`} {...rest}>
      {children}
    </div>
  );
}