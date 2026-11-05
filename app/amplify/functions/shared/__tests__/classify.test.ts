// Unit tests for the safety keyword layer and the single classify() labeler.
// Pure logic: converseWithTool is mocked to the failure path to prove the safer fallback.
import { describe, it, expect, vi } from 'vitest';

vi.mock('../bedrock', () => ({ converseWithTool: vi.fn(async () => ({ ok: false })) }));

import { keywordLabel } from '../keywords';
import { classify } from '../classify';

describe('keywordLabel (deterministic safety net)', () => {
  it('catches crisis before any model', () => {
    expect(keywordLabel('I want to kill myself')).toEqual({ label: 'crisis', confidence: 1 });
  });
  it('catches money requests', () => {
    expect(keywordLabel('send me money on venmo')).toEqual({ label: 'money', confidence: 1 });
  });
  it('catches address requests', () => {
    expect(keywordLabel("what's your address")).toEqual({ label: 'address', confidence: 1 });
  });
  it('passes ordinary text', () => {
    expect(keywordLabel('hey want to join the chat')).toBeNull();
  });
});

describe('classify()', () => {
  it('returns crisis from keywords with no model call', async () => {
    expect(await classify('I want to kill myself')).toEqual({ label: 'crisis', confidence: 1, fallback: false });
  });
  it('leans to the safer unsafe label when the model fails (D-02)', async () => {
    expect(await classify('hey want to join the chat')).toEqual({ label: 'unsafe', confidence: 0.5, fallback: true });
  });
});
