---
name: security-testing
description: Audit and improve project security for web applications, especially Next.js/TypeScript apps. Use when asked to test security, run a security audit, find vulnerabilities, harden auth/API/database code, check for leaked secrets, review dependency risk, validate security headers, assess OWASP Top 10 risks, or prepare a security remediation plan.
---

# Security Testing

## Core Workflow

1. Read repository guidance first, including `AGENTS.md`. For this project, read the relevant Next.js guide in `node_modules/next/dist/docs/` before changing Next.js code.
2. Map the stack from `package.json`, config files, route handlers, middleware, auth setup, database adapters, and environment usage.
3. Run deterministic checks:
   - `python .agents/skills/security-testing/scripts/security_scan.py .`
   - package audit command when available (`pnpm audit`, `npm audit`, or equivalent). If network or registry access is blocked, report that limitation.
4. Review high-risk areas manually:
   - authentication, session handling, roles, tenant isolation, password reset, email verification, MFA
   - API routes, server actions, route handlers, middleware, redirects, file upload, webhooks
   - database access, authorization filters, RLS, raw SQL, migrations, seed data
   - secret handling, environment variables, logs, error messages, client bundles
   - CSRF, XSS, SSRF, open redirect, IDOR, rate limiting, CORS, cache leakage
   - security headers, cookies, CSP, HTTPS assumptions
5. Prioritize findings by exploitability and impact. Lead with concrete file/line references, then propose minimal fixes.
6. Implement fixes when the user asks for remediation. Keep changes scoped, add tests for security-sensitive behavior, and rerun relevant checks.

## Script Usage

Use `scripts/security_scan.py` as a first-pass static scan. It checks for suspicious secrets, unsafe configuration, risky code patterns, and missing security-oriented project files. Treat results as leads, not proof.

Useful options:

```bash
python .agents/skills/security-testing/scripts/security_scan.py .
python .agents/skills/security-testing/scripts/security_scan.py . --json
python .agents/skills/security-testing/scripts/security_scan.py src --fail-on high
```

The script intentionally skips dependency folders, build output, lockfiles, and binary assets.

## References

Read `references/web-security-checklist.md` when performing a full audit or when findings need remediation guidance.

## Reporting Standard

For audits, report in this order:

1. Findings ordered by severity: `Critical`, `High`, `Medium`, `Low`.
2. Evidence with file and line references.
3. Risk and realistic exploit path.
4. Recommended fix.
5. Verification performed and checks that could not be run.

Avoid vague items such as "improve security" without an affected code path and a concrete next action.
