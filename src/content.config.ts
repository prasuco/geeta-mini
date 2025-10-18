// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

// 2. Import loader(s)
import { glob, file } from 'astro/loaders';

const sloks = defineCollection({

    loader: glob({ pattern: '**/**/index.json', base: './src/content/slok' }),
    schema: z.object({
        "chapter": z.number(),
        "slok": z.string(),
        "verse": z.number()
    })
});


const chapters = defineCollection({

    loader: glob({ pattern: '**/index.json', base: './src/content/chapter' }),
    schema: z.object({
        "chapter_number": z.number(),
        "verses_count": z.number(),
        "name": z.string(),
        'transliteration': z.string(),
        'meaning': z.object({
            'en': z.string(),
            "hi": z.string()
        })
    })
});




// 4. Export a single `collections` object to register your collection(s)
export const collections = { sloks, chapters };