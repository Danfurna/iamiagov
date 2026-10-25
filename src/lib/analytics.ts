// Motor de cálculo: maturidade, estatística, consenso, benchmark e plano de ação.
import { DIMENSIONS, TOTAL_QUESTIONS, EQUAL_WEIGHT, type Dimension } from "./assessment";

export interface RespondentLike {
  id: string;
  name: string;
  organizational_unit: string | null;
  job_title: string | null;
  respondent_profile: string | null;
}

export interface ResponseLike {
  respondent_id: string;
  dimension_key: string;
  question_key: string;
  score: number;
}

export interface MaturityLevel {
  level: number;
  name: string;
  min: number;
  max: number;
  color: string;
}

// Faixas baseadas no somatório das 35 questões (35 a 175).
export const MATURITY_LEVELS: MaturityLevel[] = [
  { level: 1, name: "(Inicial) Ad hoc", min: 35, max: 63, color: "#dc2626" },
  { level: 2, name: "Exploratória", min: 64, max: 91, color: "#ca8a04" },
  { level: 3, name: "Estruturada", min: 92, max: 119, color: "#2563eb" },
  { level: 4, name: "Governada", min: 120, max: 147, color: "#1e3a8a" },
  { level: 5, name: "Estratégica", min: 148, max: 175, color: "#16a34a" },
];

export function levelFromTotalScore(total: number): MaturityLevel {
  // Eight scaled machine epsilons absorb arithmetic noise from summing seven
  // dimension means. This is not decimal rounding: meaningful offsets remain.
  const toleranceAt = (boundary: number) =>
    8 * Number.EPSILON * Math.max(Math.abs(total), Math.abs(boundary));
  const minimum = 35;
  const maximum = 175;
  if (
    !Number.isFinite(total) ||
    total < minimum - toleranceAt(minimum) ||
    total > maximum + toleranceAt(maximum)
  ) {
    // Preserve a renderable result for empty assessments (total = 0), without
    // silently assigning a maturity level to invalid input.
    return {
      level: 0,
      name: "Pontuação inválida",
      min: minimum,
      max: maximum,
      color: MATURITY_LEVELS[0].color,
    };
  }
  // Continuous intervals: each upper bound is inclusive; the next interval
  // starts immediately above it. Ignore integer-only lower-bound metadata.
  for (const lvl of MATURITY_LEVELS) {
    if (total <= lvl.max + toleranceAt(lvl.max)) return lvl;
  }
  throw new RangeError("Intervalos de maturidade inconsistentes.");
}

// Converte média (1..5) por dimensão em total equivalente (35..175) usando o método.
export function totalScoreFromDimensionAverages(
  dimAverages: Record<string, number>,
  method: "simple" | "weighted",
  weights?: Record<string, number> | null,
): number {
  // média geral ponderada das dimensões (1..5)
  let weightedAvg: number;
  if (method === "weighted" && weights) {
    const totalW = DIMENSIONS.reduce((s, d) => s + (weights[d.key] ?? 0), 0) || 100;
    weightedAvg = DIMENSIONS.reduce(
      (s, d) => s + (dimAverages[d.key] ?? 0) * ((weights[d.key] ?? 0) / totalW),
      0,
    );
  } else {
    weightedAvg =
      DIMENSIONS.reduce((s, d) => s + (dimAverages[d.key] ?? 0), 0) / DIMENSIONS.length;
  }
  // escala a média (1..5) para o total de 35 questões (35..175)
  return weightedAvg * TOTAL_QUESTIONS;
}

// ---- Estatística básica ----
export interface Stats {
  mean: number;
  median: number;
  stddev: number;
  min: number;
  max: number;
  count: number;
}

