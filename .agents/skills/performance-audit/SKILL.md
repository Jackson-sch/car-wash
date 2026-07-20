---
name: performance-audit
description: Audit, analyze, and optimize application performance, database query patterns (N+1 queries, bulk operations), Next.js App Router boundaries, bundle size, and rendering bottlenecks.
---

# Performance Audit & Optimization Skill

Use this skill when tasked with auditing, analyzing, or improving application performance, server response times, database query speed, bundle sizes, or client-side rendering efficiency.

## Core Pillars of Performance Optimization

### 1. Database & Server Action Optimization
- **N+1 Query Elimination**: Never call database queries inside `.map()`, `forEach()`, or loops. Replace with SQL `GROUP BY`, `inArray()`, or `JOIN` operations.
- **Bulk Operations**: Use single `db.insert(...).values([...])` or `db.update()` statements instead of executing multiple single-row mutations.
- **Selective Projections**: Only select required columns in Drizzle/Prisma queries (`select({ id: table.id, name: table.name })`) rather than selecting full heavy rows when only partial data is used.
- **Index Alignment**: Ensure columns used in `where()`, `leftJoin()`, `groupBy()`, and `orderBy()` (e.g. `sucursalId`, `empresaId`, `estado`, `createdAt`) have database indexes defined in the schema.

### 2. Next.js App Router & Server Components
- **Session & Auth Caching**: Avoid calling `auth.api.getSession()` multiple times redundantly within a single request pipeline when session data can be passed down or cached.
- **Link Prefetching**: Disable aggressive prefetching (`prefetch={false}`) on dense navigation lists, table rows, or secondary links to prevent ráfagas of React Server Component (`?_rsc=...`) payload requests.
- **Suspense & Streaming**: Wrap slow data-fetching components in `<Suspense fallback={...}>` to unblock page shell rendering and stream dynamic sections progressively.

### 3. Client Component & Bundle Optimization
- **Dynamic Imports**: Use `next/dynamic` with `{ ssr: false }` for heavy client-side libraries (e.g., `@react-pdf/renderer`, `recharts`, `d3`, rich text editors, modal heavy dialogs).
- **Stable Hook Dependencies**: Avoid using raw `session` or un-memoized object references in `useEffect` dependency arrays to prevent infinite re-fetch loops.
- **Image & Asset Optimization**: Always use `next/image` with explicit `width`, `height`, `sizes`, and appropriate formats (`webp`/`avif`).

---

## Performance Audit Workflow

1. **Audit Database Queries**: Search `src/lib/actions/` and `src/app/` for `Promise.all(..map())`, `for..of` loops containing `db.select`/`db.insert`, missing indexes, or unaggregated queries.
2. **Audit Client Effects**: Search `src/components/` and `src/app/` for `useEffect` hooks with unstable dependency arrays or frequent state triggers.
3. **Audit Heavy Imports**: Identify heavy dependencies in `package.json` and verify they are imported dynamically or only where strictly necessary.
4. **Apply Fixes**: Refactor code to apply SQL grouping, bulk operations, hook stabilization, and lazy loading.
5. **Verify**: Ensure type safety with `npx tsc --noEmit` and confirm performance improvements.
