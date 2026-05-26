# Bunny Pocket

![Bunny Pocket social banner](public/images/social-banner.png)

Bunny Pocket is a cozy, mobile-first planner for capturing thoughts, planning the day, and organizing weekly priorities.

## Functionalities

- Sign in with Supabase authentication.
- Capture quick thoughts and tasks in the Pocket screen.
- Reorder Pocket and Daily items with drag and drop.
- Move Pocket items into Daily with a selected date.
- Move Pocket items into Weekly with a selected priority section.
- Plan Daily tasks by date.
- Add optional reminder times for Daily tasks.
- Mark tasks as done or move them back to todo.
- Edit task titles and details.
- Delete tasks.
- Organize Weekly tasks by week.
- Navigate between previous, current, and future weeks.
- Group Weekly tasks into three sections:
  - Important + Urgent
  - Important + Not Urgent
  - Keep in Mind
- Add subtasks under Weekly tasks.
- Move Weekly tasks into Daily.
- View cute empty, loading, and completion states.
- Use the app as a mobile-friendly PWA with bottom navigation.

## Using This Code

Bunny Pocket is shared as a personal project and reference implementation. You are welcome to read the code, learn from the structure, and use it as inspiration for your own planner or productivity app.

If you want to run the project locally:

1. Install dependencies with `npm install`.
2. Create a `.env.local` file with your own Supabase project values.
3. Start the development server with `npm run dev`.
4. Open the local Next.js URL shown in your terminal.

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Please use your own Supabase project, database tables, images, branding, and deployment settings. Do not commit private keys, `.env.local`, or production credentials.

## License

No open-source license has been added yet. That means the code is available for viewing, but permission is not automatically granted to copy, redistribute, or reuse it in another project. If you would like to use this code beyond learning or reference, please ask the repository owner first.