export function computeStats(values: number[]): Stats {
  const count = values.length;
  if (count === 0) return { mean: 0, median: 0, stddev: 0, min: 0, max: 0, count: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((s, v) => s + v, 0) / count;
  const median =
    count % 2 === 0
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[(count - 1) / 2];
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / count;
  return { mean, median, stddev: Math.sqrt(variance), min: sorted[0], max: sorted[count - 1], count };
}

// Índice de consenso institucional (0..100) baseado no desvio padrão.
// Em escala 1..5 o desvio máximo teórico é 2; mapeamos para 100%..0%.
export function consensusFromStddev(stddev: number): number {
  const maxStd = 2;
  return Math.max(0, Math.min(100, (1 - stddev / maxStd) * 100));
}

export function consensusClass(pct: number): { label: string; color: string } {
  if (pct > 80) return { label: "Alto consenso", color: "#16a34a" };
  if (pct >= 60) return { label: "Consenso moderado", color: "#ca8a04" };
  return { label: "Baixo consenso", color: "#dc2626" };
}

// ---- Agregação ----
export interface DimensionResult {
  dimension: Dimension;
  stats: Stats;
  consensus: number;
}

export interface AggregateResult {
  respondentCount: number;
  perQuestion: Record<string, Stats>;
  perDimension: DimensionResult[];
  dimAverages: Record<string, number>;
  overallMean: number;
  totalScore: number;
  level: MaturityLevel;
  overallStddev: number;
  consensusIndex: number;
  strongest?: DimensionResult;
  weakest?: DimensionResult;
}

export function aggregate(
  responses: ResponseLike[],
  method: "simple" | "weighted" = "simple",
  weights?: Record<string, number> | null,
): AggregateResult {
  const respondentIds = new Set(responses.map((r) => r.respondent_id));
  const respondentCount = respondentIds.size;

  const perQuestion: Record<string, Stats> = {};
  const perDimension: DimensionResult[] = [];
  const dimAverages: Record<string, number> = {};

  for (const dim of DIMENSIONS) {
    const dimResponses = responses.filter((r) => r.dimension_key === dim.key);
    for (const q of dim.questions) {
      perQuestion[q.key] = computeStats(
        dimResponses.filter((r) => r.question_key === q.key).map((r) => r.score),
      );
    }
    // média por dimensão por respondente, depois consolidada
    const byResp: Record<string, number[]> = {};
    for (const r of dimResponses) {
      (byResp[r.respondent_id] ??= []).push(r.score);
    }
    const respMeans = Object.values(byResp).map(
      (arr) => arr.reduce((s, v) => s + v, 0) / arr.length,
    );
    const stats = computeStats(respMeans);
    dimAverages[dim.key] = stats.mean;
    perDimension.push({ dimension: dim, stats, consensus: consensusFromStddev(stats.stddev) });
  }

  // média geral por respondente
  const overallByResp: Record<string, number[]> = {};
  for (const r of responses) (overallByResp[r.respondent_id] ??= []).push(r.score);
  const respOverallMeans = Object.values(overallByResp).map(
    (arr) => arr.reduce((s, v) => s + v, 0) / arr.length,
  );
  const overallStats = computeStats(respOverallMeans);

  const totalScore = totalScoreFromDimensionAverages(dimAverages, method, weights);
  const level = levelFromTotalScore(totalScore);
  const consensusIndex = consensusFromStddev(overallStats.stddev);

  const sortedDims = [...perDimension].sort((a, b) => b.stats.mean - a.stats.mean);

  return {
    respondentCount,
    perQuestion,
    perDimension,
    dimAverages,
    overallMean: overallStats.mean,
    totalScore,
    level,
    overallStddev: overallStats.stddev,
    consensusIndex,
    strongest: sortedDims[0],
    weakest: sortedDims[sortedDims.length - 1],
  };
}

// ---- Plano de ação automático ----
export interface ActionItem {
  dimension: Dimension;
  mean: number;
  classification: string;
  color: string;
  recommendation: string;
}

export function classifyMean(mean: number): { classification: string; color: string } {
  if (mean < 2.5) return { classification: "Lacuna crítica", color: "#dc2626" };
  if (mean < 3.5) return { classification: "Ponto de atenção", color: "#ca8a04" };
  if (mean < 4.5) return { classification: "Capacidade em consolidação", color: "#2563eb" };
  return { classification: "Ponto forte", color: "#16a34a" };
}

const RECOMMENDATIONS: Record<string, string> = {
  estrategia: "Formalizar a estratégia institucional de IA, definir instâncias de governança e alinhar ao planejamento estratégico.",
  riscos: "Estabelecer procedimentos de identificação, avaliação e tratamento de riscos éticos e regulatórios, com monitoramento contínuo.",
  dados: "Fortalecer a governança de dados, inventariar ativos, garantir qualidade, interoperabilidade e conformidade com a LGPD.",
  transparencia: "Implementar explicabilidade, supervisão humana e mecanismos de responsabilização e comunicação ao cidadão.",
  pessoas: "Investir em capacitação, atração de talentos e cultura de inovação e experimentação responsável.",
  tecnologia: "Modernizar a infraestrutura, ambientes de desenvolvimento, integração entre sistemas e segurança.",
  recursos: "Assegurar recursos financeiros, critérios de priorização, monitoramento de resultados e escalabilidade.",
};

export function buildActionPlan(result: AggregateResult): ActionItem[] {
  return [...result.perDimension]
    .sort((a, b) => a.stats.mean - b.stats.mean)
    .map((d) => {
      const c = classifyMean(d.stats.mean);
      return {
        dimension: d.dimension,
        mean: d.stats.mean,
        classification: c.classification,
        color: c.color,
        recommendation: RECOMMENDATIONS[d.dimension.key],
      };
    });
}

export const fmt = (n: number, d = 2) =>
  Number.isFinite(n) ? n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

export const EQUAL_WEIGHT_PCT = EQUAL_WEIGHT;
