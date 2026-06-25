/**
 * Configurações de contato do site — fonte única.
 *
 * ⚠️ TROCAR: WHATSAPP_NUMBER está com um número placeholder. Substitua pelo
 * número real no formato internacional, só dígitos: 55 (Brasil) + DDD + número.
 * Ex.: "5544998765432".
 */
export const WHATSAPP_NUMBER = "5599999999999";

export const WHATSAPP_MESSAGE =
  "Olá! Vim pelo site e quero saber mais sobre os sistemas da Com Automação.";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;

export const EMAIL = "comautomacao@gmail.com";

/** "Conheça também" — banner que divulga outro projeto (estilo da marca Equipe 360). */
export const OTHER_PROJECT = {
  name: "EQUIPE 360",
  tagline: "Desenvolvimento comportamental para empresas",
  description:
    "Desenvolvimento comportamental contínuo para empresas — palestras vivenciais e dinâmicas práticas com João Paulino.",
  cta: "Visitar o site",
  url: "https://joaopaulino.com.br/",
};
