import React from "react";
import "./App.css";
import "./BuilderLifecycle.css";
import "./BuilderWorkflow.css";
import "./VerifiedEditPanel.css";
import { CommitPanel } from "./CommitPanel";
import { ProjectFilesPanel, initializeProjectFiles } from "./ProjectFilesPanel";
import { runBuilderExecutionPreview } from "./builderExecution";
import { VerifiedEditPanel } from "./VerifiedEditPanel";
import { WorkspacePreviewPanel } from "./WorkspacePreviewPanel";
import { useAppWorkspaceRuntime } from "./AppWorkspaceRuntime";
import { createWorkspaceFromUserInput } from "./workspaceCreateRuntime";
import { activateWorkspaceById } from "./workspaceSwitcherController";
import { ChevronDown, Code2, LayoutGrid, Plus, Send, Sparkles, UserRound, X } from "lucide-react";

type Route='create'|'apps'|'account'|'workspace';
type WorkspaceTab='preview'|'builder'|'files'|'commits';
type BuildMode='build'|'plan';

export default function App(){
 const runtime=useAppWorkspaceRuntime();
 const projects=runtime.projects;
 const activeProject=runtime.activeProject;
 const activeProjectId=runtime.activeProjectId;
 const [route,setRoute]=React.useState<Route>('create');
 const [workspaceTab,setWorkspaceTab]=React.useState<WorkspaceTab>('builder');
 const [prompt,setPrompt]=React.useState('');
 const [buildInput,setBuildInput]=React.useState('');
 const [messages,setMessages]=React.useState<{role:'user'|'assistant',content:string}[]>([]);
 const [mode,setMode]=React.useState<BuildMode>('build');
 const [showMenu,setShowMenu]=React.useState(false);

 React.useEffect(()=>{const sync=()=>setRoute((window.location.hash.replace('#/','')||'create') as Route);sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync)},[]);

 const create=()=>{const r=createWorkspaceFromUserInput(prompt);if(r.created){initializeProjectFiles();window.location.hash='/workspace';setRoute('workspace');setMessages([{role:'assistant',content:'Workspace created. What should we build first?'}])}};
 const open=(id:string)=>{activateWorkspaceById(id);initializeProjectFiles();setShowMenu(false);window.location.hash='/workspace';setRoute('workspace')};

 const submit=(e:any)=>{e.preventDefault();if(!buildInput.trim())return;const text=buildInput.trim();setMessages(m=>[...m,{role:'user',content:text},{role:'assistant',content:mode==='plan'?'I generated a build plan.':'Added to build context.'}]);setBuildInput('')};

 function workspacePanel(){
   switch(workspaceTab){
     case 'preview': return <WorkspacePreviewPanel/>;
     case 'files': return <ProjectFilesPanel projectId={activeProjectId}/>;
     case 'commits': return <CommitPanel projectName={activeProject?.name ?? 'Workspace'}/>;
     default:
       return <section className='workspace-content builder-workspace'><div className='ai-conversation'><div className='ai-message assistant-message'><strong>Vivus</strong><p>{activeProject ? `${activeProject.name} is loaded. What should we build first?` : 'What would you like to build today?'}</p></div>{messages.map((m,i)=><div key={i} className={`ai-message ${m.role==='user'?'user-message':'assistant-message'}`}><strong>{m.role==='user'?'You':'Vivus'}</strong><p>{m.content}</p></div>)}<form onSubmit={submit} className='ai-builder-input-form bottom-composer'><textarea value={buildInput} onChange={(e)=>setBuildInput(e.target.value)} placeholder={mode==='plan'?'Describe requirements and goals...':'Make, test, iterate...'} /><button type='button' className='ai-builder-plus'><Plus size={18}/></button><div className='composer-controls'><button type='button' className='mode-selector' onClick={()=>setMode(m=>m==='build'?'plan':'build')}><span>{mode==='build'?'Build':'Plan'}</span><ChevronDown size={12}/></button><button type='submit' className='send-button'><Send size={16}/></button></div></form></div></section>;
   }
 }

 if(route==='workspace') return <div className='app'><main className='workspace-screen'><header className='workspace-topbar'><div className='workspace-brand project-switcher-wrap'><div className='logo-box'>V</div><button className='project-name' onClick={()=>setShowMenu(v=>!v)}>{activeProject?.name ?? 'Workspace'} <ChevronDown size={16}/></button>{showMenu && <div className='project-switcher-menu'><div className='project-switcher-header'>Workspaces</div>{projects.map((p:any)=><button key={p.id} className='project-switcher-item' onClick={()=>open(p.id)}><strong>{p.name}</strong></button>)}</div>}</div></header>{workspacePanel()}<nav className='workspace-dock'><button className={`dock-tab ${workspaceTab==='preview'?'active':''}`} onClick={()=>setWorkspaceTab('preview')}>Preview</button><button className={`dock-tab ${workspaceTab==='builder'?'active':''}`} onClick={()=>setWorkspaceTab('builder')}>Builder</button><button className={`dock-tab ${workspaceTab==='files'?'active':''}`} onClick={()=>setWorkspaceTab('files')}>Files</button><button className={`dock-tab ${workspaceTab==='commits'?'active':''}`} onClick={()=>setWorkspaceTab('commits')}>Commits</button><button className='dock-plugin-launcher'><Plus size={18}/></button></nav></main></div>;

 return <div className='app'><main className='create-screen'><section className='create-hero'><div className='workspace-pill'><span className='live-dot'/>Vivus local workspace</div><h1>What do you want to build?</h1><p className='hero-subtitle'>Create anything. Vivus is your local AI-powered canvas.</p><textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} placeholder='Describe your idea or paste a local project path...' /><button className='send-button' onClick={create}><Send size={16}/> Build</button></section></main><nav className='bottom-nav'><button className='bottom-nav-item'><Sparkles size={18}/><strong>Create</strong></button><button className='bottom-nav-item'><LayoutGrid size={18}/><strong>Apps</strong></button><button className='bottom-nav-item'><UserRound size={18}/><strong>Account</strong></button></nav></div>
}
