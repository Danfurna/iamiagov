import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Building2, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ORG_TYPES } from "@/lib/assessment";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — IAMIA-GOV" },
      { name: "description", content: "Sobre o IAMIA-GOV, Produto Técnico-Tecnológico de Mestrado Profissional em Administração Pública." },
      { property: "og:title", content: "Sobre — IAMIA-GOV" },
      { property: "og:description", content: "Sobre o IAMIA-GOV, Produto Técnico-Tecnológico de Mestrado Profissional em Administração Pública." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
          <GraduationCap className="h-4 w-4" /> Produto Técnico-Tecnológico (PTT)
        </span>
        <h1 className="mt-4 text-3xl font-bold">Sobre o IAMIA-GOV</h1>
      </header>

      <Card className="shadow-card">
        <CardContent className="p-6 text-lg leading-relaxed text-foreground/90">
          “O IAMIA-GOV foi desenvolvido como Produto Técnico-Tecnológico vinculado a pesquisa de
          mestrado profissional em Administração Pública, com o objetivo de apoiar organizações
          públicas na avaliação de suas capacidades institucionais para implementação responsável
          da Inteligência Artificial.”
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Building2 className="h-5 w-5 text-primary" /> Público-alvo</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {ORG_TYPES.map((t) => (
              <div key={t} className="rounded-lg border bg-secondary/40 px-3 py-2 text-sm">{t}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-warning/40 shadow-card">
        <CardContent className="flex gap-3 p-6">
          <ShieldAlert className="h-5 w-5 shrink-0 text-warning" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Limitações</p>
            <p className="mt-1">
              Este instrumento tem finalidade diagnóstica e acadêmica. <strong>Não constitui
              certificação oficial</strong> e <strong>não representa promessa de conformidade
              regulatória</strong>. Os resultados devem ser interpretados como subsídio ao
              planejamento institucional. O projeto está preparado para futura publicação como
              software open source.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
