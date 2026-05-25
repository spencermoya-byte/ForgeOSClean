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

type WorkspaceTab='preview'|'builder'|'files'|'commits';

export default function App(){
const runtime=useAppWorkspaceRuntime();
const projects=runtime.projects;
const activeProject=runtime.activeProject;
const [route,setRoute]=React.useState('create');
const [prompt,setPrompt]=React.useState('');
const [workspaceTab,setWorkspaceTab]=React.useState<WorkspaceTab>('builder');
const [showMenu,setShowMenu]=React.useState(false);
React.useEffect(()=>{const sync=()=>setRoute(window.location.hash.replace('#/','')||'create');sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync)},[]);
const create=()=>{const r=createWorkspaceFromUserInput(prompt);if(r.created){initializeProjectFiles();window.location.hash='/workspace';setRoute('workspace')}};
const open=(id:string)=>{activateWorkspaceById(id);initializeProjectFiles();setShowMenu(false)};
const panel=()=>{switch(workspaceTab){case 'preview':return <WorkspacePreviewPanel/>;case 'files':return <ProjectFilesPanel projectId={runtime.activeProjectId}/>;case 'commits':return <CommitPanel projectName={activeProject?.name ?? 'Workspace'}/>;default:return <section className='workspace-content'><div style={{padding:24,color:'#fff'}}><h2>Vivus Builder</h2><p>Workspace restored. Builder reconstruction in progress.</p></div></section>}}
if(route==='workspace') return <div className='app'><main className='workspace-screen'><header className='workspace-topbar'><div className='workspace-brand project-switcher-wrap'><div className='logo-box'>V</div><button className='project-name' onClick={()=>setShowMenu(v=>!v)}>{activeProject?.name ?? 'Workspace'} <ChevronDown size={16}/></button>{showMenu && <div className='project-switcher-menu'>{projects.map((p:any)=><button key={p.id} className='project-switcher-item' onClick={()=>open(p.id)}><strong>{p.name}</strong></button>)}</div>}</div></header>{panel()}<nav className='workspace-dock'><button className={`dock-tab ${workspaceTab==='preview'?'active':''}`} onClick={()=>setWorkspaceTab('preview')}>Preview</button><button className={`dock-tab ${workspaceTab==='builder'?'active':''}`} onClick={()=>setWorkspaceTab('builder')}>Builder</button><button className={`dock-tab ${workspaceTab==='files'?'active':''}`} onClick={()=>setWorkspaceTab('files')}>Files</button><button className={`dock-tab ${workspaceTab==='commits'?'active':''}`} onClick={()=>setWorkspaceTab('commits')}>Commits</button><button className='dock-plugin-launcher'><Plus size={18}/></button></nav></main></div>;
return <div className='app'><main className='create-screen'><section className='create-hero'><div className='workspace-pill'><span className='live-dot'/>Vivus local workspace</div><h1>What do you want to build?</h1><p className='hero-subtitle'>Create anything. Vivus is your local AI-powered canvas.</p><textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} placeholder='Describe your idea...' /><button className='send-button' onClick={create}><Send size={16}/> Build</button></section></main><nav className='bottom-nav'><button className='bottom-nav-item'><Sparkles size={18}/><strong>Create</strong></button><button className='bottom-nav-item'><LayoutGrid size={18}/><strong>Apps</strong></button><button className='bottom-nav-item'><UserRound size={18}/><strong>Account</strong></button></nav></div>}
