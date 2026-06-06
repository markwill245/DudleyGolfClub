<<<<<<< HEAD
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

export default defineConfig({
  name: 'default',
  title: 'Dudley Golf Club Admin',

  // Swapped in your real Project ID here!
  projectId: 'c54r3a5t', 
  dataset: 'production',
  basePath: '/studio', 

  plugins: [deskTool()],

  schema: {
    types: [
      {
        name: 'courseConditions',
        title: 'Course Conditions',
        type: 'document',
        fields: [
          {
            name: 'status',
            title: 'Daily Status Notice',
            type: 'string',
            description: 'e.g., Course Open - No buggies on fairways today'
          }
        ]
      }
    ],
  },
=======
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

export default defineConfig({
  name: 'default',
  title: 'Dudley Golf Club Admin',

  // Swapped in your real Project ID here!
  projectId: 'c54r3a5t', 
  dataset: 'production',
  basePath: '/studio', 

  plugins: [deskTool()],

  schema: {
    types: [
      {
        name: 'courseConditions',
        title: 'Course Conditions',
        type: 'document',
        fields: [
          {
            name: 'status',
            title: 'Daily Status Notice',
            type: 'string',
            description: 'e.g., Course Open - No buggies on fairways today'
          }
        ]
      }
    ],
  },
>>>>>>> a1349b6e417ccd8802b2cef382d95cb7bf8e6773
})