import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Megaphone, Plus, ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  createCampaign, deleteCampaign, listCampaigns, listOrganizations, type Campaign,
} from "@/lib/api";
import { CAMPAIGN_STATUS } from "@/lib/assessment";

export const Route = createFileRoute("/campanhas")({
  head: () => ({
    meta: [
      { title: "Campanhas — IAMIA-GOV" },
      { name: "description", content: "Crie e gerencie campanhas de avaliação multirrespondente." },
      { property: "og:title", content: "Campanhas — IAMIA-GOV" },
      { property: "og:description", content: "Crie e gerencie campanhas de avaliação multirrespondente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CampanhasPage,
});

export function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    rascunho: { label: "Rascunho", cls: "bg-muted text-muted-foreground" },
    aberta: { label: "Aberta", cls: "bg-success text-success-foreground" },
    encerrada: { label: "Encerrada", cls: "bg-primary text-primary-foreground" },
  };
  const s = map[status] ?? map.rascunho;
  return <Badge className={s.cls}>{s.label}</Badge>;
}

function CampanhasPage() {
  const qc = useQueryClient();
  const { data: campaigns, isLoading } = useQuery({ queryKey: ["campaigns"], queryFn: listCampaigns });
  const { data: orgs } = useQuery({ queryKey: ["organizations"], queryFn: listOrganizations });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ organization_id: "", name: "", description: "", start_date: "", end_date: "", status: "rascunho" });

  const orgName = (id: string) => orgs?.find((o) => o.id === id)?.name ?? "—";

  const create = useMutation({
    mutationFn: () =>
      createCampaign({
        organization_id: form.organization_id,
        name: form.name.trim(),
        description: form.description || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: form.status,
      } as Partial<Campaign> & { organization_id: string; name: string }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campanha criada.");
      setOpen(false);
      setForm({ organization_id: "", name: "", description: "", start_date: "", end_date: "", status: "rascunho" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campaigns"] }); toast.success("Campanha removida."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const noOrgs = !orgs || orgs.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Campanhas</h1>
          <p className="text-muted-foreground">Avaliações institucionais multirrespondente.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={noOrgs}><Plus className="h-4 w-4" /> Nova campanha</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova campanha</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Organização</Label>
                <Select value={form.organization_id} onValueChange={(v) => setForm({ ...form, organization_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {orgs?.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex.: Diagnóstico IA 2026" maxLength={160} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} maxLength={500} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button disabled={!form.organization_id || !form.name.trim() || create.isPending} onClick={() => create.mutate()}>
                Criar campanha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {noOrgs && (
        <Card className="shadow-card">
          <CardContent className="py-8 text-center text-muted-foreground">
            Cadastre uma <Link to="/organizacoes" className="text-primary underline">organização</Link> antes de criar campanhas.
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {campaigns.map((c) => (
            <Card key={c.id} className="shadow-card transition-shadow hover:shadow-elegant">
              <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Megaphone className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{orgName(c.organization_id)}</p>
                  </div>
                </div>
                {statusBadge(c.status)}
              </CardHeader>
              <CardContent className="space-y-3">
                {c.description && <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                <div className="flex items-center justify-between">
                  <Button size="icon" variant="ghost" onClick={() => remove.mutate(c.id)} aria-label="Remover">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/campanha/$campaignId" params={{ campaignId: c.id }}>
                      Gerenciar <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !noOrgs ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">Nenhuma campanha criada ainda.</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
