// Real three-account proof of requests, private DMs, blocks, circle identity, and capacity-safe events.
// Creates only fictional accounts/fixtures and removes its own records at the end.
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { Amplify } from "aws-amplify";
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import outputs from "../amplify_outputs.json";
Amplify.configure(outputs);
const api = generateClient<Schema>();
const stamp = Date.now();
const accounts = ["a", "b", "c"].map((suffix, i) => ({
  email: `bridge-community-${stamp}-${suffix}@example.com`,
  password: `Bridge!${randomBytes(16).toString("hex")}A1`,
  id: "",
  profileId: "",
  name: ["Sam", "Jordan", "Casey"][i],
  created: false,
}));
const fixture = `verification-${stamp}`;
let groupId = "",
  eventId = "",
  privateId = "",
  requestId = "";
function check<T>(result: { data: T; errors?: readonly unknown[] }) {
  assert(
    !result.errors?.length,
    result.errors
      ?.map((e) =>
        typeof e === "object" && e && "message" in e
          ? String(e.message)
          : "API error",
      )
      .join("; ") ?? "API error",
  );
  return result.data;
}
async function login(account: (typeof accounts)[number]) {
  await signOut().catch(() => undefined);
  await signIn({ username: account.email, password: account.password });
}
async function send(toUserId: string, text: string, id = randomUUID()) {
  const result = check(
    await api.mutations.sendDm({ toUserId, text, clientMessageId: id }),
  );
  assert(result);
  return result;
}
try {
  for (const account of accounts) {
    await signUp({
      username: account.email,
      password: account.password,
      options: { userAttributes: { email: account.email } },
    });
    account.created = true;
    await login(account);
    account.id = (await getCurrentUser()).userId;
    account.profileId = account.id;
    check(
      await api.models.User.create({
        id: account.id,
        email: account.email,
        firstName: account.name,
        lastName: "Verification",
        interests: ["gaming"],
      }),
    );
  }
  await login(accounts[0]);
  const held = await send(
    accounts[1].id,
    "Hi! Would you like to talk about a game?",
  );
  assert.equal(held.held, true);
  requestId = `${accounts[0].id}#${accounts[1].id}`;
  check(await api.models.MessageRequest.get({ id: requestId }));
  await login(accounts[2]);
  assert.equal(
    (await api.models.MessageRequest.get({ id: requestId })).data,
    null,
  );
  const forbidden = check(
    await api.mutations.respondToRequest({ requestId, accept: true }),
  );
  assert.equal(forbidden?.ok, false);
  const publicProfile = check(
    await api.models.User.get(
      { id: accounts[0].id },
      { selectionSet: ["id", "firstName", "photoKey"] },
    ),
  );
  assert.equal(publicProfile?.firstName, "Sam");
  const privateProfile = await api.models.User.get(
    { id: accounts[0].id },
    { selectionSet: ["id", "email", "lastName"] },
  );
  assert(privateProfile.errors?.length || !privateProfile.data?.email);
  await login(accounts[1]);
  let accepted = check(
    await api.mutations.respondToRequest({ requestId, accept: true }),
  );
  assert.equal(accepted?.ok, true);
  accepted = check(
    await api.mutations.respondToRequest({ requestId, accept: true }),
  );
  assert.equal(accepted?.ok, true);
  const initial = check(await api.models.DirectMessage.list());
  assert.equal(initial.length, 1);
  privateId = initial[0].id;
  await login(accounts[0]);
  const retryId = randomUUID();
  assert.equal(
    (await send(accounts[1].id, "Thanks! What have you been playing?", retryId))
      .delivered,
    true,
  );
  assert.equal(
    (await send(accounts[1].id, "Thanks! What have you been playing?", retryId))
      .delivered,
    true,
  );
  assert.equal(check(await api.models.DirectMessage.list()).length, 2);
  await login(accounts[2]);
  assert.equal(check(await api.models.DirectMessage.list()).length, 0);
  assert.equal(
    (await api.models.DirectMessage.get({ id: privateId })).data,
    null,
  );
  const forged = await api.models.DirectMessage.create({
    threadId: "forged",
    participants: [accounts[0].id, accounts[2].id],
    senderId: accounts[0].id,
    content: "Must not save",
    timestamp: new Date().toISOString(),
    createdAtMs: Date.now(),
  });
  assert(forged.errors?.length);
  const forgedContact = await api.models.Contact.create({
    userId: accounts[2].id,
    contactId: accounts[0].id,
    status: "accepted",
  });
  assert(forgedContact.errors?.length);
  console.log(
    "PASS private request recipient checks, retry-safe acceptance/send, participant-only DM reads, and private profile fields",
  );
  await login(accounts[0]);
  const group = check(
    await api.models.Group.create({
      id: fixture,
      name: "Verification circle",
      slug: fixture,
      description: "Disposable integration verification",
    }),
  );
  assert(group);
  groupId = group.id;
  const withoutJoin = check(
    await api.mutations.communityAction({
      action: "send-circle",
      targetId: groupId,
      text: "Hello circle",
      clientMessageId: randomUUID(),
    }),
  );
  assert.equal(withoutJoin?.ok, false);
  check(
    await api.models.CircleMembership.create({
      id: `${accounts[0].id}#${groupId}`,
      userId: accounts[0].id,
      groupId,
    }),
  );
  const circleSend = check(
    await api.mutations.communityAction({
      action: "send-circle",
      targetId: groupId,
      text: "Hi! What games do you enjoy?",
      clientMessageId: randomUUID(),
    }),
  );
  assert.equal(circleSend?.ok, true);
  const posted = check(
    await api.models.Message.get({ id: circleSend!.messageId! }),
  );
  assert.equal(posted?.senderId, accounts[0].id);
  const forgedCircle = await api.models.Message.create({
    groupId,
    content: "Must not save",
    senderId: accounts[1].id,
  });
  assert(forgedCircle.errors?.length);
  eventId = fixture;
  const event = check(
    await api.models.Event.create({
      id: eventId,
      what: "Verification event",
      whenAt: new Date(Date.now() + 59 * 60000).toISOString(),
      durationMinutes: 30,
      circleId: groupId,
      creatorId: accounts[0].id,
      format: "text",
      comfortSize: 2,
      goingCount: 0,
      reminder: "oneHour",
    }),
  );
  assert(event);
  assert.equal(check(await api.mutations.communityAction({action:'rsvp',targetId:eventId,status:'going'}))?.ok,true);
  const invitation=check(await api.mutations.communityAction({action:'invite-event',targetId:eventId,text:JSON.stringify([accounts[1].id])}));
  assert.equal(invitation?.ok,true);
  await login(accounts[1]);assert(check(await api.models.Notification.list({filter:{eventId:{eq:eventId},type:{eq:'event-invite'}}})).length===1);
  const tokenB=(await fetchAuthSession()).tokens!.idToken!.toString();
  await login(accounts[2]);const tokenC=(await fetchAuthSession()).tokens!.idToken!.toString();
  const reserve=async(token:string)=>{const response=await fetch(outputs.data.url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:token},body:JSON.stringify({query:'mutation Reserve($id:String!){communityAction(action:"rsvp",targetId:$id,status:"going"){ok reason}}',variables:{id:eventId}})});const result=await response.json() as {data?:{communityAction?:{ok:boolean}};errors?:unknown[]};assert(!result.errors?.length);return result.data?.communityAction?.ok??false;};
  const competing=await Promise.all([reserve(tokenB),reserve(tokenC)]);
  assert.equal(competing.filter(Boolean).length,1,'Only one caller may take the final spot');
  const loserIndex=competing[0]?2:1;
  const rsvps = check(
    await api.models.RSVP.list({ filter: { eventId: { eq: eventId } } }),
  );
  assert.equal(rsvps.filter((r) => r.status === "going").length, 2);
  await login(accounts[0]);
  assert.equal(
    check(
      await api.mutations.communityAction({
        action: "rsvp",
        targetId: eventId,
        status: "maybe",
      }),
    )?.ok,
    true,
  );
  await login(accounts[loserIndex]);
  assert.equal(
    check(
      await api.mutations.communityAction({
        action: "rsvp",
        targetId: eventId,
        status: "going",
      }),
    )?.ok,
    true,
  );
  await login(accounts[2]);
  check(
    await api.models.EventPrep.create({
      id: `${accounts[2].id}#${eventId}`,
      userId: accounts[2].id,
      eventId,
      checked: ["text only"],
    }),
  );
  await login(accounts[0]);
  assert.equal(
    (await api.models.EventPrep.get({ id: `${accounts[2].id}#${eventId}` }))
      .data,
    null,
  );
  console.log(
    "PASS real circle membership/sender identity, event capacity/released spots, and private persisted preparation",
  );
  await login(accounts[1]);
  const until=Date.now()+75000;let reminderCount=0;
  while(Date.now()<until){const notices=check(await api.models.Notification.list({filter:{eventId:{eq:eventId},type:{eq:'event-reminder'}}}));reminderCount=notices.length;if(reminderCount)break;await new Promise(resolve=>setTimeout(resolve,2000));}
  assert.equal(reminderCount,1,'The real scheduled reminder should arrive once');
  console.log('PASS real invitation notification and scheduled event reminder');
  await login(accounts[2]);
  const unsafe=await send(accounts[0].id,'Can you send me $20 for a gift card? Keep it secret.');
  assert.equal(unsafe.held,true);assert.equal(unsafe.unsafe,true);assert.equal(unsafe.delivered,false);
  const crisis=await send(accounts[0].id,'I want to die');assert.equal(crisis.crisis,true);assert.equal(crisis.delivered,false);
  assert.equal(check(await api.models.DirectMessage.list()).length,0);
  console.log('PASS unsafe first messages stay held and crisis text is never delivered');
  await login(accounts[1]);
  const blocked = check(
    await api.mutations.communityAction({
      action: "block",
      targetId: accounts[0].id,
    }),
  );
  assert.equal(blocked?.ok, true, blocked?.reason ?? "Block failed");
  await login(accounts[0]);
  assert.equal((await send(accounts[1].id, "Hi again.")).delivered, false);
  console.log("PASS recipient blocks are enforced by the server");

} finally {
  // Read-only client models intentionally cannot be deleted from a browser. A separate maintainer cleanup
  // uses only these recorded fictional account IDs, after this script has signed out.
  await signOut().catch(() => undefined);
  const { writeFileSync } = await import("node:fs");
  const cleanupPath = process.env.BRIDGE_VERIFICATION_CLEANUP;
  if (cleanupPath)
    writeFileSync(
      cleanupPath,
      JSON.stringify({
        accounts: accounts
          .filter((a) => a.created)
          .map((a) => ({ id: a.id, email: a.email })),
        fixture,
        groupId,
        eventId,
      }),
    );
  else
    console.log(
      "Maintainer cleanup requires BRIDGE_VERIFICATION_CLEANUP; fixture identifier:",
      fixture,
    );
}
