// app/amplify/functions/shared/log.ts
// Structured turn logging. Privacy per SKILL 2.8: emits only reqId / fn / scenario /
// level / latency / labels / fallback — never the user's words or the model reply.
export function logTurn(f: {
  reqId?: string;
  fn: string;
  scenario?: string;
  level?: number;
  latencyMs: number;
  labels: string[];
  fallback: boolean;
}) {
  console.log(JSON.stringify(f));
}
