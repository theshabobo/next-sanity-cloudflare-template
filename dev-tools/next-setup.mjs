// next-setup.mjs
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { argv } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse CLI args
const args = {};
argv.forEach((val, idx) => {
  if (val.startsWith('--')) {
    args[val.replace('--', '')] = argv[idx + 1];
  }
});

const projectName = args.projectName;
const basePath = args.basePath;

if (!projectName || !basePath) {
  console.error('❌ Missing required --projectName or --basePath argument.');
  process.exit(1);
}

const sitePath = path.join(basePath, 'site');

(async () => {
  console.log('\n🌐 Setting up Next.js App...\n');

  // Step 1 — Scaffold Next.js using Cloudflare CLI (interactive prompt workaround)
  const createArgs = [
    '--framework=next',
    '--platform=workers'
  ];

  try {
    await execa('npm', ['create', 'cloudflare@latest', 'site', ...createArgs], {
      cwd: basePath,
      stdio: 'inherit'
    });

    console.log('✅ Next.js app scaffolded into /site');
  } catch (err) {
    console.error('❌ Failed to scaffold Next.js app with Cloudflare Workers.');
    process.exit(1);
  }

  // Step 2 — Remove unwanted extras (if any)
  try {
    const gitFolder = path.join(sitePath, '.git');
    if (fs.existsSync(gitFolder)) {
      await fs.remove(gitFolder);
      console.log('🧹 Removed auto-generated .git folder from site.');
    }
  } catch {
    console.warn('⚠️ Unable to clean .git folder (already deleted or missing).');
  }

  console.log('\n🚀 Next.js app setup complete.\n');
})();
