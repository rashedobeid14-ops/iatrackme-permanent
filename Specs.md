# IATrackMe - Product Specifications

## Overview

**IATrackMe** is a mobile habit tracking application designed for Android 14+ devices (tested on OnePlus Nord CE 2 Lite 5G with OxygenOS). The app uses a dark theme with neon accents (sky blue #00d4ff and orange #ff6600) and neomorphic UI elements to create a modern, visually engaging experience for tracking daily habits, tasks, and recurring activities.

---

## Core Vision

IATrackMe empowers users to build and maintain positive habits through:
- **Visual progress tracking** with pie-chart style progress circles
- **Flexible scheduling** supporting daily, weekly, monthly, yearly, and custom frequencies
- **Comprehensive analytics** with weekly/monthly statistics and trend graphs
- **Data export** to CSV for backup and external analysis
- **Intuitive multi-step workflows** for habit creation and management

---

## User Interface Design

### Design System

**Color Palette:**
- Primary Background: #1a1a1a (dark gray)
- Card Background: #252525 (slightly lighter gray)
- Neon Sky Blue: #00d4ff (primary accent, active elements)
- Neon Orange: #ff6600 (secondary accent, progress indicators)
- Text Primary: #e0e0e0 (light gray)
- Text Secondary: #999999 (medium gray)
- Border: #333333 (subtle dividers)

**Typography:**
- Font Family: Sans Serif Regular (system default)
- Title: 32px, bold
- Subtitle: 20px, bold
- Body: 16px, regular
- Caption: 12px, regular

**UI Elements:**
- Neomorphic design with embossed 3D effects
- Beveled edges on interactive elements
- Rounded corners (8-12px for buttons, 12-16px for cards)
- Smooth animations and transitions

---

## Screen Specifications

### 1. Calendar Tab (Home Screen)

**Purpose:** Primary entry point for viewing daily habits and logging activities.

**Layout:**
- **Top Section:** Horizontal scrollable date strip (30 days before/after today)
  - Each date displayed as beveled box (80x80px)
  - Today's date: Sky blue border (#00d4ff)
  - Selected date: Neon orange border (#ff6600)
  - Auto-centers on today's date on app load
  - Shows day abbreviation (Mon, Tue, etc.) and date number
  
- **Main Content:** FlatList with three sections
  1. **Recent Logs** – Shows habit logs for selected date
  2. **Active Habits** – Displays habits with logs for selected date
  3. **All Habits** – Lists all created habits with quick log button

- **Floating Action Button (FAB):**
  - Position: Bottom-right, above tab bar
  - Size: 56x56px
  - Color: Neon sky blue (#00d4ff)
  - Icon: Plus (+) symbol
  - Function: Opens multi-step habit creation modal
  - Neomorphic shadow effect

**Interactions:**
- Tap date → Opens multi-step habit creation modal
- Tap + button → Opens multi-step habit creation modal
- Tap "Log" button → Logs habit for selected date
- Swipe date strip → Navigate between dates

---

### 2. Habits Tab

**Purpose:** View all habits with progress tracking and performance metrics.

**Layout:**
- **Habit List:** FlatList of all created habits
  - Each habit card displays:
    - Category icon (emoji with colored background)
    - Habit name
    - Target time
    - Start time
    - **Filled Progress Circle** (neon orange #ff6600)
      - Pie-chart style fill from 0-100%
      - Shows completion percentage in center
      - No stroke/oval wrapping effect
    - Time laps (hours:minutes spent)
    - Mini line graph (monthly trend)
    - Swipe-to-delete gesture

- **Card Styling:**
  - Neomorphic design with embossed 3D effect
  - Background: #252525
  - Border: Subtle shadow

**Interactions:**
- Tap habit card → View habit details
- Swipe left → Delete habit
- Pull-to-refresh → Reload data

---

### 3. Timer/Stopwatch Tab

**Purpose:** Track time spent on habits with automatic scoring.

**Layout:**
- **Large Circular Progress Display:**
  - Size: 240x240px
  - **Filled Progress Circle** (neon sky blue #00d4ff)
    - Pie-chart style fill from 0-100%
    - Shows time remaining or elapsed in center
    - No stroke/oval wrapping effect
  - Displays HH:MM:SS format

- **Habit Selector:** Dropdown to choose which habit to track

- **Timer Controls:**
  - 3 preset buttons: 5 min, 15 min, 30 min
  - Start/Pause/Stop buttons
  - Lap recording system

- **Scoring System:**
  - Automatic calculation after timer completion
  - Completion % = (time tracked / target time) × 100
  - Displays score immediately after submission

- **Activity Selection:** Shows "No activity selected" until habit is chosen

**Interactions:**
- Select habit → Enable timer controls
- Tap preset → Set timer duration
- Tap Start → Begin countdown
- Tap Pause → Pause timer
- Tap Stop → End timer and calculate score
- Tap Submit → Log habit with calculated score

---

### 4. Analytics Tab

**Purpose:** Visualize habit performance and statistics over time.

**Layout:**
- **Statistics Cards:**
  - Total habits count
  - Average completion score
  - Current day streak
  - Completion rate percentage

- **Line Graphs:**
  - Weekly performance trend
  - Monthly performance trend
  - Y-axis: Completion percentage (0-100%)
  - X-axis: Days or weeks

- **Date Range Selector:** Toggle between Week/Month/Custom views

- **Recent Activity List:** Shows daily scores and habit completions

**Interactions:**
- Tap Week/Month buttons → Change graph view
- Tap date range → Open custom date picker
- Scroll → View more activity history

---

### 5. Settings Tab

**Purpose:** Manage app preferences and data.

**Layout:**
- **Theme Settings:**
  - Dark/Light mode toggle (always dark for IATrackMe)
  - Color scheme preview

- **Notifications:**
  - Enable/Disable push notifications
  - Notification time preferences
  - Habit-specific reminder settings

- **Data Management:**
  - **Export as CSV** button
    - Exports: All habits, all logs, weekly stats, monthly stats, recurring habit analysis
    - File format: .csv (Excel/Google Sheets compatible)
    - Includes: Habit names, frequencies, completion %, total time invested
  - **Reset All Data** button with confirmation dialog
  - Statistics display (total habits created, total logs recorded)

- **About Section:**
  - App version
  - App name: IATrackMe
  - Custom Z ice-mountain logo

**Interactions:**
- Toggle switches → Change settings
- Tap Export → Download CSV file
- Tap Reset → Show confirmation, then clear all data

---

## Multi-Step Habit Creation Flow

### Step 1: Habit Details

**Title:** "What time of the day it starts?" (Sky blue color)

**Form Fields:**
1. **Habit Name** – Large text input field
   - Placeholder: "Enter habit name"
   - Required field

2. **Category Selection** – Horizontal scrollable icons
   - 18 categories with unique colors and emojis:
     - Health (💚), Exercise (💪), Meditation (🧘), Reading (📚), Work (💼), Learning (🎓), Art (🎨), Music (🎵), Cooking (🍳), Sports (⚽), Travel (✈️), Socializing (👥), Writing (✍️), Gaming (🎮), Productivity (⚡), Mindfulness (🧠), Hobby (🎭), Other (⭐)
   - Tap to select, shows orange border when selected

3. **Target Time** – Number input (minutes)
   - Placeholder: "30"
   - Used for scoring calculation

4. **Start Time** – Time input
   - Format: HH:MM
   - Placeholder: "09:00"

5. **Time Format Toggle** – Circular switch button
   - Toggle between 24-hour and 12-hour (AM/PM) format
   - Label shows current format

**Buttons:**
- Back button (left) – Returns to calendar
- Next button (right) – Proceeds to Step 2 (disabled if habit name is empty)

---

### Step 2: Frequency Selection

**Title:** "How often do you want to do it?" (Sky blue color)

**Radio Button Options (6 total):**

1. **Every day**
   - No expandable section
   - Habit repeats daily at specified start time

2. **Specific days of the week**
   - Expandable section with 7 checkboxes:
     - ☑️ Monday
     - ☑️ Tuesday
     - ☑️ Wednesday
     - ☑️ Thursday
     - ☑️ Friday
     - ☑️ Saturday
     - ☑️ Sunday
   - User selects which days to repeat
   - Sends Android phone alarm updates for selected days

3. **Specific days of the month**
   - Expandable section with 31 beveled boxes (rounded corners, almost circular)
   - Grid layout showing days 1-31
   - User selects multiple days
   - Habit repeats on those days each month

4. **Specific days of the year**
   - Expandable section with:
     - Text input: "Enter at least one day"
     - Plus button (neon sky blue, beveled)
   - User enters specific dates (e.g., "Jan 1, Mar 15, Dec 25")
   - Habit repeats on those dates annually

5. **Some days per period**
   - Expandable section with:
     - Number input: "1" (days)
     - Text: "days per"
     - Dropdown: "Week" / "Month" / "Year"
   - Example: "3 days per week" = repeat 3 times weekly
   - Example: "5 days per month" = repeat 5 times monthly

6. **Repeat**
   - Custom repeat option for advanced scheduling

**Expandable Sections:**
- Drawer effect (smooth expansion/collapse)
- Only one section expanded at a time
- Smooth animations

**Buttons:**
- Back button (left) – Returns to Step 1
- Create Habit button (right) – Saves habit with all settings

---

## Data Models

### Habit Object

```typescript
interface Habit {
  id: string;                    // Unique identifier
  name: string;                  // Habit name
  categoryId: string;            // Category (health, exercise, etc.)
  targetTime: number;            // Target duration in minutes
  createdAt: number;             // Timestamp of creation
  color: string;                 // Display color
  backgroundColor: string;       // Background color
  use24HourFormat: boolean;      // Time format preference
  startTime: string;             // Start time (HH:MM)
  frequency: string;             // daily, weekly, monthly, yearly, period, repeat
  frequencyDetails: {
    weekly?: boolean[];          // Days of week (7 booleans)
    monthly?: boolean[];         // Days of month (31 booleans)
    yearly?: string;             // Specific dates
    period?: {
      days: number;
      unit: "week" | "month" | "year";
    };
  };
}
```

### Habit Log Object

```typescript
interface HabitLog {
  id: string;                    // Unique identifier
  habitId: string;               // Reference to habit
  date: string;                  // Date (YYYY-MM-DD)
  duration: number;              // Time spent in minutes
  completionPercentage: number;  // (duration / targetTime) × 100
  timestamp: number;             // Timestamp of log
}
```

---

## Data Storage

**Technology:** AsyncStorage (React Native)

**Storage Keys:**
- `habits` – Array of all habits
- `habitLogs` – Array of all habit logs
- `userSettings` – User preferences (theme, notifications, etc.)

**Data Persistence:**
- All data stored locally on device
- No cloud sync (local-only app)
- CSV export for backup

---

## CSV Export Format

**File Name:** `iatrackme-export-{date}.csv`

**Columns:**
1. Habit Name
2. Category
3. Target Time (minutes)
4. Start Time
5. Frequency
6. Frequency Details
7. Total Logs
8. Average Completion %
9. Weekly Stats (formatted)
10. Monthly Stats (formatted)
11. Created Date
12. Last Logged Date

---

## Category Icons (18 Total)

| ID | Name | Icon | Color |
|---|---|---|---|
| health | Health | 💚 | #4CAF50 |
| exercise | Exercise | 💪 | #FF6B6B |
| meditation | Meditation | 🧘 | #9C27B0 |
| reading | Reading | 📚 | #2196F3 |
| work | Work | 💼 | #FF9800 |
| learning | Learning | 🎓 | #3F51B5 |
| art | Art | 🎨 | #E91E63 |
| music | Music | 🎵 | #00BCD4 |
| cooking | Cooking | 🍳 | #FFC107 |
| sports | Sports | ⚽ | #4CAF50 |
| travel | Travel | ✈️ | #00BCD4 |
| socializing | Socializing | 👥 | #FF5722 |
| writing | Writing | ✍️ | #9C27B0 |
| gaming | Gaming | 🎮 | #673AB7 |
| productivity | Productivity | ⚡ | #FFEB3B |
| mindfulness | Mindfulness | 🧠 | #009688 |
| hobby | Hobby | 🎭 | #FF6F00 |
| other | Other | ⭐ | #757575 |

---

## Performance Considerations

**Optimizations:**
- CSS-based progress circles (no heavy SVG rendering)
- Simplified bar charts instead of complex line graphs
- FlatList for efficient list rendering
- Memoized components to prevent unnecessary re-renders
- AsyncStorage for fast local data access

**Target Performance:**
- App load time: < 3 seconds on Android 14
- Smooth 60fps animations
- Responsive UI with no lag during interactions

---

## Accessibility

**Features:**
- High contrast text (light gray on dark background)
- Touch targets ≥ 44pt for easy tapping
- Clear visual feedback on interactions
- Readable font sizes (minimum 12pt)
- Color-coded categories for quick recognition

---

## Future Enhancements

1. **Push Notifications** – Remind users at scheduled times
2. **Streak Badges** – Celebrate 7-day, 30-day, 100-day milestones
3. **Social Sharing** – Share achievements on social media
4. **Cloud Sync** – Optional backup to cloud storage
5. **Habit Templates** – Pre-built habit categories for quick setup
6. **Advanced Analytics** – Predictive insights and recommendations
7. **Dark/Light Theme Toggle** – User preference for theme
8. **Habit Challenges** – Community challenges and leaderboards

---

## Testing Requirements

- **Device:** Android 14 OnePlus Nord CE 2 Lite 5G (OxygenOS)
- **Browser:** Chrome, Firefox
- **Network:** WiFi via Expo Go (no USB cable)
- **Test Scenarios:**
  - Create habit with all frequency types
  - Log habits and verify scoring
  - Export data to CSV
  - Navigate between all tabs
  - Test date selection and centering
  - Verify progress circle fills correctly

---

## Deployment

**Platform:** Expo (React Native)

**Build Targets:**
- Android 14+ (primary)
- iOS 13+ (secondary, untested)
- Web (secondary, untested)

**Distribution:**
- Expo Go for development/testing
- EAS Build for production APK
- Google Play Store (optional future)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 27, 2025 | Initial release with all core features |

