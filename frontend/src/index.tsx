import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles/theme.css";

// Entry point for the frontend app.
// This mounts the React app and applies the global theme.
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

