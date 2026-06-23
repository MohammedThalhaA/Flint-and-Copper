This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Adding Migrations
If you make changes to the database schema, place them in the `scripts` folder and run:
```bash
npx tsx scripts/admin-migrations.ts
```

## UI Components & Notifications
We use a unified, global custom Notification System built on React Context and Framer Motion, replacing all native `alert()` and `confirm()` popups.

### Toasts
To trigger a themed toast message (success, error, or info):
```tsx
import { useToast } from "@/components/NotificationProvider";

export function MyComponent() {
  const { toast } = useToast();

  const handleAction = () => {
    toast("Action successful!", "success");
    // Other variants: "error", "info"
  };
  
  return <button onClick={handleAction}>Action</button>;
}
```

### Confirm Dialogs
To prompt the user before a destructive or important action (returns a promise):
```tsx
import { useConfirm } from "@/components/NotificationProvider";

export function MyComponent() {
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    const isConfirmed = await confirm("Are you sure you want to delete this?");
    if (!isConfirmed) return;
    
    // Proceed with deletion...
  };
  
  return <button onClick={handleDelete}>Delete</button>;
}
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
