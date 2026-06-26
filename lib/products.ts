

export type Feature = {
  title: string;
  body: string;

  icon: IconKey;
};

export type IconKey =
  | "bolt"
  | "chart"
  | "card"
  | "chat"
  | "cart"
  | "users"
  | "clock"
  | "shield"
  | "cloud"
  | "link"
  | "bell"
  | "sparkles";

export type Product = {
  slug: string;
  name: string;

  accent: string;

  category: string;

  keywords: string[];

  tagline: string;

  lead: string;

  short: string;

  problem: { title: string; body: string; bullets: string[] };
  solution: { title: string; body: string; bullets: string[] };

  features: Feature[];

  audience: string[];

  wordmark?: string;

  mark?: string;

  mockup?: string;

  gallery?: { src: string; caption: string; portrait?: boolean }[];

  steps: { label: string; title: string; body: string }[];

  ctaSubject?: string;
  ctaNote?: string;
};

export const products: Product[] = [
  {
    slug: "gourmetsa",
    name: "GourmetSA",
    accent: "#EC8A2D",
    category: "Gastronomia",
    keywords: ["Comanda", "Cozinha", "Estoque", "Delivery", "Caixa"],
    tagline: "O restaurante inteiro, em ritmo de serviço.",
    lead: "Gestão completa para restaurantes e food service — do salão à cozinha, do pedido ao fechamento de caixa.",
    short: "Gestão completa para restaurantes e food service.",
    audience: ["Restaurantes", "Bares e lanchonetes", "Food service e delivery", "Cafeterias"],
    wordmark: "/products/gourmetsa/wordmark.svg",
    mark: "/products/gourmetsa/logo-g.png",
    mockup: "/products/gourmetsa/mockup.webp",
    gallery: [
      { src: "/products/gourmetsa/gallery-1.webp", caption: "Mapa de mesas e comandas" },
      { src: "/products/gourmetsa/gallery-2.webp", caption: "Controle de mesas em tempo real" },
      { src: "/products/gourmetsa/gallery-3.webp", caption: "App do garçom no salão", portrait: true },
    ],
    problem: {
      title: "Comanda no papel trava o salão.",
      body: "Pedido perdido, cozinha sem fila clara, fechamento de caixa que não bate. O serviço para e a margem some no fim do mês.",
      bullets: [
        "Pedidos dispersos entre garçom e cozinha",
        "Estoque sem baixa automática",
        "Fechamento manual e demorado",
      ],
    },
    solution: {
      title: "Um fluxo só, do pedido ao prato.",
      body: "Comanda digital que sincroniza salão, cozinha e caixa em tempo real. A cozinha vê a fila; o caixa fecha em segundos.",
      bullets: [
        "Comanda digital sincronizada (KDS)",
        "Baixa de estoque por ficha técnica",
        "Fechamento e relatórios automáticos",
      ],
    },
    features: [
      { icon: "cart", title: "Comanda & KDS", body: "Pedido do garçom cai direto na tela da cozinha, com fila e tempo de preparo." },
      { icon: "chart", title: "Estoque por ficha técnica", body: "Cada prato baixa os insumos automaticamente. Você enxerga a margem real." },
      { icon: "card", title: "Caixa & fechamento", body: "Sangria, suprimento e fechamento de turno conferidos em segundos." },
      { icon: "users", title: "Salão & mesas", body: "Mapa de mesas, junção de comandas e divisão de conta sem dor de cabeça." },
      { icon: "clock", title: "Delivery integrado", body: "Pedidos de balcão e delivery no mesmo painel, sem retrabalho." },
      { icon: "chart", title: "Relatórios de venda", body: "Curva ABC de pratos, horários de pico e ticket médio por turno." },
    ],
    steps: [
      { label: "01", title: "Implantação", body: "Cadastramos cardápio, fichas técnicas e mesas com você." },
      { label: "02", title: "Treinamento", body: "Equipe de salão e cozinha operando em um turno." },
      { label: "03", title: "Operação", body: "Suporte local enquanto a casa roda no ritmo." },
    ],
  },
  {
    slug: "finances-web",
    name: "Finances Web",
    accent: "#46ABD2",
    category: "Finanças",
    keywords: ["Fluxo de caixa", "Conciliação", "Contas", "DRE", "Nuvem"],
    tagline: "O caixa da empresa, claro e na nuvem.",
    lead: "Controle financeiro e fluxo de caixa acessível de qualquer lugar — contas a pagar, a receber e conciliação sem planilha.",
    short: "Controle financeiro e fluxo de caixa na nuvem.",
    audience: ["Pequenas e médias empresas", "Comércio", "Prestadores de serviço", "Escritórios"],
    problem: {
      title: "A planilha não conta a verdade.",
      body: "Saldo que só aparece no fim do mês, conciliação manual e decisão tomada no escuro. O dinheiro entra e sai sem visão de fluxo.",
      bullets: [
        "Fluxo de caixa atrasado e manual",
        "Conciliação bancária no olho",
        "Sem visão de projeção",
      ],
    },
    solution: {
      title: "Fluxo de caixa em tempo real.",
      body: "Contas, bancos e categorias num painel só, com projeção de saldo e conciliação automática. Decisão com número na mão.",
      bullets: [
        "Contas a pagar e a receber",
        "Conciliação bancária automática",
        "Projeção de fluxo de caixa",
      ],
    },
    features: [
      { icon: "chart", title: "Fluxo de caixa", body: "Projeção diária de saldo com entradas e saídas previstas e realizadas." },
      { icon: "card", title: "Contas a pagar/receber", body: "Agendamento, recorrência e baixa automática por extrato." },
      { icon: "link", title: "Conciliação bancária", body: "Importe o extrato e concilie em lote — sem digitar lançamento por lançamento." },
      { icon: "cloud", title: "100% na nuvem", body: "Acesse de qualquer lugar, com backup e múltiplos usuários." },
      { icon: "shield", title: "Centros de custo", body: "Categorize por projeto, filial ou departamento e veja onde o dinheiro vai." },
      { icon: "chart", title: "Relatórios & DRE", body: "DRE gerencial e relatórios exportáveis para o contador." },
    ],
    steps: [
      { label: "01", title: "Conexão", body: "Cadastramos contas, bancos e plano de contas inicial." },
      { label: "02", title: "Importação", body: "Trazemos saldos e títulos em aberto da operação atual." },
      { label: "03", title: "Rotina", body: "Você acompanha o caixa diariamente, em qualquer tela." },
    ],
  },
  {
    slug: "pdv-mais",
    name: "PDV Plus",
    accent: "#2F5FB3",
    category: "Varejo",
    keywords: ["Venda rápida", "Fiscal", "Estoque", "Caixa", "Offline"],
    tagline: "O balcão que não deixa a fila parar.",
    lead: "Ponto de venda rápido para o caixa e o balcão — venda, emite o cupom fiscal e baixa estoque em um toque.",
    short: "Ponto de venda rápido para o balcão e o caixa.",
    audience: ["Lojas de varejo", "Mercados e mercearias", "Farmácias", "Lojas de conveniência"],
    problem: {
      title: "Fila grande é venda perdida.",
      body: "Caixa lento, busca de produto travada e fiscal complicado fazem o cliente desistir no balcão. Cada segundo na fila custa.",
      bullets: [
        "Atendimento lento no caixa",
        "Emissão fiscal complicada",
        "Estoque desencontrado da venda",
      ],
    },
    solution: {
      title: "Venda em segundos, fiscal no automático.",
      body: "PDV enxuto, busca instantânea, leitor de código e emissão fiscal integrada. O caixa anda e o estoque acompanha.",
      bullets: [
        "Venda rápida com leitor e atalhos",
        "Cupom fiscal (NFC-e/SAT) integrado",
        "Baixa de estoque em tempo real",
      ],
    },
    features: [
      { icon: "bolt", title: "Venda relâmpago", body: "Busca instantânea, atalhos de teclado e leitor de código de barras." },
      { icon: "card", title: "Fiscal integrado", body: "Emissão de NFC-e/SAT e formas de pagamento sem etapa extra." },
      { icon: "cart", title: "Estoque em tempo real", body: "Cada venda baixa o estoque na hora — sem ruptura surpresa." },
      { icon: "users", title: "Multioperador", body: "Vários caixas, controle de sangria e relatório por operador." },
      { icon: "chart", title: "Fechamento de caixa", body: "Conferência rápida de turno com sangria e suprimento." },
      { icon: "clock", title: "Funciona offline", body: "Continua vendendo na queda de internet e sincroniza depois." },
    ],
    steps: [
      { label: "01", title: "Configuração fiscal", body: "Ajustamos impostos, certificado e formas de pagamento." },
      { label: "02", title: "Cadastro", body: "Subimos produtos e códigos de barras da loja." },
      { label: "03", title: "Abertura", body: "Caixa treinado e vendendo no mesmo dia." },
    ],
  },
  {
    slug: "faloapp",
    name: "FaloApp",
    accent: "#1EA84E",
    category: "Comunicação",
    keywords: ["Inbox", "WhatsApp", "Filas", "SLA", "Histórico"],
    tagline: "Todo o atendimento da empresa numa conversa só.",
    lead: "Comunicação e atendimento integrados ao seu time — múltiplos canais, um histórico, respostas que não se perdem.",
    short: "Comunicação e atendimento integrados ao seu time.",
    audience: ["Times de atendimento", "E-commerce", "Clínicas e consultórios", "Suporte ao cliente"],
    problem: {
      title: "Mensagem espalhada some.",
      body: "WhatsApp num celular, e-mail noutro, ninguém sabe quem respondeu. O cliente repete a história e o time perde o contexto.",
      bullets: [
        "Canais soltos e sem histórico",
        "Atendimento sem dono claro",
        "Cliente esperando resposta",
      ],
    },
    solution: {
      title: "Uma caixa de entrada para o time todo.",
      body: "Todos os canais numa fila só, com atribuição, respostas prontas e histórico por contato. O time fala a uma só voz.",
      bullets: [
        "Inbox unificada multicanal",
        "Atribuição e filas por equipe",
        "Histórico completo por contato",
      ],
    },
    features: [
      { icon: "chat", title: "Inbox unificada", body: "WhatsApp, e-mail e chat do site na mesma fila de atendimento." },
      { icon: "users", title: "Filas & atribuição", body: "Distribua conversas por equipe e veja quem está com cada cliente." },
      { icon: "bolt", title: "Respostas prontas", body: "Atalhos e modelos para responder o de sempre em um clique." },
      { icon: "bell", title: "SLA & alertas", body: "Avisos de conversa parada para nenhum cliente ficar sem resposta." },
      { icon: "link", title: "Integrações", body: "Conecta ao CRM e aos sistemas de venda para contexto completo." },
      { icon: "chart", title: "Métricas de atendimento", body: "Tempo de resposta, volume por canal e satisfação." },
    ],
    steps: [
      { label: "01", title: "Conexão dos canais", body: "Plugamos WhatsApp, e-mail e o chat do seu site." },
      { label: "02", title: "Times & regras", body: "Definimos filas, atribuição e respostas prontas." },
      { label: "03", title: "No ar", body: "O time atende de um lugar só, com histórico de tudo." },
    ],
  },
  {
    slug: "crm-com",
    name: "CRM Com",
    accent: "#2493D4",
    category: "Relacionamento",
    keywords: ["Funil", "Leads", "Follow-up", "Vendas", "Visão 360°"],
    tagline: "Do primeiro contato ao contrato fechado.",
    lead: "Relacionamento, funil e vendas em um só lugar — cada oportunidade visível, cada follow-up no tempo certo.",
    short: "Relacionamento, funil e vendas em um só lugar.",
    audience: ["Times comerciais", "Imobiliárias", "Prestadores B2B", "Agências"],
    problem: {
      title: "Oportunidade esquecida é receita perdida.",
      body: "Lead anotado num caderno, follow-up que ninguém faz e previsão de venda no chute. O funil vaza sem ninguém ver.",
      bullets: [
        "Leads sem acompanhamento",
        "Funil invisível e no chute",
        "Histórico do cliente fragmentado",
      ],
    },
    solution: {
      title: "O funil inteiro, num quadro só.",
      body: "Pipeline visual, tarefas de follow-up e histórico de cada conta. A previsão de vendas para de ser adivinhação.",
      bullets: [
        "Pipeline visual por estágio",
        "Tarefas e follow-up automáticos",
        "Histórico 360° do cliente",
      ],
    },
    features: [
      { icon: "chart", title: "Pipeline visual", body: "Arraste oportunidades entre estágios e veja o funil de relance." },
      { icon: "clock", title: "Follow-up no tempo", body: "Tarefas e lembretes para nenhuma oportunidade esfriar." },
      { icon: "users", title: "Visão 360° do cliente", body: "Contatos, negócios e atendimentos reunidos por conta." },
      { icon: "bolt", title: "Automação de etapas", body: "Mova estágios e dispare ações sem trabalho manual." },
      { icon: "link", title: "Integra com FaloApp", body: "Puxe conversas e atendimentos direto para a oportunidade." },
      { icon: "chart", title: "Previsão de vendas", body: "Projeção de fechamento por estágio e probabilidade." },
    ],
    steps: [
      { label: "01", title: "Desenho do funil", body: "Mapeamos seus estágios e critérios de avanço." },
      { label: "02", title: "Importação de base", body: "Trazemos contatos e oportunidades em aberto." },
      { label: "03", title: "Vendas no radar", body: "O time vende com o funil sempre à vista." },
    ],
  },
  {
    slug: "desenvolvimento-web",
    name: "Desenvolvimento Web",
    accent: "#7C5CFF",
    category: "Web",
    keywords: ["Sites", "Landing pages", "Sob medida", "Responsivo", "SEO"],
    tagline: "Um site à altura da sua empresa.",
    lead: "Criamos sites, landing pages e portais sob medida — feitos aqui, do zero, com a cara da sua marca. Rápidos, impecáveis no celular e pensados para transformar visita em cliente.",
    short: "Sites e landing pages sob medida, feitos para converter.",
    audience: ["Empresas sem site", "Negócios locais", "Profissionais liberais", "Quem quer renovar o site atual"],
    problem: {
      title: "Não ter site — ou ter um ruim — custa cliente.",
      body: "Quem procura a sua empresa no Google e não acha (ou acha uma página lenta, quebrada no celular e sem caminho pro contato) vai direto pro concorrente.",
      bullets: [
        "Difícil de achar no Google",
        "Trava ou quebra no celular",
        "Sem caminho claro pro contato",
      ],
    },
    solution: {
      title: "Um site rápido, bonito e que gera contato.",
      body: "A gente desenvolve do zero, com a identidade da sua marca: design exclusivo, carregamento veloz, responsivo de verdade e otimizado para o Google — com WhatsApp e formulário para virar conversa.",
      bullets: [
        "Design exclusivo da sua marca",
        "Rápido e 100% responsivo",
        "Otimizado para Google e conversão",
      ],
    },
    features: [
      { icon: "sparkles", title: "Design exclusivo", body: "Layout único, com a identidade da sua empresa. Nada de tema pronto e genérico." },
      { icon: "bolt", title: "Velocidade", body: "Carrega rápido no 4G e no desktop — página lenta perde visita, a sua não." },
      { icon: "users", title: "Responsivo de verdade", body: "Experiência impecável no celular, no tablet e no computador." },
      { icon: "chart", title: "SEO & conversão", body: "Estruturado para aparecer no Google e transformar visita em contato." },
      { icon: "chat", title: "WhatsApp & formulários", body: "Botões e formulários que levam o visitante direto para uma conversa com você." },
      { icon: "shield", title: "Manutenção & evolução", body: "A gente acompanha, ajusta e faz o site evoluir junto com o seu negócio." },
    ],
    steps: [
      { label: "01", title: "Briefing", body: "Entendemos a marca, o público e os objetivos do site." },
      { label: "02", title: "Design & build", body: "Criamos o layout e desenvolvemos página a página." },
      { label: "03", title: "No ar", body: "Publicamos, otimizamos e acompanhamos os resultados." },
    ],
    ctaSubject: "seu site",
    ctaNote:
      "Do briefing ao lançamento: design sob medida, performance e SEO. Fale com a gente e tire o projeto do papel.",
  },
];


export const PRODUCT_FAQ: { q: string; a: string }[] = [
  {
    q: "Quanto tempo leva a implantação?",
    a: "Rápida. A gente configura o sistema, cadastra o essencial e treina a equipe — na maioria dos casos a operação já roda no mesmo dia ou em poucos dias.",
  },
  {
    q: "Tem suporte depois de implantado?",
    a: "Sim. Suporte local e contínuo, por WhatsApp, telefone, presencial ou remoto. Você não fica na mão.",
  },
  {
    q: "Integra com o que eu já uso?",
    a: "Sim. Ajudamos a integrar com os sistemas que a sua empresa já utiliza (financeiro, atendimento, vendas) para tudo conversar.",
  },
  {
    q: "Como funciona a contratação?",
    a: "Fale com a gente pelo WhatsApp. A gente entende a sua operação, mostra o sistema e indica o melhor caminho — sem compromisso.",
  },
];

export const productMap: Record<string, Product> = Object.fromEntries(
  products.map((p) => [p.slug, p]),
);

export function getProduct(slug: string): Product | undefined {
  return productMap[slug];
}
