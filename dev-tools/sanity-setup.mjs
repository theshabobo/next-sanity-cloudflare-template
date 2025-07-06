import fs from 'fs-extra';
import path from 'path';
import readline from 'readline/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execaCommand } from 'execa';

// Step 0 — Parse CLI arguments
const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const [key, ...rest] = arg.split('=');
  return [key, rest.join('=')];
}));

const sanityProjectId = args.sanityProjectId;
const sanityDataset = args.sanityDataset;
const projectNameRoot = args.projectNameRoot;
const projectName = args.projectName;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const basePath = path.resolve(__dirname, '..', projectNameRoot);
const sanityPath = path.join(basePath, 'sanity');
const sanityTempPath = path.join(basePath, 'sanity-temp');

// Step 1 — Prompt login to Sanity CLI
try {
  console.log('\n🔐 Logging into Sanity...');
  await execaCommand('sanity logout', { stdio: 'inherit', shell: true }); // Force logout first
  await execaCommand('sanity login', { stdio: 'inherit', shell: true });
  console.log('✅ Logged into Sanity CLI');
} catch (err) {
  console.error('❌ Failed to log in to Sanity:', err);
  process.exit(1);
}

// Step 2 — Rename existing sanity to sanity-temp
try {
  if (await fs.pathExists(sanityPath)) {
    await fs.move(sanityPath, sanityTempPath, { overwrite: true });
    console.log(`📁 Renamed 'sanity' → 'sanity-temp'`);
  } else {
    console.warn(`⚠️ No existing sanity folder found`);
  }
} catch (err) {
  console.error('❌ Failed to rename sanity folder:', err);
  process.exit(1);
}

// Step 3 — Prompt user to disable TypeScript
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log('\n❗ Manual step required');
console.log('   A prompt will appear from the Sanity CLI.');
console.log('   You must choose **"No"** when asked about using TypeScript.');
console.log(`   Also, select npm when prompted.`);
await rl.question('⏳ Press Enter to begin Sanity installation... ');
rl.close();

// Step 4 — Install Sanity
try {
  if (await fs.pathExists(sanityPath)) {
    await fs.remove(sanityPath);
    console.log('🗑️ Removed old /sanity folder before install');
  }

  const cmd = `npm create sanity@latest -- --project ${sanityProjectId} --dataset ${sanityDataset} --template clean --output-path sanity`;

  await execaCommand(cmd, {
    cwd: basePath,
    stdio: 'inherit',
    shell: true
  });

  console.log('✅ Sanity installed in /sanity');
} catch (err) {
  console.error('❌ Failed to install Sanity:', err);
  process.exit(1);
}

// Step 5 — Remove leftover TypeScript files
try {
  const filesToRemove = [
    'sanity.config.ts',
    'tsconfig.json',
    'types/schema.ts',
  ];

  for (const file of filesToRemove) {
    const fullPath = path.join(sanityPath, file);
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath);
      console.log(`🧹 Removed leftover TypeScript file: ${file}`);
    }
  }

  // Convert sanity.config.ts to .js if still exists
  const configTs = path.join(sanityPath, 'sanity.config.ts');
  const configJs = path.join(sanityPath, 'sanity.config.js');
  if (await fs.pathExists(configTs)) {
    let content = await fs.readFile(configTs, 'utf8');
    content = content.replace(/\.ts/g, '.js');
    await fs.writeFile(configJs, content, 'utf8');
    await fs.remove(configTs);
    console.log('🔁 Converted sanity.config.ts → .js');
  }
} catch (err) {
  console.error('❌ Failed to remove or convert TypeScript files:', err);
}

// Step 6 — Backup and overwrite with sanity-temp contents
const backupPath = path.join(basePath, 'sanity-temp-files');

try {
  if (!(await fs.pathExists(sanityTempPath))) {
    console.warn(`⚠️ sanity-temp folder does not exist. Skipping copy.`);
  } else {
    await fs.ensureDir(backupPath);
    const files = await fs.readdir(sanityTempPath);

    for (const item of files) {
      const src = path.join(sanityTempPath, item);
      const dest = path.join(sanityPath, item);
      const backupDest = path.join(backupPath, item);

      if (await fs.pathExists(dest)) {
        await fs.copy(dest, backupDest, { overwrite: true });
        console.log(`🛟 Backed up ${item} → sanity-temp-files`);
      }

      await fs.copy(src, dest, { overwrite: true });
      console.log(`✅ Overwrote ${item} → sanity`);
    }
  }
} catch (err) {
  console.error('❌ Failed during backup and overwrite of sanity files:', err);
  process.exit(1);
}

// Step 7 — Inject into sanity.cli.js
try {
  const cliFilePath = path.join(sanityPath, 'sanity.cli.js');

  if (await fs.pathExists(cliFilePath)) {
    let content = await fs.readFile(cliFilePath, 'utf8');

    content = content.replace(/projectId:\s*['"`][^'"`]+['"`]/, `projectId: '${sanityProjectId}'`);
    content = content.replace(/dataset:\s*['"`][^'"`]+['"`]/, `dataset: '${sanityDataset}'`);

    if (content.includes('studioHost:')) {
      content = content.replace(/studioHost:\s*['"`][^'"`]+['"`],?/, `studioHost: '${projectName}',`);
    } else {
      content = content.replace(
        /(\s*)autoUpdates:\s*true,/,
        `$1studioHost: '${projectName}',\n$1autoUpdates: true,`
      );
    }

    await fs.writeFile(cliFilePath, content, 'utf8');
    console.log(`🔧 Updated sanity.cli.js with projectId, dataset, and studioHost`);
  } else {
    console.warn(`⚠️ Could not find sanity.cli.js`);
  }
} catch (err) {
  console.error('❌ Failed to update sanity.cli.js:', err);
  process.exit(1);
}

// Step 8 — Rewrite sanity.config.js with correct structure
try {
  const configFilePath = path.join(sanityPath, 'sanity.config.js');

  if (await fs.pathExists(configFilePath)) {
    const updatedContent = `import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {visionTool} from '@sanity/vision';
import {deskTool} from 'sanity/desk';
import {schemaTypes} from './schemaTypes';
import deskStructure from './deskStructure';

export default defineConfig({
  name: 'default',
  title: '${projectName}',

  projectId: '${sanityProjectId}',
  dataset: '${sanityDataset}',

  plugins: [
    deskTool({ structure: deskStructure }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
`;
    await fs.writeFile(configFilePath, updatedContent, 'utf8');
    console.log(`🔧 Updated sanity.config.js with correct structure and injected variables`);
  } else {
    console.warn(`⚠️ sanity.config.js not found — skipping`);
  }
} catch (err) {
  console.error('❌ Failed to update sanity.config.js:', err);
  process.exit(1);
}

// Step 9 — Clean up temp folders
try {
  if (await fs.pathExists(sanityTempPath)) {
    await fs.remove(sanityTempPath);
    console.log(`🧹 Removed temporary folder: sanity-temp`);
  }

  if (await fs.pathExists(backupPath)) {
    await fs.remove(backupPath);
    console.log(`🧹 Removed backup folder: sanity-temp-files`);
  }
} catch (err) {
  console.error('❌ Failed to clean up temporary folders:', err);
  process.exit(1);
}

// Step 10 — Deploy Sanity Studio
try {
  console.log('\n🚀 Starting Sanity deploy...');
  await execaCommand('sanity deploy', {
    cwd: sanityPath,
    stdio: 'inherit',
    shell: true,
  });   
  console.log('✅ Sanity Studio deployed successfully');
} catch (err) {
  console.error('❌ Sanity deploy failed:', err);
  process.exit(1);
}
