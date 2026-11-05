// Make preview chrome with the current local time; scoped to onboarding.
import { useEffect, useState } from 'react';
export function OnboardingStatusBar() {
 const time = () => new Date().toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'});
 const [clock,setClock] = useState(time);
 useEffect(()=>{const timer=window.setInterval(()=>setClock(time()),30000);return()=>window.clearInterval(timer);},[]);
 return (<div className="status-bar" style={{position: "absolute", top: "0", left: "0", right: "0", height: "44px", zIndex: "200", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", boxSizing: "border-box", background: 'var(--bg)'}}>
<span style={{fontSize: "15px", fontWeight: "600", color: "var(--ink)"}}>{clock}</span>
<div style={{display: "flex", alignItems: "center", gap: "6px"}}>
<svg width="16" height="16" viewBox="0 0 16 16" fill="#1E1B2E" aria-hidden="true"><rect x="0" y="10" width="3" height="3" rx="1"></rect><rect x="4.4" y="8" width="3" height="5" rx="1"></rect><rect x="8.8" y="6" width="3" height="7" rx="1"></rect><rect x="13.2" y="4" width="2.8" height="9" rx="1"></rect></svg>
<svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#1E1B2E" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M1 4.5a10 10 0 0 1 14 0"></path><path d="M3.5 7a6.5 6.5 0 0 1 9 0"></path><path d="M6 9.5a3 3 0 0 1 4 0"></path></svg>
<svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true"><rect x="0.75" y="0.75" width="21" height="10.5" rx="2" stroke="#1E1B2E" strokeWidth="1.5"></rect><rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="#1E1B2E"></rect><rect x="2.5" y="2.5" width="15.75" height="7" rx="1" fill="#1E1B2E"></rect></svg>
</div>
</div>
);
}
