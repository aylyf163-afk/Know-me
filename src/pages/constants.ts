export const SECTION_ORDER = ['about', 'skills', 'projects', 'contact'] as const

export type SectionId = (typeof SECTION_ORDER)[number]
