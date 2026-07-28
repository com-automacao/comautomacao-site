// Prova social · comautomacao.com
// Regra de ouro do épico: nenhum número no site sem fonte rastreável (PS-01).
// Preencha `value` SÓ com número auditável. Deixe "" para ocultar o bloco
// (o componente não renderiza itens vazios, então nada fabricado vai ao ar).

export type Stat = {
  value: string; // ex.: "+400", "12", "35"
  label: string;
};

// PS-06 · Faixa de números (home, logo após o hero).
export const STATS: Stat[] = [
  { value: "+400", label: "Clientes atendidos" },
  { value: "14", label: "Anos de estrada" },
  { value: "+45", label: "Cidades em 3 estados" },
  { value: "", label: "Prazo médio de implantação" },
];

// PS-14 · Prova do suporte (SLA declarado). Canais e horário são fatos reais.
// tempoPrimeiraResposta e politicaPico só entram com base real (deixe "" p/ ocultar).
export const SUPPORT = {
  canais: ["WhatsApp", "Telefone", "Presencial na região"],
  tempoPrimeiraResposta: "",
  politicaPico: "",
};
