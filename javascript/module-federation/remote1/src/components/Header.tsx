import React from "react";

export type HeaderProps = { title: string };

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 0",
      marginBottom: 12
    }}>
      <span style={{
        width: 8, height: 24, background: "#3b82f6", borderRadius: 4
      }} />
      <h2 style={{ margin: 0 }}>{title}</h2>
      <small style={{ color: "#6b7280" }}>(from remote1)</small>
    </header>
  );
};

export default Header;
