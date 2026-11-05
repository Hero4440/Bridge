import { useEffect, useRef, useState } from 'react';
import { OnboardingMo as Mo } from '../components/OnboardingMo';
import { feelingLabels, upcomingLabels, hardestLabels, checkInSchema, type CheckInValues } from '../lib/checkin';
import { useOnline } from '../lib/useOnline';
import './Dashboard.css';

export function CheckIn({firstName,onSave,initial}:{firstName:string;onSave:(values:CheckInValues)=>Promise<void>;initial?:CheckInValues}) {
 const [step,setStep]=useState(0);
 const [values,setValues]=useState<Partial<CheckInValues>>(initial??{});
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const lock=useRef(false);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const heading=useRef<HTMLHeadingElement>(null);
 const online=useOnline();
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{heading.current?.focus({preventScroll:true});heading.current?.closest('.main-scroll')?.scrollTo(0,0);},[step]);
 const key=(['feeling','upcoming','hardest'] as const)[step];
 const options=[feelingLabels,upcomingLabels,hardestLabels][step];
 async function finish(next:Partial<CheckInValues>) {
  try {await onSave(checkInSchema.parse(next));}
  catch(e) {setError(e instanceof Error?e.message:'Your check-in could not be saved. Please try again.');lock.current=false;setBusy(false);}
 }
 function pick(value:string) {
  if(lock.current||!online)return;
  lock.current=true;setBusy(true);setError('');const next={...values,[key]:value};setValues(next);
  timer.current=setTimeout(()=>{if(step<2){setStep(step+1);lock.current=false;setBusy(false);}else void finish(next);},400);
 }
 return <div className="daily-checkin" aria-busy={busy}>
  <div className="checkin-progress">
   {step>0?<button className="checkin-back" disabled={busy} onClick={()=>{setStep(step-1);setError('');}} aria-label="Previous question"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button>:<span/>}
   <div className="checkin-dots" role="img" aria-label={`Question ${step+1} of 3`}>{[0,1,2].map(i=><span key={i} style={{background:i===step?'var(--accent)':'color-mix(in srgb, var(--accent) 30%, #FFFFFF)'}}/>)}</div>
  </div>
  <div key={step} className="checkin-question">
   <Mo mood="happy" size={60}/>
   <h1 ref={heading} tabIndex={-1}>{[`Hi ${firstName || 'there'}! How are you feeling?`,'Anything coming up?','What feels hardest lately?'][step]}</h1>
   <div className="checkin-options">{Object.entries(options).map(([value,label])=><button key={value} disabled={busy||!online} aria-pressed={values[key]===value} onClick={()=>pick(value)}>{label}</button>)}</div>
   {!online&&<p role="status">You’re offline. Reconnect to save your check-in.</p>}
   {busy&&step===2&&<span className="visually-hidden" role="status">Saving your check-in…</span>}
   {error&&<div role="alert" className="dashboard-error"><p>{error}</p><button disabled={!online||busy} onClick={()=>{lock.current=true;setBusy(true);setError('');void finish(values);}}>Try again</button></div>}
  </div>
 </div>;
}
