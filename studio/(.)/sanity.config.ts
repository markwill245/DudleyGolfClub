import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'DudleyGolfClub',

  projectId: 'c54r3a5t',
  dataset: 'production_copy',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
