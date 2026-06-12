import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BrainCircuit, BarChart3, Users, ShieldCheck, FileText, Building2,
  Target, GitCompare, Sparkles, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listCampaigns, listOrganizations } from "@/lib/api";
import { DIMENSIONS } from "@/lib/assessment";
import { MATURITY_LEVELS } from "@/lib/analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IA-MIA GOV — Maturidade Institucional em IA" },
      { name: "description", content: "Avalie a capacidade da sua organização pública de planejar, implementar e governar Inteligência Artificial de forma responsável." },
    ],
  }),
  component: Index,
});

const MODULES = [
  { icon: Building2, title: "Administração", text: "Organizações, campanhas, respondentes e configurações." },
  { icon: Users, title: "Coleta", text: "Questionário com 35 questões, evidências e salvamento automático." },
  { icon: BarChart3, title: "Análise", text: "Maturidade, consenso institucional e benchmark interno." },
  { icon: FileText, title: "Relatórios", text: "Exportação em PDF, CSV e JSON com relatório executivo." },
];

const FEATURES = [
  { icon: Target, title: "Cálculo de maturidade", text: "Cinco níveis, da IA Ad hoc à IA Estratégica, com média simples ou ponderada." },
  { icon: ShieldCheck, title: "Índice de consenso", text: "Mede o alinhamento institucional entre os respondentes a partir do desvio padrão." },
  { icon: GitCompare, title: "Benchmark interno", text: "Compare unidades, diretorias e perfis de respondentes." },
  { icon: Sparkles, title: "Simulador & plano de ação", text: "Simule cenários de evolução e gere recomendações automáticas." },
];

function Index() {
  const { data: orgs } = useQuery({ queryKey: ["organizations"], queryFn: listOrganizations });
  const { data: campaigns } = useQuery({ queryKey: ["campaigns"], queryFn: listCampaigns });

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-hero px-6 py-16 text-primary-foreground shadow-elegant sm:px-12 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider">
            <BrainCircuit className="h-4 w-4" /> Produto Técnico-Tecnológico · v2.0
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
            IA-MIA GOV
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/90 sm:text-xl">
            Instrumento de Avaliação da Maturidade Institucional em Inteligência Artificial
            para Organizações Públicas.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="success">
              <Link to="/campanhas">Iniciar avaliação <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
              <Link to="/metodologia">Conhecer a metodologia</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Dimensões", value: DIMENSIONS.length },
          { label: "Questões", value: 35 },
          { label: "Organizações", value: orgs?.length ?? "—" },
          { label: "Campanhas", value: campaigns?.length ?? "—" },
        ].map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-6 text-center">
              <div className="font-display text-3xl font-bold text-primary">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Modules */}
      <section>
        <h2 className="text-center text-2xl font-bold">Arquitetura do sistema</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
          Quatro módulos integrados que conduzem do diagnóstico ao relatório executivo.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <Card key={m.title} className="shadow-card transition-shadow hover:shadow-elegant">
              <CardContent className="p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
                  <m.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{m.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-5 md:grid-cols-2">
        {FEATURES.map((f) => (
          <Card key={f.title} className="shadow-card">
            <CardContent className="flex gap-4 p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-hero text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Maturity levels */}
      <section>
        <h2 className="text-center text-2xl font-bold">Níveis de maturidade</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {MATURITY_LEVELS.map((l) => (
            <Card key={l.level} className="overflow-hidden shadow-card">
              <div className="h-1.5" style={{ backgroundColor: l.color }} />
              <CardContent className="p-5">
                <div className="text-xs font-medium text-muted-foreground">Nível {l.level}</div>
                <div className="mt-1 font-semibold">{l.name}</div>
                <div className="mt-2 text-xs text-muted-foreground">{l.min}–{l.max} pontos</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
