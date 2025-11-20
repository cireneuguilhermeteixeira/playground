import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./styles.css";

type ActionButtonProps = {
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ActionButton({
  children,
  className = "",
  ...rest
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={`notification-action-button ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}