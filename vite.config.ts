import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
  },
  esbuild: {
    logOverride: {
      'ignored-directive': 'silent', 
    },
  },
  logLevel: 'info', 
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        platformStructure: "platform-structure.html",
        coreFunctionalities: "core-functionalities.html",
        analyticsInsights: "analytics-insights.html",
        howItWorks: "how-it-works.html",
        pricing: "pricing.html",
        contact: "contact.html",
        apply: "apply.html",
        login: "login.html",
        dashboard: "dashboard.html",
        paypoint: "paypoint.html",
        paypointReview: "paypoint-review.html",
        privacy: "privacy.html",
        terms: "terms.html",
        security: "security.html",
      },
      onwarn(warning, warn) {
        // ignore certain harmless warnings
        if (
          warning.message.includes('Module level directives') ||
          warning.message.includes('"use client"')  ||
          warning.message.includes('"was ignored"')
        ) {
          return; 
        }

        // FAIL build on unresolved imports
        if (warning.code === 'UNRESOLVED_IMPORT') {
          throw new Error(`Build failed due to unresolved import:\n${warning.message}`);
        }

        // FAIL build on missing exports (like your Input error)
        if (warning.code === 'PLUGIN_WARNING' && /is not exported/.test(warning.message)) {
          throw new Error(`Build failed due to missing export:\n${warning.message}`);
        }

        // other warnings: log normally
        warn(warning);
      },
    },
  },
});
