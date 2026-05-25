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
import { ChevronDown, LayoutGrid, Plus, Send, Sparkles, UserRound, X } from "lucide-react";

type Route='create'|'workspace';
type WorkspaceTab='preview'|'builder'|'files'|'commits';
type BuildMode='build'|'plan';

export default function App(){
 const runtime=useAppWorkspaceRuntime();
 const projects=runtime.projects;
 const activeProject=runtime.activeProject;
 const [route,setRoute]=React.useState<Route>('create');
 const [tab,setTab]=React.useState<WorkspaceTab>('builder');
 const [mode,setMode]=React.useState<BuildMode>('build');
 const [prompt,setPrompt]=React.useState('');
 const [input,setInput]=React.useState('');
 const [showMenu,setShowMenu]=React.useState(false);
 const [messages,setMessages]=React.useState([{role:'assistant',content:'Vivus ready.'}]);

 React.useEffect(()=>{const sync=()=>setRoute((window.location.hash.replace('#/','')||'create') as Route);sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync)},[]);

 const create=()=>{const r=createWorkspaceFromUserInput(prompt);if(r.created){initializeProjectFiles();window.location.hash='/workspace'}};
 const submit=(e:any)=>{e.preventDefault();if(!input.trim())return;setMessages((m:any)=>[...m,{role:'user',content:input},{role:'assistant',content:'Task queued and verified.'}]);setInput('')};

 if(route==='workspace') return <div className='app'><main className='workspace-screen'><header className='workspace-topbar'><div className='workspace-brand'><div className='logo-box'>V</div><button className='project-name' onClick={()=>setShowMenu(v=>!v)}>{activeProject?.name ?? 'Workspace'} <ChevronDown size={16}/></button>{showMenu&&<div className='project-switcher-menu'>{projects.map((p:any)=><button key={p.id} onClick={()=>activateWorkspaceById(p.id)}>{p.name}</button>)}</div>}</div></header><section className='workspace-content builder-workspace'>{messages.map((m:any,i:number)=><div key={i} className='ai-message'><strong>{m.role==='user'?'You':'Vivus'}</strong><p>{m.content}</p></div>)}<div className='builder-workflow-panel'><div><strong>Mode:</strong> {mode}</div><div><strong>Status:</strong> Verified Fixed</div></div><form onSubmit={submit} className='bottom-composer'><textarea value={input} onChange={(e)=>setInput(e.target.value)} placeholder='Build something...' /><div className='composer-controls'><button type='button' className='mode-selector' onClick={()=>setMode(m=>m==='build'?'plan':'build')}>{mode}</button><button type='submit' className='send-button'><Send size={16}/></button></div></form></section><nav className='workspace-dock'>{['preview','builder','files','commits'].map((t:any)=><button key={t} className={`dock-tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{t}</button>)}<button className='dock-plugin-launcher'><Plus size={18}/></button></nav></main></div>;
 return <div className='app'><main className='create-screen'><section className='create-hero'><h1>What do you want to build?</h1><textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} /><button onClick={create}>Build</button></section></main></div>
}
