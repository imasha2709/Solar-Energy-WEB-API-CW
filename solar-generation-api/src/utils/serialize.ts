export function serializeData<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }

      if (
        value &&
        typeof value === "object" &&
        "toNumber" in value &&
        typeof (value as { toNumber: unknown }).toNumber === "function"
      ) {
        return (value as { toNumber: () => number }).toNumber();
      }

      return value;
    })
  );
}