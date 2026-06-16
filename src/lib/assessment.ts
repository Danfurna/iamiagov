// Modelo de avaliação IAMIA-GOV — 7 dimensões, 5 questões cada (35 questões).

export interface Question {
  key: string;
  text: string;
}

export interface Dimension {
  key: string;
  index: number;
  name: string;
  short: string;
  questions: Question[];
}

export const SCALE_LABELS: Record<number, string> = {
  1: "Não existe",
  2: "Existe de forma inicial ou informal",
  3: "Existe parcialmente",
  4: "Existe formalmente",
  5: "Existe plenamente e é monitorado",
};

export const DIMENSIONS: Dimension[] = [
  {
    key: "estrategia",
    index: 1,
    name: "Estratégia e Governança",
    short: "Estratégia",
    questions: [
      { key: "estrategia_1", text: "Existe estratégia institucional relacionada à IA?" },
      { key: "estrategia_2", text: "A alta administração apoia iniciativas de IA?" },
      { key: "estrategia_3", text: "Existem responsabilidades formais para governança da IA?" },
      { key: "estrategia_4", text: "A IA está alinhada ao planejamento estratégico?" },
      { key: "estrategia_5", text: "Existe comitê ou instância de governança para IA?" },
    ],
  },
  {
    key: "riscos",
    index: 2,
    name: "Gestão de Riscos",
    short: "Riscos",
    questions: [
      { key: "riscos_1", text: "Existem procedimentos para identificar riscos associados à IA?" },
      { key: "riscos_2", text: "São avaliados impactos éticos e regulatórios?" },
      { key: "riscos_3", text: "Existe processo de tratamento de riscos?" },
      { key: "riscos_4", text: "Os riscos são monitorados continuamente?" },
      { key: "riscos_5", text: "Existe plano de resposta para incidentes envolvendo IA?" },
    ],
  },
  {
    key: "dados",
    index: 3,
    name: "Dados e Informação",
    short: "Dados",
    questions: [
      { key: "dados_1", text: "Existe governança de dados?" },
      { key: "dados_2", text: "Os dados possuem qualidade adequada?" },
      { key: "dados_3", text: "Existe inventário de ativos de dados?" },
      { key: "dados_4", text: "Há interoperabilidade de dados?" },
      { key: "dados_5", text: "Há conformidade com a LGPD?" },
    ],
  },
  {
    key: "transparencia",
    index: 4,
    name: "Transparência e Accountability",
    short: "Transparência",
    questions: [
      { key: "transparencia_1", text: "Sistemas de IA são explicáveis?" },
      { key: "transparencia_2", text: "Existe supervisão humana?" },
      { key: "transparencia_3", text: "Existem mecanismos de responsabilização?" },
      { key: "transparencia_4", text: "Usuários são informados sobre o uso de IA?" },
      { key: "transparencia_5", text: "Existem critérios de transparência para IA?" },
    ],
  },
  {
    key: "pessoas",
    index: 5,
    name: "Pessoas e Capacidades",
    short: "Pessoas",
    questions: [
      { key: "pessoas_1", text: "Existem ações de capacitação em IA?" },
      { key: "pessoas_2", text: "Há profissionais qualificados?" },
      { key: "pessoas_3", text: "Existe cultura de inovação?" },
      { key: "pessoas_4", text: "Há incentivo à experimentação?" },
      { key: "pessoas_5", text: "Os gestores compreendem IA?" },
    ],
  },
  {
    key: "tecnologia",
    index: 6,
    name: "Tecnologia e Infraestrutura",
    short: "Tecnologia",
    questions: [
      { key: "tecnologia_1", text: "A infraestrutura suporta IA?" },
      { key: "tecnologia_2", text: "Existem ambientes de desenvolvimento?" },
      { key: "tecnologia_3", text: "Há integração entre sistemas?" },
      { key: "tecnologia_4", text: "Existem ferramentas adequadas?" },
      { key: "tecnologia_5", text: "Há mecanismos de segurança?" },
    ],
  },
  {
    key: "recursos",
    index: 7,
    name: "Recursos e Implementação",
    short: "Recursos",
    questions: [
      { key: "recursos_1", text: "Existem recursos financeiros?" },
      { key: "recursos_2", text: "Há processo de seleção de projetos?" },
      { key: "recursos_3", text: "Resultados são monitorados?" },
      { key: "recursos_4", text: "Existem critérios de priorização?" },
      { key: "recursos_5", text: "Existe capacidade de escalabilidade?" },
    ],
  },
];

export const ALL_QUESTIONS: { dimension: Dimension; question: Question }[] =
  DIMENSIONS.flatMap((d) => d.questions.map((q) => ({ dimension: d, question: q })));

export const TOTAL_QUESTIONS = ALL_QUESTIONS.length; // 35
export const EQUAL_WEIGHT = 100 / DIMENSIONS.length; // 14.2857...

export const RESPONDENT_PROFILES = [
  "Alta Administração",
  "Gestor",
  "Especialista",
  "Analista Técnico",
  "Servidor Administrativo",
  "Outro",
] as const;

export const CAMPAIGN_STATUS = [
  { value: "rascunho", label: "Rascunho" },
  { value: "aberta", label: "Aberta" },
  { value: "encerrada", label: "Encerrada" },
] as const;

export const ORG_TYPES = [
  "Administração Pública Federal",
  "Administração Pública Estadual",
  "Administração Pública Municipal",
  "Instituição de Ensino Superior",
  "Agência Governamental",
  "Autarquia",
  "Fundação Pública",
] as const;
