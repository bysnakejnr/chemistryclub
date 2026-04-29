import type { ClubEvent } from '../types'

export const events: ClubEvent[] = [
  {
    id: 'lab-tour-2026',
    title: 'University Lab Tour',
    date: '2026-02-18',
    location: 'Chemistry Department, State University',
    summary: 'Behind-the-scenes tour of analytical and organic chemistry labs.',
    whatWeLearned:
      'We saw how NMR and GC–MS instruments are used to identify compounds, and how safety protocols are built into every part of lab design.',
    coverImageUrl: '/images/events/lab-tour.jpg',
    galleryImageUrls: ['/images/events/lab-tour-1.jpg', '/images/events/lab-tour-2.jpg'],
  },
  {
    id: 'water-treatment-plant',
    title: 'Water Treatment Plant Visit',
    date: '2026-01-26',
    location: 'City Water Treatment Facility',
    summary: 'Field trip focused on real-world applications of solution chemistry.',
    whatWeLearned:
      'We followed water from intake to distribution, connecting concepts like coagulation, flocculation, pH control, and disinfection with chlorine and ozone.',
    coverImageUrl: '/images/events/water-plant.jpg',
    galleryImageUrls: ['/images/events/water-plant-1.jpg'],
  },
]

