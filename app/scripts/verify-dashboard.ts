// Live development-backend verification; uses and removes two fictional accounts.
// Run from app/: npx tsx scripts/verify-dashboard.ts
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { Amplify } from 'aws-amplify';
import { signUp, signIn, signOut, getCurrentUser, deleteUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';
Amplify.configure(outputs);
const api=generateClient<Schema>();
const { saveCheckIn,getTodayCheckIn,saveGoal,loadDashboard,heartbeat,leaveCircle }=await import('../src/lib/dashboard');
const { localDate }=await import('../src/lib/checkin');
const accounts=['a','b'].map(s=>({email:`bridge-dashboard-${Date.now()}-${s}@example.com`,password:`Bridge!${randomBytes(16).toString('hex')}A1`,created:false}));
async function login(account:typeof accounts[number]){await signOut().catch(()=>undefined);await signIn({username:account.email,password:account.password});return (await getCurrentUser()).userId;}
const answers={feeling:'ready',upcoming:'text',hardest:'tone'} as const;
let aId='';const goalId=randomUUID();
try {
 for(const account of accounts){await signUp({username:account.email,password:account.password,options:{userAttributes:{email:account.email}}});account.created=true;}
 aId=await login(accounts[0]);
 assert.equal(await getTodayCheckIn(aId),null);
 await saveCheckIn(aId,answers);await saveCheckIn(aId,answers);
 assert.deepEqual(await getTodayCheckIn(aId),answers);
 assert.equal((await api.models.CheckIn.list()).data.length,1);
 console.log('PASS daily check-in persists, retries without duplicates, and restores all three answers');
 const goal=await saveGoal({id:goalId,text:'Ask one conversation question',done:false,position:0},true);
 await saveGoal({...goal,done:true});
 const loaded=await loadDashboard();assert.equal(loaded.goals.length,1);assert.equal(loaded.goals[0].done,true);assert.equal(loaded.steps,1);
 await saveGoal({...goal,text:'Try one new opener',done:true});
 await login(accounts[0]);assert.equal((await loadDashboard()).goals[0].text,'Try one new opener');
 await heartbeat(aId,'dashboard-verification');
 console.log('PASS weekly plan creates, edits, completes, counts a step, and survives a fresh session');
 await login(accounts[1]);
 assert.equal((await loadDashboard()).goals.length,0);
 assert.equal((await api.models.CheckIn.list()).data.length,0);
 const privateRead=await api.models.CheckIn.get({id:`${aId}-${localDate()}`});assert.equal(privateRead.data,null);
 assert.equal((await api.models.WeeklyGoal.get({id:goalId})).data,null);
 const write=await api.models.WeeklyGoal.update({id:goalId,text:'Must not save'});assert(write.errors?.length);
 const checkWrite=await api.models.CheckIn.update({id:`${aId}-${localDate()}`,feeling:'over'});assert(checkWrite.errors?.length);
 const presence=await api.models.CirclePresence.get({id:aId});assert.equal(presence.data?.groupId,'dashboard-verification');assert((presence.data?.expiresAt??0)>Math.floor(Date.now()/1000));
 const presenceWrite=await api.models.CirclePresence.update({id:aId,lastSeen:Date.now()});assert(presenceWrite.errors?.length);
 console.log('PASS second account cannot read or modify private check-ins/goals, and can only read another person’s circle heartbeat');
 await login(accounts[0]);assert.deepEqual(await getTodayCheckIn(aId),answers);await leaveCircle(aId);
} finally {
 for(const account of accounts.filter(a=>a.created)) {
  try {
   const id=await login(account);
   for(const row of (await api.models.CheckIn.list()).data){const result=await api.models.CheckIn.delete({id:row.id},{selectionSet:['id']});assert(!result.errors?.length);}
   for(const row of (await api.models.WeeklyGoal.list()).data){const result=await api.models.WeeklyGoal.delete({id:row.id},{selectionSet:['id']});assert(!result.errors?.length);}
   const presence=await api.models.CirclePresence.get({id});if(presence.data)await leaveCircle(id);
   await deleteUser();
  } catch(e){console.error('Disposable account cleanup failed:',e instanceof Error?e.message:'Unknown error');process.exitCode=1;}
 }
 await signOut().catch(()=>undefined);
 console.log('Disposable dashboard test accounts and records cleaned up.');
}
