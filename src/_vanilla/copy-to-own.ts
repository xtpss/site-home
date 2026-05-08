export default function copyToOwn<T>(input: T): T {
  if (input === null || typeof input !== "object") {
    return input;
  }
  if (Array.isArray(input)) {
    return input.map(copyToOwn) as unknown as T;
  }
  const output: Record<string, unknown> = {};
  for (const key in input) {
    output[key] = copyToOwn((input as Record<string, unknown>)[key]);
  }
  return output as T;
}
