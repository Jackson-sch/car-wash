# Web Security Checklist

Use this reference for full project audits and remediation work.

## Next.js And React

- Read the local Next.js docs required by `AGENTS.md` before editing framework code.
- Verify server-only code is not imported by client components.
- Check route handlers and server actions for authentication, authorization, input validation, and rate limiting.
- Treat `redirect`, `nextUrl`, callback URLs, and user-provided paths as open redirect risks.
- Ensure cache behavior does not expose per-user data. Review `fetch` cache options, route segment caching, and any framework-specific cache APIs.
- Avoid rendering unsanitized HTML. If `dangerouslySetInnerHTML` is required, identify the sanitizer and allowed input source.
- Confirm cookies use `HttpOnly`, `Secure`, `SameSite`, tight path/domain scope, and appropriate expiration.
- Ensure error pages and API errors do not leak stack traces, SQL errors, tokens, or environment values.

## Authentication And Authorization

- Verify every protected page, API route, server action, and mutation checks the current user.
- Check object ownership and organization/tenant membership at the data access boundary.
- Review role checks for fail-open logic, stringly typed roles, missing default-deny behavior, and client-only enforcement.
- Validate password reset, email verification, invitation, and OAuth callback flows.
- Confirm sessions are invalidated after sensitive changes where appropriate.
- Review MFA and backup code storage if present.

## Data And Database

- Prefer parameterized queries and ORM query builders. Treat raw SQL, string concatenation, and dynamic identifiers as high-risk.
- Confirm migrations do not create permissive policies or default admin users.
- Check seed/demo data for real credentials, tokens, emails, or customer data.
- Verify tenant filters cannot be bypassed through user-controlled IDs.
- Review logs and analytics events for PII, secrets, tokens, and payment data.

## Inputs, Files, And External Calls

- Validate request bodies, query params, headers, webhooks, and form data with explicit schemas.
- Enforce file upload limits: size, MIME verification, extension allowlist, storage path isolation, and malware scanning where needed.
- Protect webhooks with signature verification and replay protection.
- Treat user-controlled URLs as SSRF risks. Restrict protocols, private IP ranges, redirects, and metadata endpoints.
- Check CORS policies for credentialed wildcard origins.

## Browser Security

- Require security headers appropriate to the app: CSP, HSTS, X-Frame-Options or `frame-ancestors`, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- Keep CSP practical and verify it does not rely on broad `unsafe-inline` or `unsafe-eval` without a documented reason.
- Avoid storing sensitive data in `localStorage`, `sessionStorage`, or readable client cookies.

## Dependencies And Supply Chain

- Run the package manager audit command and inspect high/critical advisories.
- Check whether vulnerable packages are direct or transitive and whether the vulnerable code path is reachable.
- Review install scripts, unusual packages, unpublished forks, and packages used in build/deploy scripts.
- Confirm `.env*`, private keys, generated credentials, and local database dumps are ignored by git.

## Severity Guide

- Critical: unauthenticated remote code execution, exposed production secrets, auth bypass for broad access, destructive data access across tenants.
- High: IDOR on sensitive data, SQL injection, stored XSS for privileged users, missing auth on sensitive mutation, vulnerable dependency with reachable exploit.
- Medium: reflected XSS with constraints, weak security headers, missing rate limiting on sensitive endpoints, limited information disclosure.
- Low: hardening gaps, minor dependency hygiene, incomplete logging safeguards, non-sensitive misconfiguration.
