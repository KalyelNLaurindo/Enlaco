import type { Participant, ExclusionRule } from '../types';

// Error thrown when a valid secret draw configuration cannot be solved under given exclusions.
export class DrawInfeasibleError extends Error {
  constructor(message = 'No valid combination was found for the draw.') {
    super(message);
    this.name = 'DrawInfeasibleError';
    Object.setPrototypeOf(this, DrawInfeasibleError.prototype);
  }
}

// Service class to handle the Secret Santa draw matching process.
export class DrawGenerator {
  // Randomly shuffles an array to ensure the draw is fair and unbiased.
  private static shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Matches participants together while respecting exclusions and preventing self-drawing.
  public static generate(
    participants: Participant[],
    exclusionRules: ExclusionRule[]
  ): Map<string, string> {
    const n = participants.length;
    if (n < 3) {
      throw new DrawInfeasibleError('At least 3 participants are required.');
    }

    const participantIds = participants.map((p) => p.id);

    // Maps who cannot draw whom (bidirectional exclusions).
    const exclusions = new Map<string, Set<string>>();
    participantIds.forEach((id) => exclusions.set(id, new Set<string>()));

    exclusionRules.forEach((rule) => {
      exclusions.get(rule.participantA)?.add(rule.participantB);
      exclusions.get(rule.participantB)?.add(rule.participantA);
    });

    // Creates a list of potential partners for each participant.
    const candidateGraph = new Map<string, string[]>();
    participantIds.forEach((giver) => {
      const options = participantIds.filter(
        (receiver) => receiver !== giver && !exclusions.get(giver)?.has(receiver)
      );
      candidateGraph.set(giver, options);
    });

    const assigned = new Map<string, string>(); // Giver -> Receiver
    const taken = new Map<string, string>();    // Receiver -> Giver

    let iterations = 0;
    const maxIterations = 10000; // Safety limit to avoid infinite loops

    // Backtracking recursive function to search for a valid pairing combination.
    function backtrack(): boolean {
      iterations++;
      if (iterations > maxIterations) {
        return false;
      }

      if (assigned.size === n) {
        return true; // Success: all participants have a unique partner
      }

      // MRV Heuristic: pick the participant with the fewest remaining choices to solve faster.
      let nextGiver: string | null = null;
      let minCandidatesCount = Infinity;

      for (const giver of participantIds) {
        if (assigned.has(giver)) continue;

        const candidates = (candidateGraph.get(giver) || []).filter(
          (receiver) => !taken.has(receiver) && taken.get(giver) !== receiver
        );

        if (candidates.length < minCandidatesCount) {
          minCandidatesCount = candidates.length;
          nextGiver = giver;
        }
      }

      if (!nextGiver) return false;

      const currentCandidates = (candidateGraph.get(nextGiver) || []).filter(
        (receiver) => !taken.has(receiver) && taken.get(nextGiver) !== receiver
      );

      // Shuffles candidates to ensure a random and unique result every time.
      const shuffledCandidates = DrawGenerator.shuffle(currentCandidates);

      for (const receiver of shuffledCandidates) {
        assigned.set(nextGiver, receiver);
        taken.set(receiver, nextGiver);

        if (backtrack()) {
          return true;
        }

        // Undoes the pairing if it leads to a dead end.
        assigned.delete(nextGiver);
        taken.delete(receiver);
      }

      return false;
    }

    const success = backtrack();

    if (!success) {
      throw new DrawInfeasibleError(
        'Impossible to run the draw with the current exclusion rules. Please reduce rules and try again.'
      );
    }

    return assigned;
  }
}

// Functional export for backward compatibility and simpler testing.
export function generateDraw(
  participants: Participant[],
  exclusionRules: ExclusionRule[]
): Map<string, string> {
  return DrawGenerator.generate(participants, exclusionRules);
}
