import type { ElementType, HTMLAttributes } from "react";

type IconProps = {
  icon: ElementType;
} & HTMLAttributes<HTMLDivElement>;

export function Icon({ icon: IconComponent, ...rest }: IconProps) {
  return (
    <div className="notification-icon" {...rest}>
      <IconComponent />
    </div>
  );
}