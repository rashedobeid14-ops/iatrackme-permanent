# IATrackMe Mobile App Design

## Overview

IATrackMe is a dark-themed habit tracking application with neomorphic UI elements, neon accents (sky blue and orange), and comprehensive analytics. The app helps users track daily habits with visual progress indicators, timers, and monthly performance graphs.

---

## Screen List

1. **Calendar Tab (Home)** – Main screen with monthly calendar view and logging strips
2. **Habits Tab** – Track individual habits with completion percentage and progress circles
3. **Timer/Stopwatch Tab** – Interval-based habit tracking with preset timers
4. **Analytics Tab** – Monthly performance graphs and scoring
5. **Settings Tab** – App configuration and preferences

---

## Primary Content and Functionality

### Screen 1: Calendar Tab (Home)

**Layout:**
- **Top Logging Strip** – Horizontal scrollable strip showing recent habit logs with timestamps
- **Calendar Grid** – Monthly calendar with day numbers (1-31)
- **Day Selection** – Tap any day to open an add-habit dialog
- **Bottom Logging Strip** – Horizontal scrollable strip showing upcoming/scheduled habits
- **Floating Action Button (FAB)** – Neomorphic, neon sky blue plus icon (+) centered at the bottom

**Functionality:**
- Display current month and year
- Tap a day → opens dialog to add/edit habits for that day
- Long-press FAB or tap to add a new habit
- Logging strips show habit entries with timestamps

