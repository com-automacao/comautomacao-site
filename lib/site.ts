
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5515997133311";

export const WHATSAPP_MESSAGE =
  "Olá! Vim pelo site e quero saber mais sobre os sistemas da Com Automação.";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;

export const EMAIL = "comautomacao@gmail.com";


export const OTHER_PROJECT = {
  name: "EQUIPE 360",
  tagline: "Desenvolvimento comportamental para empresas",
  description:
    "Desenvolvimento comportamental contínuo para empresas — palestras vivenciais e dinâmicas práticas com João Paulino.",
  cta: "Visitar o site",
  url: "https://joaopaulino.com.br/",
};
