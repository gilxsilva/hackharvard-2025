# Chrona 📚

A smart academic dashboard that helps students manage their coursework through AI-powered automation.

## What We're Building

Chrona is an intelligent platform designed to streamline academic life by:

- **Smart Calendar Integration** - Upload course syllabi and automatically sync all deadlines, exams, and class sessions to Google Calendar with dedicated calendars per course
- **Canvas LMS Integration** - Track assignments, grades, and course progress across all your classes
- **AI-Powered Parsing** - Use Gemini AI to extract structured information from syllabus documents (PDF/DOCX/TXT)

## Features

### 📅 Calendar Management
- Upload syllabus files and extract events automatically
- Create separate Google Calendars for each course with emoji identifiers
- Smart event categorization (classes, exams, assignments)
- Timezone-aware scheduling
- Customizable reminders based on event type

### 📊 Canvas Dashboard
- View all course grades in one place
- Track upcoming assignments across courses
- Monitor assignment progress and deadlines

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS v4 with dark theme
- **AI**: Google Gemini 2.5 Flash
- **Authentication**: NextAuth.js with Google OAuth
- **APIs**: Google Calendar API, Canvas LMS API
- **PDF Processing**: PDF.js

## Getting Started

### Prerequisites

- Node.js 18+
- Google Cloud Console account (for Calendar API)
- Canvas LMS API token (optional)
- Gemini API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/gilxsilva/hackharvard-2025.git
cd scholarly-next
# Chrona — Smart Academic Dashboard 📚

Chrona is an AI-first academic dashboard that helps students manage courses, assignments, and calendars in one place. It combines Canvas LMS data, Google Calendar sync, and a lightweight assistant (CentralHub) to make campus life easier.

---

## Highlights

- Unified view of courses, assignments, and grades (Canvas integration)
- Google Calendar sync with "Today" widget and per-course calendars
- CentralHub AI assistant (floating, Notion-style) for natural language queries about your schedule, assignments, and grades
- Fully converted styles to Tailwind CSS with a consistent design system and animations
- Customizable dashboard: users can choose which widgets to show and the preferences are saved to localStorage

---

## Quick Features

- Dashboard widgets: Courses, Assignments, Grades, Missing Assignments, Smart Calendar, Google Calendar (today's events), Grade Analytics, Course Workload, Recent Activity, Weekly Overview
- Widget manager with categories and persistent preferences (localStorage key: `chrona-widget-settings`)
- CentralHub: floating assistant in the bottom-right; expands to a panel for chat and AI-powered syllabus parsing
- Google Calendar API integration (server-side route for today's events)
- NextAuth.js Google OAuth for authentication and calendar access

---

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS (customized theme & animations)
- NextAuth.js (Google OAuth)
- Google Calendar API
- Canvas LMS API
- Gemini AI (for syllabus parsing & assistant)

---

## Getting Started (Development)

Prerequisites
- Node.js 18+
- Google Cloud Console project with Calendar API enabled
- NextAuth Google client credentials
- Gemini API key (set as NEXT_PUBLIC_GEMINI_API_KEY)

1. Clone the repo

```bash
git clone https://github.com/gilxsilva/hackharvard-2025.git
cd hackharvard-2025/chrona
```

2. Install dependencies

```bash
npm install
```

3. Create `.env.local` in the `chrona/` folder and add required variables (example values below):

```text
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=some-random-secret

# Google OAuth (for Calendar access)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Gemini (assistant)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Canvas (optional)
CANVAS_API_URL=https://canvas.instructure.com
CANVAS_API_TOKEN=your_canvas_token
```

4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000/dashboard/space (or the port reported by Next) to view the Space Dashboard.

---

## Files & Important Paths

- `src/components/dashboard/CentralHub.tsx` — Floating AI assistant; currently rendered in the dashboard canvas and positioned as a bottom-right floating button. Expands into a panel for chat.
- `src/components/dashboard/GoogleCalendarWidget.tsx` — Google Calendar "Today" widget used in the dashboard
- `src/app/api/calendar/today-events/route.ts` — Server-side route used to fetch today's Google Calendar events for authenticated users
- `src/hooks/useWidgetSettings.ts` — Hook that provides the available widgets, toggle/visibility helpers, and handles persistence to localStorage
- `src/components/dashboard/WidgetSettingsPanel.tsx` — UI panel for selecting which widgets are visible
- `src/components/dashboard/FloatingSettingsButton.tsx` — Floating button to open the widget settings
- `tailwind.config.js` — Custom theme and animations used across the project

---

## Widget Preferences & Persistence

- Preferences are stored in `localStorage` under the key `chrona-widget-settings`.
- The `useWidgetSettings` hook provides helpers:
	- `isWidgetVisible(id)` — boolean
	- `toggleWidget(id)` — toggle visibility
	- `showAllWidgets()` / `hideAllWidgets()` / `resetToDefaults()`

---

## Authentication & Calendar Access

- The app uses NextAuth.js for Google authentication and requests calendar scopes for reading events.
- The server route `/api/calendar/today-events` expects an authenticated user session with a valid access token.

See `chrona/src/app/api/calendar/today-events/route.ts` for implementation details.

---

## Design Notes

- The CentralHub assistant was intentionally moved from a center orb to a bottom-right floating button to preserve dashboard real-estate and match common UX patterns.
- All CSS was migrated to Tailwind classes; animations are declared in `tailwind.config.js`.

---

## Development Tips

- If you modify Tailwind config, restart the dev server to pick up new classes.
- Use the widget settings to test the conditional rendering and persistence of widgets.
- For Google Calendar testing, ensure your Google OAuth client includes the calendar scope: `https://www.googleapis.com/auth/calendar`.

---

## Roadmap / Future Improvements

- Server-side persisted user preferences (so settings sync across devices)
- Event color-coding and multi-day calendar views
- Create events directly from the dashboard
- Optional offline sync for assignments and calendar events

---

## License

MIT
