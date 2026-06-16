import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { ArrowLeft, Printer, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCampaign, listOrganizations, listRespondents, listResponsesForCampaign,
} from "@/lib/api";
import {
  aggregate, buildActionPlan, consensusClass, fmt,
} from "@/lib/analytics";

export const Route = createFileRoute("/relatorio/$campaignId")({
  component: Relatorio,
});

function Relatorio() {
  const { campaignId } = Route.useParams();
  const { data: campaign } = useQuery({ queryKey: ["campaign", campaignId], queryFn: () => getCampaign(campaignId) });
  const { data: orgs } = useQuery({ queryKey: ["organizations"], queryFn: listOrganizations });
  const { data: respondents } = useQuery({ queryKey: ["respondents", campaignId], queryFn: () => listRespondents(campaignId) });
  const { data: responses } = useQuery({ queryKey: ["responses", campaignId], queryFn: () => listResponsesForCampaign(campaignId), enabled: !!campaign });

  const method = (campaign?.calc_method === "weighted" ? "weighted" : "simple") as "simple" | "weighted";
  const result = useMemo(
    () => aggregate(responses ?? [], method, campaign?.weights),
    [responses, method, campaign?.weights],
  );

  if (!campaign) return <p className="text-muted-foreground">Carregando…</p>;
  const org = orgs?.find((o) => o.id === campaign.organization_id) ?? null;
  const submitted = (respondents ?? []).filter((r) => r.submitted);

  const profiles = [...new Set(submitted.map((r) => r.respondent_profile || "Outro"))];
  const radarData = result.perDimension.map((d) => ({ dim: d.dimension.short, media: Number(d.stats.mean.toFixed(2)) }));
  const overallConsensus = consensusClass(result.consensusIndex);
  const plan = buildActionPlan(result);
  const gaps = plan.filter((p) => p.mean < 3.5);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link to="/campanha/$campaignId" params={{ campaignId }}><ArrowLeft className="h-4 w-4" /> Voltar</Link>
        </Button>
        <Button variant="hero" onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimir / Salvar PDF</Button>
      </div>

      <article className="space-y-8 rounded-xl bg-card p-8 shadow-card print:shadow-none print:p-0">
        {/* Capa */}
        <header className="border-b pb-6">
          <div className="flex items-center gap-2 text-primary">
            <BrainCircuit className="h-6 w-6" />
            <span className="font-display text-lg font-bold">IA-MIA GOV</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold">Relatório Executivo de Maturidade em IA</h1>
          <p className="mt-1 text-muted-foreground">Instrumento de Avaliação da Maturidade Institucional em Inteligência Artificial</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Meta label="Organização" value={org?.name ?? "—"} />
            <Meta label="Órgão superior" value={org?.parent_body ?? "—"} />
            <Meta label="Campanha" value={campaign.name} />
            <Meta label="Respondentes" value={String(result.respondentCount)} />
          </dl>
        </header>

        {result.respondentCount === 0 ? (
          <p className="text-muted-foreground">Sem respostas concluídas para gerar o relatório.</p>
        ) : (
          <>
            {/* Perfil dos participantes */}
            <Block title="Perfil dos participantes">
              <div className="flex flex-wrap gap-2">
                {profiles.map((p) => {
                  const count = submitted.filter((r) => (r.respondent_profile || "Outro") === p).length;
                  return <span key={p} className="rounded-full bg-secondary px-3 py-1 text-sm">{p}: {count}</span>;
                })}
              </div>
            </Block>

            {/* Resultado geral */}
            <Block title="Resultado geral">
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Maturidade geral" value={`${fmt(result.totalScore, 0)} / 175`} />
                <Stat label="Nível" value={`N${result.level.level} — ${result.level.name}`} color={result.level.color} />
                <Stat label="Consenso institucional" value={`${fmt(result.consensusIndex, 0)}% · ${overallConsensus.label}`} color={overallConsensus.color} />
              </div>
            </Block>

            {/* Radar institucional */}
            <Block title="Radar institucional">
              <div className="mx-auto max-w-md">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 9 }} />
                    <Radar dataKey="media" stroke="#1e3a8a" fill="#2563eb" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Block>

            {/* Resultado por dimensão */}
            <Block title="Resultado por dimensão">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2">Dimensão</th><th className="py-2">Média</th><th className="py-2">Mediana</th>
                    <th className="py-2">Desvio</th><th className="py-2">Mín</th><th className="py-2">Máx</th><th className="py-2">Consenso</th>
                  </tr>
                </thead>
                <tbody>
                  {result.perDimension.map((d) => (
                    <tr key={d.dimension.key} className="border-b last:border-0">
                      <td className="py-2">{d.dimension.name}</td>
                      <td className="py-2 font-medium">{fmt(d.stats.mean)}</td>
                      <td className="py-2">{fmt(d.stats.median)}</td>
                      <td className="py-2">{fmt(d.stats.stddev)}</td>
                      <td className="py-2">{fmt(d.stats.min)}</td>
                      <td className="py-2">{fmt(d.stats.max)}</td>
                      <td className="py-2">{fmt(d.consensus, 0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Block>

            {/* Principais lacunas */}
            <Block title="Principais lacunas">
              {gaps.length ? (
                <ul className="space-y-1 text-sm">
                  {gaps.map((g) => (
                    <li key={g.dimension.key}>
                      • <strong>{g.dimension.name}</strong> — {g.classification} (média {fmt(g.mean)})
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">Nenhuma lacuna crítica identificada.</p>}
            </Block>

            {/* Plano de ação */}
            <Block title="Plano de ação e recomendações">
              <div className="space-y-3">
                {plan.map((a) => (
                  <div key={a.dimension.key} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <strong>{a.dimension.name}</strong>
                      <span style={{ color: a.color }}>{a.classification} · {fmt(a.mean)}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{a.recommendation}</p>
                  </div>
                ))}
              </div>
            </Block>

            {/* Metodologia + Limitações */}
            <Block title="Metodologia">
              <p className="text-sm text-muted-foreground">
                Avaliação baseada em 7 dimensões e 35 afirmações (escala Likert 1–5), respondida por
                múltiplos participantes. Cálculo por {method === "weighted" ? "média ponderada" : "média simples"}.
                O índice de consenso deriva do desvio padrão das respostas. Pontuação total entre 35 e 175 pontos,
                distribuída em cinco níveis de maturidade.
              </p>
            </Block>

            <Block title="Limitações">
              <p className="text-sm text-muted-foreground">
                Diagnóstico de caráter acadêmico e institucional. Não constitui certificação oficial nem
                promessa de conformidade regulatória. Resultados refletem a percepção dos respondentes na
                data da coleta.
              </p>
            </Block>
          </>
        )}

        <footer className="border-t pt-4 text-xs text-muted-foreground">
          Gerado em {new Date().toLocaleString("pt-BR")} · IA-MIA GOV v2.0
        </footer>
      </article>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="font-medium">{value}</dd></div>;
}
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="break-inside-avoid"><h2 className="mb-3 text-lg font-bold">{title}</h2>{children}</section>;
}
function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-bold" style={color ? { color } : undefined}>{value}</p>
    </div>
  );
}