**Visual Style:**
- Dark gray background (#1a1a1a or similar)
- Neon sky blue (#00d4ff or similar) for day indicators and accents
- Logging strips with semi-transparent backgrounds

---

### Screen 2: Habits Tab

**Layout:**
- **Habit List** – Scrollable list of all habits
- **Habit Card** – For each habit:
  - Habit name and description
  - **Neomorphic Progress Circle** – Hollow circle with thin embossed 3D effect showing completion percentage
  - **Neon Orange Progress Fill** – Vivid neon orange (#ff6600 or similar) filling the circle end-to-end
  - Current time laps (hours:minutes)
  - Completion percentage text
  - **Bottom Graph** – Mini line graph showing monthly total scores (📈📉 representation)

**Functionality:**
- View all tracked habits
- Tap habit to view details or edit
- Progress circles update in real-time
- Swipe to delete or archive habits

**Visual Style:**
- Neomorphic 3D embossed circles (hollow, thin lines)
- Neon orange progress indicators
- Dark card backgrounds with subtle shadows

---

### Screen 3: Timer/Stopwatch Tab

**Layout:**
- **Circular Timer Display** – Large circular progress indicator
- **Preset Timers** – 3 circular buttons for common intervals (e.g., 5 min, 15 min, 30 min)
- **Controls** – Start/Pause/Stop buttons
- **Time Laps Display** – Current elapsed time and lap count
- **Scoring System** – Percentage score displayed after submission

**Functionality:**
- Select a preset habit timer or manually enter duration
- Track time in intervals/periods
- Automatic scoring based on completion
- Submit to log the habit and calculate percentage score
- Background timer support (habit continues even if app is closed)

**Visual Style:**
- Large circular progress ring (similar to Habits tab)
- Neon sky blue for active timers
- Neon orange for progress fill
- Dark background with neomorphic buttons

---

### Screen 4: Analytics Tab

**Layout:**
- **Monthly Score Graph** – Line graph showing daily/weekly total scores
- **Statistics Cards** – Summary stats (total habits, completion rate, streaks)
- **Date Range Selector** – Filter by week/month/custom range
- **Export Option** – Download or share analytics

**Functionality:**
- Display historical data from local storage
- Interactive graphs with tap-to-see-details
- Trend analysis and insights

**Visual Style:**
- Line graphs with neon orange lines
- Dark background with grid lines
- Summary cards with neomorphic styling

---

### Screen 5: Settings Tab

**Layout:**
- **Theme Toggle** – Dark/Light mode (default: Dark)
- **Notification Settings** – Enable/disable reminders
- **Backup & Restore** – Local data management
- **About** – App version and credits
- **Reset Data** – Clear all habits and logs

**Functionality:**
- Customize app behavior
- Manage notifications
- Data persistence options

---

## Key User Flows

### Flow 1: Add a New Habit
1. User taps a day on the Calendar tab
2. Dialog appears with form fields (habit name, category, target time)
3. User submits → habit is saved to local storage
4. Habit appears in the Habits tab

### Flow 2: Track a Habit with Timer
1. User navigates to Timer/Stopwatch tab
2. Selects a preset timer or enters custom duration
3. Taps "Start" → timer begins
4. Timer counts down with circular progress indicator
5. When complete, user taps "Submit" → score is calculated
6. Habit log is saved with timestamp and completion percentage

### Flow 3: View Habit Progress
1. User navigates to Habits tab
2. Views all habits with progress circles showing completion %
3. Taps a habit to see detailed history and monthly graph
4. Swipes to delete or edit habit

### Flow 4: Check Monthly Analytics
1. User navigates to Analytics tab
2. Views line graph of monthly scores
3. Taps on a data point to see details for that day
4. Uses date range selector to filter by week or custom period

---

## Color Choices

| Element | Color | Hex Code | Purpose |
|---------|-------|----------|---------|
| Background | Dark Gray | #1a1a1a | Main app background |
| Primary Accent | Neon Sky Blue | #00d4ff | Calendar indicators, FAB, active elements |
| Secondary Accent | Neon Orange | #ff6600 | Progress fills, highlights |
| Text Primary | Light Gray | #e0e0e0 | Main text |
| Text Secondary | Medium Gray | #a0a0a0 | Subtext, secondary info |
| Card Background | Dark Gray | #252525 | Card and component backgrounds |
| Border/Divider | Dark Blue | #1a3a3f | Subtle dividers |
| Success | Neon Green | #00ff00 | Completion indicators (optional) |

---

## Typography

- **Font Family:** Sans Serif Regular (system default)
- **Title:** 28-32pt, bold
- **Subtitle:** 18-20pt, semibold
- **Body:** 14-16pt, regular
- **Caption:** 12-13pt, regular

---

## Neomorphic UI Elements

- **Progress Circles:** Hollow circles with thin embossed 3D effect, no fill initially
- **FAB Button:** Centered, large, with subtle shadow and glow effect
- **Cards:** Subtle inset shadows for depth
- **Buttons:** Raised or inset based on state

---

## Responsive Design

- **Portrait Orientation:** Primary layout (9:16 aspect ratio)
- **One-Handed Usage:** Critical elements in bottom 1/3 of screen
- **Safe Area:** Respect notches and home indicators
- **Touch Targets:** Minimum 44pt for all interactive elements

---

## Data Model

### Habit
```
{
  id: string,
  name: string,
  category: string,
  targetTime: number (minutes),
  createdAt: timestamp,
  color: string (hex)
}
```

### HabitLog
```
{
  id: string,
  habitId: string,
  date: date,
  duration: number (minutes),
  completionPercentage: number (0-100),
  timestamp: timestamp
}
```

### DailyScore
```
{
  date: date,
  totalScore: number,
  habitsCompleted: number,
  habitsTotal: number
}
```

---

## Storage

- **Local Storage:** AsyncStorage for habits, logs, and settings
- **No Cloud Sync:** Data persists locally on device
- **Backup:** Optional export to JSON file

---

## Animations & Interactions

- **Progress Circle Animation:** Smooth fill animation as percentage increases
- **FAB Press:** Scale down slightly on press, spring back on release
- **Tab Transitions:** Smooth fade/slide between tabs
- **Timer Countdown:** Smooth circular progress animation
- **Haptic Feedback:** Light tap on button press, success notification on completion

---

## Accessibility

- **Color Contrast:** All text meets WCAG AA standards
- **Touch Targets:** All interactive elements ≥ 44pt
- **Labels:** All buttons and inputs have descriptive labels
- **Dark Mode:** Default dark theme reduces eye strain
