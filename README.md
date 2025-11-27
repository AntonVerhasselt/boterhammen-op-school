# Welcome to your Convex + Next.js + Clerk app

This is a [Convex](https://convex.dev/) project created with [`npm create convex`](https://www.npmjs.com/package/create-convex).

After the initial setup (<2 minutes) you'll have a working full-stack app using:

- Convex as your backend (database, server logic)
- [React](https://react.dev/) as your frontend (web page interactivity)
- [Next.js](https://nextjs.org/) for optimized web hosting and page routing
- [Tailwind](https://tailwindcss.com/) for building great looking accessible UI
- [Clerk](https://clerk.com/) for authentication

## Get started

If you just cloned this codebase and didn't use `npm create convex`, run:

```
npm install
npm run dev
```

If you're reading this README on GitHub and want to use this template, run:

```
npm create convex@latest -- -t nextjs-clerk
```

Then:

1. Open your app. There should be a "Claim your application" button from Clerk in the bottom right of your app.
2. Follow the steps to claim your application and link it to this app.
3. Follow step 3 in the [Convex Clerk onboarding guide](https://docs.convex.dev/auth/clerk#get-started) to create a Convex JWT template.
4. Uncomment the Clerk provider in `convex/auth.config.ts`
5. Paste the Issuer URL as `CLERK_JWT_ISSUER_DOMAIN` to your dev deployment environment variable settings on the Convex dashboard (see [docs](https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances))

If you want to sync Clerk user data via webhooks, check out this [example repo](https://github.com/thomasballinger/convex-clerk-users-table/).

## Learn more

To learn more about developing your project with Convex, check out:

- The [Tour of Convex](https://docs.convex.dev/get-started) for a thorough introduction to Convex principles.
- The rest of [Convex docs](https://docs.convex.dev/) to learn about all Convex features.
- [Stack](https://stack.convex.dev/) for in-depth articles on advanced topics.

## Join the community

Join thousands of developers building full-stack apps with Convex:

- Join the [Convex Discord community](https://convex.dev/community) to get help in real-time.
- Follow [Convex on GitHub](https://github.com/get-convex/), star and contribute to the open-source implementation of Convex.

---

## PWA Support

This application is configured as a Progressive Web App (PWA).

### Features
- Installable on mobile and desktop.
- Offline support for static assets.
- Custom icons generated from `public/favicon.svg`.

### Icons Generation
Icons are generated using the `scripts/generate-icons.js` script, which uses `sharp` to resize `public/favicon.svg` into various sizes required for the Web App Manifest.

To regenerate icons (e.g. after changing favicon.svg):
```bash
node scripts/generate-icons.js
```

### Testing PWA
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Open the app in Chrome.
4. Open DevTools > Application > Manifest to verify settings.
5. Open DevTools > Application > Service Workers to verify the worker is registered.
6. Run a Lighthouse audit to check for PWA criteria.

### Configuration & Strategies
- **Manifest**: Located at `public/manifest.json`.
  - Name: "Boterhammen op school" (Short: "BOS")
  - Start URL: `/orders`
- **Service Worker**: Handled by `@ducanh2912/next-pwa` in `next.config.ts`.
  - **Navigations (HTML)**: `NetworkFirst`. This ensures that redirects (like Clerk Auth and Stripe) are always handled by the browser/network unless offline. It also allows for an offline fallback to the cache for previously visited pages.
  - **Static Assets**: `StaleWhileRevalidate` for performance.
  - **API Routes**: `NetworkOnly` to prevent caching of dynamic data.
  - **Cross-Origin**: The service worker is configured to ignore external domains (Clerk, Stripe) by default.
- **Metadata**: PWA-specific metadata (manifest link, theme color) is configured in `app/layout.tsx`.
