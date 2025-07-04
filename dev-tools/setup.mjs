// setup.mjs
import inquirer from 'inquirer';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  console.log('\n🚀 Welcome to the Project Setup Wizard!\n');

  const {
    siteName,
    githubUser,
    createRepo,
    sanityProjectId,
    sanityDataset,
    cloudflareToken
  } = await inquirer.prompt([
    { name: 'siteName', message: 'Project name (e.g. your-project.com):' },
    { name: 'githubUser', message: 'Your GitHub username:' },
    { type: 'confirm', name: 'createRepo', message: 'Create a GitHub repo for this project?', default: true },
    { name: 'sanityProjectId', message: 'Sanity Project ID:' },
    { name: 'sanityDataset', message: 'Sanity Dataset:', default: 'production' },
    { name: 'cloudflareToken', message: 'Cloudflare API Token (optional):', mask: '*' }
  ]);

  const targetPath = path.join(__dirname, '..', siteName);
  const templateRepo = 'https://github.com/theshabobo/next-sanity-cloudflare-template.git';

  console.log(`\n📦 Cloning template into: ${siteName}`);
  await execa('git', ['clone', templateRepo, targetPath]);
  await fs.remove(path.join(targetPath, '.git'));

  const envPath = path.join(targetPath, 'site', '.env.local');
  await fs.outputFile(envPath, `NEXT_PUBLIC_SANITY_PROJECT_ID=${sanityProjectId}
NEXT_PUBLIC_SANITY_DATASET=${sanityDataset}
`);

  const wranglerPath = path.join(targetPath, 'site', 'wrangler.jsonc');
  await fs.outputFile(wranglerPath, `{
  "name": "${siteName.replace(/\W+/g, '-')}-worker",
  "compatibility_date": "2024-01-01",
  "vars": {
    "SANITY_PROJECT_ID": "${sanityProjectId}",
    "SANITY_DATASET": "${sanityDataset}"
  }
}
`);

  console.log('\n📁 Initializing Git...');
  await execa('git', ['init'], { cwd: targetPath });

  console.log('🔐 Marking project as a safe Git directory...');
  await execa('git', [
    'config',
    '--global',
    '--add',
    'safe.directory',
    targetPath.replace(/\\/g, '/')
  ]);

  await execa('git', ['add', '.'], { cwd: targetPath });
  await execa('git', ['commit', '-m', 'Initial project scaffold'], { cwd: targetPath });

  if (createRepo) {
    console.log('🐙 Creating and pushing to GitHub...');
    await execa('gh', [
      'repo',
      'create',
      `${githubUser}/${siteName}`,
      '--public',
      '--source=.',
      '--remote=origin',
      '--push'
    ], { cwd: targetPath, stdio: 'inherit' });
  }

  // ✅ Run sanity-setup.mjs with all args
  console.log('\n🧠 Launching Sanity setup script...');
  const sanitySetupPath = path.join(__dirname, 'sanity-setup.mjs');

  try {
    await execa('node', [
      sanitySetupPath,
      '--projectId', sanityProjectId,
      '--basePath', targetPath,
      '--projectName', siteName
    ], { stdio: 'inherit' });
    console.log('\n✅ Sanity setup completed.\n');
  } catch (err) {
    console.error('\n❌ Sanity setup failed. Exiting...\n');
    process.exit(1);
  }

  // ✅ Run next-setup.mjs with all args
  console.log('\n🌐 Launching Next.js setup script...');
  const nextSetupPath = path.join(__dirname, 'next-setup.mjs');

  try {
    await execa('node', [
      nextSetupPath,
      '--projectName', siteName,
      '--basePath', targetPath
    ], { stdio: 'inherit' });
    console.log('\n✅ Next.js app setup completed.\n');
  } catch (err) {
    console.error('\n❌ Next.js setup failed. Exiting...\n');
    process.exit(1);
  }

  // Manual checklist
  const checklist = `
# ✅ Manual Setup Steps for ${siteName}

## 🧠 Sanity

1. Go to https://sanity.io/manage
2. Open your project ID: \`${sanityProjectId}\`
3. Start the studio:
   \`cd sanity && npm install && npm run dev\`

## 🌐 Cloudflare

1. Run: \`wrangler login\` (if not already)
2. Add secret: \`npx wrangler secret put SANITY_TOKEN\`
3. Build & deploy:
   \`cd site\`
   \`npx opennextjs-cloudflare build\`
   \`npx wrangler deploy .open-next/worker.js --experimental-json-config\`

## 🖥 Local Dev

- Frontend: \`cd site && npm install && npm run dev\`
- Studio:   \`cd sanity && npm run dev\`
`;

  await fs.outputFile(path.join(targetPath, 'README_MANUAL_STEPS.md'), checklist);

  console.log(`\n✅ Done! Your new project is ready at:\n${targetPath}`);
  console.log(`📄 See README_MANUAL_STEPS.md for next steps.\n`);
})();
