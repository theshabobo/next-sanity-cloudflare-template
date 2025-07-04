import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {visionTool} from '@sanity/vision';
import {deskTool} from 'sanity/desk';
import {schemaTypes} from './schemaTypes';
import deskStructure from './deskStructure';

export default defineConfig({
  name: 'default',
  title: 'theodore-miller',

  projectId: 'ogrckg5g',
  dataset: 'production',

  plugins: [
    deskTool({ structure: deskStructure }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
