// 1. Import utilities from `astro:content`
import { defineCollection, z } from "astro:content";

// 2. Import loader(s)
import { glob, file } from "astro/loaders";

const sloks = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: "./src/content/sloks",
  }),
  schema: z.object({
    chapter_id: z.number(),
    chapter_number: z.number(),
    externalId: z.number(),
    id: z.number(),
    text: z.string(),
    title: z.string(),
    verse_number: z.number(),
    verse_order: z.number(),
    transliteration: z.string(),
    word_meanings: z.string(),
  }),
});

const chapters = defineCollection({
  loader: glob({ pattern: "**/index.json", base: "./src/content/chapters" }),
  schema: z.object({
    chapter_number: z.number(),
    chapter_summary: z.string(),
    chapter_summary_hindi: z.string(),
    id: z.number(),
    image_name: z.string(),
    name: z.string(),
    name_meaning: z.string(),
    name_translation: z.string(),
    name_transliterated: z.string(),
    verses_count: z.number(),
  }),
});

const translations = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/translations" }),
  schema: z.array(
    z.object({
      authorName: z.string(),
      author_id: z.number(),
      description: z.string(),
      id: z.number(),
      lang: z.string(),
      language_id: z.number(),
      verseNumber: z.number(),
      verse_id: z.number(),
    }),
  ),
});

const commentary = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/commentary" }),
  schema: z.array(
    z.object({
      authorName: z.string(),
      author_id: z.number(),
      description: z.string(),
      id: z.number(),
      lang: z.string(),
      language_id: z.number(),
      verseNumber: z.number(),
      verse_id: z.number(),
    }),
  ),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { sloks, chapters, translations, commentary };
