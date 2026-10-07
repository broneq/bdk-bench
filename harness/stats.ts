// The difference rule of the harness: a gap between
// two workflows counts only when their medians are further apart than the larger
// within-workflow range, so an A/A pair's spread is the noise floor.

/** Values closer than this are equal: workflow values are sums of fractions. */
const EPSILON = 1e-9;

function sorted(values: readonly number[]): number[] {
  if (values.length === 0) throw new Error("median of an empty workflow");
  return [...values].sort((a, b) => a - b);
}

function at(values: readonly number[], index: number): number {
  const value = values[index];
  if (value === undefined) throw new Error(`no value at index ${String(index)}`);
  return value;
}

export function median(values: readonly number[]): number {
  const ordered = sorted(values);
  const middle = Math.floor(ordered.length / 2);
  if (ordered.length % 2 === 1) return at(ordered, middle);
  return (at(ordered, middle - 1) + at(ordered, middle)) / 2;
}

export function range(values: readonly number[]): number {
  const ordered = sorted(values);
  return at(ordered, ordered.length - 1) - at(ordered, 0);
}

export interface Comparison {
  /** `a` or `b` names the workflow with the higher median when the gap is measurable. */
  readonly verdict: "no-difference" | "a" | "b";
  readonly medianA: number;
  readonly medianB: number;
  readonly gap: number;
  /** The larger within-workflow range of the two workflows. */
  readonly noise: number;
}

export function compare(a: readonly number[], b: readonly number[]): Comparison {
  if (a.length < 2 || b.length < 2)
    throw new Error("a comparison needs at least 2 runs per workflow");
  const medianA = median(a);
  const medianB = median(b);
  const gap = Math.abs(medianA - medianB);
  const noise = Math.max(range(a), range(b));
  const measurable = gap > noise + EPSILON;
  const verdict = !measurable ? "no-difference" : medianA > medianB ? "a" : "b";
  return { verdict, medianA, medianB, gap, noise };
}

/** A metric value as the report tables print it: integers as they are, others to two decimals. */
export function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/** A workflow's values as `median [low..high]`, or `n/a` without any. */
export function formatValues(values: readonly number[]): string {
  if (values.length === 0) return "n/a";
  const low = Math.min(...values);
  return `${formatNumber(median(values))} [${formatNumber(low)}..${formatNumber(low + range(values))}]`;
}

/** The difference rule's verdict in words, naming the higher workflow by `names`. */
export function formatVerdict(
  a: readonly number[],
  b: readonly number[],
  names: readonly [string, string],
): string {
  if (a.length < 2 || b.length < 2) return "fewer than 2 counted runs";
  const result = compare(a, b);
  const detail = `gap ${formatNumber(result.gap)}, noise ${formatNumber(result.noise)}`;
  if (result.verdict === "no-difference") return `no measurable difference (${detail})`;
  return `${result.verdict === "a" ? names[0] : names[1]} higher (${detail})`;
}
