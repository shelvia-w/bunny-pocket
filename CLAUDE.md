# Bunny Pocket

Bunny Pocket is a mobile-first PWA planner and brain-dump app.

Core concept:
Pocket → Today → Week

The app should stay extremely simple, cute, and minimal.

## Product behavior

Main screens:
- Pocket: quick brain dump for anything that pops into the user's mind.
- Today: daily to-do list with optional reminder time.
- Week: weekly planner with three stacked sections on mobile:
  - Important + Urgent
  - Important + Not Urgent
  - Keep in Mind

Users can:
- add item
- mark item done
- move item to Today
- move item to Week
- archive item
- delete item
- choose weekly category
- optionally set/display reminder time

Do not add:
- tags
- projects
- subtasks
- recurring tasks
- AI
- analytics
- calendar sync
- multiple database tables

## Design

Style:
- cute but elegant
- bunny-themed but subtle
- cream/off-white background
- blush pink, soft lavender, sage green, pale peach accents
- rounded cards
- pill tabs
- soft shadows
- mobile-first layout
- bottom navigation: Pocket, Today, Week

Suggested empty states:
- Your pocket is empty for now ✨
- Nothing planned yet 🌷
- Soft start. Pick one little thing.

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- PWA support
- Deploy to Vercel

## Database

Use one Supabase table only: personal_items.

Fields:
- id uuid primary key
- user_id uuid references auth.users(id)
- title text not null
- list text not null default 'pocket'
- category text nullable
- status text not null default 'todo'
- due_date date nullable
- reminder_at timestamptz nullable
- sort_order int default 0
- created_at timestamptz default now()
- updated_at timestamptz default now()

Allowed list values:
- pocket
- today
- week
- archive

Allowed category values:
- important_urgent
- important_not_urgent
- keep_in_mind

Allowed status values:
- todo
- done

## Coding preferences

Keep code simple and readable.
Prefer small components.
Avoid unnecessary abstractions.
Do not introduce complex state management unless needed.
Use Supabase auth and filter all data by current user.