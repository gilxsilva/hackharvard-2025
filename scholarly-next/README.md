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
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file:
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

# AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Canvas (optional)
CANVAS_API_URL=https://canvas.instructure.com
CANVAS_API_TOKEN=your_canvas_token_here
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth configuration
│   │   ├── calendar/              # Calendar API routes
│   │   └── canvas/                # Canvas LMS API routes
│   ├── calendar/                  # Calendar page
│   └── dashboard/                 # Main dashboard
├── components/                    # Reusable UI components
├── lib/
│   ├── gemini.ts                 # Gemini AI integration
│   ├── googleCalendar.ts         # Google Calendar client
│   └── canvas.ts                 # Canvas API client
└── types/                        # TypeScript type definitions
```

## Setup Guides

- [Google Calendar Setup](./GOOGLE_CALENDAR_SETUP.md) - Detailed OAuth and API configuration

## Roadmap

- [x] Google Calendar integration with per-course calendars
- [x] Canvas LMS grade tracking
- [x] AI-powered syllabus parsing
- [ ] Assignment deadline notifications
- [ ] Study schedule generation
- [ ] Multi-platform sync (Blackboard, Moodle)
- [ ] Mobile app

## Contributing

This project was created for HackHarvard 2025.

## License

MIT
