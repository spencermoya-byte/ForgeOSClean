import React from "react";
import "./App.css";
import "./BuilderLifecycle.css";
import "./BuilderWorkflow.css";
import "./VerifiedEditPanel.css";
import { CommitPanel } from "./CommitPanel";
import { ProjectFilesPanel, initializeProjectFiles } from "./ProjectFilesPanel";
import { WorkspacePreviewPanel } from "./WorkspacePreviewPanel";
import { useAppWorkspaceRuntime } from "./AppWorkspaceRuntime";
import { createWorkspaceFromUserInput } from "./workspaceCreateRuntime";
import { activateWorkspaceById } from "./workspaceSwitcherController";
import { ChevronDown, LayoutGrid, Plus, Send, Sparkles, UserRound } from "lucide-react";

export default function App() {
 const workspaceRuntime = useAppWorkspaceRuntime();
 const projects = workspaceRuntime.projects;
 const activeProject = workspaceRuntime.activeProject;
 const [route,setRoute]=React.useState("create");
 const [prompt,setPrompt]=React.useState("");
 React.useEffect(()=>{setRoute(window.location.hash.replace('#/','')||'create')},[]);
 const create=()=>{const result=createWorkspaceFromUserInput(prompt);if(result.created){initializeProjectFiles();window.location.hash='/workspace';setRoute('workspace')}};
 if(route==='workspace') return <div className='app'><main className='workspace-screen'><header className='workspace-topbar'><div className='workspace-brand'><div className='logo-box'>V</div><button className='project-name'>{activeProject?.name ?? 'Workspace'} <ChevronDown size={16}/></button></div></header><section className='workspace-content'><WorkspacePreviewPanel /></section></main></div>;
 return <div className='app'><main className='create-screen'><section className='create-hero'><div className='workspace-pill'><span className='live-dot'/>Vivus local workspace</div><h1>What do you want to build?</h1><textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} placeholder='Describe your idea...' /><button onClick={create}><Send size={16}/> Build</button></section></main><nav className='bottom-nav'><button className='bottom-nav-item'><Sparkles size={18}/><strong>Create</strong></button><button className='bottom-nav-item'><LayoutGrid size={18}/><strong>Apps</strong></button><button className='bottom-nav-item'><UserRound size={18}/><strong>Account</strong></button></nav></div>;
}
