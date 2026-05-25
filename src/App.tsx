import React from "react";
import "./App.css";

export default function App() {
  return (
    <div className="app" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0b1020",color:"#f8fafc",padding:"24px"}}>
      <div style={{maxWidth:"700px",textAlign:"center"}}>
        <h1 style={{fontSize:"32px",marginBottom:"12px"}}>Vivus Recovery Mode</h1>
        <p style={{opacity:0.85,lineHeight:1.6}}>
          App render loop corruption was detected and disabled. The UI shell is being restored.
        </p>
      </div>
    </div>
  );
}
