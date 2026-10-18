/**
 * Utility function to shuffle an array using the Fisher-Yates algorithm.
 * Guarantees a clean, un-mutated copy of the shuffled array.
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  if (!array || array.length <= 1) {
    return array ? [...array] : [];
  }

  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  // If array has >= 3 elements and happens to equal the original order, shuffle once more
  if (result.length >= 3) {
    const isIdentical = result.every((item, idx) => item === array[idx]);
    if (isIdentical) {
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
    }
  }

  return result;
}
