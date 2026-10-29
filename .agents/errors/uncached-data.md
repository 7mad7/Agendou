## Error Type
Blocking Route

## Error Message
Route "/explorar": Next.js encountered uncached data during prerendering.

`fetch(...)` or `connection()` accessed outside of `<Suspense>` prevents the route from being prerendered, blocking the page load and leading to a slower user experience.

Ways to fix this:
  - [stream] Provide a placeholder with `<Suspense fallback={...}>` around the data access
  - [cache] Cache the data access with `"use cache"` (does not apply to `connection()`)
  - [block] Set `export const instant = false` to allow a blocking route

Learn more: https://nextjs.org/docs/messages/blocking-prerender-dynamic


    at searchMerchantsAction (src/actions/discovery.ts:231:54)
    at ExplorarPage (src/app/explorar/page.tsx:42:54)

## Code Frame
  229 |     }
  230 |
> 231 |     const dbMerchants = await prisma.merchantProfile.findMany({
      |                                                      ^
  232 |       where: whereClause,
  233 |       include: {
  234 |         services: {

Next.js version: 16.4.2 (Turbopack)
