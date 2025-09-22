import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Canonical redirect: fuerza siempre www.maity.com.mx
const CANON = "www.maity.com.mx";
if (location.hostname !== CANON) {
  location.replace(`https://${CANON}${location.pathname}${location.search}${location.hash}`);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
