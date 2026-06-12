import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createOrganization, deleteOrganization, listOrganizations } from "@/lib/api";
import { ORG_TYPES } from "@/lib/assessment";

export const Route = createFileRoute("/organizacoes")({
  head: () => ({
    meta: [
      { title: "Organizações — IA-MIA GOV" },
      { name: "description", content: "Cadastre e gerencie as organizações públicas avaliadas." },
    ],
  }),
  component: OrganizacoesPage,
});

function OrganizacoesPage() {
  const qc = useQueryClient();
  const { data: orgs, isLoading } = useQuery({ queryKey: ["organizations"], queryFn: listOrganizations });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parent, setParent] = useState<string>("");

  const create = useMutation({
    mutationFn: () => createOrganization({ name: name.trim(), parent_body: parent || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organização cadastrada.");
      setOpen(false); setName(""); setParent("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organização removida.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Organizações</h1>
          <p className="text-muted-foreground">Órgãos e entidades públicas avaliadas.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Nova organização</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova organização</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Nome da organização</Label>
                <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Secretaria Municipal de Inovação" maxLength={160} />
              </div>
              <div className="space-y-2">
                <Label>Órgão superior / esfera</Label>
                <Select value={parent} onValueChange={setParent}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {ORG_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button disabled={!name.trim() || create.isPending} onClick={() => create.mutate()}>
                Cadastrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : orgs && orgs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((o) => (
            <Card key={o.id} className="shadow-card">
              <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle className="text-base">{o.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{o.parent_body ?? "—"}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove.mutate(o.id)}
                  aria-label="Remover">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Cadastrada em {new Date(o.created_at).toLocaleDateString("pt-BR")}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma organização cadastrada ainda.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
