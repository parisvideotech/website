/**
 * Constantes du site — édition manuelle.
 * À garder centralisé pour faciliter les mises à jour ponctuelles
 * (changement de mail de contact, nouvelle URL Meetup, etc.).
 */

export const SITE = {
  name: 'Paris Video Tech',
  tagline: 'La plus grande rencontre des ingénieurs de la vidéo à Paris',
  description:
    'Communauté d\'ingénieurs, développeurs et amateurs de la technique vidéo en ligne. ' +
    'Meetups trimestriels à Paris autour de l\'encoding, du streaming, des players, et plus.',
  url: 'https://parisvideotech.com',
  locale: 'fr-FR',
  timezone: 'Europe/Paris',
  social: {
    linkedin: 'https://www.linkedin.com/company/paris-video-tech/',
    twitter: 'https://twitter.com/ParisVideoTech/',
    meetup: 'https://www.meetup.com/fr-FR/Paris-Video-Tech/',
  },
  contact: {
    email: 'contact@parisvideotech.com',
  },
  donations: {
    helloasso: 'https://www.helloasso.com/associations/paris-video-tech/formulaires/1',
  },
} as const;
