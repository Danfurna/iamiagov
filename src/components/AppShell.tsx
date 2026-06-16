import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { BrainCircuit, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/organizacoes", label: "Organizações" },
  { to: "/campanhas", label: "Campanhas" },
  { to: "/metodologia", label: "Metodologia" },
  { to: "/sobre", label: "Sobre" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Esconde o cabeçalho na página pública de resposta para foco total no questionário.
  const isRespond = pathname.startsWith("/responder/");

  return (
    <div className="flex min-h-screen flex-col">
      {!isRespond && (
        <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 print:hidden">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-hero text-primary-foreground">
                <BrainCircuit className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-lg font-bold text-primary">IAMIA-GOV</span>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                  Maturidade em IA · Setor Público
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                  activeProps={{ className: "bg-secondary text-primary" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              className="md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {open && (
            <nav className="border-t bg-card px-4 pb-3 md:hidden">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
                  activeProps={{ className: "bg-secondary text-primary" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </header>
      )}

      <main className={cn("flex-1", !isRespond && "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6")}>
        {children}
      </main>

      {!isRespond && (
        <footer className="border-t bg-card print:hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
            <p className="font-medium text-foreground">IAMIA-GOV — Instrumento de Avaliação da Maturidade Institucional em IA</p>
            <p className="mt-1">
              Produto Técnico-Tecnológico (PTT) de Mestrado Profissional em Administração Pública.
              Sem certificação oficial e sem promessas de conformidade regulatória.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
