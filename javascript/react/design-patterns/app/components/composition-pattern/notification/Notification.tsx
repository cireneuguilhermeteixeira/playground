import React from "react";
import type { ElementType, ReactNode } from "react";
import "./notification.css";

export type NotificationVariant = "default" | "success" | "error" | "warning";

type NotificationProps = {

  showRoot?: boolean;

  showIcon?: boolean;
  icon?: ElementType;

  showContent?: boolean;
  content?: ReactNode;

  showActions?: boolean;

  onConfirm?: () => void;
  onCancel?: () => void;

  confirmLabel?: string;
  cancelLabel?: string;

  confirmIcon?: ElementType;
  cancelIcon?: ElementType;

  variant?: NotificationVariant;

  className?: string;
};

export function Notification({
  showRoot = true,
  showIcon = false,
  icon: Icon,
  showContent = true,
  content,
  showActions = false,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmIcon: ConfirmIcon,
  cancelIcon: CancelIcon,
  variant = "default",
  className = "",
}: NotificationProps) {

    if (!showRoot) return null;

  return (
    <div className={`notification-root notification-${variant} ${className}`}>
      {showIcon && Icon && (
        <div className="notification-icon">
          <Icon />
        </div>
      )}

      {showContent && content && (
        <div className="notification-content">{content}</div>
      )}

      {showActions && (onConfirm || onCancel) && (
        <div className="notification-actions">
          {onCancel && (
            <button
              type="button"
              className="notification-action-button notification-action-cancel"
              onClick={onCancel}
            >
              {CancelIcon && <CancelIcon />}
              {!CancelIcon && cancelLabel}
            </button>
          )}

          {onConfirm && (
            <button
              type="button"
              className="notification-action-button notification-action-confirm"
              onClick={onConfirm}
            >
              {ConfirmIcon && <ConfirmIcon />}
              {!ConfirmIcon && confirmLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}