import React from "react";
import "./App.css";
import { Plus, Send, ChevronDown, LayoutGrid, Sparkles, UserRound } from "lucide-react";

type Route = "apps" | "create" | "account";

export default function App() {
  const [prompt, setPrompt] = React.useState("");
  const [mode, setMode] = React.useState<"build" | "plan">("build");
  const [route, setRoute] = React.useState<Route>("create");

  return (
    <div className="app">
      <main className="create-screen">
        <section className="create-hero">
          <div className="workspace-pill"><span className="live-dot" />Vivus local workspace</div>
          <h1>What do you want to build?</h1>
          <p className="hero-subtitle">Create anything. Vivus is your local AI-powered canvas.</p>

          <form className="home-composer">
            <textarea
              placeholder="Describe your idea or paste a local project path..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <button type="button" className="home-composer-plus" aria-label="Attach files">
              <Plus size={18} strokeWidth={2.6} />
            </button>

            <div className="home-composer-actions">
              <button type="button" className="mode-selector" onClick={() => setMode(mode === "build" ? "plan" : "build")}>
                <span>{mode === "build" ? "Build" : "Plan"}</span>
                <ChevronDown size={13} strokeWidth={2.5} />
              </button>

              <button type="submit" className="send-button">
                <Send size={17} strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </section>
      </main>

      <nav className="bottom-nav">
        <button className={route === "apps" ? "bottom-nav-item active" : "bottom-nav-item"} onClick={() => setRoute("apps")}><LayoutGrid size={20} /><strong>Apps</strong></button>
        <div className="nav-divider" />
        <button className={route === "create" ? "bottom-nav-item active" : "bottom-nav-item"} onClick={() => setRoute("create")}><Sparkles size={20} /><strong>Create</strong></button>
        <div className="nav-divider" />
        <button className={route === "account" ? "bottom-nav-item active" : "bottom-nav-item"} onClick={() => setRoute("account")}><UserRound size={20} /><strong>Account</strong></button>
      </nav>
    </div>
  );
}
