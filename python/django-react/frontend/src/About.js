import React from "react";

export default function About(props) {
  const { pageTitle, description } = props;

  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>{pageTitle}</h2>
      <p>{description}</p>
      <p>
        This is another React component mounted on a{" "}
        <code>data-component="About"</code> root.
      </p>
    </div>
  );
}