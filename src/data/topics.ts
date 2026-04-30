import type { ChemTopic } from '../types'

export const topics: ChemTopic[] = [
  {
    id: 'week-3-covalent-bonds',
    slug: 'covalent-bonds',
    title: 'Covalent Bonds',
    date: 'Week 3',
    summary: 'How atoms share electrons to form molecules and why shapes matter.',
    content:
      'Covalent bonds form when two non-metal atoms share pairs of electrons. We explored Lewis structures, bonding vs. lone pairs, and the idea of bond polarity. Using models, we connected VSEPR shapes (like linear, bent, trigonal pyramidal) to actual molecules such as H₂O, NH₃, and CO₂.',
    coverImageUrl: '/images/topics/covalent-bonds.jpg',
    galleryImageUrls: [],
  },
  {
    id: 'week-4-intermolecular-forces',
    slug: 'intermolecular-forces',
    title: 'Intermolecular Forces',
    date: 'Week 4',
    summary: 'Forces between molecules that explain boiling points, solubility, and more.',
    content:
      'We compared London dispersion, dipole–dipole interactions, and hydrogen bonding. By ranking boiling points of related compounds, we linked “stickiness” between molecules to macroscopic properties like melting point, viscosity, and solubility in water vs. oil.',
    coverImageUrl: '',
    galleryImageUrls: [],
  },
]
