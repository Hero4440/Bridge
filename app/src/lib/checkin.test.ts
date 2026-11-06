import { describe, it, expect } from 'vitest';
import { checkInSchema, localDate, weekStart, recommendation, hardestOptions, type CheckInValues } from './checkin';
describe('daily check-in recommendations',()=>{
 it('routes all Figma answers to supported practice scenarios and follows the Make hint level',()=>{
  const scenarios=['join','invite','repair','disagree'];
  for(const feeling of ['over','okay','ready'] as const){
   Object.keys(hardestOptions).forEach((hardest,i)=>{
    const rec=recommendation({feeling,upcoming:'none',hardest:hardest as CheckInValues['hardest']});
    expect(rec.scenario).toBe(scenarios[i]);expect(rec.level).toBe(feeling==='ready'?2:1);
   });
  }
 });
 it('keeps the Make recommendation copy and gentle overwhelmed fallback',()=>{
  expect(recommendation({feeling:'okay',upcoming:'text',hardest:'tone'})).toMatchObject({picked:true,title:'Fix it after saying something harsh',line:"Tricky moments get easier with practice. I've got one ready."});
  expect(recommendation({feeling:'over',upcoming:'group',hardest:'leave'}).line).toContain('Just reading a circle counts.');
 });
 it('requires all three valid answers before persistence',()=>{
  expect(checkInSchema.safeParse({feeling:'ready',upcoming:'none'}).success).toBe(false);
  expect(checkInSchema.safeParse({feeling:'ready',upcoming:'none',hardest:'unknown'}).success).toBe(false);
 });
});
describe('local calendar boundaries',()=>{
 it('uses local dates and Monday weeks across a year boundary',()=>{
  expect(localDate(new Date(2027,0,3,23,59))).toBe('2027-01-03');
  expect(weekStart(new Date(2027,0,3,23,59))).toBe('2026-12-28');
  expect(weekStart(new Date(2027,0,4,0,1))).toBe('2027-01-04');
 });
});
