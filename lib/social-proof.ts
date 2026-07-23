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
  { value: "", label: "Clientes atendidos" },
  { value: "", label: "Anos de estrada" },
  { value: "", label: "Cidades atendidas" },
  { value: "", label: "Prazo médio de implantação" },
];
