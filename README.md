# Class Room

Class Room is a cozy study dashboard prototype for two people who want to study together with more focus, accountability, and encouragement. The app centers on a private shared room for Magic and Partner, where both people can check in, track study progress, manage tasks, run focus sprints, save notes, reflect on sessions, and leave motivational messages.

This is currently a frontend prototype. It uses local browser storage to simulate accounts, private access, room data, activity, and study history.

## App Idea

Class Room is designed around a simple emotional promise: studying feels easier when someone is quietly showing up with you.

Instead of being only a task tracker, the app combines practical study tools with small social rituals:

- Daily check-ins that show whether each person studied.
- A shared streak and weekly hour target.
- A two-person task board.
- Focus timer sprints.
- Session reports that capture wins and stuck points.
- Shared and private notes.
- Encouragement messages.
- A room activity feed that records progress and care.

## Features

### Public Pages

- Landing page with a product overview and demo entry points.
- Features page describing the study tools.
- Access page for choosing a demo user and unlocking the private room.
- Dashboard page with a broader study overview.
- Access denied page for users without private-room access.

### Private Study Room

The `/our-room` page is the heart of the prototype. It includes:

- Room header with shared streak, weekly progress, today check-ins, and next-step badges.
- Member cards for Magic and Partner with current status, active tasks, and latest session context.
- Daily check-ins with mood, hours studied, and study notes.
- Shared task board with Todo, Doing, and Done columns.
- Focus timer with 25, 45, and 60 minute presets.
- Session feedback form for logging subject, duration, focus rating, wins, and difficulties.
- Progress stats for tasks, study hours, check-ins, streak, and sessions.
- Study notes with shared/private visibility.
- Mock AI tools for prototype-only study assistance.
- Motivation box with quotes and encouragement prompts.
- Activity feed showing recent room actions.

## Tech Stack

- React
- Vite
- React Router
- Bootstrap utility/grid classes
- Lucide React icons
- CSS custom styling with responsive layouts
- Browser `localStorage` for prototype persistence
- ESLint for code checks

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

By default, Vite will print a local URL such as:

```text
http://localhost:5173/
```

## GitHub and Deployment Files

The project includes deployment configuration for static SPA hosting:

- `public/_redirects` tells Netlify to serve `index.html` for client-side routes.
- `netlify.toml` sets the Netlify build command, publish directory, and SPA fallback.
- `vercel.json` sets the Vercel build command, output directory, and SPA rewrite.

These files are important because Class Room uses React Router. Without an SPA fallback, routes such as `/features`, `/dashboard`, and `/our-room` may work during navigation but fail when the browser refreshes directly on that URL.

## Demo Access

The private room is protected by a prototype-only access flow.

Demo users:

- Magic
- Partner
- Guest

Private room passcode:

```text
CLASSROOM2026
```

Guests can explore public pages, but only Magic or Partner with the passcode can enter `/our-room`.

## Current Prototype Limitations

- Data is stored in `localStorage`, so it is browser-specific and not shared across devices.
- Authentication is simulated with demo users and a visible passcode.
- The private room is not truly secure yet.
- Mock AI tools do not call a real AI API.
- There is no backend database.
- There is no real-time sync between two users.
- There are no production user profiles, invitations, password reset flows, or email verification.
- Activity history and room content can be cleared if browser storage is reset.
- The app is not yet connected to analytics, monitoring, or error reporting.

## Next Production Steps

### 1. Supabase Auth

Replace the demo user/passcode flow with Supabase Auth.

Recommended work:

- Add sign up, sign in, sign out, and password reset.
- Support email verification.
- Create user profiles for each student.
- Add room membership and invite flows.
- Redirect unauthenticated users away from private routes.

### 2. Supabase Database

Move all room data out of `localStorage` and into Supabase Postgres.

Suggested tables:

- `profiles`
- `rooms`
- `room_members`
- `checkins`
- `tasks`
- `focus_sessions`
- `session_reports`
- `notes`
- `encouragements`
- `activity_events`

This would allow two people to see the same room data across devices.

### 3. Row Level Security

Enable Supabase Row Level Security for every table that contains user or room data.

Recommended policies:

- Users can read only rooms where they are members.
- Users can create room content only for rooms they belong to.
- Users can update/delete only their own notes, reports, and check-ins unless a shared-room rule allows otherwise.
- Room members can read shared notes and activity events.
- Private notes are visible only to their owner.

### 4. Real AI API Through Serverless Functions

Replace mock AI tools with a real server-side AI integration.

Important production pattern:

- Do not call AI APIs directly from the browser.
- Keep API keys on the server.
- Create serverless functions for AI requests.
- Validate user session and room membership before running AI tools.
- Rate limit requests per user and room.
- Store useful AI outputs when they should become part of the room history.

Possible AI tools:

- Summarize notes.
- Generate quiz questions.
- Create study plans from tasks.
- Explain stuck points from session reports.
- Suggest encouragement based on recent activity.

### 5. Deploy to Netlify or Vercel

Deploy the frontend and serverless functions to a production host.

Vercel path:

- Connect the Git repository to Vercel.
- Add environment variables for Supabase and AI API keys.
- Use Vercel Functions for backend AI endpoints.
- Configure production domain and preview deployments.

Netlify path:

- Connect the Git repository to Netlify.
- Add environment variables for Supabase and AI API keys.
- Use Netlify Functions for backend AI endpoints.
- Configure production domain and deploy previews.

## Production Readiness Checklist

- Replace prototype auth with Supabase Auth.
- Replace `localStorage` with Supabase database reads/writes.
- Add RLS policies and test them with multiple users.
- Add loading, error, and empty states for real network requests.
- Add serverless AI endpoints.
- Add input validation on both client and server.
- Add rate limiting for AI features.
- Add real-time subscriptions for shared room updates.
- Add automated tests for core room flows.
- Add deployment environment variables.
- Add monitoring and error reporting.

## Project Status

Class Room is a polished React + Vite prototype. It is ready for local demos, UX iteration, and production architecture planning. The next major milestone is replacing local prototype state with real authentication, database persistence, secure access rules, and server-side AI features.
