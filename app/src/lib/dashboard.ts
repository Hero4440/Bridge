// Cognito-authorized data only. Check-ins and goals use owner-only model rules.
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { checkInSchema, localDate, weekStart, type CheckInValues } from './checkin';
import { countBadgeSteps, listEarnedBadges } from './badges';
import { currentUser } from './auth';
export { activeCounts } from './presence';
const client = generateClient<Schema>();
export type Goal = Schema['WeeklyGoal']['type'];
export type Circle = Schema['Group']['type'];
export type Notification = Schema['Notification']['type'];
function checked<T>(result: {data:T; errors?: readonly {message:string}[]}) {
  if(result.errors?.length) throw new Error(result.errors.map(e=>e.message).join('; '));
  return result.data;
}
// Amplify list limits apply even to small screens; follow every page.
async function pages<T>(read:(nextToken?:string)=>Promise<{data:T[];nextToken?:string|null;errors?:readonly {message:string}[]}>) {
  const items:T[]=[];let token:string|undefined;
  do {const result=await read(token);items.push(...checked(result));token=result.nextToken??undefined;} while(token);
  return items;
}
export async function getTodayCheckIn(userId:string) {
  const row=checked(await client.models.CheckIn.get({id:`${userId}-${localDate()}`}));
  return row ? checkInSchema.parse(row) : null;
}
export async function saveCheckIn(userId:string, values:CheckInValues) {
  const valid=checkInSchema.parse(values);
  const date=localDate();
  const id=`${userId}-${date}`;
  const existing=checked(await client.models.CheckIn.get({id}));
  const input={id,date,...valid};
  checked(existing ? await client.models.CheckIn.update(input) : await client.models.CheckIn.create(input));
  return valid;
}
export async function listCircles(){return pages(token=>client.models.Group.list({nextToken:token}));}
export async function loadDashboard() {
  const week=weekStart();
  const {userId}=await currentUser();
  const [circles,goals,runs,reflections,rsvps,badges]=await Promise.all([
    pages(token=>client.models.Group.list({nextToken:token})),
    pages(token=>client.models.WeeklyGoal.list({filter:{week:{eq:week}},nextToken:token})),
    pages(token=>client.models.PracticeRun.list({nextToken:token})),
    pages(token=>client.models.Reflection.list({nextToken:token})),
    pages(token=>client.models.RSVP.list({filter:{userId:{eq:userId},status:{eq:'going'}},nextToken:token})),
    listEarnedBadges(),
  ]);
  // Every persisted practice, reflection, Going RSVP, checked intention, or milestone is one step.
  const inWeek=(date:string|null|undefined)=>!!date && localDate(new Date(date))>=week;
  const start=new Date(`${week}T00:00:00`);const end=new Date(start);end.setDate(end.getDate()+7);
  const steps=runs.filter(r=>inWeek(r.createdAt)).length+reflections.filter(r=>inWeek(r.timestamp??r.createdAt)).length+rsvps.filter(r=>inWeek(r.timestamp??r.createdAt)).length+goals.filter(g=>g.done).length+countBadgeSteps(badges,start,end);
  return {circles,goals:goals.sort((a,b)=>a.position-b.position),steps};
}
export async function saveGoal(input:{id:string;text:string;done:boolean;position:number}, create=false) {
  const text=input.text.trim();if(!text || text.length>160) throw new Error('Write a goal with 1–160 characters.');
  const data={id:input.id,text,done:input.done,position:input.position,week:weekStart()};
  const existing=create ? checked(await client.models.WeeklyGoal.get({id:input.id})) : true;
  const row=checked(existing ? await client.models.WeeklyGoal.update(data) : await client.models.WeeklyGoal.create(data));
  if(!row) throw new Error('Your goal could not be saved. Please try again.');
  return row;
}
export async function deleteGoal(id:string) {checked(await client.models.WeeklyGoal.delete({id},{selectionSet:['id']}));}
export function observeNotifications(next:(items:Notification[])=>void, error:(e:unknown)=>void) {
  return client.models.Notification.observeQuery().subscribe({next:result=>next([...result.items].sort((a,b)=>(b.timestamp??b.createdAt).localeCompare(a.timestamp??a.createdAt))),error});
}
export async function readNotification(id:string) {checked(await client.models.Notification.update({id,read:true}));}
export function observePresence(next:(rows:Schema['CirclePresence']['type'][])=>void,error:(e:unknown)=>void) {
  return client.models.CirclePresence.observeQuery().subscribe({next:r=>next([...r.items]),error});
}
export async function heartbeat(userId:string,groupId:string) {
  const id=userId;
  const row=checked(await client.models.CirclePresence.get({id}));
  const input={id,userId,groupId,lastSeen:Date.now(),expiresAt:Math.floor(Date.now()/1000)+120};
  checked(row ? await client.models.CirclePresence.update(input) : await client.models.CirclePresence.create(input));
}
export async function leaveCircle(userId:string) {checked(await client.models.CirclePresence.delete({id:userId},{selectionSet:['id']}));}
