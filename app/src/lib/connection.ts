// app/src/lib/connection.ts
// Maps the AppSync subscription ConnectionState to a calm banner state (CHAT-03). This is the
// documented, non-polling way to drive the "Reconnecting…" UI: observeQuery manages reconnection,
// and Hub emits ConnectionStateChange events we translate here. `bannerFor` is pure (unit-tested);
// the banner component itself is Phase 6 polish.
import { Hub } from 'aws-amplify/utils';
import { ConnectionState } from 'aws-amplify/api';

export type BannerState = 'online' | 'reconnecting' | 'offline';

export function bannerFor(state: ConnectionState): BannerState {
  switch (state) {
    case ConnectionState.Connected:
      return 'online';
    case ConnectionState.Disconnected:
      return 'offline';
    // Everything else is a transient in-between state → show a calm "Reconnecting…":
    // Connecting, ConnectionDisrupted, ConnectionDisruptedPendingNetwork,
    // ConnectedPendingNetwork, ConnectedPendingDisconnect, ConnectedPendingKeepAlive.
    default:
      return 'reconnecting';
  }
}

// Subscribe to connection changes; returns an unlisten function.
export function onConnectionChange(cb: (state: BannerState) => void): () => void {
  return Hub.listen('api', (data) => {
    const { payload } = data;
    if (payload.event === 'ConnectionStateChange') {
      const state = (payload.data as { connectionState: ConnectionState }).connectionState;
      cb(bannerFor(state));
    }
  });
}
