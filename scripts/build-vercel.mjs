// Assembles a Vercel Build Output API (v3) bundle in .vercel/output:
//   static/              -> the Vite-built frontend (run `vite build` first)
//   functions/api.func/  -> the Express API bundled into one CommonJS file
// See https://vercel.com/docs/build-output-api/v3
import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const root = process.cwd();
const out = path.join(root, '.vercel', 'output');
const funcDir = path.join(out, 'functions', 'api.func');

if (!existsSync(path.join(root, 'dist', 'index.html'))) {
  console.error('dist/ not found. Run `vite build` before this script.');
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(funcDir, { recursive: true });

// 1. Static frontend
cpSync(path.join(root, 'dist'), path.join(out, 'static'), { recursive: true });

// 2. API function (dependencies bundled in, so no node_modules are needed at runtime)
await build({
  entryPoints: [path.join(root, 'server', 'vercelEntry.ts')],
  outfile: path.join(funcDir, 'index.js'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  // Optional MongoDB driver add-ons that are loaded lazily only when configured
  external: [
    'kerberos',
    'snappy',
    '@mongodb-js/zstd',
    'mongodb-client-encryption',
    '@aws-sdk/credential-providers',
    'gcp-metadata',
    'socks',
    'aws4',
  ],
  // Vercel's Node launcher expects the handler as module.exports
  footer: { js: 'module.exports = module.exports.default || module.exports;' },
  logLevel: 'warning',
});

writeFileSync(path.join(funcDir, 'package.json'), JSON.stringify({ type: 'commonjs' }));
writeFileSync(
  path.join(funcDir, '.vc-config.json'),
  JSON.stringify({ runtime: 'nodejs22.x', handler: 'index.js', launcherType: 'Nodejs', maxDuration: 30 }, null, 2)
);

// 3. Routing: real files first, /api/* to the function, everything else to the SPA
writeFileSync(
  path.join(out, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '^/api(/.*)?$', dest: '/api' },
        { src: '^/(.*)$', dest: '/index.html' },
      ],
    },
    null,
    2
  )
);

console.log('Vercel build output ready in .vercel/output');
