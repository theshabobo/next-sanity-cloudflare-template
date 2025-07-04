// sanity-setup.mjs
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

const sanityProjectId = args.projectId;
const basePath = args.basePath;
const projectName = args.projectName;

if (!sanityProjectId || sanityProjectId.length < 5) {
  console.error('❌ Missing or invalid --projectId');
  process.exit(1);
}

if (!fs.existsSync(basePath)) {
  console.error('❌ Invalid --basePath: Directory does not exist.');
  process.exit(1);
}

if (!projectName || projectName.trim().length === 0) {
  console.error('❌ Missing or invalid --projectName');
  process.exit(1);
}

// Strip domain extension
const studioHost = projectName.replace(/\.[^/.]+$/, '');
const title = studioHost;

const outputPath = path.join(basePath, 'sanity');
const templatePath = path.join(__dirname, 'sanity-template');

(async () => {
  console.log('\n🧠 Sanity Studio Setup\n');

  // Step 1 – Login
  console.log('🔐 Logging into Sanity...');
  try {
    await execa('sanity', ['login'], { stdio: 'inherit' });
    console.log('✅ Logged into Sanity.\n');
  } catch {
    console.error('❌ Sanity login failed.');
    process.exit(1);
  }

  // Step 2 – Install Sanity (No TypeScript)
  const fullCommand = [
    'npm',
    'create',
    'sanity@latest',
    '--',
    '--project',
    sanityProjectId,
    '--dataset',
    'production',
    '--template',
    'clean',
    '--output-path',
    outputPath
  ];

  console.log(`📦 Installing Sanity Studio at: ${outputPath}`);
  console.log(`📋 Running command:\n${fullCommand.join(' ')}\n`);

  try {
    await execa(fullCommand[0], fullCommand.slice(1), { stdio: 'inherit' });
    console.log('\n✅ Sanity Studio created successfully.');
  } catch {
    console.error('❌ Failed to create Sanity Studio.');
    process.exit(1);
  }

  // Step 3 – Copy custom files
  const filesToCopy = [
    ['schemaTypes', 'index.js'],
    ['.', 'deskStructure.js'],
    ['.', 'eslint.config.js']
  ];

  for (const [subfolder, file] of filesToCopy) {
    const src = path.join(templatePath, subfolder, file);
    const dest = path.join(outputPath, subfolder, file);
    try {
      await fs.copy(src, dest);
      console.log(`✅ Copied ${file}`);
    } catch {
      console.warn(`⚠️ Skipped ${file}: Source not found`);
    }
  }

  // Step 4 – Write sanity.cli.js
  const cliConfig = `import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '${sanityProjectId}',
    dataset: 'production'
  },
  studioHost: '${studioHost}',
  autoUpdates: true,
})
`;
  await fs.outputFile(path.join(outputPath, 'sanity.cli.js'), cliConfig);
  console.log('✅ Wrote sanity.cli.js');

  // Step 5 – Write sanity.config.js
  const sanityConfig = `import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {visionTool} from '@sanity/vision';
import {deskTool} from 'sanity/desk';
import {schemaTypes} from './schemaTypes';
import deskStructure from './deskStructure';

export default defineConfig({
  name: 'default',
  title: '${title}',

  projectId: '${sanityProjectId}',
  dataset: 'production',

  plugins: [
    deskTool({ structure: deskStructure }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
`;
  await fs.outputFile(path.join(outputPath, 'sanity.config.js'), sanityConfig);
  console.log('✅ Wrote sanity.config.js');

  // Step 6 – Deploy Sanity Studio
  console.log('\n🌐 Deploying Sanity Studio...');
  try {
    await execa('npx', ['sanity', 'deploy'], {
      cwd: outputPath,
      stdio: 'inherit'
    });
    console.log('\n✅ Sanity Studio deployed successfully.');
  } catch {
    console.error('❌ Sanity deploy failed.');
    process.exit(1);
  }

  console.log('\n🎉 Sanity Studio setup complete.\n');
})();
