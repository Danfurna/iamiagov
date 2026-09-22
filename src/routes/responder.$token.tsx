import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BrainCircuit, Check, ChevronLeft, ChevronRight, Clock3, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Glossary } from "@/components/Glossary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getCampaignByToken,
  getRespondent,
  createRespondent,
  updateRespondent,
  listResponsesForRespondent,
  upsertResponse,
  upsertEvidence,
  listEvidences,
  type Respondent,
} from "@/lib/api";
import { CONSENT_VERSION, DIMENSIONS, RESPONDENT_PROFILES, SCALE_LABELS, TOTAL_QUESTIONS } from "@/lib/assessment";

export const Route = createFileRoute("/responder/$token")({
  validateSearch: (s: Record<string, unknown>): { r?: string } => ({ r: typeof s.r === "string" ? s.r : undefined }),
  head: () => ({
    meta: [
      { title: "Responder avaliação — IAMIA-GOV" },
      {
        name: "description",
        content: "Questionário de avaliação da maturidade institucional em Inteligência Artificial.",
      },
      { property: "og:title", content: "Responder avaliação — IAMIA-GOV" },
      {
        property: "og:description",
        content: "Questionário de avaliação da maturidade institucional em Inteligência Artificial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RespondPage,
});

function RespondPage() {
  const { token } = Route.useParams();
  const { r: respondentId } = useSearch({ from: "/responder/$token" });
  const {
    data: campaign,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["campaign-token", token],
    queryFn: () => getCampaignByToken(token),
  });

  if (isLoading)
    return (
      <Centered>
        <Loader2 className="h-6 w-6 animate-spin" />
      </Centered>
    );
  if (error || !campaign)
    return (
      <Centered>
        <p className="text-muted-foreground">Campanha não encontrada.</p>
      </Centered>
    );
  if (campaign.status === "encerrada")
    return (
      <Centered>
        <p className="text-muted-foreground">Esta campanha está encerrada e não aceita novas respostas.</p>
      </Centered>
    );

  return (
    <Questionnaire
      token={token}
      campaignName={campaign.name}
      initialRespondentId={respondentId}
      campaignId={campaign.id}
    />
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4">{children}</div>;
}

function Questionnaire({
  token,
  campaignName,
  initialRespondentId,
  campaignId,
}: {
  token: string;
  campaignName: string;
  initialRespondentId?: string;
  campaignId: string;
}) {
  const qc = useQueryClient();
  const [respondentId, setRespondentId] = useState<string | undefined>(initialRespondentId);
  const [identForm, setIdentForm] = useState({
    name: "",
    email: "",
    organizational_unit: "",
    job_title: "",
    respondent_profile: "",
  });
  const [consent, setConsent] = useState(false);

  const { data: existingResp } = useQuery({
    queryKey: ["respondent", respondentId],
    queryFn: () => {
      if (!respondentId) throw new Error("Respondente não identificado.");
      return getRespondent(respondentId);
    },
    enabled: !!respondentId,
  });

  const startResp = useMutation({
    mutationFn: () =>
      createRespondent({
        campaign_id: campaignId,
        name: identForm.name.trim(),
        email: identForm.email || null,
        organizational_unit: identForm.organizational_unit || null,
        job_title: identForm.job_title || null,
        respondent_profile: identForm.respondent_profile || null,
        consent_accepted: true,
        consented_at: new Date().toISOString(),
        consent_version: CONSENT_VERSION,
      }),
    onSuccess: (r) => setRespondentId(r.id),
    onError: () =>
      toast.error("Não foi possível salvar seus dados e o consentimento. Revise as informações e tente novamente."),
  });

  const emailIsValid = !identForm.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identForm.email);
  const canStart = consent && !!identForm.name.trim() && !!identForm.respondent_profile && emailIsValid;

  if (!respondentId) {
    return (
      <div className="min-h-screen bg-background">
        <Header campaignName={campaignName} />
        <form
          className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:py-10"
          onSubmit={(event) => {
            event.preventDefault();
            if (canStart) startResp.mutate();
          }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>
                <h1 className="text-xl">1. Sobre esta pesquisa</h1>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                O IAMIA-GOV avalia a maturidade institucional da organização para o uso de Inteligência Artificial. Esta
                aplicação integra uma dissertação do Mestrado Profissional em Administração Pública da Universidade de
                Brasília.
              </p>
              <p>
                A participação é voluntária e pode ser interrompida a qualquer momento. As respostas serão analisadas de
                forma agregada e tratadas de modo a não permitir a identificação individual dos participantes no relato
                dos resultados. As informações serão utilizadas exclusivamente para fins acadêmicos.
              </p>
              <div className="flex items-start gap-3 rounded-md border bg-secondary/40 p-4">
                <Checkbox
                  id="research-consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked === true)}
                  aria-required="true"
                />
                <Label htmlFor="research-consent" className="cursor-pointer leading-relaxed text-foreground">
                  Li as informações apresentadas e concordo voluntariamente em participar da pesquisa.
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>
                <h2 className="text-xl">2. Identificação do respondente</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Preencha os dados abaixo para iniciar a avaliação institucional. Essas informações serão utilizadas
                apenas para caracterizar e organizar a participação na pesquisa e não serão apresentadas de forma
                individual nos resultados.
              </p>
              <Field label="Nome">
                <Input
                  required
                  value={identForm.name}
                  onChange={(e) => setIdentForm({ ...identForm, name: e.target.value })}
                  maxLength={160}
                />
              </Field>
              <Field label="E-mail institucional">
                <Input
                  type="email"
                  value={identForm.email}
                  onChange={(e) => setIdentForm({ ...identForm, email: e.target.value })}
                  maxLength={200}
                  aria-invalid={!emailIsValid}
                />
              </Field>
              {!emailIsValid && (
                <p role="alert" className="text-sm text-destructive">
                  Informe um e-mail válido.
                </p>
              )}
              <Field label="Unidade organizacional">
                <Input
                  value={identForm.organizational_unit}
                  onChange={(e) => setIdentForm({ ...identForm, organizational_unit: e.target.value })}
                  maxLength={160}
                  placeholder="Ex.: Diretoria de TI"
                />
              </Field>
              <Field label="Cargo">
                <Input
                  value={identForm.job_title}
                  onChange={(e) => setIdentForm({ ...identForm, job_title: e.target.value })}
                  maxLength={120}
                />
              </Field>
              <Field label="Perfil">
                <Select
                  required
                  value={identForm.respondent_profile}
                  onValueChange={(v) => setIdentForm({ ...identForm, respondent_profile: v })}
                >
                  <SelectTrigger aria-label="Perfil">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESPONDENT_PROFILES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>
                <h2 className="text-xl">3. Como responder</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <div className="flex items-start gap-2 font-medium text-foreground">
                <Clock3 className="mt-1 h-4 w-4 shrink-0" />
                <p>
                  <span className="block">
                    O instrumento contém 35 afirmações, distribuídas em sete dimensões.
                    <strong className="mt-2 block font-bold text-primary">
                      Para cada afirmação, selecione uma opção de 1 a 5, de acordo com o quanto a situação descrita
                      representa a realidade atual da organização pública.
                    </strong>
                  </span>
                  <span className="mt-4 block">
                    Utilize a escala apresentada abaixo, em que 1 significa que a prática, capacidade ou estrutura descrita
                    não existe na organização e 5 significa que ela existe plenamente e é monitorada. Os valores
                    intermediários representam diferentes níveis de desenvolvimento e institucionalização.
                  </span>
                  <span className="mt-4 block">O preenchimento leva aproximadamente 15 minutos.</span>
                </p>
              </div>
              <p>
                Responda com base na sua percepção sobre a organização pública como um todo, e não apenas sobre sua
                unidade de atuação.
              </p>
              <p>
                Não é necessário consultar documentos durante o preenchimento. Caso não tenha certeza sobre alguma
                afirmação, escolha a opção que mais se aproxima do que você conhece sobre a organização pública.
              </p>
              <p>
                Não há resposta certa ou errada. O objetivo não é avaliar pessoas, unidades ou áreas específicas, mas
                identificar o estágio de maturidade institucional da organização pública para o uso de Inteligência
                Artificial.
              </p>
              <p>
                Alguns termos técnicos utilizados nas afirmações estão definidos no glossário, localizado no topo de
                cada página, que poderá ser consultado a qualquer momento durante o preenchimento.
              </p>
              <div className="pt-1">
                <h3 className="font-display text-base font-semibold text-foreground">Como avaliar cada afirmação</h3>
                <ol className="mt-3 grid gap-2 sm:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <li key={value} className="rounded-md border bg-muted/40 p-3">
                      <span className="block font-display text-lg font-bold text-primary">{value}</span>
                      <span className="text-xs leading-relaxed text-foreground">{SCALE_LABELS[value]}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="rounded-md border-l-4 border-primary bg-secondary/40 p-4 text-foreground">
                Se a organização pública ainda não utiliza soluções de IA, avalie cada afirmação considerando as
                práticas, capacidades e estruturas institucionais atualmente existentes ou em preparação.
              </p>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={!canStart || startResp.isPending}>
            {startResp.isPending && <Loader2 className="animate-spin" />}
            Iniciar avaliação
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Form
      respondentId={respondentId}
      respondent={existingResp}
      campaignName={campaignName}
      onSubmitted={() => qc.invalidateQueries({ queryKey: ["respondents", campaignId] })}
    />
  );
}

function Form({
  respondentId,
  respondent,
  campaignName,
  onSubmitted,
}: {
  respondentId: string;
  respondent?: Respondent;
  campaignName: string;
  onSubmitted: () => void;
}) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(respondent?.submitted ?? false);
  const evidenceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const { data: savedResponses } = useQuery({
    queryKey: ["responses-resp", respondentId],
    queryFn: () => listResponsesForRespondent(respondentId),
  });
  const { data: savedEvidences } = useQuery({
    queryKey: ["evidences-resp", respondentId],
    queryFn: () => listEvidences(respondentId),
  });

  useEffect(() => {
    if (savedResponses) setScores(Object.fromEntries(savedResponses.map((r) => [r.question_key, r.score])));
  }, [savedResponses]);
  useEffect(() => {
    if (savedEvidences) setEvidence(Object.fromEntries(savedEvidences.map((e) => [e.dimension_key, e.evidence_text])));
  }, [savedEvidences]);

  const answered = Object.keys(scores).length;
  const progress = (answered / TOTAL_QUESTIONS) * 100;
  const dim = DIMENSIONS[step];

  const setScore = async (dimensionKey: string, questionKey: string, score: number) => {
    setScores((s) => ({ ...s, [questionKey]: score }));
    setSaving(true);
    try {
      await upsertResponse({
        respondent_id: respondentId,
        dimension_key: dimensionKey,
        question_key: questionKey,
        score,
      });
    } catch (e) {
      toast.error("Falha ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const setEvid = (dimensionKey: string, text: string) => {
    setEvidence((e) => ({ ...e, [dimensionKey]: text }));
    clearTimeout(evidenceTimers.current[dimensionKey]);
    evidenceTimers.current[dimensionKey] = setTimeout(() => {
      upsertEvidence({ respondent_id: respondentId, dimension_key: dimensionKey, evidence_text: text }).catch(() => {});
    }, 800);
  };

  const submit = async () => {
    if (answered < TOTAL_QUESTIONS) {
      toast.error("Responda todas as 35 afirmações antes de enviar.");
      return;
    }
    await updateRespondent(respondentId, { submitted: true });
    setSubmitted(true);
    onSubmitted();
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header campaignName={campaignName} />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground">
            <Check className="h-8 w-8" />
          </span>
          <h2 className="mt-6 text-2xl font-bold">Avaliação enviada!</h2>
          <p className="mt-2 text-muted-foreground">
            Obrigado por contribuir com o diagnóstico institucional de maturidade em IA. Suas respostas foram
            registradas e consolidadas com segurança.
          </p>
        </div>
      </div>
    );
  }

  const dimAnswered = dim.questions.filter((q) => scores[q.key] != null).length;

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header campaignName={campaignName} />
      <div className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {answered} de {TOTAL_QUESTIONS} respondidas
            </span>
            <span className="flex items-center gap-1">
              {saving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Salvando…
                </>
              ) : (
                <>
                  <Save className="h-3 w-3" /> Salvo automaticamente
                </>
              )}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-accent">
            Dimensão {dim.index} de {DIMENSIONS.length}
          </p>
          <h2 className="text-2xl font-bold">{dim.name}</h2>
          <p className="text-sm text-muted-foreground">
            {dimAnswered} de {dim.questions.length} afirmações respondidas
          </p>
        </div>

        <div className="space-y-5">
          {dim.questions.map((q, i) => (
            <Card key={q.key} className="shadow-card">
              <CardContent className="p-5">
                <p className="font-medium">
                  {i + 1}. {q.text}
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((v) => {
                    const active = scores[q.key] === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setScore(dim.key, q.key, v)}
                        className={`rounded-lg border p-2.5 text-left text-xs transition-colors ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-primary hover:bg-secondary"
                        }`}
                      >
                        <span className="block text-base font-bold">{v}</span>
                        <span className="block leading-tight">{SCALE_LABELS[v]}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="shadow-card">
            <CardContent className="p-5">
              <Label className="text-sm">Evidências (opcional)</Label>
              <Textarea
                className="mt-2"
                rows={3}
                maxLength={1000}
                placeholder="Cite documentos, normativos, sistemas ou práticas que sustentam suas respostas nesta dimensão."
                value={evidence[dim.key] ?? ""}
                onChange={(e) => setEvid(dim.key, e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Nav footer */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <div className="flex gap-1">
            {DIMENSIONS.map((d, i) => (
              <button
                key={d.key}
                onClick={() => setStep(i)}
                className={`h-2 w-2 rounded-full ${i === step ? "bg-primary" : d.questions.every((q) => scores[q.key] != null) ? "bg-success" : "bg-muted"}`}
                aria-label={d.name}
              />
            ))}
          </div>
          {step < DIMENSIONS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Próxima <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="success" onClick={submit}>
              Enviar avaliação <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({ campaignName }: { campaignName: string }) {
  return (
    <header className="border-b bg-hero text-primary-foreground">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrainCircuit className="h-6 w-6 shrink-0" />
          <div className="min-w-0">
            <p className="font-display font-bold leading-tight">IAMIA-GOV</p>
            <p className="truncate text-xs text-primary-foreground/80">{campaignName}</p>
          </div>
        </div>
        <Glossary />
      </div>
    </header>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
