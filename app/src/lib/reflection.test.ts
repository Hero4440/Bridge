// Unit tests for the reflection reply fallback (pure; DynamoDB write is exercised live in Plan 05).
import { describe, it, expect } from 'vitest';
import { REFLECTION_FALLBACK, resolveReply } from './reflection';

describe('REFLECTION_FALLBACK', () => {
  it('is a non-empty, warm constant', () => {
    expect(REFLECTION_FALLBACK.length).toBeGreaterThan(0);
  });
});

describe('resolveReply', () => {
  it('falls back when there is no reply source', async () => {
    expect(await resolveReply({ feeling: 'okay', wins: [] })).toEqual({ reply: REFLECTION_FALLBACK, fallback: true });
  });
  it('falls back when the reply source throws', async () => {
    const r = await resolveReply({ feeling: 'good', wins: ['said hi'] }, async () => {
      throw new Error('bedrock throttled');
    });
    expect(r.fallback).toBe(true);
    expect(r.reply).toBe(REFLECTION_FALLBACK);
  });
  it('uses the real reply when available', async () => {
    const r = await resolveReply({ feeling: 'good', wins: [] }, async () => 'Nice work today!');
    expect(r).toEqual({ reply: 'Nice work today!', fallback: false });
  });
});
