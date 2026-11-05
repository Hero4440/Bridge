// Trusted writes for circle chat, blocks, event capacity, and explicit event sharing.
import { defineFunction } from "@aws-amplify/backend";
export const community = defineFunction({
  name: "community",
  entry: "./handler.ts",
  resourceGroupName: "data",
  timeoutSeconds: 29,
  memoryMB: 512,
});
