import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Canonical redirect: fuerza siempre www.maity.com.mx
const CANONICAL_HOSTNAME = "www.maity.com.mx";
const CANONICAL_PROTOCOL = "https:";

// Solo hacer redirect en producción (no en desarrollo local)
const isProduction = !location.hostname.includes('localhost') && !location.hostname.includes('127.0.0.1');

if (isProduction) {
  let needsRedirect = false;
  let redirectUrl = '';

  // Validar hostname canónico
  if (location.hostname !== CANONICAL_HOSTNAME) {
    needsRedirect = true;
  }

  // Validar protocolo HTTPS
  if (location.protocol !== CANONICAL_PROTOCOL) {
    needsRedirect = true;
  }

  // Realizar redirect si es necesario
  if (needsRedirect) {
    redirectUrl = `${CANONICAL_PROTOCOL}//${CANONICAL_HOSTNAME}${location.pathname}${location.search}${location.hash}`;
    console.log(`Redirecting to canonical URL: ${redirectUrl}`);
    location.replace(redirectUrl);
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
