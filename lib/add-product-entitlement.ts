// The landing mounts several plan cards at once. Share their initial read by session;
// clicks still request a fresh entitlement before deciding a purchase.
export function createEntitlementReader<T>(
  load: (key: string) => Promise<T>,
  now: () => number = Date.now,
): (key: string) => Promise<T> {
  const cache = new Map<string, { value: T; until: number }>();
  const inFlight = new Map<string, Promise<T>>();
  return (key) => {
    const cached = cache.get(key);
    if (cached && cached.until > now()) return Promise.resolve(cached.value);
    const pending = inFlight.get(key);
    if (pending) return pending;
    const request = load(key).then((value) => {
      for (const [oldKey, entry] of cache) {
        if (entry.until <= now()) cache.delete(oldKey);
      }
      if (cache.size >= 8) cache.delete(cache.keys().next().value!);
      cache.set(key, { value, until: now() + 5000 });
      return value;
    }).finally(() => inFlight.delete(key));
    inFlight.set(key, request);
    return request;
  };
}
