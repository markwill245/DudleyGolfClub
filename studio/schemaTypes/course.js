import { defineType, defineField } from 'sanity'

export const course = defineType({
    name: 'course',
    title: 'Course Guide',
    type: 'document',
    fields: [
        defineField({ name: 'holeNumber', title: 'Hole Number', type: 'number' }),
        defineField({ name: 'holeName', title: 'Hole Name', type: 'string' }),
        defineField({ name: 'par', title: 'Par', type: 'number' }),
        defineField({ name: 'yards', title: 'Yards', type: 'number' }),
        defineField({ name: 'proTip', title: 'Pro Tip', type: 'text' }),
        defineField({ name: 'introduction', title: 'Introduction', type: 'text' }),
    ],
})
