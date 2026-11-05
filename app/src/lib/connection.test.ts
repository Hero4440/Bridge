// Unit tests for the pure ConnectionState → BannerState mapper (CHAT-03). No network, no mocks.
import { describe, it, expect } from 'vitest';
import { ConnectionState } from 'aws-amplify/api';
import { bannerFor } from './connection';

describe('bannerFor', () => {
  it('Connected → online', () => {
    expect(bannerFor(ConnectionState.Connected)).toBe('online');
  });

  it('Disconnected → offline', () => {
    expect(bannerFor(ConnectionState.Disconnected)).toBe('offline');
  });

  it('every transient/disrupted state → reconnecting', () => {
    const reconnecting = [
      ConnectionState.Connecting,
      ConnectionState.ConnectionDisrupted,
      ConnectionState.ConnectionDisruptedPendingNetwork,
      ConnectionState.ConnectedPendingNetwork,
      ConnectionState.ConnectedPendingDisconnect,
      ConnectionState.ConnectedPendingKeepAlive,
    ];
    for (const state of reconnecting) {
      expect(bannerFor(state)).toBe('reconnecting');
    }
  });
});
