// setup.js

const inquirer = require('inquirer'); // Ask the user questions
const execa = require('execa');       // Run shell commands like git
const fs = require('fs-extra');       // Handle files & folders
const path = require('path');         // Handle file paths

(async () => {
  console.log('\n🚀 Welcome to the Project Setup Wizard!\n');

  // STEP 1: Ask user for project details
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

  const targetPath = path.join(process.cwd(), siteName);
  const templateRepo = 'https://github.com/YOURUSERNAME/next-sanity-cloudflare-template.git';

  console.log(`\n📦 Cloning template into: ${siteName}`);
  await execa('git', ['clone', templateRepo, siteName]);

  // Remove .git from cloned template so we can start fresh
  await fs.remove(path.join(targetPath, '.git'));

  // STEP 2: Inject environment variables into site/.env.local
  const envPath = path.join(targetPath, 'site', '.env.local');
  await fs.outputFile(envPath, `NEXT_PUBLIC_SANITY_PROJECT_ID=${sanityProjectId}
NEXT_PUBLIC_SANITY_DATASET=${sanityDataset}
`);

  // STEP 3: Inject Cloudflare config into site/wrangler.jsonc
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

  // STEP 4: Initialize Git and push to GitHub (optional)
  console.log('\n📁 Initializing Git...');
  await execa('git', ['init'], { cwd: targetPath });
  await execa('git', ['add', '.'], { cwd: targetPath });
  await execa('git', ['commit', '-m', 'Initial project scaffold'], { cwd: targetPath });

  if (createRepo) {
    console.log('🐙 Creating and pushing to GitHub...');
    await execa('gh', ['repo', 'create', `${githubUser}/${siteName}`, '--public', '--source=.', '--remote=origin', '--push'], {
      cwd: targetPath,
      stdio: 'inherit'
    });
  }

  // STEP 5: Create manual instructions file
  const checklist = `
# ✅ Manual Setup Steps for ${siteName}

## 🧠 Sanity

1. Go to https://sanity.io/manage
2. Open your project ID: \`${sanityProjectId}\`
3. Start the studio:
   \`cd sanity && npm install && npm run dev\`

## 🌐 Cloudflare

1. Run: \`wrangler login\` (if not done)
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

  console.log(`\n✅ Done! Your project is ready at: ${targetPath}`);
  console.log(`📄 See README_MANUAL_STEPS.md for remaining setup steps.\n`);
})();
