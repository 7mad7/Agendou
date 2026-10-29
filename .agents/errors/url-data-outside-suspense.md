## Error Type
Blocking Route

## Error Message
Route "/c/[slug]": Next.js encountered URL data `usePathname()` in a Client Component outside of `<Suspense>`.

This blocks prerendering because the value is only available at runtime.

Ways to fix this:
  - [stream] Wrap the component in `<Suspense fallback={...}>` so the hook value streams in after prerendering
  - [block] Set `export const instant = false` to allow a blocking route

Learn more: https://nextjs.org/docs/messages/blocking-prerender-client-hook


    at BottomNav (src/components/layout/bottom-nav.tsx:33:31)
    at MobileShell (src/components/layout/mobile-shell.tsx:32:27)
    at RootLayout (src/app/layout.tsx:33:9)

## Code Frame
  31 |
  32 | export function BottomNav() {
> 33 |   const pathname = usePathname();
     |                               ^
  34 |
  35 |   return (
  36 |     <nav

Next.js version: 16.4.2 (Turbopack)
