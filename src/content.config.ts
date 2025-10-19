// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

// 2. Import loader(s)
import { glob, file } from 'astro/loaders';

const sloks = defineCollection({

    loader: glob({
        pattern: '**/*/index.json', base: './src/content/slok',
    }),
    schema: z.object({
        "chapter": z.number(),
        "slok": z.union([z.string(), z.number()]),
        "verse": z.number(),
        'transliteration': z.string(),
        'raman': z.object({
            'sc': z.string(),
            'et': z.string()
        })
    })
});


const chapters = defineCollection({

    loader: glob({ pattern: '**/index.json', base: './src/content/chapter', }),
    schema: z.object({
        "chapter_number": z.number(),
        "verses_count": z.number(),
        "name": z.string(),
        'transliteration': z.string(),
        'meaning': z.object({
            'en': z.string(),
            "hi": z.string()
        })

        ,

        'summary': z.object({

            en: z.string(),
            hi: z.string(),
        })
    })
});




// 4. Export a single `collections` object to register your collection(s)
export const collections = { sloks, chapters };