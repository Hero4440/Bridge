// Authenticated onboarding saves private contacts before publishing the completed profile.
import { currentUser } from '../lib/auth';
import { createUserProfile, validateProfileName, getCurrentUserProfile, saveTrustedContacts, updateUserProfile, type UserRecord } from '../lib/profile';
import { OnboardingFlow } from './OnboardingFlow';

export function Onboarding({ onComplete }: { onComplete: (profile: UserRecord) => void }) {
  return <OnboardingFlow onSave={async (values) => {
    const user = await currentUser();
    await saveTrustedContacts(values.contacts);
    const existing = await getCurrentUserProfile();
    const input = {
      ...validateProfileName(values),
      interests: values.interests,
      theme: values.theme,
      comfortTextSize: values.textLarge ? 'large' : 'default',
      comfortCalmMode: values.calmMode,
      comfortTextFirst: values.textFirst,
    };
    // An owner-specific ID protects against duplicate profiles after a lost response.
    const profile = existing
      ? await updateUserProfile({ id: existing.id, ...input })
      : await createUserProfile({ id: user.userId, email: user.signInDetails?.loginId || '', ...input });
    onComplete(profile);
  }} />;
}
