// Exportações: CSV e JSON. PDF é gerado via impressão do relatório.
import { DIMENSIONS } from "./assessment";
import type { AggregateResult } from "./analytics";
import type { Campaign, Organization, Respondent, ResponseRow } from "./api";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJSON(payload: unknown, filename: string) {
  download(filename, JSON.stringify(payload, null, 2), "application/json");
}

export function exportCSV(rows: Record<string, string | number>[], filename: string) {
  if (rows.length === 0) {
    download(filename, "", "text/csv");
    return;
  }
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(";"),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(";")),
  ].join("\n");
  download(filename, "\uFEFF" + csv, "text/csv;charset=utf-8");
}

export function buildResultRows(result: AggregateResult): Record<string, string | number>[] {
  return result.perDimension.map((d) => ({
    Dimensao: d.dimension.name,
    Media: d.stats.mean.toFixed(2),
    Mediana: d.stats.median.toFixed(2),
    DesvioPadrao: d.stats.stddev.toFixed(2),
    Minimo: d.stats.min.toFixed(2),
    Maximo: d.stats.max.toFixed(2),
    Respondentes: d.stats.count,
    Consenso: d.consensus.toFixed(0) + "%",
  }));
}

export function buildRawRows(
  respondents: Respondent[],
  responses: ResponseRow[],
): Record<string, string | number>[] {
  const byId = new Map(respondents.map((r) => [r.id, r]));
  const anonymousCodeById = new Map(respondents.map((r, index) => [r.id, `Participante ${index + 1}`]));
  return responses.map((r) => {
    const resp = byId.get(r.respondent_id);
    const dim = DIMENSIONS.find((d) => d.key === r.dimension_key);
    return {
      Respondente: anonymousCodeById.get(r.respondent_id) ?? "Participante",
      Perfil: resp?.respondent_profile ?? "",
      Unidade: resp?.organizational_unit ?? "",
      Dimensao: dim?.name ?? r.dimension_key,
      Questao: r.question_key,
      Nota: r.score,
    };
  });
}

export function buildFullExport(opts: {
  organization: Organization | null;
  campaign: Campaign;
  result: AggregateResult;
  respondents: Respondent[];
  responses: ResponseRow[];
}) {
  const { organization, campaign, result, respondents, responses } = opts;
  return {
    gerado_em: new Date().toISOString(),
    organizacao: organization?.name,
    orgao_superior: organization?.parent_body,
    campanha: campaign.name,
    metodo_calculo: campaign.calc_method,
    total_respondentes: result.respondentCount,
    maturidade: {
      pontuacao_total: Number(result.totalScore.toFixed(2)),
      nivel: result.level.level,
      nivel_nome: result.level.name,
      media_geral: Number(result.overallMean.toFixed(2)),
      indice_consenso: Number(result.consensusIndex.toFixed(1)),
    },
    dimensoes: result.perDimension.map((d) => ({
      dimensao: d.dimension.name,
      media: Number(d.stats.mean.toFixed(2)),
      mediana: Number(d.stats.median.toFixed(2)),
      desvio_padrao: Number(d.stats.stddev.toFixed(2)),
      minimo: d.stats.min,
      maximo: d.stats.max,
      consenso: Number(d.consensus.toFixed(1)),
    })),
    respostas: buildRawRows(respondents, responses),
  };
}
