// Content Collections — schémas typés pour le contenu MDX.
// Doc : https://docs.astro.build/en/guides/content-collections/

import { defineCollection, z } from 'astro:content';

/**
 * Collection `meetups` — un meetup par fichier MDX dans `src/content/meetups/`.
 * Le `slug` du fichier (nom sans extension) sert d'URL.
 */
const meetups = defineCollection({
  type: 'content',
  schema: z.object({
    /** Titre complet du meetup (ex. "Paris Video Tech #32 feat. Les Echos"). */
    title: z.string(),

    /** Date de l'événement (ISO 8601). Sert au tri et à l'affichage. */
    date: z.coerce.date(),

    /**
     * Statut de l'événement.
     * - `upcoming` : à venir, mis en avant sur la home
     * - `past` : passé (par défaut)
     * - `draft` : exclu du build
     */
    status: z.enum(['upcoming', 'past', 'draft']).default('past'),

    /** Lieu (ex. "Le Wagon, Paris 11e"). Optionnel. */
    location: z.string().optional(),

    /** Résumé court (1–2 phrases) pour les listings. */
    summary: z.string().max(280),

    /**
     * Chemin public de la cover (ex. `/images/meetups/pvt-32.jpg`).
     * En Phase 2 on stocke un path string ; en Phase 4 on pourra repasser
     * à `image()` pour profiter de l'optimisation Astro Image en plaçant
     * les fichiers dans `src/assets/meetups/`.
     */
    cover: z.string().optional(),
    cover_alt: z.string().optional(),

    /** Liste d'intervenants. */
    speakers: z
      .array(
        z.object({
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          talk_title: z.string().optional(),
          linkedin: z.string().url().optional(),
        })
      )
      .default([]),

    /** Lien vers le replay YouTube (URL complète youtube.com/watch ou youtu.be). */
    youtube_url: z.string().url().optional(),

    /** Tags thématiques (HLS, ABR, IA, etc.). */
    tags: z.array(z.string()).default([]),

    /**
     * Si défini, redirige automatiquement depuis l'ancienne URL WordPress
     * (pour les meetups dont le slug a été normalisé).
     */
    legacy_slug: z.string().optional(),

    /** ID du post WP original — utile pour traçabilité de la migration. */
    legacy_wp_id: z.number().optional(),

    /** Article publié sur le site. `false` exclut du build (équivalent à status `draft`). */
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  meetups,
};
