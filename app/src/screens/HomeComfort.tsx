import { useState, type FormEvent } from 'react';
import { updateUserProfile, type UserRecord } from '../lib/profile';
import { onboardingThemes, onboardingThemeNames, type OnboardingTheme } from '../lib/onboarding';
import { useOnline } from '../lib/useOnline';
export function HomeComfort({profile,onSaved,onBack}:{profile:UserRecord;onSaved:(profile:UserRecord)=>void;onBack:()=>void}) {
 const [theme,setTheme]=useState<OnboardingTheme>(profile.theme&&profile.theme in onboardingThemes?profile.theme as OnboardingTheme:'dawn');
 const [large,setLarge]=useState(profile.comfortTextSize==='large');
 const [calm,setCalm]=useState(!!profile.comfortCalmMode);
 const [textFirst,setTextFirst]=useState(profile.comfortTextFirst!==false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const online=useOnline();
 async function save(e:FormEvent){e.preventDefault();if(busy||!online)return;setBusy(true);setError('');try{const saved=await updateUserProfile({id:profile.id,theme,comfortTextSize:large?'large':'standard',comfortCalmMode:calm,comfortTextFirst:textFirst});onSaved(saved);onBack();}catch{setError('Your comfort settings could not be saved. Please try again.');}finally{setBusy(false);}}
 return <form className="dashboard-panel home-comfort" onSubmit={e=>void save(e)}>
 <button type="button" onClick={onBack} disabled={busy}>← Back to Home</button><h1>Comfort</h1><p>Make Bridge feel right for you.</p>
 <fieldset disabled={busy}><legend>Colors</legend><div className="comfort-theme-grid">{onboardingThemeNames.map(name=><button type="button" key={name} aria-pressed={theme===name} onClick={()=>setTheme(name)}><i style={{background:onboardingThemes[name].accent}}/>{onboardingThemes[name].label}</button>)}</div></fieldset>
 {([{label:'Text size',value:large,set:setLarge,options:['Standard','Large']},{label:'Calm mode',value:calm,set:setCalm,options:['Off','On']},{label:'Text first',value:textFirst,set:setTextFirst,options:['Off','On']}] as const).map(setting=><fieldset key={setting.label} disabled={busy}><legend>{setting.label}</legend><div className="comfort-segments">{setting.options.map((label,i)=><button key={label} type="button" aria-pressed={setting.value===!!i} onClick={()=>setting.set(!!i)}>{label}</button>)}</div></fieldset>)}
 {!online&&<p role="status">You’re offline. Reconnect to save your settings.</p>}{error&&<p role="alert">{error}</p>}
 <button disabled={busy||!online} type="submit">{busy?'Saving…':'Save comfort settings'}</button>
 </form>;
}
