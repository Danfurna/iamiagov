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

export const CONSENT_VERSION = "2026-09-20-v1";

export const GLOSSARY = [
  ["Iniciativas de IA", "Projetos, ações, experimentações ou outras atividades institucionais relacionadas ao desenvolvimento, adoção ou uso de IA."],
  ["Soluções de IA", "Sistemas, aplicações, ferramentas ou serviços que utilizam Inteligência Artificial."],
  ["Governança de IA", "Estruturas, responsabilidades e mecanismos utilizados para orientar, acompanhar e controlar o uso institucional de IA."],
  ["Controle sobre os dados", "Conjunto de regras e mecanismos utilizados para definir e acompanhar como os dados podem ser acessados, utilizados, alterados e compartilhados no contexto das soluções de IA."],
  ["Uso ético dos dados", "Utilização dos dados de forma compatível com sua finalidade institucional e com respeito aos direitos das pessoas, evitando usos indevidos ou discriminatórios."],
  ["Viés em IA", "Tendência de uma solução de IA produzir resultados injustos, tendenciosos ou discriminatórios."],
  ["Tratamento dos riscos", "Definição e adoção de medidas para responder aos riscos identificados, podendo envolver sua redução, prevenção, compartilhamento ou aceitação, conforme o caso."],
  ["Supervisão humana", "Possibilidade de pessoas acompanharem, revisarem ou intervirem no uso ou nos resultados de soluções de IA."],
  ["Responsabilização", "Dever de responder institucionalmente pelo uso de soluções de IA e por suas consequências."],
  ["Força de trabalho", "Conjunto de servidores, empregados, colaboradores e demais profissionais que atuam na organização pública."],
] as const;

export const DIMENSIONS: Dimension[] = [
  {
    key: "estrategia",
    index: 1,
    name: "Estratégia e Governança",
    short: "Estratégia",
    questions: [
      { key: "estrategia_1", text: "A organização pública possui uma estratégia institucional que orienta o uso de IA." },
      { key: "estrategia_2", text: "A organização pública possui uma instância formal responsável pela governança das iniciativas de IA." },
      { key: "estrategia_3", text: "A organização pública estabelece as responsabilidades de suas unidades organizacionais no uso institucional de IA." },
      { key: "estrategia_4", text: "A organização pública possui procedimento definido para a aprovação de iniciativas de IA antes de sua implementação." },
      { key: "estrategia_5", text: "As iniciativas de IA estão alinhadas aos objetivos estratégicos da organização pública." },
    ],
  },
  {
    key: "riscos",
    index: 2,
    name: "Gestão de Riscos",
    short: "Riscos",
    questions: [
      { key: "riscos_1", text: "A organização pública avalia os riscos associados às iniciativas de IA antes de sua implementação." },
      { key: "riscos_2", text: "A organização pública adota mecanismos para reduzir vieses nas soluções de IA." },
      { key: "riscos_3", text: "A organização pública adota procedimentos para o tratamento dos riscos associados às iniciativas de IA." },
      { key: "riscos_4", text: "A organização pública monitora os riscos das soluções de IA após a implementação." },
      { key: "riscos_5", text: "A organização pública incorpora os riscos de segurança da informação à gestão de riscos das iniciativas de IA." },
    ],
  },
  {
    key: "dados",
    index: 3,
    name: "Dados e Informação",
    short: "Dados",
    questions: [
      { key: "dados_1", text: "A organização pública possui mecanismos de controle sobre os dados utilizados em soluções de IA." },
      { key: "dados_2", text: "A organização pública adota medidas de proteção de dados pessoais no uso de soluções de IA, observada a Lei Geral de Proteção de Dados (LGPD)." },
      { key: "dados_3", text: "A organização pública possui mecanismos de rastreabilidade dos dados utilizados em soluções de IA desde a origem até o uso." },
      { key: "dados_4", text: "A organização pública adota mecanismos para assegurar a qualidade dos dados utilizados em soluções de IA." },
      { key: "dados_5", text: "A organização pública adota práticas para promover o uso ético dos dados em soluções de IA." },
    ],
  },
  {
    key: "transparencia",
    index: 4,
    name: "Transparência e Accountability",
    short: "Transparência",
    questions: [
      { key: "transparencia_1", text: "A organização pública adota mecanismos que permitem compreender como as soluções de IA geram os resultados utilizados na tomada de decisões." },
      { key: "transparencia_2", text: "A organização pública adota mecanismos de supervisão humana no uso de soluções de IA." },
      { key: "transparencia_3", text: "A organização pública estabelece mecanismos de responsabilização pelo uso de soluções de IA." },
      { key: "transparencia_4", text: "A organização pública realiza avaliações periódicas das soluções de IA em uso." },
      { key: "transparencia_5", text: "A organização pública divulga, de forma transparente, informações sobre as soluções de IA em uso aos públicos interessados." },
    ],
  },
  {
    key: "pessoas",
    index: 5,
    name: "Pessoas e Capacidades",
    short: "Pessoas",
    questions: [
      { key: "pessoas_1", text: "A organização pública promove a capacitação de sua força de trabalho para o uso responsável de IA." },
      { key: "pessoas_2", text: "A organização pública promove a conscientização de sua força de trabalho sobre as limitações das soluções de IA." },
      { key: "pessoas_3", text: "A organização pública promove o desenvolvimento contínuo de competências técnicas em IA entre os profissionais que atuam com essa tecnologia." },
      { key: "pessoas_4", text: "A organização pública dispõe de profissionais com competências técnicas em IA para apoiar suas iniciativas de IA." },
      { key: "pessoas_5", text: "A cultura da organização pública incentiva a experimentação com IA." },
    ],
  },
  {
    key: "tecnologia",
    index: 6,
    name: "Tecnologia e Infraestrutura",
    short: "Tecnologia",
    questions: [
      { key: "tecnologia_1", text: "A organização pública dispõe de infraestrutura tecnológica capaz de dar suporte ao uso de soluções de IA." },
      { key: "tecnologia_2", text: "A organização pública possui capacidade para integrar soluções de IA aos seus sistemas institucionais." },
      { key: "tecnologia_3", text: "A organização pública adota controles de segurança da informação aplicáveis às soluções de IA." },
      { key: "tecnologia_4", text: "A equipe de TI da organização pública possui capacidade técnica para manter as soluções de IA em funcionamento." },
      { key: "tecnologia_5", text: "A infraestrutura tecnológica da organização pública permite ampliar o uso das soluções de IA conforme a demanda." },
    ],
  },
  {
    key: "recursos",
    index: 7,
    name: "Recursos e Implementação",
    short: "Recursos",
    questions: [
      { key: "recursos_1", text: "A organização pública dispõe de recursos orçamentários para financiar iniciativas de IA." },
      { key: "recursos_2", text: "A organização pública verifica, antes da contratação, se as soluções de IA atendem aos requisitos previamente definidos." },
      { key: "recursos_3", text: "A organização pública formaliza requisitos específicos para soluções de IA em seus instrumentos de contratação." },
      { key: "recursos_4", text: "A organização pública avalia o desempenho dos fornecedores de soluções de IA durante a execução contratual." },
      { key: "recursos_5", text: "A organização pública possui capacidade institucional para dar continuidade às iniciativas de IA ao longo do tempo." },
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
