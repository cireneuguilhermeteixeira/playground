import React from "react";

const SharedButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return (
    <button
      {...props}
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        background: "#f9fafb",
        cursor: "pointer",
        ...props.style
      }}
    />
  );
};

export default SharedButton;
