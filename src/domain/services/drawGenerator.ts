import type { Participant, ExclusionRule } from '../types';

/**
 * Custom error thrown when a valid secret draw configuration cannot be mathematically resolved
 * under the given constraints (e.g., self-draw, 2-cycles, or exclusion rules).
 */
export class DrawInfeasibleError extends Error {
  constructor(message = 'No valid draw satisfies the current constraints.') {
    super(message);
    this.name = 'DrawInfeasibleError';
    // Restore prototype chain for built-in class extension in older JS environments
    Object.setPrototypeOf(this, DrawInfeasibleError.prototype);
  }
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm to ensure randomness.
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Main draw generator using a backtracking Constraint Satisfaction Problem (CSP) algorithm
 * combined with the Minimum Remaining Values (MRV) heuristic.
 * 
 * Guarantees:
 * 1. No self-draw (P -> P is forbidden).
 * 2. No 2-cycles (if A -> B, then B -> A is forbidden).
 * 3. Respects all bidirectional exclusion rules.
 * 4. Fair randomness via candidate shuffling.
 */
export function generateDraw(
  participants: Participant[],
  exclusionRules: ExclusionRule[]
): Map<string, string> {
  const n = participants.length;
  if (n < 3) {
    throw new DrawInfeasibleError('A minimum of 3 participants is required to run a draw without 2-cycles.');
  }

  const participantIds = participants.map((p) => p.id);

  // Build bidirectional exclusion lookup sets for constant-time complexity validation
  const exclusions = new Map<string, Set<string>>();
  participantIds.forEach((id) => exclusions.set(id, new Set<string>()));

  exclusionRules.forEach((rule) => {
    exclusions.get(rule.participantA)?.add(rule.participantB);
    exclusions.get(rule.participantB)?.add(rule.participantA);
  });

  // Candidate graph: map of giver to list of all possible valid receivers (excluding self and rule-based exclusions)
  const candidateGraph = new Map<string, string[]>();
  participantIds.forEach((giver) => {
    const options = participantIds.filter(
      (receiver) => receiver !== giver && !exclusions.get(giver)?.has(receiver)
    );
    candidateGraph.set(giver, options);
  });

  const assigned = new Map<string, string>(); // maps giver -> receiver
  const taken = new Map<string, string>();    // maps receiver -> giver (tracks who has already been drawn)

  // Track recursive iterations to prevent hanging on highly complex or infinite loops in edge cases
  let iterations = 0;
  const maxIterations = 10000;

  function backtrack(): boolean {
    iterations++;
    if (iterations > maxIterations) {
      return false; // Iteration budget exceeded, abort branch
    }

    if (assigned.size === n) {
      return true; // Complete, valid assignment reached
    }

    // MRV Heuristic: Pick the unassigned giver who has the fewest remaining valid candidate options.
    // This reduces the branching factor and catches conflicts as early as possible.
    let nextGiver: string | null = null;
    let minCandidatesCount = Infinity;

    for (const giver of participantIds) {
      if (assigned.has(giver)) continue;

      // Filter current legal candidates:
      // - Must be in candidate graph.
      // - Must not already be assigned to someone else (not in taken).
      // - Must prevent a 2-cycle (if receiver already gives to giver, giver cannot give back to receiver).
      const candidates = (candidateGraph.get(giver) || []).filter(
        (receiver) => !taken.has(receiver) && taken.get(giver) !== receiver
      );

      if (candidates.length < minCandidatesCount) {
        minCandidatesCount = candidates.length;
        nextGiver = giver;
      }
    }

    if (!nextGiver) return false;

    // Filter candidates for the chosen giver
    const currentCandidates = (candidateGraph.get(nextGiver) || []).filter(
      (receiver) => !taken.has(receiver) && taken.get(nextGiver) !== receiver
    );

    // Shuffle candidates to guarantee fairness and avoid alphabetical/input-order bias
    const shuffledCandidates = shuffle(currentCandidates);

    for (const receiver of shuffledCandidates) {
      assigned.set(nextGiver, receiver);
      taken.set(receiver, nextGiver);

      if (backtrack()) {
        return true;
      }

      // Backtrack: undo assignment and try the next receiver candidate
      assigned.delete(nextGiver);
      taken.delete(receiver);
    }

    return false; // Dead end reached, propagate failure back up the recursive call stack
  }

  const success = backtrack();

  if (!success) {
    throw new DrawInfeasibleError(
      'No valid draw is possible under the current exclusion constraints. Please reduce exclusion rules and try again.'
    );
  }

  return assigned;
}
