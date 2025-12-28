# IATrackMe - Technical Documentation

## Project Overview

**IATrackMe** is a mobile habit tracking application built with React Native and Expo, designed for Android 14+ devices. The app features a dark theme with neon accents (sky blue #00d4ff and orange #ff6600), neomorphic UI elements, and comprehensive habit management with analytics.

## Technology Stack

- **Framework:** React Native 0.81 with Expo SDK 54
- **Language:** TypeScript 5.9
- **State Management:** React Hooks (useState, useEffect, useContext)
- **Storage:** AsyncStorage for local data persistence
- **Navigation:** Expo Router 6
- **Animations:** React Native Reanimated 4.x
- **UI Components:** React Native built-in components (View, ScrollView, FlatList, Modal, etc.)
- **Icons:** Material Icons via Expo Vector Icons
- **SVG Rendering:** react-native-svg for progress circles

## Project Structure

```
iatrackme/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation configuration
│   │   ├── index.tsx            # Calendar tab (home screen)
│   │   ├── habits.tsx           # Habits tracking tab
│   │   ├── timer.tsx            # Timer/stopwatch tab
│   │   ├── analytics.tsx        # Analytics & statistics tab
│   │   └── settings.tsx         # Settings tab
│   ├── modal.tsx                # Modal screen example
│   └── oauth/                   # OAuth callback handler
├── components/
│   ├── themed-text.tsx          # Text component with theme support
│   ├── themed-view.tsx          # View component with theme support
│   ├── category-icon.tsx        # Habit category icon component
│   ├── filled-progress-circle.tsx # Pie-chart style progress circle
│   ├── haptic-tab.tsx           # Haptic feedback for tabs
│   └── ui/
│       └── icon-symbol.tsx      # Icon mapping for tabs
├── constants/
│   ├── theme.ts                 # Color palette & typography
│   └── categories.ts            # Habit categories with icons & colors
├── hooks/
│   ├── use-auth.ts              # Authentication state management
│   ├── use-color-scheme.ts      # Theme color hook
│   └── use-theme-color.ts       # Theme color utility
├── lib/
│   └── trpc.ts                  # tRPC client configuration
├── assets/
│   └── images/
│       ├── icon.png             # App icon (custom Z design)
│       ├── splash-icon.png      # Splash screen icon
│       ├── favicon.png          # Web favicon
│       └── android-icon-*.png   # Android adaptive icons
├── app.config.ts                # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
└── README.md                    # User documentation
```

## Key Features

### 1. Calendar Tab (Home Screen)

**Purpose:** View habits by date and add new habits

**Components:**
- **Date Strip:** Horizontal scrollable date selector (±30 days from today)
  - Auto-centers on today's date on load
  - Today highlighted with neon sky blue border
  - Selected date highlighted with neon orange border
  - Tap any date to open habit creation modal

- **Recent Logs:** Shows all habit logs for selected date
- **Active Habits:** Shows habits with logs for selected date
- **All Habits:** Complete list of created habits with quick "Log" button
- **FAB Button:** Floating Action Button (neon sky blue) to add new habit

**Data Structure:**
```typescript
interface Habit {
  id: string;
  name: string;
  categoryId: string;
  targetTime: number;
  createdAt: number;
  color: string;
  backgroundColor: string;
  use24HourFormat: boolean;
}

interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  duration: number;
  completionPercentage: number;
  timestamp: number;
}
```

### 2. Habits Tab

**Purpose:** View all habits with progress tracking and completion statistics

**Features:**
- **Habit Cards:** Display each habit with:
  - Category icon (colored background)
  - Habit name and category
  - Target time
  - Today's time spent
  - **Filled Progress Circle:** Pie-chart style solid color fill (neon orange)
    - Shows completion percentage (0-100%)
    - Center text displays percentage
  - Stats bar showing completion % and time spent
  - Long-press to delete

- **Pull-to-Refresh:** Swipe down to refresh data
- **Empty State:** Prompts user to create first habit

### 3. Timer Tab

**Purpose:** Track time spent on habits with scoring system

**Features:**
- **Habit Selector:** Horizontal scroll to select habit
- **Timer Display:** Large centered progress circle (neon sky blue)
  - Pie-chart style solid fill
  - Shows time remaining (HH:MM:SS format)
  - Fills as time elapses

- **Preset Timers:** Quick start buttons (5, 15, 30 minutes)
- **Controls:** Start/Pause, Resume, Stop, Lap buttons
- **Lap Recording:** Track multiple laps within single session
- **Scoring System:** 
  - Calculates completion % based on target time
  - Auto-submits habit log with score
  - Displays completion percentage after submission

### 4. Analytics Tab

**Purpose:** View habit performance trends and statistics

**Features:**
- **Statistics Cards:**
  - Total habits count
  - Average completion score
  - Current day streak
  - Completion rate percentage

- **Bar Charts:** Weekly/monthly performance visualization
- **Date Range Selector:** Filter by week, month, or custom range
- **Recent Activity:** List of recent habit logs with scores

### 5. Settings Tab

**Purpose:** Configure app preferences and manage data

**Features:**
- **Theme Settings:** Dark/light mode toggle (dark always active)
- **Notifications:** Enable/disable habit reminders
- **Statistics Display:** Show total habits and total logs
- **Data Export:** Download all habits and logs as CSV file
  - Includes weekly/monthly statistics
  - Recurring habit analysis
  - Summary metrics

- **Reset Data:** Clear all habits and logs (with confirmation)
- **About Section:** App info and version

## Data Storage

All data is stored locally using **AsyncStorage** for persistence:

```typescript
// Habits storage key: "habits"
const habits = await AsyncStorage.getItem("habits");

// Habit logs storage key: "habitLogs"
const logs = await AsyncStorage.getItem("habitLogs");
```

**Data Format:** JSON stringified arrays

**Backup/Restore:** CSV export available in Settings tab

## UI/UX Design

### Color Palette

- **Background:** #1a1a1a (dark gray)
- **Card Background:** #252525 (darker gray)
- **Border:** #333333 (subtle gray)
- **Primary Text:** #e0e0e0 (light gray)
- **Secondary Text:** #999999 (medium gray)
- **Neon Sky Blue:** #00d4ff (primary accent)
- **Neon Orange:** #ff6600 (secondary accent)

### Typography

- **Title:** 32px, bold
- **Subtitle:** 20px, bold
- **Default:** 16px, regular
- **Caption:** 12px, regular
- **Font Family:** System default (San Francisco on iOS, Roboto on Android)

### Spacing

- **Base Unit:** 8px
- **Padding:** 16px (standard), 12px (compact), 8px (tight)
- **Gap:** 8px-16px between components
- **Border Radius:** 8-12px (buttons), 12-16px (cards)

### Neomorphic Effects

Embossed 3D effects using shadows:
```typescript
const NeomorphicShadows = {
  dark: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
};
```

## Component Architecture

### ThemedText & ThemedView

Automatically apply theme colors based on light/dark mode:

```typescript
<ThemedText type="title">Habit Tracker</ThemedText>
<ThemedView style={styles.container}>
  {/* Content */}
</ThemedView>
```

### CategoryIcon

Displays habit category with colored background:

```typescript
<CategoryIcon
  icon="💪"
  backgroundColor="#FF6B6B"
  size="large"
  selected={true}
/>
```

### FilledProgressCircle

Pie-chart style progress indicator:

```typescript
<FilledProgressCircle
  progress={0.75}
  size={120}
  fillColor="#00d4ff"
  backgroundColor="#252525"
  centerText="75%"
/>
```

## Habit Categories

18 predefined categories with unique icons and colors:

1. **Health** (💚 Green #4CAF50)
2. **Exercise** (💪 Red #FF6B6B)
3. **Meditation** (🧘 Purple #9C27B0)
4. **Reading** (📚 Blue #2196F3)
5. **Work** (💼 Orange #FF9800)
6. **Learning** (🎓 Purple #673AB7)
7. **Art** (🎨 Pink #E91E63)
8. **Music** (🎵 Cyan #00BCD4)
9. **Cooking** (👨‍🍳 Yellow #FFC107)
10. **Sports** (⚽ Green #8BC34A)
11. **Travel** (✈️ Cyan #00ACC1)
12. **Socializing** (👥 Pink #F06292)
13. **Writing** (✍️ Brown #795548)
14. **Gaming** (🎮 Purple #7E57C2)
15. **Productivity** (✅ Green #66BB6A)
16. **Mindfulness** (🧠 Purple #AB47BC)
17. **Hobby** (🎯 Orange #FFA726)
18. **Other** (⭐ Gray #9E9E9E)

## Navigation Structure

```
Tab Navigation (Bottom Tabs)
├── Calendar (index.tsx)
│   └── Add Habit Modal
├── Habits (habits.tsx)
├── Timer (timer.tsx)
├── Analytics (analytics.tsx)
└── Settings (settings.tsx)
    └── CSV Export
```

## Performance Optimizations

1. **FlatList for Lists:** Used instead of ScrollView + map for better performance
2. **Memoization:** Components wrapped with React.memo to prevent unnecessary re-renders
3. **Lazy Loading:** Data loaded on demand using useEffect
4. **SVG Optimization:** Minimal SVG usage, CSS-based progress circles where possible
5. **Bundle Size:** Removed heavy dependencies, optimized for Android 14

## Known Limitations

1. **No Cloud Sync:** Data stored locally only (can be exported as CSV)
2. **No User Authentication:** App designed for single-user local use
3. **No Push Notifications:** Reminders not implemented (future feature)
4. **No Recurring Habits:** Habits don't auto-repeat (manual logging required)
5. **Limited Analytics:** Basic charts, no advanced ML predictions

## Development Workflow

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run on Android device via Expo Go
# Scan QR code from terminal
```

### Testing

```bash
# Run TypeScript check
pnpm tsc

# Build for production
pnpm build
```

### Building for Production

```bash
# Build APK for Android
eas build --platform android

# Build IPA for iOS
eas build --platform ios
```

## Future Enhancements

1. **Recurring Habits:** Daily, weekly, monthly repeat options
2. **Push Notifications:** Scheduled reminders at specific times
3. **Streak Badges:** Visual achievements for milestone streaks
4. **Social Sharing:** Share progress on social media
5. **Cloud Sync:** Optional Firebase/Supabase integration
6. **Advanced Analytics:** ML-powered insights and predictions
7. **Habit Templates:** Pre-built habit categories with suggestions
8. **Dark/Light Theme Toggle:** User preference for theme

## Troubleshooting

### App Won't Load

1. Clear Expo cache: `expo start -c`
2. Restart dev server: `pnpm dev`
3. Clear AsyncStorage: Delete app and reinstall

### Habits Not Saving

1. Check AsyncStorage permissions in app.config.ts
2. Verify JSON serialization in storage calls
3. Check device storage space

### Progress Circles Not Displaying

1. Verify react-native-svg is installed
2. Check SVG component props (progress 0-1 range)
3. Ensure fillColor and backgroundColor are valid hex codes

## Support & Contributing

For issues or feature requests, please contact the development team or submit a GitHub issue.

---

**Last Updated:** December 27, 2025
**Version:** 1.0.0
**License:** MIT
