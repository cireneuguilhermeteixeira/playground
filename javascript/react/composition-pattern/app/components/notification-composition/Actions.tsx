import type { ReactNode, HTMLAttributes } from "react";
import "./styles.css";

type ActionsProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function Actions({ children, className = "", ...rest }: ActionsProps) {
  return (
    <div className={`notification-actions ${className}`} {...rest}>
      {children}
    </div>
  );
}