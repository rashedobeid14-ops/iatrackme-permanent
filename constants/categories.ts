export interface HabitCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

export const HABIT_CATEGORIES: HabitCategory[] = [
  {
    id: "health",
    name: "Health",
    icon: "💚",
    color: "#4CAF50",
    backgroundColor: "#1B5E20",
  },
  {
    id: "exercise",
    name: "Exercise",
    icon: "💪",
    color: "#FF6B6B",
    backgroundColor: "#C62828",
  },
  {
    id: "meditation",
    name: "Meditation",
    icon: "🧘",
    color: "#9C27B0",
    backgroundColor: "#4A148C",
  },
  {
    id: "reading",
    name: "Reading",
    icon: "📚",
    color: "#2196F3",
    backgroundColor: "#0D47A1",
  },
  {
    id: "work",
    name: "Work",
    icon: "💼",
    color: "#FF9800",
    backgroundColor: "#E65100",
  },
  {
    id: "learning",
    name: "Learning",
    icon: "🎓",
    color: "#673AB7",
    backgroundColor: "#311B92",
  },
  {
    id: "art",
    name: "Art",
    icon: "🎨",
    color: "#E91E63",
    backgroundColor: "#880E4F",
  },
  {
    id: "music",
    name: "Music",
    icon: "🎵",
    color: "#00BCD4",
    backgroundColor: "#006064",
  },
  {
    id: "cooking",
    name: "Cooking",
    icon: "👨‍🍳",
    color: "#FFC107",
    backgroundColor: "#F57F17",
  },
  {
    id: "sports",
    name: "Sports",
    icon: "⚽",
    color: "#4CAF50",
    backgroundColor: "#1B5E20",
  },
  {
    id: "travel",
    name: "Travel",
    icon: "✈️",
    color: "#00BCD4",
    backgroundColor: "#006064",
  },
  {
    id: "socializing",
    name: "Socializing",
    icon: "👥",
    color: "#FF6B9D",
    backgroundColor: "#C2185B",
  },
  {
    id: "writing",
    name: "Writing",
    icon: "✍️",
    color: "#8B4513",
    backgroundColor: "#5D4037",
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: "🎮",
    color: "#9C27B0",
    backgroundColor: "#4A148C",
  },
  {
    id: "productivity",
    name: "Productivity",
    icon: "✅",
    color: "#4CAF50",
    backgroundColor: "#1B5E20",
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    icon: "🧠",
    color: "#673AB7",
    backgroundColor: "#311B92",
  },
  {
    id: "hobby",
    name: "Hobby",
    icon: "🎯",
    color: "#FF9800",
    backgroundColor: "#E65100",
  },
  {
    id: "other",
    name: "Other",
    icon: "⭐",
    color: "#607D8B",
    backgroundColor: "#37474F",
  },
];

export const getCategoryById = (id: string): HabitCategory | undefined => {
  return HABIT_CATEGORIES.find((cat) => cat.id === id);
};

export const getCategoryByName = (name: string): HabitCategory | undefined => {
  return HABIT_CATEGORIES.find((cat) => cat.name === name);
};
