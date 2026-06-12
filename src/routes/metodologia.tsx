import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DIMENSIONS, SCALE_LABELS } from "@/lib/assessment";
import { MATURITY_LEVELS } from "@/lib/analytics";

export const Route = createFileRoute("/metodologia")({
  head: () => ({
    meta: [
      { title: "Metodologia — IA-MIA GOV" },
      { name: "description", content: "Conceito de maturidade institucional em IA, sete dimensões, escala Likert, cálculo e índice de consenso." },
    ],
  }),
  component: Metodologia,
});

function Metodologia() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <h1 className="text-3xl font-bold">Metodologia</h1>
        <p className="mt-2 text-muted-foreground">
          Fundamentos do instrumento de avaliação da maturidade institucional em Inteligência Artificial.
        </p>
      </header>

      <Section title="Maturidade institucional em IA">
        <p>
          A maturidade institucional em IA expressa a capacidade de uma organização pública de
          planejar, implementar, governar e sustentar iniciativas de Inteligência Artificial de
          forma responsável, ética e alinhada ao interesse público. O instrumento traduz essa
          capacidade em um diagnóstico estruturado, comparável e evolutivo.
        </p>
      </Section>

      <Section title="As sete dimensões">
        <div className="grid gap-3 sm:grid-cols-2">
          {DIMENSIONS.map((d) => (
            <div key={d.key} className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Dimensão {d.index}</p>
              <p className="font-medium">{d.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{d.questions.length} questões</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm">
          São <strong>35 questões</strong> no total (5 por dimensão), respondidas por múltiplos
          participantes da organização.
        </p>
      </Section>

      <Section title="Escala Likert (1 a 5)">
        <ul className="space-y-2">
          {Object.entries(SCALE_LABELS).map(([k, v]) => (
            <li key={k} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{k}</span>
              <span className="text-sm">{v}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Método de cálculo">
        <p>
          A pontuação de cada dimensão é a média das respostas (escala 1 a 5). O resultado geral
          pode ser calculado por <strong>média simples</strong> (cada dimensão pesa 14,2857%) ou por
          <strong> média ponderada</strong>, em que o administrador define pesos que devem totalizar 100%.
        </p>
        <p className="mt-2">
          A média geral é convertida em uma pontuação total (35 a 175 pontos), correspondendo a um
          dos cinco níveis de maturidade:
        </p>
        <div className="mt-3 space-y-2">
          {MATURITY_LEVELS.map((l) => (
            <div key={l.level} className="flex items-center gap-3 rounded-lg border p-3">
              <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: l.color }} />
              <div className="flex-1">
                <span className="font-medium">Nível {l.level} — {l.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{l.min}–{l.max} pontos</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Índice de Consenso Institucional">
        <p>
          O índice de consenso (0% a 100%) mede o grau de alinhamento entre os respondentes e é
          derivado do desvio padrão das respostas: quanto menor a dispersão, maior o consenso.
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          <li>• <strong>Acima de 80%:</strong> alto consenso</li>
          <li>• <strong>60% a 80%:</strong> consenso moderado</li>
          <li>• <strong>Abaixo de 60%:</strong> baixo consenso</li>
        </ul>
      </Section>

      <Section title="Interpretação dos resultados">
        <p>
          Os resultados devem ser lidos como um diagnóstico institucional para orientar decisões e
          priorizações, e não como uma certificação. Dimensões com média inferior a 2,5 indicam
          lacunas críticas; entre 2,5 e 3,4, pontos de atenção; entre 3,5 e 4,4, capacidades em
          consolidação; e a partir de 4,5, pontos fortes. O plano de ação automático e o simulador
          de evolução apoiam o planejamento das próximas etapas.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-card">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="text-sm leading-relaxed text-foreground/90 [&_p]:leading-relaxed">{children}</CardContent>
    </Card>
  );
}
