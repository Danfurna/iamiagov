import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft, Plus, Trash2, Link2, Copy, CheckCircle2, Clock, Settings, Users, BarChart3, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  getCampaign, listOrganizations, listRespondents, listResponsesForCampaign,
  createRespondent, deleteRespondent, updateCampaign, shareLink, type Respondent, type Campaign,
} from "@/lib/api";
import { CAMPAIGN_STATUS, DIMENSIONS, EQUAL_WEIGHT, RESPONDENT_PROFILES } from "@/lib/assessment";
import { CampaignAnalysis } from "@/components/CampaignAnalysis";
import { statusBadge } from "./campanhas";

export const Route = createFileRoute("/campanha/$campaignId")({
  component: CampaignDetail,
});

function CampaignDetail() {
  const { campaignId } = Route.useParams();
  const qc = useQueryClient();

  const { data: campaign, isLoading } = useQuery({ queryKey: ["campaign", campaignId], queryFn: () => getCampaign(campaignId) });
  const { data: orgs } = useQuery({ queryKey: ["organizations"], queryFn: listOrganizations });
  const { data: respondents } = useQuery({ queryKey: ["respondents", campaignId], queryFn: () => listRespondents(campaignId) });
  const { data: responses } = useQuery({ queryKey: ["responses", campaignId], queryFn: () => listResponsesForCampaign(campaignId), enabled: !!campaign });

  if (isLoading || !campaign) return <p className="text-muted-foreground">Carregando…</p>;
  const org = orgs?.find((o) => o.id === campaign.organization_id) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-1">
            <Link to="/campanhas"><ArrowLeft className="h-4 w-4" /> Campanhas</Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            {statusBadge(campaign.status)}
          </div>
          <p className="text-muted-foreground">{org?.name}</p>
        </div>
      </div>

      <Tabs defaultValue="respondentes">
        <TabsList>
          <TabsTrigger value="respondentes"><Users className="mr-1.5 h-4 w-4" /> Respondentes</TabsTrigger>
          <TabsTrigger value="analise"><BarChart3 className="mr-1.5 h-4 w-4" /> Análise</TabsTrigger>
          <TabsTrigger value="config"><Settings className="mr-1.5 h-4 w-4" /> Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="respondentes" className="mt-6">
          <RespondentsTab campaignId={campaignId} shareToken={campaign.share_token} respondents={respondents ?? []} />
        </TabsContent>
        <TabsContent value="analise" className="mt-6">
          <CampaignAnalysis campaign={campaign} organization={org} respondents={respondents ?? []} responses={responses ?? []} />
        </TabsContent>
        <TabsContent value="config" className="mt-6">
          <ConfigTab campaign={campaign} onSaved={() => qc.invalidateQueries({ queryKey: ["campaign", campaignId] })} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RespondentsTab({ campaignId, shareToken, respondents }: {
  campaignId: string; shareToken: string; respondents: Respondent[];
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", organizational_unit: "", job_title: "", respondent_profile: "" });
  const link = shareLink(shareToken);

  const create = useMutation({
    mutationFn: () => createRespondent({
      campaign_id: campaignId, name: form.name.trim(), email: form.email || null,
      organizational_unit: form.organizational_unit || null, job_title: form.job_title || null,
      respondent_profile: form.respondent_profile || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["respondents", campaignId] });
      toast.success("Respondente adicionado.");
      setOpen(false);
      setForm({ name: "", email: "", organizational_unit: "", job_title: "", respondent_profile: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRespondent(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["respondents", campaignId] }); toast.success("Removido."); },
  });

  const copy = () => { navigator.clipboard.writeText(link); toast.success("Link copiado!"); };

  return (
    <div className="space-y-5">
      <Card className="shadow-card">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Link2 className="h-4 w-4" /> Link compartilhável</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Input readOnly value={link} className="max-w-xl font-mono text-xs" />
          <Button variant="secondary" size="sm" onClick={copy}><Copy className="h-4 w-4" /> Copiar</Button>
          <Button asChild variant="outline" size="sm"><a href={link} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Abrir</a></Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{respondents.length} respondente(s) · {respondents.filter((r) => r.submitted).length} concluído(s)</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" /> Adicionar</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo respondente</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Field label="Nome"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={160} /></Field>
              <Field label="E-mail institucional"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={200} /></Field>
              <Field label="Unidade organizacional"><Input value={form.organizational_unit} onChange={(e) => setForm({ ...form, organizational_unit: e.target.value })} maxLength={160} placeholder="Ex.: Diretoria de TI" /></Field>
              <Field label="Cargo"><Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} maxLength={120} /></Field>
              <Field label="Perfil">
                <Select value={form.respondent_profile} onValueChange={(v) => setForm({ ...form, respondent_profile: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{RESPONDENT_PROFILES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <DialogFooter><Button disabled={!form.name.trim() || create.isPending} onClick={() => create.mutate()}>Adicionar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {respondents.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-10 text-center text-muted-foreground">Nenhum respondente. Compartilhe o link ou adicione manualmente.</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {respondents.map((r) => (
            <Card key={r.id} className="shadow-card">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{r.name}</span>
                    {r.submitted
                      ? <Badge className="bg-success text-success-foreground"><CheckCircle2 className="mr-1 h-3 w-3" /> Concluído</Badge>
                      : <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Pendente</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {[r.respondent_profile, r.organizational_unit].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button asChild variant="ghost" size="sm"><a href={`${shareLink(shareToken)}?r=${r.id}`} target="_blank" rel="noreferrer">Responder</a></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove.mutate(r.id)} aria-label="Remover"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfigTab({ campaign, onSaved }: { campaign: Campaign; onSaved: () => void }) {
  const [status, setStatus] = useState(campaign.status);
  const [method, setMethod] = useState(campaign.calc_method);
  const [weights, setWeights] = useState<Record<string, number>>(
    campaign.weights ?? Object.fromEntries(DIMENSIONS.map((d) => [d.key, Number(EQUAL_WEIGHT.toFixed(2))])),
  );

  const totalWeight = Object.values(weights).reduce((s, v) => s + (v || 0), 0);
  const weightOk = Math.abs(totalWeight - 100) < 0.5;

  const save = useMutation({
    mutationFn: () => updateCampaign(campaign.id, {
      status, calc_method: method, weights: method === "weighted" ? weights : null,
    }),
    onSuccess: () => { toast.success("Configurações salvas."); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Status da campanha</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CAMPAIGN_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Defina como "Aberta" para receber respostas e "Encerrada" ao concluir a coleta.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Método de cálculo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Média simples (14,29% por dimensão)</SelectItem>
              <SelectItem value="weighted">Média ponderada (pesos personalizados)</SelectItem>
            </SelectContent>
          </Select>

          {method === "weighted" && (
            <div className="space-y-3">
              {DIMENSIONS.map((d) => (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="flex-1 text-sm">{d.name}</span>
                  <Input type="number" min={0} max={100} step={0.5} value={weights[d.key] ?? 0}
                    onChange={(e) => setWeights((w) => ({ ...w, [d.key]: Number(e.target.value) }))}
                    className="w-24" />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              ))}
              <p className={`text-sm font-medium ${weightOk ? "text-success" : "text-destructive"}`}>
                Total: {totalWeight.toFixed(1)}% {weightOk ? "✓" : "(deve somar 100%)"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Button disabled={save.isPending || (method === "weighted" && !weightOk)} onClick={() => save.mutate()}>
          Salvar configurações
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
