// Unit tests for scripted fallbacks, the rate-limit fail-open, and privacy-safe logging.
import { describe, it, expect, vi } from 'vitest';
import { FALLBACKS } from '../fallback';
import { checkRateLimit } from '../rateLimit';
import { logTurn } from '../log';

describe('FALLBACKS', () => {
  it('practice fallback has warm, non-empty copy', () => {
    expect(FALLBACKS.practice.partnerReply.length).toBeGreaterThan(0);
    expect(FALLBACKS.practice.strength.length).toBeGreaterThan(0);
    expect(FALLBACKS.practice.tip.length).toBeGreaterThan(0);
  });
  it('classify fallback leans unsafe', () => {
    expect(FALLBACKS.classify).toEqual({ label: 'unsafe', confidence: 0.5 });
  });
});

describe('checkRateLimit', () => {
  it('fails open when no table is wired', async () => {
    delete process.env.RATE_LIMIT_TABLE;
    expect(await checkRateLimit('u1')).toEqual({ allowed: true, count: 0 });
  });
});

describe('logTurn', () => {
  it('emits no user content / message / text field', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logTurn({ fn: 'practice', latencyMs: 12, labels: ['safe'], fallback: false });
    const obj = JSON.parse(spy.mock.calls[0][0] as string);
    expect(Object.keys(obj)).not.toContain('message');
    expect(Object.keys(obj)).not.toContain('text');
    expect(Object.keys(obj)).not.toContain('content');
    spy.mockRestore();
  });
});
