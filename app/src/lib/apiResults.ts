// Typed API error handling and pagination shared by the community screens.
export function checked<T>(result: {
  data: T;
  errors?: readonly { message: string }[];
}): T {
  if (result.errors?.length)
    throw new Error(result.errors.map((e) => e.message).join("; "));
  return result.data;
}
export async function allPages<T>(
  read: (
    nextToken?: string,
  ) => Promise<{
    data: T[];
    nextToken?: string | null;
    errors?: readonly { message: string }[];
  }>,
): Promise<T[]> {
  const items: T[] = [];
  let token: string | undefined;
  do {
    const result = await read(token);
    items.push(...checked(result));
    token = result.nextToken ?? undefined;
  } while (token);
  return items;
}
