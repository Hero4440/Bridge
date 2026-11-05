// Fail closed on GraphQL errors and exhaust list pages without logging user content.
export function checked<T>(result: {
  data: T;
  errors?: readonly unknown[];
}): T {
  if (result.errors?.length) throw new Error("Data operation failed");
  return result.data;
}
export async function allPages<T>(
  read: (
    nextToken?: string,
  ) => Promise<{
    data: T[];
    errors?: readonly unknown[];
    nextToken?: string | null;
  }>,
): Promise<T[]> {
  const rows: T[] = [];
  let token: string | undefined;
  do {
    const result = await read(token);
    rows.push(...checked(result));
    token = result.nextToken ?? undefined;
  } while (token);
  return rows;
}
