import React from "react";
import ReactDOM from "react-dom";
import Home from "./Home";
import About from "./About";

function getInitialProps() {
  const script = document.getElementById("initial-props");
  if (!script) return {};
  try {
    return JSON.parse(script.textContent);
  } catch (e) {
    console.error("Erro parsing initial-props:", e);
    return {};
  }
}

function bootstrap() {
  const root = document.getElementById("react-root");
  if (!root) {
    console.warn("Element #react-root not found");
    return;
  }

  const componentName = root.dataset.component;
  const props = getInitialProps();

  let Component = null;

  switch (componentName) {
    case "Home":
      Component = Home;
      break;
    case "About":
      Component = About;
      break;
    default:
      console.warn("Unknow React component:", componentName);
      return;
  }

  ReactDOM.render(<Component {...props} />, root);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
