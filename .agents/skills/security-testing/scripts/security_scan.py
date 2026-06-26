#!/usr/bin/env python3
"""Static security lead finder for web projects.

This script is intentionally conservative: it reports suspicious patterns with
file/line evidence and leaves exploitability decisions to the reviewer.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable


SKIP_DIRS = {
    ".agents",
    ".codex",
    ".git",
    ".next",
    ".turbo",
    ".vercel",
    "coverage",
    "dist",
    "build",
    "node_modules",
    "out",
}

SKIP_EXTS = {
    ".avif",
    ".bmp",
    ".gif",
    ".ico",
    ".jpeg",
    ".jpg",
    ".lock",
    ".map",
    ".pdf",
    ".png",
    ".svg",
    ".tsbuildinfo",
    ".webp",
    ".woff",
    ".woff2",
    ".zip",
}

SEVERITY_ORDER = {"low": 1, "medium": 2, "high": 3, "critical": 4}


@dataclass
class Finding:
    severity: str
    rule: str
    path: str
    line: int
    message: str
    evidence: str


RULES: list[tuple[str, str, re.Pattern[str], str]] = [
    (
        "critical",
        "private-key-material",
        re.compile(r"-----BEGIN (RSA |EC |OPENSSH |DSA |PRIVATE )?PRIVATE KEY-----"),
        "Private key material appears to be committed.",
    ),
    (
        "high",
        "hardcoded-token",
        re.compile(
            r"(?i)\b(api[_-]?key|secret|token|password|passwd|pwd|client[_-]?secret)\b"
            r"\s*[:=]\s*['\"][^'\"\s]{12,}['\"]"
        ),
        "Potential hardcoded credential or token.",
    ),
    (
        "high",
        "jwt-secret-fallback",
        re.compile(r"(?i)(jwt|session|auth).{0,24}secret.{0,60}(\|\||\?\?).{0,20}['\"][^'\"]+['\"]"),
        "Secret value appears to have a hardcoded fallback.",
    ),
    (
        "high",
        "dangerous-eval",
        re.compile(r"\b(eval|Function)\s*\("),
        "Dynamic code execution can lead to injection or RCE.",
    ),
    (
        "high",
        "sql-string-concat",
        re.compile(r"(?i)(query|execute|raw|sql)\s*\([^)]*(\+|`\s*\$\{)"),
        "SQL appears to be built dynamically. Verify parameterization.",
    ),
    (
        "medium",
        "dangerous-html",
        re.compile(r"dangerouslySetInnerHTML"),
        "HTML injection sink. Verify sanitization and trusted input.",
    ),
    (
        "medium",
        "insecure-random",
        re.compile(r"\bMath\.random\s*\("),
        "Math.random is not suitable for secrets, tokens, or security decisions.",
    ),
    (
        "medium",
        "weak-hash",
        re.compile(r"(?i)\b(md5|sha1)\b"),
        "Weak hash usage. Verify this is not used for passwords or signatures.",
    ),
    (
        "medium",
        "permissive-cors",
        re.compile(r"(?i)(access-control-allow-origin|origin)\s*[:=]\s*['\"]\*['\"]"),
        "Wildcard CORS origin found. Verify credentials are not allowed.",
    ),
    (
        "medium",
        "tls-disabled",
        re.compile(r"NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['\"]?0"),
        "TLS certificate validation appears to be disabled.",
    ),
    (
        "low",
        "console-secret-risk",
        re.compile(r"console\.(log|error|warn|info)\([^)]*(token|secret|password|session|cookie)", re.I),
        "Logging may expose sensitive values.",
    ),
]


def iter_files(root: Path) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for filename in filenames:
            path = Path(dirpath) / filename
            if path.suffix.lower() in SKIP_EXTS:
                continue
            if path.name in {"pnpm-lock.yaml", "package-lock.json", "yarn.lock"}:
                continue
            yield path


def read_text(path: Path) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            return path.read_text(encoding="utf-16")
        except UnicodeDecodeError:
            return None
    except OSError:
        return None


def scan_file(path: Path, root: Path) -> list[Finding]:
    text = read_text(path)
    if text is None:
        return []

    findings: list[Finding] = []
    rel = path.relative_to(root).as_posix()
    for line_no, line in enumerate(text.splitlines(), 1):
        stripped = line.strip()
        if not stripped or stripped.startswith("//") or stripped.startswith("#"):
            continue
        for severity, rule, pattern, message in RULES:
            if pattern.search(stripped):
                findings.append(
                    Finding(
                        severity=severity,
                        rule=rule,
                        path=rel,
                        line=line_no,
                        message=message,
                        evidence=stripped[:220],
                    )
                )
    return findings


def project_findings(root: Path) -> list[Finding]:
    findings: list[Finding] = []
    gitignore = root / ".gitignore"
    if gitignore.exists():
        text = read_text(gitignore) or ""
        if ".env" not in text:
            findings.append(
                Finding(
                    severity="medium",
                    rule="gitignore-env",
                    path=".gitignore",
                    line=1,
                    message=".gitignore does not appear to ignore .env files.",
                    evidence="missing .env pattern",
                )
            )
    else:
        findings.append(
            Finding(
                severity="medium",
                rule="missing-gitignore",
                path=".",
                line=1,
                message="No .gitignore found. Verify secrets and build output cannot be committed.",
                evidence="missing .gitignore",
            )
        )

    next_config = root / "next.config.ts"
    if next_config.exists():
        text = read_text(next_config) or ""
        if "headers()" not in text and "async headers" not in text:
            findings.append(
                Finding(
                    severity="low",
                    rule="next-security-headers",
                    path="next.config.ts",
                    line=1,
                    message="No Next.js security headers detected in next.config.ts.",
                    evidence="missing headers()",
                )
            )
    return findings


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scan a project for security review leads.")
    parser.add_argument("root", nargs="?", default=".", help="Project path to scan.")
    parser.add_argument("--json", action="store_true", help="Emit JSON output.")
    parser.add_argument(
        "--fail-on",
        choices=["low", "medium", "high", "critical"],
        help="Exit with status 2 when findings at or above this severity exist.",
    )
    return parser.parse_args()


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")

    args = parse_args()
    root = Path(args.root).resolve()
    if not root.exists():
        print(f"Path does not exist: {root}", file=sys.stderr)
        return 1

    findings = project_findings(root)
    for path in iter_files(root):
        findings.extend(scan_file(path, root))

    findings.sort(key=lambda item: (-SEVERITY_ORDER[item.severity], item.path, item.line, item.rule))

    if args.json:
        print(json.dumps([asdict(item) for item in findings], indent=2))
    else:
        if not findings:
            print("No security leads found by static scan.")
        for item in findings:
            print(
                f"[{item.severity.upper()}] {item.rule} {item.path}:{item.line}\n"
                f"  {item.message}\n"
                f"  {item.evidence}"
            )

    if args.fail_on:
        threshold = SEVERITY_ORDER[args.fail_on]
        if any(SEVERITY_ORDER[item.severity] >= threshold for item in findings):
            return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
