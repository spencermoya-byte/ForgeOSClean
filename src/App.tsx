import React from "react";
import "./App.css";
import { Plus, Send, ChevronDown, LayoutGrid, Sparkles, UserRound, Code2, Eye, FolderOpen, GitCommitHorizontal } from "lucide-react";

type Route = "apps" | "create" | "account" | "workspace";
type WorkspaceTab = "builder" | "preview" | "files" | "commits";

export default function App() {
  const [prompt, setPrompt] = React.useState("");
  const [builderPrompt, setBuilderPrompt] = React.useState("");
  const [mode, setMode] = React.useState<"build" | "plan">("build");
  const [route, setRoute] = React.useState<Route>("create");
  const [workspaceTab, setWorkspaceTab] = React.useState<WorkspaceTab>("builder");

  function openWorkspace(e?: React.FormEvent) {
    e?.preventDefault();
    setRoute("workspace");
  }

  const renderComposer = (value:string,setValue:(v:string)=>void,placeholder:string) => (
    <form className="home-composer" onSubmit={(e)=>e.preventDefault()}>
      <textarea placeholder={placeholder} value={value} onChange={(e)=>setValue(e.target.value)} />
      <button type="button" className="home-composer-plus"><Plus size={18} strokeWidth={2.6} /></button>
      <div className="home-composer-actions">
        <button type="button" className="mode-selector" onClick={()=>setMode(mode === "build" ? "plan" : "build")}>
          <span>{mode === "build" ? "Build" : "Plan"}</span>
          <ChevronDown size={13} strokeWidth={2.5} />
        </button>
        <button type="submit" className="send-button"><Send size={17} strokeWidth={2.5} /></button>
      </div>
    </form>
  );

  const renderCreate = () => <main className="create-screen"><section className="create-hero"><div className="workspace-pill"><span className="live-dot" />Vivus local workspace</div><h1>What do you want to build?</h1><p className="hero-subtitle">Create anything. Vivus is your local AI-powered canvas.</p>{renderComposer(prompt,setPrompt,"Describe your idea or paste a local project path...")}<button className="soft-button" onClick={openWorkspace}>Open Workspace</button></section></main>;

  const renderWorkspace = () => <main className="workspace-screen"><header className="workspace-topbar"><div className="workspace-brand"><strong>Vivus Workspace</strong></div></header><section className="workspace-content" style={{padding:"24px",paddingBottom:"100px"}}>{workspaceTab === "builder" && <div><div className="forge-card" style={{marginBottom:"16px"}}><Code2 size={18} /><h2>Builder</h2><p>Builder composer restored.</p></div>{renderComposer(builderPrompt,setBuilderPrompt,"Make, test, iterate...")}</div>}{workspaceTab === "preview" && <div className="forge-card"><Eye size={18} /><h2>Preview</h2></div>}{workspaceTab === "files" && <div className="forge-card"><FolderOpen size={18} /><h2>Files</h2></div>}{workspaceTab === "commits" && <div className="forge-card"><GitCommitHorizontal size={18} /><h2>Commits</h2></div>}</section><nav className="workspace-dock"><button className={workspaceTab==="preview"?"dock-tab active":"dock-tab"} onClick={()=>setWorkspaceTab("preview")}>Preview</button><button className={workspaceTab==="builder"?"dock-tab active":"dock-tab"} onClick={()=>setWorkspaceTab("builder")}>Builder</button><button className={workspaceTab==="files"?"dock-tab active":"dock-tab"} onClick={()=>setWorkspaceTab("files")}>Files</button><div className="dock-divider" /><button className={workspaceTab==="commits"?"dock-tab active":"dock-tab"} onClick={()=>setWorkspaceTab("commits")}>Commits</button></nav></main>;

  return <div className="app">{route === "workspace" ? renderWorkspace() : renderCreate()}<nav className="bottom-nav"><button className={route === "apps" ? "bottom-nav-item active" : "bottom-nav-item"}><LayoutGrid size={20} /><strong>Apps</strong></button><div className="nav-divider" /><button className={route === "create" ? "bottom-nav-item active" : "bottom-nav-item"} onClick={()=>setRoute("create")}><Sparkles size={20} /><strong>Create</strong></button><div className="nav-divider" /><button className={route === "account" ? "bottom-nav-item active" : "bottom-nav-item"}><UserRound size={20} /><strong>Account</strong></button></nav></div>;
}
