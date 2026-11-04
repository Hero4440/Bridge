// app/amplify/data/resource.ts
// Bridge data schema — all 9 models defined at once (D-07) so the TS2590
// "type instantiation excessively deep" risk surfaces on the first deploy.
// Authorization follows D-08: Reflection/PracticeRun/Notification are owner-only;
// Event/RSVP/Contact/GuardianLink/User are owner + authenticated read; Message is
// authenticated for Phase 1 with a deferred server-side membership check.
// Relationships are kept shallow (only Event<->RSVP) to hold type depth down.
// Field lists follow REQUIREMENTS DATA-01..09 + SKILL §2.2-2.4; reconcile against
// `tech design/index.html` if it specifies additional fields.
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // DATA-01 — profile lives here (D-03), not in Cognito.
  User: a
    .model({
      email: a.string().required(),
      firstName: a.string(),
      lastName: a.string(),
      interests: a.string().array(),
      trustedPersonName: a.string(),
      trustedPersonRelation: a.enum(['Parent', 'Sibling', 'Friend', 'Other']),
      theme: a.enum(['dawn', 'sage', 'mist', 'sand']),
      comfortTextSize: a.string(),
      comfortCalmMode: a.boolean(),
      comfortTextFirst: a.boolean(),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

  // DATA-02
  // TODO(phase-chat): custom-query membership check (D-08) — member visibility is a
  // server-side Lambda, deferred to the chat phase, never a client-side guard.
  Message: a
    .model({
      content: a.string().required(),
      groupId: a.string(),
      senderId: a.string(),
      timestamp: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // DATA-03
  Event: a
    .model({
      what: a.string().required(),
      whenAt: a.datetime(),
      whereText: a.string(),
      format: a.enum(['inPerson', 'online']),
      comfortSound: a.string(),
      comfortLighting: a.string(),
      comfortSize: a.integer(),
      creatorId: a.string(),
      rsvps: a.hasMany('RSVP', 'eventId'),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

  // DATA-04
  RSVP: a
    .model({
      eventId: a.string().required(),
      userId: a.string(),
      status: a.enum(['going', 'maybe', 'cant']),
      timestamp: a.datetime(),
      event: a.belongsTo('Event', 'eventId'),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

  // DATA-05 — SKILL §2.8: NO raw transcript. userResponse text is NOT stored;
  // only scenarioId/level/feedback/hintsUsed are kept.
  PracticeRun: a
    .model({
      scenarioId: a.string(),
      level: a.integer(),
      feedback: a.string(),
      hintsUsed: a.integer(),
    })
    .authorization((allow) => [allow.owner()]),

  // DATA-06
  Reflection: a
    .model({
      eventId: a.string(),
      feeling: a.string(),
      wins: a.string().array(),
      timestamp: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),

  // DATA-07
  Contact: a
    .model({
      userId: a.string(),
      contactId: a.string(),
      status: a.enum(['pending', 'accepted', 'blocked']),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

  // DATA-08
  GuardianLink: a
    .model({
      userId: a.string(),
      guardianId: a.string(),
      status: a.enum(['pending', 'connected', 'declined']),
      permissions: a.string().array(),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

  // DATA-09
  Notification: a
    .model({
      userId: a.string(),
      type: a.string(),
      message: a.string(),
      read: a.boolean(),
      timestamp: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
