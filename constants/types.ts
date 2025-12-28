export type ActivityType = 'habit' | 'recurring_task' | 'task';

export type FrequencyType =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "period"
  | "repeat";

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  categoryId: string;
  targetTime: number;
  createdAt: number;
  updatedAt: number;
  color: string;
  backgroundColor: string;
  use24HourFormat: boolean;
  startTime: string;
  frequency: FrequencyType;
  frequencyDetails: any;
  archived: boolean;
  pinned: boolean;
  dueDate?: string; // For single tasks
  dueTime?: string; // For single tasks
  isCompleted?: boolean; // For tasks
  completedAt?: number; // For tasks
}

export interface ActivityLog {
  id: string;
  activityId: string;
  date: string;
  duration: number;
  completionPercentage: number;
  timestamp: number;
}

export interface Goal {
  id: string;
  activityId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentCount: number;
  achieved: boolean;
  achievedAt?: number;
}

export interface FilterList {
  id: string;
  name: string;
  filters: {
    categories: string[];
    types: ActivityType[];
    status: 'active' | 'archived' | 'all';
  };
  createdAt: number;
}
