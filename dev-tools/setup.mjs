// setup.mjs
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { execa, execaCommand } from 'execa';

const rl = readline.createInterface({ input, output });

console.log('\n🌐 Website Setup: Initial Configuration\n');

// Step 1 — Prompt user
const projectNameRoot = await rl.question('🔤 Enter the full domain (e.g. construction-site.com): ');
const githubUser = await rl.question('🐙 Enter your GitHub username: ');
const createRepoAnswer = await rl.question('📦 Create GitHub repo? (Y/n): ');
const createRepo = createRepoAnswer.trim().toLowerCase() !== 'n';
const sanityProjectId = await rl.question('🧠 Enter your Sanity project ID: ');
const sanityDataset = await rl.question('📁 Enter Sanity dataset (default: production): ') || 'production';
const sanityApiToken = await rl.question('🔐 Enter your Sanity API token: ');

rl.close();

// Step 2 — Strip extension from domain to get projectName
const projectName = projectNameRoot.replace(/\..+$/, '');

// Step 3 — Show summary
console.log('\n✅ Configuration complete:');
console.log(`- Project Name Root: ${projectNameRoot}`);
console.log(`- Project Name:      ${projectName}`);
console.log(`- GitHub Username:   ${githubUser}`);
console.log(`- Create Repo:       ${createRepo ? 'Yes' : 'No'}`);
console.log(`- Sanity Project ID: ${sanityProjectId}`);
console.log(`- Sanity Dataset:    ${sanityDataset}`);
console.log(`- Sanity API Token:  ${'*'.repeat(sanityApiToken.length)} (hidden)`);

// Step 4 — Create new folder one level above current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parentDir = path.resolve(__dirname, '..');
const projectDir = path.join(parentDir, projectNameRoot);

try {
  await fs.ensureDir(projectDir);
  console.log(`\n📁 Created project directory at: ${projectDir}`);
} catch (err) {
  console.error('❌ Failed to create project directory:', err);
  process.exit(1);
}

// Step 5 — Clone from GitHub and copy needed folders
const tempCloneDir = path.join(parentDir, `${projectNameRoot}-temp`);

try {
  console.log('\n⬇️ Cloning template repository...');
  await execa('git', ['clone', '--depth=1', 'https://github.com/theshabobo/next-sanity-cloudflare-template.git', tempCloneDir], {
    stdio: 'inherit'
  });

  const foldersToCopy = ['sanity', 'site'];
  for (const folder of foldersToCopy) {
    const src = path.join(tempCloneDir, folder);
    const dest = path.join(projectDir, folder);

    if (await fs.pathExists(src)) {
      await fs.copy(src, dest, { overwrite: true });
      console.log(`📁 Copied '${folder}' → '${folder}'`);
    } else {
      console.warn(`⚠️ Folder not found in repo: ${folder}`);
    }
  }

  await fs.remove(tempCloneDir);
  console.log('🧹 Removed temporary cloned repo');
} catch (err) {
  console.error('❌ Git clone or folder copy failed:', err);
  process.exit(1);
}

// Step 6 — Run next-setup.mjs with values
const nextSetupPath = path.join(__dirname, 'next-setup.mjs');

try {
  console.log('\n▶️ Running next-setup.mjs...');

  await execaCommand(
    `node "${nextSetupPath}" projectNameRoot="${projectNameRoot}" projectName="${projectName}" sanityApiToken="${sanityApiToken}" sanityProjectId="${sanityProjectId}"`,
    {
      stdio: 'inherit',
      shell: true
    }
  );
} catch (err) {
  console.error('❌ Failed to run next-setup.mjs:', err);
  process.exit(1);
}

// Step 7 — Run sanity-setup.mjs with values
const sanitySetupPath = path.join(__dirname, 'sanity-setup.mjs');

try {
  console.log('\n▶️ Running sanity-setup.mjs...');

  await execaCommand(
    `node "${sanitySetupPath}" sanityProjectId="${sanityProjectId}" sanityDataset="${sanityDataset}" projectNameRoot="${projectNameRoot}" projectName="${projectName}"`,
    {
      stdio: 'inherit',
      shell: true
    }
  );
} catch (err) {
  console.error('❌ Failed to run sanity-setup.mjs:', err);
  process.exit(1);
}

// Step 7.5 — Ensure no nested Git repos exist before GitHub setup
try {
  const nestedGitDirs = ['sanity/.git', 'site/.git', `${projectName}/.git`]; // support variable-based site name too

  for (const gitDir of nestedGitDirs) {
    const fullPath = path.join(projectDir, gitDir);
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath);
      console.log(`🧼 Removed nested Git repo: ${gitDir}`);
    }
  }
} catch (err) {
  console.error('❌ Failed to clean nested .git directories:', err);
  process.exit(1);
}


// Step 8 — GitHub Repo Creation & Initial Commit
if (createRepo) {
  try {
    console.log('\n🔐 Logging into GitHub...');
    await execa('gh', ['auth', 'login'], {
      stdio: 'inherit',
    });

    console.log(`\n📦 Creating new GitHub repo: ${githubUser}/${projectNameRoot}`);
    await execa('gh', ['repo', 'create', `${githubUser}/${projectNameRoot}`, '--public', '--confirm'], {
      cwd: projectDir,
      stdio: 'inherit',
    });

    console.log('🔧 Initializing git...');
    await execa('git', ['init'], { cwd: projectDir });
    await execa('git', ['add', '.'], { cwd: projectDir });
    await execa('git', ['commit', '-m', 'Initial project setup'], { cwd: projectDir });

    console.log('🚀 Pushing to GitHub...');
    await execa('git', ['branch', '-M', 'main'], { cwd: projectDir });
    await execa('git', ['remote', 'add', 'origin', `https://github.com/${githubUser}/${projectNameRoot}.git`], {
      cwd: projectDir,
    });
    await execa('git', ['push', '-u', 'origin', 'main'], { cwd: projectDir });

    console.log('✅ Project pushed to GitHub successfully!');
  } catch (err) {
    console.error('❌ GitHub upload failed:', err);
    process.exit(1);
  }
} else {
  console.log('\n📦 GitHub upload skipped.');
}

// Step 9 — Display Cloudflare setup instructions
console.clear();
console.log(`\n🌩️  Step 9: Final Cloudflare Configuration\n`);

console.log(`🔐 In Cloudflare Pages → Project Settings → Environment Variables`);
console.log(`   ➤ Add secret:`);
console.log(`      SANITY_API_TOKEN=${sanityApiToken}`);

console.log(`\n🔗 In Cloudflare Pages → Connect to Git Repository`);
console.log(`   ➤ GitHub account: (use the one you selected)`);
console.log(`   ➤ Repository:      ${githubUser}/${projectNameRoot}`);
console.log(`   ➤ Branch:          main`);
console.log(`   ➤ Root Directory:  /${projectName}`);
console.log(`   ➤ Build Command:   npx opennextjs-cloudflare build`);
console.log(`   ➤ Deploy Command:  npx wrangler deploy .open-next/worker.js --experimental-json-config`);
console.log(`   ➤ Non-prod Branch Deploy Command:`);
console.log(`      npx wrangler deploy .open-next/worker.js --experimental-json-config`);

console.log(`\n✅ Setup complete. You can now proceed with the Cloudflare dashboard configuration.`);
