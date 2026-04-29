import type { ChemTerm } from '../types'

export const terms: ChemTerm[] = [
  {
    id: 'stoichiometry',
    realWord: 'Stoichiometry',
    ourBetterWord: 'Recipe math for molecules',
    explanation:
      'Using balanced chemical equations like recipes to figure out how much reactant you need and how much product you can make.',
    category: 'Reactions',
  },
  {
    id: 'covalent-bond',
    realWord: 'Covalent bond',
    ourBetterWord: 'Electron-sharing handshake',
    explanation:
      'A connection between atoms where they share electrons so both feel like they have full outer shells.',
    category: 'Bonding',
  },
  {
    id: 'limiting-reactant',
    realWord: 'Limiting reactant',
    ourBetterWord: 'Ingredient that runs out first',
    explanation:
      'The reactant that gets used up first and decides how much product you can actually make in a reaction.',
    category: 'Reactions',
  },
]

