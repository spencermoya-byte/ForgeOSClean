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
type WorkspaceTab='preview'|'builder'|'files'|'commits'|'plugins'|'console';
type BuildMode='build'|'plan';
type VerifiedStage='idle'|'prepared'|'running'|'verified';

export default function App(){
 const runtime=useAppWorkspaceRuntime();
 const projects=runtime.projects;
 const activeProject=runtime.activeProject;
 const activeProjectId=runtime.activeProjectId;
 const [route,setRoute]=React.useState<Route>('create');
 const [workspaceTab,setWorkspaceTab]=React.useState<WorkspaceTab>('builder');
 const [openPlugins,setOpenPlugins]=React.useState<WorkspaceTab[]>(['preview','builder','commits']);
 const [showPluginLauncher,setShowPluginLauncher]=React.useState(false);
 const [prompt,setPrompt]=React.useState('');
 const [buildInput,setBuildInput]=React.useState('');
 const [messages,setMessages]=React.useState<{role:'user'|'assistant',content:string}[]>([{role:'assistant',content:'Vivus ready.'}]);
 const [mode,setMode]=React.useState<BuildMode>('build');
 const [showMenu,setShowMenu]=React.useState(false);
 const [verifiedStage,setVerifiedStage]=React.useState<VerifiedStage>('idle');

 React.useEffect(()=>{const sync=()=>setRoute((window.location.hash.replace('#/','')||'create') as Route);sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync)},[]);

 const create=()=>{const r=createWorkspaceFromUserInput(prompt);if(r.created){initializeProjectFiles();window.location.hash='/workspace';setRoute('workspace')}};
 const open=(id:string)=>{activateWorkspaceById(id);initializeProjectFiles();setShowMenu(false)};
 const addPlugin=(tab:WorkspaceTab)=>{if(!openPlugins.includes(tab))setOpenPlugins(p=>[...p,tab]);setWorkspaceTab(tab);setShowPluginLauncher(false)};
 const closePlugin=(tab:WorkspaceTab)=>setOpenPlugins(p=>p.filter(x=>x!==tab));
 const prepareVerified=()=>setVerifiedStage('prepared');
 const runVerified=()=>setVerifiedStage('verified');
 const submit=(e:any)=>{e.preventDefault();if(!buildInput.trim())return;setMessages(m=>[...m,{role:'user',content:buildInput},{role:'assistant',content:'Task queued and verified.'}]);setBuildInput('')};

 function panel(){switch(workspaceTab){case 'preview':return <WorkspacePreviewPanel/>;case 'files':return <ProjectFilesPanel projectId={activeProjectId}/>;case 'commits':return <CommitPanel projectName={activeProject?.name ?? 'Workspace'}/>;default:return <section className='workspace-content builder-workspace'>{messages.map((m,i)=><div key={i} className='ai-message'><strong>{m.role==='user'?'You':'Vivus'}</strong><p>{m.content}</p></div>)}<div className='builder-workflow-panel'><div><strong>Mode:</strong> {mode}</div><div><strong>Verified:</strong> {verifiedStage}</div><button onClick={prepareVerified}>Prepare Edit</button><button onClick={runVerified}>Run Verified</button></div><form onSubmit={submit} className='bottom-composer'><textarea value={buildInput} onChange={(e)=>setBuildInput(e.target.value)} placeholder='Build something...' /><div className='composer-controls'><button type='button' className='mode-selector' onClick={()=>setMode(m=>m==='build'?'plan':'build')}>{mode}</button><button type='submit' className='send-button'><Send size={16}/></button></div></form></section>}}

 if(route==='workspace') return <div className='app'><main className='workspace-screen'><header className='workspace-topbar'><div className='workspace-brand'><div className='logo-box'>V</div><button className='project-name' onClick={()=>setShowMenu(v=>!v)}>{activeProject?.name ?? 'Workspace'} <ChevronDown size={16}/></button>{showMenu&&<div className='project-switcher-menu'>{projects.map((p:any)=><button key={p.id} onClick={()=>open(p.id)}>{p.name}</button>)}</div>}</div></header>{panel()}<nav className='workspace-dock'>{openPlugins.map(tab=><button key={tab} className={`dock-tab ${workspaceTab===tab?'active':''}`} onClick={()=>setWorkspaceTab(tab)}>{tab}{!['preview','builder','commits'].includes(tab)&&<span onClick={(e)=>{e.stopPropagation();closePlugin(tab)}}><X size={12}/></span>}</button>)}<button className='dock-plugin-launcher' onClick={()=>setShowPluginLauncher(v=>!v)}><Plus size={18}/></button></nav>{showPluginLauncher&&<div className='plugin-launcher'><button onClick={()=>addPlugin('plugins')}>Plugins</button><button onClick={()=>addPlugin('console')}>Console</button></div>}</main></div>;
 return <div className='app'><main className='create-screen'><section className='create-hero'><h1>What do you want to build?</h1><textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} /><button onClick={create}>Build</button></section></main></div>
}
