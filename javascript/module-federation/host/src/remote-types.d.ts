declare module "remote1/Header" {
  import * as React from "react";
  export type HeaderProps = { title: string };
  const Header: React.FC<HeaderProps>;
  export default Header;
}

declare module "remote1/SharedButton" {
  import * as React from "react";
  export type SharedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
  const SharedButton: React.FC<SharedButtonProps>;
  export default SharedButton;
}

declare module "remote1/RemoteWidget" {
  import * as React from "react";
  const RemoteWidget: React.FC;
  export default RemoteWidget;
}
