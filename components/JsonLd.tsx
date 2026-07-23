import { LEGAL, EMAIL } from "@/lib/site";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://comautomacao.com";

export default function JsonLd() {
  const sameAs = [LEGAL.instagram, LEGAL.googleBusiness].filter(Boolean);

  const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#business`,
    name: "Com Automação",
    legalName: LEGAL.razaoSocial,
    url: SITE_URL,
    email: EMAIL,
    telephone: LEGAL.telefoneSchema,
    taxID: LEGAL.cnpj,
    image: `${SITE_URL}/logos/logo-horizontal-white.png`,
    logo: `${SITE_URL}/logos/logo-horizontal-white.png`,
    description:
      "Representamos os melhores sistemas de gestão e cuidamos da implantação, do treinamento e do suporte local.",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${LEGAL.endereco.rua} - ${LEGAL.endereco.bairro}`,
      addressLocality: LEGAL.endereco.cidade,
      addressRegion: LEGAL.endereco.uf,
      postalCode: LEGAL.endereco.cep,
      addressCountry: "BR",
    },
    areaServed: { "@type": "State", name: "São Paulo" },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "08:00",
        closes: "17:30",
      },
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
