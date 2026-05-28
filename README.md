# Bunny Pocket

![Bunny Pocket social banner](public/images/social-banner.png)

Bunny Pocket is a cozy, mobile-first planner for capturing thoughts, planning the day, and organizing weekly priorities.

## Functionalities

1. **Capture tasks quickly**  
   Add thoughts and tasks to the Pocket screen, then edit titles, details, or delete them anytime.

2. **Plan daily tasks by date**  
   Move items into Daily, choose a date, and mark tasks as done or todo.

3. **Organize weekly priorities**  
   Plan tasks by week and group them into Important + Urgent, Important + Not Urgent, and Keep in Mind.

4. **Move and reorder tasks easily**  
   Drag and drop items, reorder lists, and move tasks between Pocket, Daily, and Weekly.

5. **Use it as a cute mobile PWA**  
   Sign in with Supabase, navigate with bottom tabs, and enjoy cute empty, loading, and completion states.

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
