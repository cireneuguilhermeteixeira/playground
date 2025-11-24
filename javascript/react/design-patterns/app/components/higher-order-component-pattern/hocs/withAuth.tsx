import type { ComponentType } from "react";
import { isAuthenticated } from "../auth/auth.service";

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function AuthComponent(props: P) {
    const isLogged = isAuthenticated();

    if (!isLogged) {
      return <p>Access denied. Please log in to continue.
      </p>;
    }

    return <WrappedComponent {...props} />;
  };
}
