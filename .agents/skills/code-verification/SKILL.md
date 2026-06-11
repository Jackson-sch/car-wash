---
name: code-verification
description: Verifies if there are code changes, checks for lint/type/build errors, and automatically corrects them or provides steps to fix them.
license: MIT
metadata:
  author: Antigravity
  version: "1.0.0"
  date: June 2026
  abstract: A guidelines framework and automation script to detect modified code, run eslint/tsc/build checks, auto-correct minor lint issues, and systematically resolve compilation errors.
---

# Code Verification and Error Correction Guidelines

This skill defines the standard process for verifying code changes and correcting compilation, linting, type, or build errors in the **WashMaster Pro** repository. By following these guidelines, you ensure that every change maintains the codebase's integrity and prevents broken builds from reaching main.

---

## When to Apply

Apply these guidelines:
- Immediately after making or modifying any code.
- Prior to declaring a task "completed" or asking the user for final feedback.
- When any process or command indicates a compilation or build failure.
- To audit the current workspace state for hidden errors.

---

## 1. Automated Verification & Auto-Correction

The easiest way to check the workspace is by running the automated PowerShell script included in this skill. Since your workspace runs on **Windows**, use the following command:

```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/code-verification/scripts/verify-and-fix.ps1
```

### What the Script Does:
1. **Git Status Check**: Shows which files are currently modified or untracked.
2. **ESLint Verification**: Runs ESLint rules. If there are errors, it attempts to fix them automatically by running `pnpm exec eslint . --fix`.
3. **TypeScript Type-Checking**: Executes `pnpm exec tsc --noEmit` to verify type safety across the entire application.
4. **Next.js Build**: Runs `pnpm run build` to verify production bundle generation, validating route configurations, SSR/SSG compilation, and metadata checks.

---

## 2. Manual Verification Reference

If you need to run individual commands manually or run them in specific scopes, use the table below:

| Action | Command | Scope | Purpose |
| :--- | :--- | :--- | :--- |
| **Check Git Changes** | `git status -s` | Workspace | Identify dirty files and check if untracked files exist. |
| **Run Linter** | `pnpm run lint` | Project | Analyze code quality using ESLint rules. |
| **Auto-Fix Lint** | `pnpm exec eslint . --fix` | Project | Automatically fix simple issues like formatting, sorting imports, or styling. |
| **Targeted Lint** | `pnpm exec eslint "src/components/MyComp.tsx" --fix` | Single File | Fix lint issues in a specific file without checking the whole project. |
| **Type Check** | `pnpm exec tsc --noEmit` | Project | Run TypeScript compiler validation to check all types. |
| **Verify Build** | `pnpm run build` | Project | Validate Next.js pages, routing, tree-shaking, and bundling. |

---

## 3. Error Correction Playbook

When checks fail, follow this playbook to resolve the errors:

### A. Linting Failures (ESLint)

Common lint issues and how to resolve them:
1. **Unused Imports / Variables** (`@typescript-eslint/no-unused-vars`):
   - *Fix*: Remove the unused variable or import. If the variable is required by an interface but unused locally, prefix it with an underscore (e.g., `_event`).
2. **React Hook Dependencies** (`react-hooks/exhaustive-deps`):
   - *Fix*: Add missing dependencies to the dependency array, or wrap functions in `useCallback` if they change too frequently. Only disable this warning if you are sure that triggering the hook again will cause infinite loops (using `// eslint-disable-next-line react-hooks/exhaustive-deps`).
3. **Missing Escape Characters** (JSX text like `'` or `"`):
   - *Fix*: Escape quotes inside JSX text using `&apos;` for `'` and `&quot;` for `"`. Alternatively, wrap the text in double quotes inside curly braces: `{"It's fine"}`.
4. **Invalid HTML Attributes**:
   - *Fix*: Check for common React attributes like `class` -> `className`, `for` -> `htmlFor`, or invalid custom properties without `data-` prefixes.

### B. TypeScript Compilation Failures (TSC)

Common TypeScript issues and how to resolve them:
1. **Property does not exist on type**:
   - *Fix*: Verify that you are using the correct interface/type. If using dynamic structures, declare a proper interface, extend it, or use safe type guarding:
     ```typescript
     if ('prop' in obj) {
       // obj.prop is now safe to use
     }
     ```
2. **Type 'X' is not assignable to type 'Y'**:
   - *Fix*: Align the types or cast them explicitly *only* when absolutely safe (e.g., `value as string`). Prefer correct type conversions (like `Number(value)` or `String(value)`) or schema parsing with Zod.
3. **Missing or Mismatched Imports**:
   - *Fix*: Check import statements. Make sure path aliases are used correctly (e.g., `@/components/ui/button` instead of `../../components/ui/button`). Check whether the module uses default (`export default`) or named (`export const`) exports.
4. **Nullable / Undefined values (`Object is possibly 'null' or 'undefined'`)**:
   - *Fix*: Use optional chaining (`obj?.property`), the nullish coalescing operator (`obj ?? fallback`), or strict null checking (`if (obj) { ... }`).

### C. Next.js Build Failures

Common Next.js build errors and how to resolve them:
1. **Missing `<Suspense>` boundary for Search Params**:
   - *Fix*: If a page or component uses `useSearchParams()` or other client-side navigation hooks, wrap it inside a `<Suspense>` component boundary. Otherwise, Next.js static generation will fail at build time.
2. **"use client" Directive Missing**:
   - *Fix*: Next.js 16+ uses React Server Components by default. If a file uses hooks (`useState`, `useEffect`, `useContext`) or client-side event handlers (like `onClick`), add `"use client"` at the very top of the file.
3. **Invalid Link Tag Nesting**:
   - *Fix*: Next.js `<Link>` components should not contain an `<a>` tag as a child unless `legacyBehavior` is enabled. Use `<Link href="...">Text</Link>` directly.
4. **Missing Key Prop in Iterator**:
   - *Fix*: Inside map functions, make sure the top-level element returned always has a unique `key` prop (e.g., `<div key={item.id}>`). Do not use array indexes as keys if the array can be sorted, filtered, or mutated.

---

## 4. Verification Loop Checklist

Follow this checklist before finalizing your changes:

- [ ] Run `git status` to identify all changed files.
- [ ] Run ESLint check (`pnpm run lint`) to identify any style, best-practice, or syntax issues.
- [ ] Correct any lint issues (utilizing `pnpm exec eslint . --fix` when possible).
- [ ] Run TypeScript type-checker (`pnpm exec tsc --noEmit`) to verify strict type safety.
- [ ] Solve any type errors by adjusting interfaces, checking imports, or using type guards.
- [ ] Run production build (`pnpm run build`) to ensure the application compiles cleanly without warnings or errors.
- [ ] Verify that there are no remaining build warnings.
