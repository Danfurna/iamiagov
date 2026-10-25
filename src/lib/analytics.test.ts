import { describe, expect, test } from "bun:test";
import { levelFromTotalScore, totalScoreFromDimensionAverages } from "./analytics";
import { DIMENSIONS } from "./assessment";

describe("maturity classification — audit cases", () => {
  const cases = [
    [1, 1], [1.799, 1], [1.8, 1], [1.801, 2], [1.805, 2], [1.81, 2],
    [2.599, 2], [2.6, 2], [2.601, 3], [3.4, 3], [3.401, 4],
    [4.2, 4], [4.201, 5], [5, 5],
  ];
  for (const [mean, expected] of cases) {
    test(`mean ${mean} returns N${expected}`, () => {
      expect(levelFromTotalScore(mean * 35).level).toBe(expected);
    });
  }
});

function adjacent(value: number, direction: bigint): number {
  const floats = new Float64Array([value]);
  const bits = new BigUint64Array(floats.buffer);
  bits[0] += direction;
  return floats[0];
}

describe("continuous boundaries and floating-point policy", () => {
  for (const [mean, lowerLevel] of [[1.8, 1], [2.6, 2], [3.4, 3], [4.2, 4]]) {
    test(`${mean}: immediately below, exact, immediately above outside tolerance`, () => {
      expect(levelFromTotalScore((mean - 1e-10) * 35).level).toBe(lowerLevel);
      expect(levelFromTotalScore(mean * 35).level).toBe(lowerLevel);
      expect(levelFromTotalScore((mean + 1e-10) * 35).level).toBe(lowerLevel + 1);
    });
    test(`${mean}: adjacent representable totals are treated as boundary noise`, () => {
      const total = mean * 35;
      expect(levelFromTotalScore(adjacent(total, -1n)).level).toBe(lowerLevel);
      expect(levelFromTotalScore(total).level).toBe(lowerLevel);
      expect(levelFromTotalScore(adjacent(total, 1n)).level).toBe(lowerLevel);
    });
    test(`${mean}: all seven means at boundary survive sum/division noise`, () => {
      const averages = Object.fromEntries(DIMENSIONS.map(d => [d.key, mean]));
      const total = totalScoreFromDimensionAverages(averages, "simple");
      expect(levelFromTotalScore(total).level).toBe(lowerLevel);
    });
  }
  test("valid endpoints and adjacent representable arithmetic noise", () => {
    expect(levelFromTotalScore(35).level).toBe(1);
    expect(levelFromTotalScore(175).level).toBe(5);
    expect(levelFromTotalScore(adjacent(35, -1n)).level).toBe(1);
    expect(levelFromTotalScore(adjacent(175, 1n)).level).toBe(5);
  });
  test("meaningful values just outside endpoints are invalid", () => {
    expect(levelFromTotalScore((1 - 1e-10) * 35).level).toBe(0);
    expect(levelFromTotalScore((5 + 1e-10) * 35).level).toBe(0);
  });
  for (const total of [NaN, Infinity, -Infinity, -1, 0, 34, 176]) {
    test(`invalid total ${total} returns explicit non-maturity state`, () => {
      const result = levelFromTotalScore(total);
      expect(result.level).toBe(0);
      expect(result.name).toBe("Pontuação inválida");
    });
  }
  test("no two-decimal rounding near 1.80 and 2.60", () => {
    expect(levelFromTotalScore(1.800000001 * 35).level).toBe(2);
    expect(levelFromTotalScore(2.600000001 * 35).level).toBe(3);
  });
  test("CAPES institutional score remains N2", () => {
    expect(levelFromTotalScore(74.80172413793105).level).toBe(2);
  });
  test("CAPES Gestão de Riscos is N2", () => {
    expect(levelFromTotalScore(1.8068965517241382 * 35).level).toBe(2);
  });
  test("CAPES Transparência e Accountability is N1", () => {
    expect(levelFromTotalScore(1.7931034482758623 * 35).level).toBe(1);
  });
});