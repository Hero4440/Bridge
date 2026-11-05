import { it, expect } from 'vitest';
import { activeCounts } from './presence';
it('counts unique people per circle and excludes expired or future heartbeats',()=>{
 const row=(userId:string,groupId:string,lastSeen:number)=>({userId,groupId,lastSeen});
 expect(activeCounts([row('a','gaming',100000),row('a','gaming',100000),row('b','gaming',99999),row('c','music',90000),row('old','gaming',10000),row('future','gaming',111000)],100000)).toEqual({gaming:2,music:1});
 expect(activeCounts([row('a','gaming',100000)],190001)).toEqual({});
});
