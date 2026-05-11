import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import App from "./App";
import { AuthProvider } from './auth/authContext';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
