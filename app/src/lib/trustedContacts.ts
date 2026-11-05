// Shared validation keeps onboarding and database writes aligned without loading an API client.
import { z } from 'zod';

export const trustedContactSchema = z.object({
  name: z.string().trim().min(1, 'Enter the person’s name').max(80),
  phone: z.string().trim().regex(/^[+()\d\s.-]{1,24}$/, 'Enter a valid phone number')
    .refine((phone) => phone.replace(/\D/g, '').length >= 10, 'Add a 10-digit phone number'),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email')]),
  relation: z.enum(['Parent', 'Guardian', 'Sibling', 'Coach', 'Friend', 'Other']),
  otherRole: z.string().trim().max(80).optional(),
});
export type TrustedContactInput = z.input<typeof trustedContactSchema>;
export function validateTrustedContact(input: TrustedContactInput) {
  const result = trustedContactSchema.safeParse(input);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? 'Check your trusted person details');
  }
  return result.data;
}
export const blankTrustedContact = (): TrustedContactInput => ({ name: '', phone: '', email: '', relation: 'Parent', otherRole: '' });
export const isBlankTrustedContact = (contact: TrustedContactInput) =>
  !contact.name.trim() && !contact.phone.trim() && !contact.email.trim() && !contact.otherRole?.trim();
