/**
 * A simple seeded pseudo-random number generator (Linear Congruential Generator).
 * Ensures deterministic results for the same seed.
 */
export class SeededRandom {
  private seed: number;

  constructor(seedStr: string) {
    this.seed = this.hashString(seedStr);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Returns a float between 0 and 1
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Returns a float between min and max
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Returns an integer between min and max (inclusive of min, exclusive of max)
   */
  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }

  /**
   * Returns true/false based on probability (0-1)
   */
  boolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Picks a random item from an array
   */
  pick<T>(array: T[]): T {
    return array[this.rangeInt(0, array.length)];
  }
}