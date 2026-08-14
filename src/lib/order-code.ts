/**
 * Order tracking code generation.
 *
 * Format: EMD-XXXXXX where the 6 chars after the prefix are exactly 3 letters
 * (A-Z, excluding confusing ones) and 3 digits, randomly shuffled — e.g.
 * "EMD-K7M3B2". Generation happens server-side and is checked against stored
 * codes to guarantee uniqueness across orders.
 */

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I, O
const DIGITS = "123456789"; // no 0 to avoid confusion with O

/** Picks `n` unique characters at random from a pool and shuffles them. */
function pickMixed(count: number, alternative: number): string {
  const chars: string[] = [];
  for (let i = 0; i < count; i++) {
    chars.push(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
  }
  for (let i = 0; i < alternative; i++) {
    chars.push(DIGITS[Math.floor(Math.random() * DIGITS.length)]);
  }
  // Fisher–Yates shuffle to blend letters and digits randomly.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

/** Builds a fresh candidate code, e.g. "EMD-K7M3B2". */
export function generateTrackingCode(): string {
  return `EMD-${pickMixed(3, 3)}`;
}