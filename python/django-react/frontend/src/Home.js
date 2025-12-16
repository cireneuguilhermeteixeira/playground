import React from "react";

export default function Home(props) {
  const { username, pageTitle } = props;

  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>{pageTitle}</h2>
      <p>Welcome, {username}!</p>
      <p>
        This content is rendered by <strong>React 17</strong> inside a Django
        template.
      </p>
    </div>
  );
}