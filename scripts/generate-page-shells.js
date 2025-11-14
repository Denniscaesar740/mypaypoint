import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesPath = path.resolve(__dirname, '..', 'pageRoutes.json');
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
const outputDir = path.resolve(__dirname, '..');

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildTemplate = ({ title, description }) => {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="https://meku.dev/favicon.ico" />
    <title>${safeTitle}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <meta name="generator" content="Meku" />
    <meta name="description" content="${safeDescription}" />
    <meta name="author" content="Meku" />

    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://meku.dev/images/meku.png" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@meku_dev" />
    <meta name="twitter:image" content="https://meku.dev/images/meku.png" />
    <script type="module" src="/index.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;
};

routes.forEach((route) => {
  const destination = path.resolve(outputDir, route.filename);
  fs.writeFileSync(destination, buildTemplate(route), 'utf-8');
});

console.log(`Generated ${routes.length} page shells.`);
