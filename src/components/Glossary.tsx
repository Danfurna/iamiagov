import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GLOSSARY } from "@/lib/assessment";

export function Glossary() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground shadow-sm hover:bg-primary-foreground/20 hover:text-primary-foreground"
        >
          <BookOpen />
          <span className="hidden sm:inline">Consultar glossário</span>
          <span className="sm:hidden">Glossário</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Termos e definições utilizados no IAMIA-GOV</DialogTitle>
          <DialogDescription>Definições de referência para a leitura das afirmações.</DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-muted">
                <th className="p-3">Termo</th>
                <th className="p-3">Definição</th>
              </tr>
            </thead>
            <tbody>
              {GLOSSARY.map(([term, definition]) => (
                <tr key={term} className="border-b align-top">
                  <th className="p-3 font-semibold">{term}</th>
                  <td className="p-3 leading-relaxed text-muted-foreground">{definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}