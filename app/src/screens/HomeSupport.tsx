// Functional destinations for the four actions on Home's Mo menu.
import { useEffect, useRef, useState } from 'react';
import { OnboardingMo as Mo } from '../components/OnboardingMo';
import type { SupportTool } from '../components/DashboardNav';
import { getCurrentTrustedContacts } from '../lib/profile';
import { sendHelpAlert } from '../lib/safety';
import { useOnline } from '../lib/useOnline';
import { awardBadgeAfter } from '../lib/badges';
export function HomeSupport({tool,onBack,onTool}:{tool:SupportTool;onBack:()=>void;onTool:(tool:SupportTool)=>void}) {
 const [remaining,setRemaining]=useState(60);
 const [running,setRunning]=useState(false);
 const deadline=useRef(0);
 const [ground,setGround]=useState(-1);
 const [contacts,setContacts]=useState<Awaited<ReturnType<typeof getCurrentTrustedContacts>>>([]);
 const [loading,setLoading]=useState(tool==='help');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [sent,setSent]=useState<string|null>(null);
 const online=useOnline();
 async function loadContacts(retry=false){if(retry){setLoading(true);setError('');}try{setContacts(await getCurrentTrustedContacts());}catch{setError('Your trusted people could not be loaded. Please try again.');}finally{setLoading(false);}}
 useEffect(()=>{if(tool==='help')void loadContacts();},[tool]);
 useEffect(()=>{if(!running)return;const timer=setInterval(()=>{const seconds=Math.max(0,Math.ceil((deadline.current-Date.now())/1000));setRemaining(seconds);if(seconds===0){setRunning(false);awardBadgeAfter('breather');}},250);return()=>clearInterval(timer);},[running]);
 async function notify(){if(busy||!online)return;setBusy(true);setError('');try{const result=await sendHelpAlert();setSent(result.notified>0?`Help notification sent to ${result.notified===1?'your connected trusted person':`${result.notified} connected trusted people`}.`:'No connected trusted person can receive help notifications yet. You can call someone below, or connect a trusted person in Me.');}catch{setError('The help notification could not be sent. Please try again, or call your trusted person.');}finally{setBusy(false);}}
 return <section className="dashboard-panel">
 <button onClick={onBack}>← Back to Home</button><Mo mood={tool==='low'?'worried':'calm'} size={72}/>
 {tool==='reset'?<><h1>Take a breath with me</h1><p>A quick breathing exercise. 60 seconds.</p><div className="breath-orb" style={{animationPlayState:running?'running':'paused'}} role="status">{remaining===0?'Well done':running?((60-remaining)%8<4?'Breathe in':'Breathe out'):'At your own pace'}</div><p aria-live="off">{remaining} seconds</p><button onClick={()=>{if(running)setRunning(false);else{const seconds=remaining===0?60:remaining;setRemaining(seconds);deadline.current=Date.now()+seconds*1000;setRunning(true);}}}>{running?'Pause':remaining===0?'Start again':remaining===60?'Start':'Continue'}</button></>:tool==='low'?<><h1>That’s a big feeling.</h1><p>Let’s slow things down together.</p><button onClick={()=>onTool('reset')}>Take a breath with me</button>{ground<0?<button onClick={()=>setGround(0)}>Ground yourself</button>:ground<5?<div className="dashboard-empty"><p>{['Name 1 thing you can see','Name 1 thing you can hear','Name 1 thing you can touch','Name 1 thing you can smell','Name 1 thing you can taste'][ground]}</p><p>{ground+1} of 5</p><button onClick={()=>setGround(n=>n+1)}>Next →</button></div>:<p role="status">Nice. You took a moment for yourself.</p>}<button onClick={()=>onTool('help')}>I need help</button><button onClick={onBack}>Maybe later</button></>:<><h1>I need help</h1><p>Your connected trusted person can receive an in-app help notification. Nothing is sent until you choose.</p>{loading?<p role="status">Loading your trusted people…</p>:<>{contacts.length===0?<p>No trusted people saved yet. Add someone in Me.</p>:contacts.map(c=><div className="dashboard-empty" key={c.id}><strong>{c.name}</strong><p>{c.relation==='Other'?c.otherRole:c.relation}</p><a href={`tel:${c.phone.replace(/[^+\d]/g,'')}`}>Call {c.name}</a></div>)}<button disabled={!online||busy} onClick={()=>void notify()}>{busy?'Sending…':'Notify my connected trusted person'}</button></>}{sent&&<p role="status">{sent}</p>}</>}
 {!online&&<p role="status">You’re offline. Phone calls and breathing tools are still available.</p>}{error&&<div role="alert"><p>{error}</p>{tool==='help'&&<button disabled={!online||busy} onClick={()=>void loadContacts(true)}>Reload trusted people</button>}</div>}
 </section>;
}
