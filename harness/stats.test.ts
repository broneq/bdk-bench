import { describe, expect, it } from "vitest";

import { compare, median, range } from "./stats.ts";

describe("median and range", () => {
  it("takes the middle value of an odd count and the mean of the middle pair of an even count", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it("averages the middle pair of an even count and spans max minus min", () => {
    expect(median([1, 2, 3, 10])).toBe(2.5);
    expect(range([4, 9, 5])).toBe(5);
  });

  it("is max minus min", () => {
    expect(range([0.6, 1, 0.8])).toBeCloseTo(0.4);
  });

  it("refuses an empty workflow", () => {
    expect(() => median([])).toThrow(/empty/);
  });
});

describe("compare (difference rule)", () => {
  it("reports no measurable difference when the median gap is inside the larger range", () => {
    const result = compare([0.6, 0.8, 0.8, 1, 1], [0.8, 0.8, 1, 1, 1]);
    expect(result.verdict).toBe("no-difference");
    expect(result.gap).toBeCloseTo(0.2);
    expect(result.noise).toBeCloseTo(0.4);
  });

  it("reports a difference in favour of the workflow with the higher median when the gap exceeds the noise", () => {
    const result = compare([0.2, 0.2, 0.4, 0.4, 0.4], [0.8, 1, 1, 1, 1]);
    expect(result).toMatchObject({ verdict: "b", medianA: 0.4, medianB: 1 });
    expect(result.gap).toBeCloseTo(0.6);
    expect(result.noise).toBeCloseTo(0.2);
    expect(compare([0.8, 1, 1, 1, 1], [0.2, 0.2, 0.4, 0.4, 0.4]).verdict).toBe("a");
  });

  it("counts any gap as a difference when both workflows have zero range", () => {
    expect(compare([1, 1, 1], [0.75, 0.75, 0.75]).verdict).toBe("a");
    expect(compare([1, 1, 1], [1, 1, 1]).verdict).toBe("no-difference");
  });

  it("treats a gap equal to the noise as no measurable difference", () => {
    expect(compare([0, 0.5], [0.5, 1]).verdict).toBe("no-difference");
  });

  it("names b higher and finds no difference when the gap is inside the noise", () => {
    expect(compare([1, 1], [5, 5]).verdict).toBe("b");
    expect(compare([1, 5], [3, 3]).verdict).toBe("no-difference");
  });

  it("refuses a workflow with fewer than 2 runs", () => {
    expect(() => compare([1], [1, 1])).toThrow(/at least 2 runs/);
  });
});
