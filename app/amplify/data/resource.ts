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
import { classify } from '../functions/classify/resource';
import { practice } from '../functions/practice/resource';
import { tone } from '../functions/tone/resource';
import { preview } from '../functions/preview/resource';
import { reflectReply } from '../functions/reflectReply/resource';
import { dailyTopic } from '../functions/dailyTopic/resource';
import { sendDm } from '../functions/sendDm/resource';
import { respondToRequest } from '../functions/respondToRequest/resource';
import { sendHelpAlert } from '../functions/sendHelpAlert/resource';

const schema = a.schema({
  // DATA-01 — profile lives here (D-03), not in Cognito.
  User: a
    .model({
      email: a.string().required(),
      firstName: a.string(),
      lastName: a.string(),
      gender: a.string(),
      interests: a.string().array(),
      trustedPersonName: a.string(),
      trustedPersonRelation: a.enum(['Parent', 'Sibling', 'Friend', 'Other']),
      theme: a.enum(['dawn', 'sage', 'mist', 'sand', 'berry', 'honey']),
      comfortTextSize: a.string(),
      comfortCalmMode: a.boolean(),
      comfortTextFirst: a.boolean(),
      comfortMoHelp: a.string(),
      comfortPlainWords: a.boolean(),
      photoKey: a.string(), // S3 key for profile photo (Phase 6 PROFILE-03)
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

  // Trusted contact details are owner-only; phone/email must never ride on the public profile.
  TrustedContact: a
    .model({
      name: a.string().required(),
      phone: a.string().required(),
      email: a.string(),
      relation: a.enum(['Parent', 'Guardian', 'Sibling', 'Coach', 'Friend', 'Other']),
    })
    .authorization((allow) => [allow.owner()]),

  // DATA-02
  // TODO(phase-5): member-only / DM-participant visibility check (D-08) — a server-side Lambda
  // custom query, DEFERRED TO PHASE 5; never a client-side guard. Open circles (Phase 4 D-01)
  // keep allow.authenticated() so group subscriptions deliver to every circle member.
  Message: a
    .model({
      content: a.string().required(),
      groupId: a.string().required(),
      senderId: a.string(),
      createdAtMs: a.float(), // epoch ms sort value for the GSI (Int would overflow 32-bit; Float holds ms)
      timestamp: a.datetime(),
    })
    .secondaryIndexes((index) => [index('groupId').sortKeys(['createdAtMs']).queryField('messagesByGroup')])
    .authorization((allow) => [allow.authenticated()]),

  // DATA-03 — reconciled with the 3-step create wizard (D-01, D-02, D-05)
  Event: a
    .model({
      what: a.string().required(),
      whenAt: a.datetime(),
      durationMinutes: a.integer(),
      whereText: a.string(),
      venue: a.string(), // D-01: host free-text venue, no maps
      usuallyQuiet: a.boolean(), // D-01: host-declared quiet venue
      format: a.enum(['inPerson', 'voice', 'video', 'text']),
      comfortSound: a.string(),
      comfortLighting: a.string(),
      comfortSize: a.integer(), // group size / capacity
      reminder: a.enum(['oneHour', 'oneDay', 'both']),
      tellTrustedPerson: a.boolean(),
      exitPlan: a.string(), // D-02: host "what to expect" break/exit field (not AI)
      circleId: a.string(), // D-05: optional; events are standalone, circle scoping is Phase 4
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
      userId: a.string(), // owner key the practice Lambda sets explicitly (trusted write)
    })
    .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub')]),
    // NOTE: PracticeRun persistence (practice Lambda → Data client) is deferred to Phase 3
    // (Events & Persistence). Phase 2's practice() returns strength+tip without a DB write.

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
  // Contact rows are created by the respondToRequest Lambda (accept), which sets userId; bind the
  // owner to that field (like PracticeRun in Phase 3) so the owning user can block/update their row.
  Contact: a
    .model({
      userId: a.string(),
      contactId: a.string(),
      status: a.enum(['pending', 'accepted', 'blocked']),
    })
    .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub'), allow.authenticated().to(['read'])]),

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
  // Notifications are created both by the owner and by the sendHelpAlert Lambda (which sets userId
  // to the guardian). Bind the owner to userId so a Lambda-written alert is readable by its recipient.
  Notification: a
    .model({
      userId: a.string(),
      type: a.string(),
      message: a.string(),
      read: a.boolean(),
      timestamp: a.datetime(),
    })
    .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub')]),

  // --- Phase 4: circles as real data + cached daily topic ---
  // Group: the 6 circles (Gaming/Music/Anime/Cooking/Art/Tech) as real DynamoDB rows, not a
  // constant array (§1.3). Seeded idempotently by scripts/seed/circles.ts; read by all users.
  Group: a
    .model({
      name: a.string().required(),
      slug: a.string(),
      description: a.string(),
      emoji: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // Topic: the cached daily topic. Composite id ['groupId','date'] makes get() a point read and
  // create race-safe, so the dailyTopic Lambda calls Bedrock at most once per circle per day (D-03).
  Topic: a
    .model({
      groupId: a.string().required(),
      date: a.string().required(), // YYYY-MM-DD (UTC)
      text: a.string().required(),
      fallback: a.boolean(),
    })
    .identifier(['groupId', 'date'])
    .authorization((allow) => [allow.authenticated()]),

  // --- Phase 5: direct messages + safety ---
  // MessageRequest: a first message from a NON-contact, held for accept/decline (DM-02 / SAFE-01).
  // Writes happen only via the Plan 02 sendDm/respondToRequest Lambdas, which set `unsafe` from
  // classify(); authenticated read lets both parties see it. DMs themselves reuse Message (groupId=dm#...).
  MessageRequest: a
    .model({
      fromUserId: a.string().required(),
      toUserId: a.string().required(),
      firstMessage: a.string().required(),
      status: a.enum(['pending', 'accepted', 'declined']),
      unsafe: a.boolean(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // Report: an abuse report the team reviews (SAFE-04). No moderator role — the UI only promises review.
  Report: a
    .model({
      reporterId: a.string(),
      targetType: a.enum(['message', 'user']),
      targetId: a.string(),
      reason: a.string(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

  // --- Phase 2: AI reply types + Cognito-authorized custom queries (handlers in functions/) ---
  PracticeReply: a.customType({
    partnerReply: a.string(),
    strength: a.string(),
    tip: a.string(),
    fallback: a.boolean(),
    crisis: a.boolean(),
  }),
  ClassifyReply: a.customType({ label: a.string(), confidence: a.float(), fallback: a.boolean() }),
  ToneReply: a.customType({ gentle: a.string(), flaggedWords: a.string().array(), fallback: a.boolean() }),
  PreviewReply: a.customType({ suggestions: a.string().array(), fallback: a.boolean() }),

  practiceTurn: a
    .query()
    .arguments({ scenarioId: a.string().required(), level: a.integer().required(), goal: a.string().required(), message: a.string().required() })
    .returns(a.ref('PracticeReply'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(practice)),
  classifyText: a
    .query()
    .arguments({ text: a.string().required() })
    .returns(a.ref('ClassifyReply'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(classify)),
  toneCheck: a
    .query()
    .arguments({ text: a.string().required() })
    .returns(a.ref('ToneReply'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(tone)),
  previewReplies: a
    .query()
    .arguments({ context: a.string().required() })
    .returns(a.ref('PreviewReply'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(preview)),

  // Phase 3 (D-03): warm Mo reflection reply
  ReflectReply: a.customType({ reply: a.string(), fallback: a.boolean() }),
  reflectReply: a
    .query()
    .arguments({ feeling: a.string().required(), wins: a.string().array() })
    .returns(a.ref('ReflectReply'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(reflectReply)),

  // Phase 4 (CHAT-05 / D-03): AI-generated, cached daily circle topic.
  DailyTopicReply: a.customType({ text: a.string(), fallback: a.boolean() }),
  getDailyTopic: a
    .query()
    .arguments({ groupId: a.string().required(), groupName: a.string() })
    .returns(a.ref('DailyTopicReply'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(dailyTopic)),

  // Phase 5: safety + DM custom mutations (server-side enforcement, SKILL §1.4).
  SendDmReply: a.customType({ delivered: a.boolean(), held: a.boolean(), unsafe: a.boolean(), crisis: a.boolean() }),
  sendDm: a
    .mutation()
    .arguments({ toUserId: a.string().required(), text: a.string().required() })
    .returns(a.ref('SendDmReply'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(sendDm)),
  RespondReply: a.customType({ ok: a.boolean(), accepted: a.boolean(), reason: a.string() }),
  respondToRequest: a
    .mutation()
    .arguments({ requestId: a.string().required(), accept: a.boolean().required() })
    .returns(a.ref('RespondReply'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(respondToRequest)),
  HelpReply: a.customType({ notified: a.integer() }),
  sendHelpAlert: a
    .mutation()
    .arguments({ note: a.string() })
    .returns(a.ref('HelpReply'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(sendHelpAlert)),
})
  // Phase 3 (D-04): grant the practice Lambda Data-client access to persist PracticeRun.
  // Phase 4 (D-03): grant the dailyTopic Lambda access to read/write the Topic cache.
  // Phase 5: grant the DM/safety Lambdas Data access (hold/deliver, accept→Contact, help→Notification).
  .authorization((allow) => [
    allow.resource(practice),
    allow.resource(dailyTopic),
    allow.resource(sendDm),
    allow.resource(respondToRequest),
    allow.resource(sendHelpAlert),
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
