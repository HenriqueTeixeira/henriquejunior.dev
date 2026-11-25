import type { CloudflareConfig } from "cf/config";

export default {
  worker: {
    name: "site-pessoal",
    compatibilityDate: "2026-11-19",
    observability: {
      enabled: true,
    },
    assets: {
      htmlHandling: "auto-trailing-slash",
      notFoundHandling: "404-page",
    },
    // Produção só no domínio próprio; o endereço público *.workers.dev fica desligado.
    domains: ["henriquejunior.dev"],
    workersDev: false,
    // URLs de versão continuam ligadas para os previews dos pull requests.
    previewUrls: true,
  },
} satisfies CloudflareConfig;
