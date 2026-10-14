export const categories = [
  'Quick Games',
  'Brain Teasers',
  'Creative Tasks',
  'Random Challenges',
] as const

export type Category = (typeof categories)[number]

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Challenge {
  id: string
  title: string
  description: string
  estimatedMinutes: number
  difficulty: Difficulty
  category: Category
}
