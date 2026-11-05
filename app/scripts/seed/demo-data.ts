// Seeds two made-up Cognito accounts and their real AppSync/DynamoDB demo data.
// Run from app/ after the sandbox is deployed; local credentials come from the gitignored .env.
import assert from 'node:assert/strict';
import { loadEnvFile } from 'node:process';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signIn, signOut, signUp } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient<Schema>();

try {
  loadEnvFile();
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}

const CIRCLES = [
  { slug: 'gaming', name: 'Gaming', emoji: '🎮', description: 'Co-op nights, new releases, and chill backlog chat.' },
  { slug: 'music', name: 'Music', emoji: '🎧', description: 'Share what you are listening to and find concert buddies.' },
  { slug: 'anime', name: 'Anime', emoji: '🌸', description: 'Seasonal watchlists, recommendations, and spoiler-tagged talk.' },
  { slug: 'cooking', name: 'Cooking', emoji: '🍳', description: 'Easy recipes, wins, and low-spoon meal ideas.' },
  { slug: 'art', name: 'Art', emoji: '🎨', description: 'Drawing, crafts, and show-your-work encouragement.' },
  { slug: 'tech', name: 'Tech', emoji: '💻', description: 'Projects, gadgets, and learning out loud.' },
] as const;

const MESSAGES = {
  gaming: ['What game helps you unwind?', 'I have been building a cozy Minecraft village.'],
  music: ['What song is on repeat for you?', 'I made a calm study playlist this week.'],
  anime: ['What are you watching this season?', 'I liked the new episode, but I hate spoilers.', 'Want to plan a quiet watch party?'],
  cooking: ['What is your easiest weeknight recipe?', 'Sheet-pan meals are my current favorite.'],
  art: ['What are you making this week?', 'I am practicing watercolor clouds.'],
  tech: ['What app has made your day easier?', 'I am learning how real-time chat works.'],
} as const;

const TOPICS = {
  gaming: 'What game would you recommend to someone new?',
  music: 'What song matches your mood today?',
  anime: 'Which character would make a good friend?',
  cooking: 'What meal feels comforting and easy?',
  art: 'What color have you enjoyed using lately?',
  tech: 'What technology would you like to learn?',
} as const;

const EVENT_IDS = ['demo-gaming-night', 'demo-anime-watch-party', 'demo-cooking-class', 'demo-tech-talk', 'demo-music-jam'] as const;

