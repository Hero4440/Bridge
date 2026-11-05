// Counts only recent real circle heartbeats, deduplicated by person.
export function activeCounts(rows: {userId:string;groupId:string;lastSeen:number}[],now=Date.now()) {
  const users=new Map<string,Set<string>>();
  for(const row of rows) if(row.lastSeen>now-90000 && row.lastSeen<=now+10000) {
    if(!users.has(row.groupId)) users.set(row.groupId,new Set());
    users.get(row.groupId)!.add(row.userId);
  }
  return Object.fromEntries([...users].map(([id,set])=>[id,set.size]));
}
