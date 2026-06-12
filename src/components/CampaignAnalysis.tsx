import { useMemo, useState } from "react";
import {
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend,
} from "recharts";
import {
  Download, FileText, Activity, Users, TrendingUp, TrendingDown, Gauge,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DIMENSIONS } from "@/lib/assessment";
import {
  aggregate, buildActionPlan, classifyMean, consensusClass, fmt,
  levelFromTotalScore, MATURITY_LEVELS, type AggregateResult,
} from "@/lib/analytics";
import {
  buildFullExport, buildResultRows, buildRawRows, exportCSV, exportJSON,
} from "@/lib/exports";
import type { Campaign, Organization, Respondent, ResponseRow } from "@/lib/api";

interface Props {
  campaign: Campaign;
  organization: Organization | null;
  respondents: Respondent[];
  responses: ResponseRow[];
}

const CHART_COLORS = ["#1e3a8a", "#2563eb", "#16a34a", "#ca8a04", "#dc2626", "#0891b2", "#7c3aed"];

export function CampaignAnalysis({ campaign, organization, respondents, responses }: Props) {
  const method = (campaign.calc_method === "weighted" ? "weighted" : "simple") as "simple" | "weighted";
  const result = useMemo(
    () => aggregate(responses, method, campaign.weights),
    [responses, method, campaign.weights],
  );

  if (result.respondentCount === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-12 text-center text-muted-foreground">
          Ainda não há respostas concluídas nesta campanha. Os resultados aparecerão aqui
          quando os respondentes enviarem suas avaliações.
        </CardContent>
      </Card>
    );
  }

  const radarData = result.perDimension.map((d) => ({
    dim: d.dimension.short, media: Number(d.stats.mean.toFixed(2)),
  }));

  const barData = result.perDimension.map((d) => ({
    name: d.dimension.short, media: Number(d.stats.mean.toFixed(2)),
    color: classifyMean(d.stats.mean).color,
  }));

  const overallConsensus = consensusClass(result.consensusIndex);

  // ----- Benchmark por unidade e perfil -----
  const benchmark = (groupKey: "organizational_unit" | "respondent_profile") => {
    const groups = new Map<string, string[]>();
    for (const r of respondents) {
      const key = (r[groupKey] || "Não informado").toString();
      const arr = groups.get(key) ?? [];
      arr.push(r.id);
      groups.set(key, arr);
    }
    return [...groups.entries()]
      .map(([label, ids]) => {
        const subset = responses.filter((x) => ids.includes(x.respondent_id));
        if (subset.length === 0) return null;
        const agg = aggregate(subset, method, campaign.weights);
        return { label, mean: agg.overallMean, level: agg.level, consensus: agg.consensusIndex, count: agg.respondentCount };
      })
      .filter(Boolean) as { label: string; mean: number; level: typeof MATURITY_LEVELS[0]; consensus: number; count: number }[];
  };

  const byUnit = benchmark("organizational_unit").sort((a, b) => b.mean - a.mean);
  const byProfile = benchmark("respondent_profile").sort((a, b) => b.mean - a.mean);

  // ----- Radar por perfil -----
  const profileRadar = useMemo(() => {
    const profiles = [...new Set(respondents.map((r) => r.respondent_profile || "Outro"))];
    const rows = DIMENSIONS.map((d) => {
      const row: Record<string, string | number> = { dim: d.short };
      for (const p of profiles) {
        const ids = respondents.filter((r) => (r.respondent_profile || "Outro") === p).map((r) => r.id);
        const subset = responses.filter((x) => ids.includes(x.respondent_id) && x.dimension_key === d.key);
        row[p] = subset.length ? Number((subset.reduce((s, x) => s + x.score, 0) / subset.length).toFixed(2)) : 0;
      }
      return row;
    });
    return { profiles, rows };
  }, [respondents, responses]);

  // ----- Exports -----
  const onCSVResults = () => exportCSV(buildResultRows(result), `${campaign.name}-dimensoes.csv`);
  const onCSVRaw = () => exportCSV(buildRawRows(respondents, responses), `${campaign.name}-respostas.csv`);
  const onJSON = () =>
    exportJSON(buildFullExport({ organization, campaign, result, respondents, responses }), `${campaign.name}-relatorio.json`);

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi icon={Users} label="Respondentes" value={String(result.respondentCount)} />
        <Kpi icon={Gauge} label="Maturidade geral" value={fmt(result.overallMean)} sub={`${fmt(result.totalScore, 0)} / 175 pts`} />
        <Kpi icon={Activity} label="Consenso" value={`${fmt(result.consensusIndex, 0)}%`} sub={overallConsensus.label} color={overallConsensus.color} />
        <Kpi icon={TrendingUp} label="Mais forte" value={result.strongest?.dimension.short ?? "—"} sub={fmt(result.strongest?.stats.mean ?? 0)} color="#16a34a" />
        <Kpi icon={TrendingDown} label="Mais fraca" value={result.weakest?.dimension.short ?? "—"} sub={fmt(result.weakest?.stats.mean ?? 0)} color="#dc2626" />
      </div>

      {/* Maturity banner */}
      <Card className="overflow-hidden shadow-card">
        <div className="h-1.5" style={{ backgroundColor: result.level.color }} />
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Nível de maturidade institucional</p>
            <p className="font-display text-2xl font-bold" style={{ color: result.level.color }}>
              Nível {result.level.level} — {result.level.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onCSVResults}><Download className="h-4 w-4" /> CSV dimensões</Button>
            <Button variant="outline" size="sm" onClick={onCSVRaw}><Download className="h-4 w-4" /> CSV respostas</Button>
            <Button variant="outline" size="sm" onClick={onJSON}><Download className="h-4 w-4" /> JSON</Button>
            <Button asChild size="sm" variant="hero">
              <Link to="/relatorio/$campaignId" params={{ campaignId: campaign.id }}><FileText className="h-4 w-4" /> Relatório PDF</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Radar institucional">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid />
              <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
              <Radar name="Média" dataKey="media" stroke="#1e3a8a" fill="#2563eb" fillOpacity={0.4} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Média por dimensão">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="media" radius={[0, 4, 4, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Radar por perfil de respondente">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={profileRadar.rows} outerRadius="72%">
              <PolarGrid />
              <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 9 }} />
              {profileRadar.profiles.map((p, i) => (
                <Radar key={p} name={p} dataKey={p} stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.12} />
              ))}
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Heatmap por questão">
          <Heatmap result={result} />
        </ChartCard>
      </div>

      {/* Consensus + Benchmark */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Consenso por dimensão</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {result.perDimension.map((d) => {
              const c = consensusClass(d.consensus);
              return (
                <div key={d.dimension.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{d.dimension.name}</span>
                    <span style={{ color: c.color }}>{fmt(d.consensus, 0)}% · {c.label}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${d.consensus}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Benchmark por unidade</CardTitle></CardHeader>
          <CardContent>
            <BenchmarkTable rows={byUnit} />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Benchmark por perfil de respondente</CardTitle></CardHeader>
        <CardContent><BenchmarkTable rows={byProfile} /></CardContent>
      </Card>

      {/* Simulator */}
      <Simulator result={result} method={method} weights={campaign.weights} />

      {/* Action plan */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Plano de ação automático</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {buildActionPlan(result).map((a) => (
            <div key={a.dimension.key} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{a.dimension.name}</span>
                <span className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: a.color }}>
                  {a.classification} · {fmt(a.mean)}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{a.recommendation}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" /><span className="text-xs">{label}</span>
        </div>
        <div className="mt-2 font-display text-2xl font-bold" style={color ? { color } : undefined}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-card">
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function BenchmarkTable({ rows }: { rows: { label: string; mean: number; level: typeof MATURITY_LEVELS[0]; consensus: number; count: number }[] }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Sem dados.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 pr-2">#</th><th className="py-2 pr-2">Grupo</th>
            <th className="py-2 pr-2">Resp.</th><th className="py-2 pr-2">Maturidade</th>
            <th className="py-2 pr-2">Nível</th><th className="py-2">Consenso</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} className="border-b last:border-0">
              <td className="py-2 pr-2 font-medium">{i + 1}</td>
              <td className="py-2 pr-2">{r.label}</td>
              <td className="py-2 pr-2">{r.count}</td>
              <td className="py-2 pr-2 font-medium">{fmt(r.mean)}</td>
              <td className="py-2 pr-2"><span style={{ color: r.level.color }}>N{r.level.level}</span></td>
              <td className="py-2">{fmt(r.consensus, 0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Heatmap({ result }: { result: AggregateResult }) {
  const color = (v: number) => {
    if (v === 0) return "#e5e7eb";
    if (v < 2.5) return "#fca5a5";
    if (v < 3.5) return "#fde68a";
    if (v < 4.5) return "#93c5fd";
    return "#86efac";
  };
  return (
    <div className="space-y-1.5">
      {DIMENSIONS.map((d) => (
        <div key={d.key} className="flex items-center gap-1.5">
          <span className="w-24 shrink-0 truncate text-xs text-muted-foreground" title={d.name}>{d.short}</span>
          <div className="flex gap-1">
            {d.questions.map((q, i) => {
              const m = result.perQuestion[q.key]?.mean ?? 0;
              return (
                <span key={q.key} title={`${q.text} — ${fmt(m)}`}
                  className="flex h-7 w-7 items-center justify-center rounded text-[10px] font-medium text-foreground/70"
                  style={{ backgroundColor: color(m) }}>
                  {i + 1}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Simulator({ result, method, weights }: {
  result: AggregateResult; method: "simple" | "weighted"; weights: Record<string, number> | null;
}) {
  const [sim, setSim] = useState<Record<string, number>>(
    Object.fromEntries(result.perDimension.map((d) => [d.dimension.key, Number(d.stats.mean.toFixed(1))])),
  );

  const simAverages = sim;
  const totalW = DIMENSIONS.reduce((s, d) => s + (weights?.[d.key] ?? 0), 0) || 100;
  const simTotal = (method === "weighted" && weights)
    ? DIMENSIONS.reduce((s, d) => s + (simAverages[d.key] ?? 0) * ((weights[d.key] ?? 0) / totalW), 0) * 35
    : (DIMENSIONS.reduce((s, d) => s + (simAverages[d.key] ?? 0), 0) / DIMENSIONS.length) * 35;
  const simLevel = levelFromTotalScore(simTotal);
  const delta = simTotal - result.totalScore;

  return (
    <Card className="shadow-card">
      <CardHeader><CardTitle className="text-base">Simulador de evolução</CardTitle></CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {result.perDimension.map((d) => (
            <div key={d.dimension.key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{d.dimension.short}</span>
                <span className="text-muted-foreground">
                  Atual {fmt(d.stats.mean, 1)} → <span className="font-medium text-foreground">{fmt(sim[d.dimension.key], 1)}</span>
                </span>
              </div>
              <Slider min={1} max={5} step={0.1} value={[sim[d.dimension.key]]}
                onValueChange={([v]) => setSim((s) => ({ ...s, [d.dimension.key]: v }))} />
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-center gap-4 rounded-xl bg-secondary/50 p-6">
          <div>
            <p className="text-xs text-muted-foreground">Situação atual</p>
            <p className="font-display text-xl font-bold">{fmt(result.totalScore, 0)} pts — N{result.level.level} {result.level.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Situação simulada</p>
            <p className="font-display text-2xl font-bold" style={{ color: simLevel.color }}>
              {fmt(simTotal, 0)} pts — N{simLevel.level} {simLevel.name}
            </p>
          </div>
          <div className="rounded-lg bg-card p-3 text-sm">
            Impacto esperado:{" "}
            <span className="font-semibold" style={{ color: delta >= 0 ? "#16a34a" : "#dc2626" }}>
              {delta >= 0 ? "+" : ""}{fmt(delta, 0)} pontos
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
