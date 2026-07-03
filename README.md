# Class Room

Class Room is a cozy study dashboard prototype for people who want to study with more focus, accountability, and encouragement. The app centers on account types: Student for public study tools, and Couples or VIP for private shared rooms where members can check in, track study progress, manage tasks, run focus sprints, save notes, reflect on sessions, and leave motivational messages.

This is currently a Supabase-backed React prototype. It uses Supabase Auth for accounts, Supabase Postgres for room data, and Row Level Security policies to protect private room records.

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
- Access page for Supabase sign up, login, logout, and account-type selection.
- Dashboard page with a broader study overview.
- Access denied page for users without private-room access.

### Private Study Room

The `/our-room` page is the heart of the prototype. It includes:

- Room header with shared streak, weekly progress, today check-ins, and next-step badges.
- Member cards for VIP and Couples with current status, active tasks, and latest session context.
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
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Bootstrap utility/grid classes
- Lucide React icons
- CSS custom styling with responsive layouts
- ESLint for code checks

## Supabase Setup

Create a Supabase project, then run the SQL in:

```text
supabase-schema.sql
```

The schema creates:

- `profiles`
- `rooms`
- `room_members`
- `tasks`
- `checkins`
- `study_sessions`
- `notes`
- `encouragements`
- `activity`

It also enables Row Level Security so only room members can read or write room data.

Create a local environment file:

```bash
cp .env.example .env
```

Then fill in:

```text
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Only use the public Supabase anon key in the frontend. Do not put service-role keys or other secrets in Vite environment variables.

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

## Account Access

Class Room uses real Supabase Auth accounts plus a profile `account_type`.

Available account types:

- Student: can access public pages and the dashboard, but cannot create or enter a private room.
- Couples: can create or access a Couples private study room.
- VIP: can create or access a VIP private study room.

Clicking Student, Couples, or VIP while logged in updates the signed-in user's Supabase profile. Student is not a logout mode.

To enter `/our-room`, a user must be signed in, have a Couples or VIP profile, and belong to the room through `room_members`. If a Couples/VIP user has no membership yet, `/our-room` shows a friendly setup screen with **Create My Private Room**. That action creates a `rooms` row, adds the current user to `room_members` as `owner`, and then opens the private room.

## Current Prototype Limitations

- Supabase must be configured before sign up, login, and room data will work.
- The app creates private rooms only when a Couples or VIP user clicks **Create My Private Room**.
- A production invite/join flow for adding a second real user to the same room still needs to be built.
- Mock AI tools do not call a real AI API.
- Real-time room sync is not wired yet.
- Password reset and email verification settings depend on Supabase project configuration.
- The app is not yet connected to analytics, monitoring, or error reporting.

## Next Production Steps

### 1. Supabase Auth

Supabase Auth is wired into the frontend. Next production refinements:

Recommended work:

- Configure email templates and redirect URLs in Supabase.
- Add password reset UI.
- Add profile editing.
- Add room membership and invite flows.
- Decide whether email confirmation is required before private room access.

### 2. Supabase Database

Room data now uses Supabase Postgres tables.

Production refinements:

- Add migrations through the Supabase CLI.
- Add seed data for development.
- Add indexes for high-traffic room queries.
- Add archive/delete flows for rooms.

### 3. Row Level Security

The starter SQL enables Row Level Security for every private table.

Production refinements:

- Test policies with multiple real accounts.
- Add admin/owner policies for membership management.
- Add invite-code or email-invite policies.
- Confirm private notes remain visible only to their owner.

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

- Configure Supabase environment variables.
- Run `supabase-schema.sql`.
- Test RLS policies with multiple users.
- Add loading, error, and empty states for real network requests.
- Add serverless AI endpoints.
- Add input validation on both client and server.
- Add rate limiting for AI features.
- Add real-time subscriptions for shared room updates.
- Add automated tests for core room flows.
- Add deployment environment variables.
- Add monitoring and error reporting.

## Project Status

Class Room is a polished React + Vite prototype upgraded to Supabase Auth, Supabase database persistence, and Row Level Security. The next major milestone is adding production invite flows, real AI serverless functions, realtime room sync, and deployment environment configuration.
