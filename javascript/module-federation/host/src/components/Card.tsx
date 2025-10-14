import React from "react";

export type CardProps = {
  title: string;
  children?: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      marginBottom: 12
    }}>
      <h3 style={{ margin: 0, marginBottom: 8 }}>{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export default Card;
