// next-setup.mjs
import { execaCommand } from 'execa';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Step 1: Parse incoming args
const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const [key, ...rest] = arg.split('=');
  return [key, rest.join('=')]; // handles '=' inside token
}));

const projectNameRoot = args.projectNameRoot;
const projectName = args.projectName;
const sanityApiToken = args.sanityApiToken;
const sanityProjectId = args.sanityProjectId;


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const basePath = path.resolve(__dirname, '..', projectNameRoot);
const installPath = path.join(basePath, projectName);
const siteTemplatePath = path.join(basePath, 'site');

console.log(`📁 Installing Next.js via Cloudflare into: ${installPath}`);
console.log(`   Select defaults for the sub questions.`);


// Step 2: Scaffold Next.js app via Cloudflare CLI
await execaCommand(
  `npm create cloudflare@latest ${projectName} -- --category=web-framework --framework=next --ts=false`,
  {
    cwd: basePath,
    stdio: 'inherit',
    shell: true,
  }
);

// Step 3: Overwrite Next.js folder with custom site template
console.log('\n📂 Copying custom site template files into the Next.js project...');
try {
  await fs.copy(siteTemplatePath, installPath, {
    overwrite: true,
    recursive: true
  });
  console.log(`✅ Site files copied from /site → /${projectName}`);
} catch (err) {
  console.error('❌ Failed to copy site files:', err);
  process.exit(1);
}

// Step 4: Remove the site template folder
try {
  await fs.remove(siteTemplatePath);
  console.log('🗑️ Removed site folder after copying');
} catch (err) {
  console.error('❌ Failed to delete site folder:', err);
  process.exit(1);
}

// Step 5: Replace SANITY_API_TOKEN in .env.local
try {
  const envFilePath = path.join(installPath, '.env.local');

  if (await fs.pathExists(envFilePath)) {
    let envContent = await fs.readFile(envFilePath, 'utf8');

    envContent = envContent.replace(
      /^SANITY_API_TOKEN=.*$/m,
      `SANITY_API_TOKEN=${sanityApiToken}`
    );

    await fs.writeFile(envFilePath, envContent, 'utf8');
    console.log('🔑 Updated SANITY_API_TOKEN in .env.local');
  } else {
    console.warn('⚠️ .env.local not found, skipping token replacement.');
  }
} catch (err) {
  console.error('❌ Failed to update .env.local with Sanity token:', err);
  process.exit(1);
}

// Step 6: Inject correct domain name into siteSettingsLayout.js
try {
  const layoutFile = path.join(installPath, 'app', 'components', 'siteSettings', 'siteSettingsLayout.js');

  if (await fs.pathExists(layoutFile)) {
    let content = await fs.readFile(layoutFile, 'utf8');
    const domainRegex = /checkSitePayment\('.*?'\)/;
    const updated = content.replace(domainRegex, `checkSitePayment('${projectNameRoot}')`);
    await fs.writeFile(layoutFile, updated, 'utf8');
    console.log(`📝 Injected domain (${projectNameRoot}) into siteSettingsLayout.js`);
  }
} catch (err) {
  console.error('❌ Failed to update siteSettingsLayout.js:', err);
}

console.log('\n🚀 Done. Your project is ready at:\n' + installPath + '\n');

// Step 7 — Install next-sanity and @portabletext/react into the Next.js app
try {
  console.log('\n📦 Installing required packages: next-sanity and @portabletext/react...');
  await execaCommand(
    `npm install next-sanity @portabletext/react`,
    {
      cwd: installPath,
      stdio: 'inherit',
      shell: true,
    }
  );
  console.log('✅ Installed next-sanity and @portabletext/react');
} catch (err) {
  console.error('❌ Failed to install required packages:', err);
}

// Step 8 — Inject Sanity Project ID into lib/sanity.js
try {
  const sanityFile = path.join(installPath, 'lib', 'sanity.js');

  if (await fs.pathExists(sanityFile)) {
    let content = await fs.readFile(sanityFile, 'utf8');

    const updated = content.replace(
      /projectId:\s*['"`][a-zA-Z0-9]+['"`]/,
      `projectId: '${sanityProjectId}'`
    );

    await fs.writeFile(sanityFile, updated, 'utf8');
    console.log(`🧠 Injected Sanity Project ID into lib/sanity.js`);
  } else {
    console.warn(`⚠️ Could not find lib/sanity.js to update projectId`);
  }
} catch (err) {
  console.error('❌ Failed to update lib/sanity.js with projectId:', err);
}