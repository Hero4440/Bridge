// Real event reminders use a scheduled Lambda and idempotent private notifications.
import { defineFunction } from "@aws-amplify/backend";
export const eventReminders = defineFunction({
  name: "eventReminders",
  entry: "./handler.ts",
  resourceGroupName: "data",
  schedule: "every 1m",
  timeoutSeconds: 60,
  memoryMB: 512,
});
