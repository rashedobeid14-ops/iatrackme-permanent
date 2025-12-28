export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  icon: string;
  categoryId: string;
  targetTime: number; // minutes per day
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const LOCAL_CHALLENGES: Challenge[] = [
  {
    id: 'water_30',
    title: '30-Day Hydration',
    description: 'Drink at least 2L of water every day for a month.',
    durationDays: 30,
    icon: '💧',
    categoryId: 'health',
    targetTime: 5,
    difficulty: 'Easy',
  },
  {
    id: 'meditation_7',
    title: 'Zen Week',
    description: 'Meditate for 10 minutes every day for a week.',
    durationDays: 7,
    icon: '🧘',
    categoryId: 'meditation',
    targetTime: 10,
    difficulty: 'Easy',
  },
  {
    id: 'reading_21',
    title: 'Bookworm Habit',
    description: 'Read for 30 minutes every day for 21 days.',
    durationDays: 21,
    icon: '📚',
    categoryId: 'reading',
    targetTime: 30,
    difficulty: 'Medium',
  },
  {
    id: 'exercise_30',
    title: 'Fitness Month',
    description: 'Exercise for 45 minutes every day for 30 days.',
    durationDays: 30,
    icon: '💪',
    categoryId: 'exercise',
    targetTime: 45,
    difficulty: 'Hard',
  },
  {
    id: 'no_sugar_14',
    title: 'Sugar-Free Fortnight',
    description: 'Avoid added sugars for 14 days straight.',
    durationDays: 14,
    icon: '🍎',
    categoryId: 'health',
    targetTime: 1,
    difficulty: 'Medium',
  },
  {
    id: 'coding_100',
    title: '100 Days of Code',
    description: 'Code for at least 1 hour every day for 100 days.',
    durationDays: 100,
    icon: '💻',
    categoryId: 'learning',
    targetTime: 60,
    difficulty: 'Hard',
  }
];