type DemoAccount = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  interests: string[];
  theme: 'dawn' | 'sage';
  trustedPersonName: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env and fill the demo-only value.`);
  return value;
}

function accounts(): DemoAccount[] {
  return [
    {
      email: requiredEnv('BRIDGE_DEMO_SAM_EMAIL'),
      password: requiredEnv('BRIDGE_DEMO_SAM_PASSWORD'),
      firstName: 'Sam',
      lastName: 'Carter',
      interests: ['gaming', 'music', 'tech'],
      theme: 'dawn',
      trustedPersonName: 'Taylor',
    },
    {
      email: requiredEnv('BRIDGE_DEMO_JORDAN_EMAIL'),
      password: requiredEnv('BRIDGE_DEMO_JORDAN_PASSWORD'),
      firstName: 'Jordan',
      lastName: 'Lee',
      interests: ['anime', 'cooking', 'art'],
      theme: 'sage',
      trustedPersonName: 'Casey',
    },
  ];
}

function validateSeedSpec(): void {
  assert.equal(CIRCLES.length, 6);
  assert.equal(Object.values(MESSAGES).flat().length, 13);
  assert.equal(Object.keys(TOPICS).length, CIRCLES.length);
  assert.equal(new Set(CIRCLES.map(({ slug }) => slug)).size, CIRCLES.length);
}

async function authenticate(account: DemoAccount): Promise<string> {
  await signOut().catch(() => undefined);
  try {
    await signUp({
      username: account.email,
      password: account.password,
      options: { userAttributes: { email: account.email } },
    });
    console.log(`Created Cognito account for ${account.firstName}.`);
  } catch (error) {
    if ((error as { name?: string }).name !== 'UsernameExistsException') throw error;
    console.log(`Cognito account for ${account.firstName} already exists.`);
  }
  await signIn({ username: account.email, password: account.password });
  return (await getCurrentUser()).userId;
}

async function upsertProfile(account: DemoAccount): Promise<void> {
  const { data: profiles, errors } = await client.models.User.list({});
  if (errors?.length) throw new Error(`List User failed: ${JSON.stringify(errors)}`);
  const input = {
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
    interests: account.interests,
    trustedPersonName: account.trustedPersonName,
    trustedPersonRelation: 'Friend' as const,
    theme: account.theme,
    comfortTextSize: 'default',
    comfortCalmMode: false,
    comfortTextFirst: true,
  };
  const profile = profiles.find(({ email }) => email === account.email);
  const result = profile
    ? await client.models.User.update({ id: profile.id, ...input })
    : await client.models.User.create(input);
  if (result.errors?.length) throw new Error(`Save User failed: ${JSON.stringify(result.errors)}`);
  console.log(`Saved profile for ${account.firstName}.`);
}

function futureDate(days: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

async function seedSharedData(samId: string): Promise<void> {
  for (const circle of CIRCLES) {
    const { data: found, errors } = await client.models.Group.list({ filter: { slug: { eq: circle.slug } } });
    if (errors?.length) throw new Error(`List Group(${circle.slug}) failed: ${JSON.stringify(errors)}`);
    if (!found.length) {
      const created = await client.models.Group.create(circle);
      if (created.errors?.length) throw new Error(`Create Group(${circle.slug}) failed: ${JSON.stringify(created.errors)}`);
    }
  }
  console.log('Saved 6 circles.');

  const events = [
    { id: 'demo-gaming-night', what: 'Gaming Night', whenAt: futureDate(0, 19), durationMinutes: 90, whereText: 'Online', format: 'voice' as const, comfortSound: 'Headphones welcome', comfortLighting: 'Your choice', comfortSize: 8, reminder: 'oneHour' as const, tellTrustedPerson: false, exitPlan: 'Leave the voice channel whenever you need a break.', circleId: 'gaming', creatorId: samId },
    { id: 'demo-anime-watch-party', what: 'Anime Watch Party', whenAt: futureDate(1, 18), durationMinutes: 120, whereText: 'Tempe Community Room', venue: 'Tempe Community Room', usuallyQuiet: true, format: 'inPerson' as const, comfortSound: 'Quiet', comfortLighting: 'Dim', comfortSize: 10, reminder: 'both' as const, tellTrustedPerson: true, exitPlan: 'The lobby is available for quiet breaks.', circleId: 'anime', creatorId: samId },
    { id: 'demo-cooking-class', what: 'Cooking Class', whenAt: futureDate(3, 16), durationMinutes: 90, whereText: 'Community Kitchen', venue: 'Community Kitchen', usuallyQuiet: false, format: 'inPerson' as const, comfortSound: 'Conversation and kitchen sounds', comfortLighting: 'Bright', comfortSize: 6, reminder: 'oneDay' as const, tellTrustedPerson: true, exitPlan: 'Step into the hallway or watch instead of cooking.', circleId: 'cooking', creatorId: samId },
    { id: 'demo-tech-talk', what: 'Tech Talk', whenAt: futureDate(7, 18), durationMinutes: 60, whereText: 'Online', format: 'video' as const, comfortSound: 'Speaker audio', comfortLighting: 'Your choice', comfortSize: 20, reminder: 'oneDay' as const, tellTrustedPerson: false, exitPlan: 'Camera and microphone are optional.', circleId: 'tech', creatorId: samId },
    { id: 'demo-music-jam', what: 'Music Jam Session', whenAt: futureDate(8, 17), durationMinutes: 75, whereText: 'Arts Room', venue: 'Arts Room', usuallyQuiet: false, format: 'inPerson' as const, comfortSound: 'Live music', comfortLighting: 'Soft', comfortSize: 12, reminder: 'both' as const, tellTrustedPerson: true, exitPlan: 'A quiet room is next door.', circleId: 'music', creatorId: samId },
  ];
  for (const event of events) {
    const existing = await client.models.Event.get({ id: event.id });
    if (existing.errors?.length) throw new Error(`Get Event(${event.id}) failed: ${JSON.stringify(existing.errors)}`);
    const saved = existing.data
      ? await client.models.Event.update(event)
      : await client.models.Event.create(event);
    if (saved.errors?.length) throw new Error(`Save Event(${event.id}) failed: ${JSON.stringify(saved.errors)}`);
  }
  console.log('Saved 5 upcoming events.');

  const date = new Date().toISOString().slice(0, 10);
  for (const circle of CIRCLES) {
    const existing = await client.models.Topic.get({ groupId: circle.slug, date });
    if (existing.errors?.length) throw new Error(`Get Topic(${circle.slug}) failed: ${JSON.stringify(existing.errors)}`);
    if (!existing.data) {
      const created = await client.models.Topic.create({ groupId: circle.slug, date, text: TOPICS[circle.slug], fallback: false });
      if (created.errors?.length) throw new Error(`Create Topic(${circle.slug}) failed: ${JSON.stringify(created.errors)}`);
    }
  }
  console.log('Saved today\'s 6 circle topics.');
}

async function seedMessages(senderId: string, authorIndex: number): Promise<void> {
  let offset = authorIndex;
  for (const circle of CIRCLES) {
    const messages = MESSAGES[circle.slug];
    for (let index = authorIndex; index < messages.length; index += 2) {
      const id = `demo-${circle.slug}-${index}`;
      const existing = await client.models.Message.get({ id });
      if (existing.errors?.length) throw new Error(`Get Message(${id}) failed: ${JSON.stringify(existing.errors)}`);
      if (!existing.data) {
        const timestamp = new Date(Date.now() - (60 - offset) * 60_000);
        const created = await client.models.Message.create({ id, content: messages[index], groupId: circle.slug, senderId, createdAtMs: timestamp.getTime(), timestamp: timestamp.toISOString() });
        if (created.errors?.length) throw new Error(`Create Message(${id}) failed: ${JSON.stringify(created.errors)}`);
      }
      offset += 1;
    }
  }
}

async function verifySeed(demoAccounts: DemoAccount[]): Promise<void> {
  for (const account of demoAccounts) {
    const profiles = await client.models.User.list({ filter: { email: { eq: account.email } } });
    if (profiles.errors?.length) throw new Error(`Verify User failed: ${JSON.stringify(profiles.errors)}`);
    assert.equal(profiles.data.length, 1, `Expected one profile for ${account.firstName}`);
  }
  for (const id of EVENT_IDS) assert.ok((await client.models.Event.get({ id })).data, `Missing event ${id}`);
  for (const circle of CIRCLES) {
    const groups = await client.models.Group.list({ filter: { slug: { eq: circle.slug } } });
    assert.ok(groups.data.length >= 1, `Missing circle ${circle.slug}`);
    for (let index = 0; index < MESSAGES[circle.slug].length; index += 1) {
      assert.ok((await client.models.Message.get({ id: `demo-${circle.slug}-${index}` })).data, `Missing ${circle.slug} message ${index}`);
    }
  }
}

export async function seed(): Promise<void> {
  validateSeedSpec();
  const [sam, jordan] = accounts();
  for (const account of [sam, jordan]) {
    assert.match(account.email, /^[a-z0-9.+-]+@example\.com$/i, 'Demo accounts must use example.com');
    assert.ok(account.password.length >= 8, 'Demo passwords must be at least 8 characters');
  }

  try {
    const samId = await authenticate(sam);
    await upsertProfile(sam);
    await seedSharedData(samId);
    await seedMessages(samId, 0);

    const jordanId = await authenticate(jordan);
    await upsertProfile(jordan);
    await seedMessages(jordanId, 1);
    await verifySeed([sam, jordan]);
    console.log('Demo seed complete: 2 users, 5 events, 6 circles, 13 messages, and 6 topics.');
  } finally {
    await signOut().catch(() => undefined);
  }
}

if (process.argv.includes('--check')) {
  validateSeedSpec();
  console.log('Demo seed specification is valid.');
} else {
  seed().catch((error) => {
    console.error('Demo seed failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
