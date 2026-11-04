// app/scripts/seed/circles.ts
// Idempotent seed for the 6 Bridge circles as REAL DynamoDB Group rows (no constant arrays, §1.3).
// The schema is Cognito-only, so we sign in as a made-up test account first, then upsert each
// circle by slug (list → create-if-absent). Safe to re-run. Made-up names only (§1.3 / §4).
// Run after a sandbox deploy:  cd app && npx tsx scripts/seed/circles.ts
import { Amplify } from 'aws-amplify';
import { signIn, signOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient<Schema>();

const PASSWORD = 'Passw0rd!Test';
const SEED_USER = 'sam@example.com';

// SKILL §2.2 — the six circles. Made-up descriptions; no real participant data.
const CIRCLES: Array<{ slug: string; name: string; emoji: string; description: string }> = [
  { slug: 'gaming', name: 'Gaming', emoji: '🎮', description: 'Co-op nights, new releases, and chill backlog chat.' },
  { slug: 'music', name: 'Music', emoji: '🎧', description: 'Share what you are listening to and find concert buddies.' },
  { slug: 'anime', name: 'Anime', emoji: '🌸', description: 'Seasonal watchlists, recs, and spoiler-tagged talk.' },
  { slug: 'cooking', name: 'Cooking', emoji: '🍳', description: 'Easy recipes, wins, and low-spoon meal ideas.' },
  { slug: 'art', name: 'Art', emoji: '🎨', description: 'Drawing, crafts, and show-your-work encouragement.' },
  { slug: 'tech', name: 'Tech', emoji: '💻', description: 'Projects, gadgets, and learning out loud.' },
];

async function main(): Promise<void> {
  await signOut().catch(() => undefined);
  await signIn({ username: SEED_USER, password: PASSWORD });

  let created = 0;
  let existing = 0;
  for (const circle of CIRCLES) {
    const { data: found, errors: listErrors } = await client.models.Group.list({
      filter: { slug: { eq: circle.slug } },
    });
    if (listErrors?.length) throw new Error(`list Group(${circle.slug}) failed: ${JSON.stringify(listErrors)}`);
    if (found.length > 0) {
      existing += 1;
      continue;
    }
    const { errors: createErrors } = await client.models.Group.create(circle);
    if (createErrors?.length) throw new Error(`create Group(${circle.slug}) failed: ${JSON.stringify(createErrors)}`);
    created += 1;
  }

  console.log(`Seed circles: ${created} created, ${existing} already present (${CIRCLES.length} total).`);
  await signOut().catch(() => undefined);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
