

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

  gallery?: { src: string; caption: string; portrait?: boolean; light?: boolean }[];

  acquirers?: string[];

  steps: { label: string; title: string; body: string }[];

  faq?: { q: string; a: string }[];

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
    lead: "Gestão completa para restaurantes e food service, do salão à cozinha, do pedido ao fechamento de caixa.",
    short: "Gestão completa para restaurantes e food service.",
    audience: ["Restaurantes", "Bares e lanchonetes", "Food service e delivery", "Cafeterias"],
    wordmark: "/products/gourmetsa/wordmark.svg",
    mark: "/products/gourmetsa/wordmark.svg",
    mockup: "/products/gourmetsa/mockup.webp",
    gallery: [
      { src: "/products/gourmetsa/gallery-1.webp", caption: "Mapa de mesas e comandas" },
      { src: "/products/gourmetsa/gallery-2.webp", caption: "Cadastro de produtos e preços" },
      { src: "/products/gourmetsa/gallery-3.webp", caption: "Auto-atendimento no salão" },
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
    faq: [
      { q: "O pedido do garçom vai direto pra cozinha?", a: "Sim. A comanda cai na tela ou impressora da cozinha (KDS), com fila e tempo de preparo, sem papel perdido." },
      { q: "Controla mesas, comandas e delivery juntos?", a: "Sim. Salão, balcão e delivery no mesmo painel, com junção de comandas, divisão de conta e baixa de estoque automática." },
      { q: "Quanto tempo leva pra implantar no meu restaurante?", a: "Cadastramos cardápio, fichas técnicas e mesas com você. Na maioria dos casos a casa já opera em um turno de treinamento." },
      { q: "Tem suporte no horário de pico?", a: "Sim. Suporte local e contínuo, inclusive nos horários movimentados, por WhatsApp, telefone ou presencial." },
    ],
  },
  {
    slug: "finances-web",
    name: "Finances Web",
    accent: "#46ABD2",
    category: "Gestão",
    keywords: ["Financeiro", "Fiscal", "Vendas", "Estoque", "Nuvem"],
    tagline: "Toda a gestão da empresa em um sistema só.",
    lead: "ERP completo na nuvem: financeiro, fiscal, vendas e estoque integrados, do cadastro do produto à emissão da nota, sem trocar de sistema.",
    short: "ERP web completo: financeiro, fiscal, vendas e estoque.",
    audience: ["Pequenas e médias empresas", "Comércio e varejo", "Distribuidoras", "Prestadores de serviço"],
    wordmark: "/products/finances-web/logo.png",
    mark: "/products/finances-web/logo.png",
    mockup: "/products/finances-web/mockup.webp",
    problem: {
      title: "Vários sistemas que não se falam.",
      body: "Financeiro numa ferramenta, vendas em outra, fiscal numa terceira. O dado se perde no meio, o setor retrabalha e ninguém enxerga a empresa inteira.",
      bullets: [
        "Retrabalho entre os setores",
        "Dados espalhados e desencontrados",
        "Sem visão da empresa em tempo real",
      ],
    },
    solution: {
      title: "Um núcleo só, do cadastro à nota.",
      body: "Financeiro, fiscal, vendas e estoque no mesmo sistema, conectados e em tempo real. O que entra numa área já reflete nas outras, sem intermediário.",
      bullets: [
        "Módulos integrados de verdade",
        "Informação em tempo real",
        "100% na nuvem, multi-empresa",
      ],
    },
    features: [
      { icon: "chart", title: "Financeiro em tempo real", body: "Contas a pagar e a receber, fluxo de caixa e DRE sempre atualizados." },
      { icon: "card", title: "Fiscal integrado", body: "NF-e, NFS-e e SPED emitidos direto do sistema, sem digitar duas vezes." },
      { icon: "cart", title: "Vendas e comercial", body: "Pedidos, orçamentos, comissões e pipeline no mesmo lugar." },
      { icon: "shield", title: "Estoque e produtos", body: "Cadastro, inventário e rastreabilidade com baixa automática na venda." },
      { icon: "cloud", title: "Multi-empresa na nuvem", body: "Várias empresas e filiais, acessíveis de qualquer lugar com backup." },
      { icon: "link", title: "Integrações abertas", body: "API REST para conectar o Finances ao resto da sua operação." },
    ],
    steps: [
      { label: "01", title: "Implantação", body: "Configuramos empresa, plano de contas e parâmetros fiscais com você." },
      { label: "02", title: "Migração", body: "Trazemos cadastros, produtos e saldos do sistema atual." },
      { label: "03", title: "Operação", body: "Equipe treinada operando financeiro, vendas e estoque no mesmo dia." },
    ],
    faq: [
      { q: "É um ERP completo ou só financeiro?", a: "Completo. Financeiro, fiscal, vendas e estoque no mesmo sistema, integrados e em tempo real, do cadastro do produto à emissão da nota." },
      { q: "Emite NF-e e NFS-e?", a: "Sim. NF-e, NFS-e e SPED saem direto do sistema, sem digitar duas vezes." },
      { q: "Consigo migrar os dados do meu sistema atual?", a: "Sim. Trazemos cadastros, produtos e saldos da sua operação atual na implantação." },
      { q: "Atende mais de uma empresa ou filial?", a: "Sim. É multi-empresa e multi-filial, na nuvem, acessível de qualquer lugar com backup." },
    ],
  },
  {
    slug: "pdv-mais",
    name: "PDV Plus",
    accent: "#2F5FB3",
    category: "Varejo e Gastronomia",
    keywords: ["NFC-e", "Venda rápida", "Multiplataforma", "Offline", "Delivery"],
    tagline: "Do restaurante ao varejo, venda rápido e emita NFC-e.",
    lead: "Um PDV que serve tanto restaurantes e bares quanto o varejo em geral: venda no balcão, na maquininha ou no celular, emita o cupom fiscal e continue vendendo mesmo sem internet.",
    short: "PDV multiplataforma com NFC-e para restaurantes e varejo em geral.",
    audience: ["Varejo, MEI e Simples Nacional", "Mercados e conveniência", "Bares e restaurantes", "Delivery e food service"],
    wordmark: "/products/pdv-mais/wordmark.png",
    mark: "/products/pdv-mais/logo.png",
    mockup: "/products/pdv-mais/mockup.webp",
    acquirers: [
      "/products/pdv-mais/acquirers/1.png",
      "/products/pdv-mais/acquirers/2.png",
      "/products/pdv-mais/acquirers/3.png",
      "/products/pdv-mais/acquirers/4.png",
      "/products/pdv-mais/acquirers/5.png",
      "/products/pdv-mais/acquirers/6.png",
      "/products/pdv-mais/acquirers/7.png",
      "/products/pdv-mais/acquirers/8.png",
      "/products/pdv-mais/acquirers/9.png",
      "/products/pdv-mais/acquirers/10.png",
    ],
    problem: {
      title: "Sistema travado é venda perdida.",
      body: "Caixa lento, NFC-e complicada e internet instável fazem o cliente desistir no balcão. E sem relatório claro, você vende no escuro.",
      bullets: [
        "Emissão de NFC-e complicada",
        "Tudo para quando a internet cai",
        "Sem visão de vendas por período",
      ],
    },
    solution: {
      title: "Venda em segundos, NFC-e no automático.",
      body: "PDV enxuto com busca inteligente, leitor de código e NFC-e integrada, no computador, na maquininha smart ou no celular. Sincroniza na nuvem e continua vendendo offline.",
      bullets: [
        "NFC-e rápida, até em contingência",
        "Roda em Windows, Android, iOS e maquininhas",
        "Sincroniza tudo na nuvem",
      ],
    },
    features: [
      { icon: "bolt", title: "Venda rápida", body: "Busca inteligente, leitor de código de barras e divisão por categorias. O caixa não para." },
      { icon: "card", title: "NFC-e integrada", body: "Emita o cupom fiscal direto do PDV, com diversas formas de pagamento, até em contingência." },
      { icon: "clock", title: "Funciona offline", body: "Internet caiu? Continua vendendo e sincroniza tudo quando a conexão volta." },
      { icon: "cloud", title: "Multiplataforma na nuvem", body: "Windows, tablet, maquininha smart, mini PDV, Android e iOS, sempre sincronizados." },
      { icon: "cart", title: "Mesas, comandas e delivery", body: "Atendimento de balcão e mesas, com integração iFood e catálogo online." },
      { icon: "chart", title: "Relatórios e estoque", body: "Acompanhe vendas por dispositivo e período, com alerta de estoque mínimo." },
    ],
    steps: [
      { label: "01", title: "Configuração fiscal", body: "Ajustamos certificado, impostos e formas de pagamento da NFC-e." },
      { label: "02", title: "Catálogo", body: "Importamos produtos do banco online e cadastramos seu estoque." },
      { label: "03", title: "Operação", body: "Caixa treinado vendendo no mesmo dia, em qualquer dispositivo." },
    ],
    faq: [
      { q: "Funciona na minha maquininha?", a: "Sim. Roda em Windows, Android, iOS, maquininhas smart e mini PDV, sempre sincronizado na nuvem." },
      { q: "Continua vendendo se a internet cair?", a: "Sim. O PDV segue vendendo offline e sincroniza tudo, inclusive a NFC-e em contingência, quando a conexão volta." },
      { q: "Serve pra loja e pra restaurante?", a: "Serve os dois. Venda rápida de balcão para o varejo, e mesas, comandas e delivery para bares e restaurantes." },
      { q: "Emite cupom fiscal?", a: "Sim. NFC-e integrada, com diversas formas de pagamento, sem etapa extra." },
    ],
  },
  {
    slug: "faloapp",
    name: "FaloApp",
    accent: "#1EA84E",
    category: "Comunicação",
    keywords: ["Inbox", "WhatsApp", "Filas", "SLA", "Histórico"],
    tagline: "Todo o atendimento da empresa numa conversa só.",
    lead: "Comunicação e atendimento integrados ao seu time: múltiplos canais, um histórico, respostas que não se perdem.",
    short: "Comunicação e atendimento integrados ao seu time.",
    audience: ["Times de atendimento", "E-commerce", "Clínicas e consultórios", "Suporte ao cliente"],
    wordmark: "/products/faloapp/wordmark.png",
    mark: "/products/faloapp/logo-outline.png",
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
    faq: [
      { q: "Junta WhatsApp e outros canais num lugar só?", a: "Sim. Todos os canais numa caixa de entrada única, com o histórico do cliente sempre à mão." },
      { q: "Vários atendentes usam ao mesmo tempo?", a: "Sim. Filas, distribuição por atendente e controle de SLA para nada ficar sem resposta." },
      { q: "Fica registrado o histórico das conversas?", a: "Sim. Todo o histórico do cliente fica salvo, independente de quem atendeu." },
      { q: "Precisa instalar alguma coisa?", a: "Não. É na nuvem, acessível pelo navegador, e a gente configura os canais com você." },
    ],
  },
  {
    slug: "crm-com",
    name: "CRM Com",
    accent: "#2493D4",
    category: "Relacionamento",
    keywords: ["Funil", "Leads", "Follow-up", "Vendas", "Visão 360°"],
    tagline: "Do primeiro contato ao contrato fechado.",
    lead: "Relacionamento, funil e vendas em um só lugar: cada oportunidade visível, cada follow-up no tempo certo.",
    short: "Relacionamento, funil e vendas em um só lugar.",
    audience: ["Times comerciais", "Imobiliárias", "Prestadores B2B", "Agências"],
    wordmark: "/products/crm-com/wordmark.png",
    mark: "/products/crm-com/logo-outline.png",
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
    faq: [
      { q: "Como funciona o funil de vendas?", a: "Você vê cada oportunidade por estágio, com critérios de avanço, e nada de follow-up esquecido." },
      { q: "Dá pra importar minha base de contatos?", a: "Sim. Trazemos contatos e oportunidades em aberto na implantação, sem começar do zero." },
      { q: "Mostra relatórios de venda e previsão?", a: "Sim. Previsão por estágio, taxa de conversão e desempenho do time, com número na mão." },
      { q: "Integra com o atendimento e outros sistemas?", a: "Sim. Conecta com os canais e sistemas que você já usa, para o relacionamento e a venda conversarem." },
    ],
  },
  {
    slug: "desenvolvimento-web",
    name: "Pedra & Pixel",
    accent: "#2080F0",
    category: "Web",
    keywords: ["Sites", "Landing pages", "Sob medida", "Responsivo", "SEO"],
    tagline: "Sólido como pedra, preciso no pixel.",
    lead: "Sites, landing pages e portais sob medida, feitos aqui, do zero: a solidez de uma boa engenharia com o capricho no último pixel. Rápidos, impecáveis no celular e pensados para transformar visita em cliente.",
    short: "Sites sob medida: engenharia sólida, design no pixel.",
    audience: ["Empresas sem site", "Negócios locais", "Profissionais liberais", "Quem quer renovar o site atual"],
    wordmark: "/products/desenvolvimento-web/wordmark.png",
    mark: "/products/desenvolvimento-web/mark.png",
    problem: {
      title: "Não ter site, ou ter um ruim, custa cliente.",
      body: "Quem procura a sua empresa no Google e não acha (ou acha uma página lenta, quebrada no celular e sem caminho pro contato) vai direto pro concorrente.",
      bullets: [
        "Difícil de achar no Google",
        "Trava ou quebra no celular",
        "Sem caminho claro pro contato",
      ],
    },
    solution: {
      title: "Um site rápido, bonito e que gera contato.",
      body: "A gente desenvolve do zero, com a identidade da sua marca: design exclusivo, carregamento veloz, responsivo de verdade e otimizado para o Google, com WhatsApp e formulário para virar conversa.",
      bullets: [
        "Design exclusivo da sua marca",
        "Rápido e 100% responsivo",
        "Otimizado para Google e conversão",
      ],
    },
    features: [
      { icon: "sparkles", title: "Design exclusivo", body: "Layout único, com a identidade da sua empresa. Nada de tema pronto e genérico." },
      { icon: "bolt", title: "Velocidade", body: "Carrega rápido no 4G e no desktop. Página lenta perde visita, a sua não." },
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
    faq: [
      { q: "Vocês criam do zero ou usam tema pronto?", a: "Do zero, com design exclusivo da sua marca. Nada de tema genérico igual ao do concorrente." },
      { q: "O site funciona bem no celular?", a: "Sim. Responsivo de verdade, rápido no 4G e impecável no celular, no tablet e no desktop." },
      { q: "O site aparece no Google?", a: "Sim. Estruturamos tudo para SEO, para você ser encontrado e transformar visita em contato." },
      { q: "Quanto tempo leva, e tem manutenção depois?", a: "Do briefing ao ar em poucas semanas, conforme o escopo. Depois a gente acompanha, ajusta e faz o site evoluir com o negócio." },
    ],
    ctaSubject: "seu site",
    ctaNote:
      "Do briefing ao lançamento: design sob medida, performance e SEO. Fale com a gente e tire o projeto do papel.",
  },
];


export const PRODUCT_FAQ: { q: string; a: string }[] = [
  {
    q: "Quanto tempo leva a implantação?",
    a: "Rápida. A gente configura o sistema, cadastra o essencial e treina a equipe. Na maioria dos casos a operação já roda no mesmo dia ou em poucos dias.",
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
    a: "Fale com a gente pelo WhatsApp. A gente entende a sua operação, mostra o sistema e indica o melhor caminho, sem compromisso.",
  },
];

export const productMap: Record<string, Product> = Object.fromEntries(
  products.map((p) => [p.slug, p]),
);

export function getProduct(slug: string): Product | undefined {
  return productMap[slug];
}
