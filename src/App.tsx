import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import App from "./App";
import { AuthProvider } from './auth/authContext';
import ResourceList from './features/resources/ResourceList';
import ResourceDetail from './features/resources/ResourceDetail';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
