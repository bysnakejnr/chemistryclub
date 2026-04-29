export interface ChemElement {
  atomicNumber: number
  symbol: string
  name: string
  group: number | null
  period: number
  block: 's' | 'p' | 'd' | 'f'
  isCompleted: boolean
  realLifeUsage?: string
  mostCommonUseOrCompound?: string
  discoveredWhen?: string
  toxicOrRadioactiveCause?: string
  compositionNote?: string
  whereFound?: string
}

export interface ClubEvent {
  id: string
  title: string
  date: string
  location: string
  summary: string
  whatWeLearned: string
  coverImageUrl: string
  galleryImageUrls: string[]
}

export interface ChemTopic {
  id: string
  slug: string
  title: string
  date: string
  summary: string
  content: string
  coverImageUrl: string
  galleryImageUrls: string[]
}

export interface ChemTerm {
  id: string
  realWord: string
  ourBetterWord: string
  explanation: string
  category?: string
}

