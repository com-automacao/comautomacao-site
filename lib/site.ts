
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5515997133311";

export const WHATSAPP_MESSAGE =
  "Olá! Vim pelo site e quero saber mais sobre os sistemas da Com Automação.";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;

export const EMAIL = "joao@comautomacao.com";

export const LEGAL = {
  razaoSocial: "João Maria de Jesus Paulino",
  cnpj: "25.187.426/0001-27",
  endereco: {
    rua: "R. Epitácio Piedade, 204",
    bairro: "Vila Ophelia",
    cidade: "Itapeva",
    uf: "SP",
    cep: "18400-817",
  },
  telefone: "(15) 3526-9980",
  telefoneHref: "+551535269980",
  telefoneSchema: "+55 15 3526-9980",
  horario: "Seg a Sex, 8h às 17h30",
  areaAtendimento: "Itapeva e região — SP",
  // Redes para o schema (sameAs) — adicionar quando disponíveis:
  instagram: "",
  googleBusiness: "",
};


export const OTHER_PROJECT = {
  name: "EQUIPE 360",
  tagline: "Desenvolvimento comportamental para empresas",
  description:
    "Desenvolvimento comportamental contínuo para empresas: palestras vivenciais e dinâmicas práticas com João Paulino.",
  cta: "Visitar o site",
  url: "https://joaopaulino.com.br/",
};
