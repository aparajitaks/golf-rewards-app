/** Multiset intersection: each winning value consumes at most one matching ticket value. */
export function matchCount(userScores: number[], winningScores: number[]): number {
  const bag = new Map<number, number>();
  for (const u of userScores) {
    bag.set(u, (bag.get(u) ?? 0) + 1);
  }
  let m = 0;
  for (const w of winningScores) {
    const c = bag.get(w) ?? 0;
    if (c > 0) {
      m++;
      bag.set(w, c - 1);
    }
  }
  return m;
}

export function randomWinningScores(): number[] {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, 5);
}

/** Weight rarer community scores higher; sample 5 distinct values without replacement. */
export function weightedWinningScores(entrySnapshots: number[][]): number[] {
  const freq = new Map<number, number>();
  for (const snap of entrySnapshots) {
    for (const s of snap) {
      freq.set(s, (freq.get(s) ?? 0) + 1);
    }
  }
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const picked: number[] = [];
  for (let k = 0; k < 5; k++) {
    let total = 0;
    const weights = pool.map((s) => {
      const w = 1 / ((freq.get(s) ?? 0) + 1.5);
      total += w;
      return w;
    });
    let r = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i]!;
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    picked.push(pool[idx]!);
    pool.splice(idx, 1);
  }
  return picked;
}

export type PrizeTier = "none" | "three" | "four" | "five";

export function tierFromMatches(matches: number): PrizeTier {
  if (matches >= 5) return "five";
  if (matches === 4) return "four";
  if (matches === 3) return "three";
  return "none";
}

const POOL_FIVE = 0.4;
const POOL_FOUR = 0.35;
const POOL_THREE = 0.25;

export type PrizeAllocation = {
  tier: PrizeTier;
  winners: number;
  poolCents: number;
  perWinnerCents: number;
  unallocatedCents: number;
};

export function allocatePrizes(
  poolCents: number,
  jackpotCarryIn: number,
  counts: { five: number; four: number; three: number },
): {
  allocations: PrizeAllocation[];
  jackpotCarryOut: number;
} {
  const totalPool = poolCents + jackpotCarryIn;
  const rawFive = Math.floor(totalPool * POOL_FIVE);
  const rawFour = Math.floor(totalPool * POOL_FOUR);
  const rawThree = Math.floor(totalPool * POOL_THREE);

  const allocFive = splitTier("five", counts.five, rawFive);
  const allocFour = splitTier("four", counts.four, rawFour);
  const allocThree = splitTier("three", counts.three, rawThree);

  let jackpotCarryOut = allocFive.unallocatedCents;
  jackpotCarryOut += allocFour.unallocatedCents;
  jackpotCarryOut += allocThree.unallocatedCents;

  return {
    allocations: [allocFive, allocFour, allocThree],
    jackpotCarryOut,
  };
}

function splitTier(
  tier: PrizeTier,
  winners: number,
  poolCents: number,
): PrizeAllocation {
  if (winners <= 0 || poolCents <= 0) {
    return { tier, winners: 0, poolCents, perWinnerCents: 0, unallocatedCents: poolCents };
  }
  const perWinnerCents = Math.floor(poolCents / winners);
  const paid = perWinnerCents * winners;
  const unallocatedCents = poolCents - paid;
  return { tier, winners, poolCents, perWinnerCents, unallocatedCents };
}
