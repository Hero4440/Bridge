// Live onboarding proof using two disposable, fictional accounts; cleans up its own records.
// Run: npx tsx scripts/verify-onboarding.ts (requires generated amplify_outputs.json).
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { Amplify } from 'aws-amplify';
import { signUp, signIn, signOut, deleteUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
const { saveTrustedContacts, getCurrentTrustedContacts, createUserProfile, getCurrentUserProfile } = await import('../src/lib/profile');
const client = generateClient<Schema>();
const stamp = Date.now();
const accounts = ['a', 'b'].map((suffix) => ({ email: `bridge-onboarding-${stamp}-${suffix}@example.com`, password: `Bridge!${randomBytes(16).toString('hex')}A1`, created: false }));
const contactInputs = [
  { name: 'Sam', phone: '(480) 555-0142', email: '', relation: 'Other', otherRole: 'Neighbor' },
  { name: 'Jordan', phone: '(480) 555-0199', email: '', relation: 'Sibling', otherRole: '' },
] as const;

async function login(account: typeof accounts[number]) {
  await signOut().catch(() => undefined);
  await signIn({ username: account.email, password: account.password });
}
try {
  for (const account of accounts) {
    await signUp({ username: account.email, password: account.password, options: { userAttributes: { email: account.email } } });
    account.created = true;
  }
  await login(accounts[0]);
  console.log('Disposable account A:', accounts[0].email);
  await saveTrustedContacts([...contactInputs]);
  const first = await getCurrentTrustedContacts();
  assert.equal(first.length, 2);
  assert.equal(first[0].otherRole, 'Neighbor');
  assert.equal(first[1].name, 'Jordan');
  await saveTrustedContacts([...contactInputs]);
  const retried = await getCurrentTrustedContacts();
  assert.deepEqual(retried.map((c) => c.id), first.map((c) => c.id));
  console.log('PASS two trusted people, custom relationship, stable ordering, retry without duplicates');

  const profile = await createUserProfile({ email: accounts[0].email, interests: ['gaming', 'Astronomy'], theme: 'sage', comfortTextSize: 'large', comfortCalmMode: true, comfortTextFirst: false });
  await login(accounts[0]);
  const restored = await getCurrentUserProfile();
  assert.equal(restored?.id, profile.id);
  assert.deepEqual(restored?.interests, ['gaming', 'Astronomy']);
  assert.equal(restored?.theme, 'sage');
  assert.equal(restored?.comfortTextSize, 'large');
  assert.equal(restored?.comfortCalmMode, true);
  assert.equal(restored?.comfortTextFirst, false);
  console.log('PASS saved profile and comfort preferences survive a new session');

  await login(accounts[1]);
  assert.equal((await getCurrentTrustedContacts()).length, 0);
  for (const contact of first) {
    const read = await client.models.TrustedContact.get({ id: contact.id });
    assert.equal(read.data, null);
  }
  console.log('PASS second account cannot list or read the first account’s trusted people');
} finally {
  for (const account of accounts.filter((a) => a.created)) {
    try {
      await login(account);
      for (const contact of await getCurrentTrustedContacts()) {
        const result = await client.models.TrustedContact.delete({ id: contact.id }, { selectionSet: ['id'] });
        assert(!result.errors?.length, JSON.stringify(result.errors));
      }
      const profile = await getCurrentUserProfile();
      if (profile) {
        const result = await client.models.User.delete({ id: profile.id }, { selectionSet: ['id'] });
        assert(!result.errors?.length, JSON.stringify(result.errors));
      }
      await deleteUser();
    } catch (error) { console.error('Disposable account cleanup failed:', error instanceof Error ? error.message : 'Unknown error'); process.exitCode = 1; }
  }
  await signOut().catch(() => undefined);
}
