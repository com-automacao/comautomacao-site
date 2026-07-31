// Flat config (ESLint 9 / eslint-config-next 16). O comando `next lint` foi
// removido no Next 16 — o lint roda direto pelo binário do ESLint.
import next from "eslint-config-next";

const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      // fontes do mascote 3D e artefatos de deploy: fora do build
      "mascot-src/**",
      "mascot3d-package/**",
      "comautomacao-site-export/**",
      "components/com-automation-robot-*/**",
    ],
  },
  ...next,
];

export default config;
