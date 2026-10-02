// Uniform integer in [min, max] using the platform CSPRNG, which the OS seeds
// from runtime entropy (a stronger equivalent of seeding with the system time).
// Rejection sampling avoids the modulo bias of `value % span`.
export function randomInt(min, max, getRandomValues = (arr) => globalThis.crypto.getRandomValues(arr)) {
  const span = max - min + 1;
  const limit = Math.floor(0x100000000 / span) * span;
  const buf = new Uint32Array(1);
  do {
    getRandomValues(buf);
  } while (buf[0] >= limit);
  return min + (buf[0] % span);
}
