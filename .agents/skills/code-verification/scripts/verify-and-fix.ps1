# verify-and-fix.ps1
# Helper script to verify code changes, check for errors, and attempt automatic fixes.

$ErrorActionPreference = "Continue" # Do not exit instantly on command failure so we can run fixes and compile stats

# Helper function to print headers
function Write-Header ($text) {
    Write-Host "`n=== $text ===" -ForegroundColor Cyan
}

# Helper function to print success
function Write-Success ($text) {
    Write-Host "[OK] $text" -ForegroundColor Green
}

# Helper function to print warnings
function Write-WarningMsg ($text) {
    Write-Host "[!] $text" -ForegroundColor Yellow
}

# Helper function to print errors
function Write-ErrorMsg ($text) {
    Write-Host "[X] $text" -ForegroundColor Red
}

Write-Header "Code Verification and Auto-Correction Tool"

# 1. Detect git changes
Write-Header "Checking Git Status"
$gitChanges = git status --porcelain
if ([string]::IsNullOrWhiteSpace($gitChanges)) {
    Write-WarningMsg "No modified or untracked files detected in Git."
} else {
    Write-Host "The following files have changes:" -ForegroundColor Gray
    Write-Host $gitChanges
}

# 2. Run Linting
Write-Header "Step 1: Running Linter (ESLint)"
$lintFailed = $false

pnpm run lint
if ($LASTEXITCODE -ne 0) {
    Write-WarningMsg "Linter detected errors. Attempting automatic fixes..."
    $lintFailed = $true
} else {
    Write-Success "Linter passed successfully!"
}

if ($lintFailed) {
    # If standard lint fails, let's run eslint --fix
    Write-Host "Running: pnpm exec eslint . --fix" -ForegroundColor Gray
    pnpm exec eslint . --fix
    
    Write-Host "Re-running linter to verify fixes..." -ForegroundColor Gray
    pnpm run lint
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Linter errors were automatically fixed and verified!"
        $lintFailed = $false
    } else {
        Write-ErrorMsg "Linter still has errors that cannot be automatically fixed."
        $lintFailed = $true
    }
}

# 3. TypeScript Type-Checking
Write-Header "Step 2: Checking TypeScript Types"
$tscFailed = $false
Write-Host "Running: pnpm exec tsc --noEmit" -ForegroundColor Gray
pnpm exec tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "TypeScript type-checking failed with errors."
    $tscFailed = $true
} else {
    Write-Success "TypeScript type-checking passed!"
}

# 4. Next.js Build
Write-Header "Step 3: Verifying Next.js Build"
$buildFailed = $false
Write-Host "Running: pnpm run build" -ForegroundColor Gray
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Next.js Build failed."
    $buildFailed = $true
} else {
    Write-Success "Next.js Build completed successfully!"
}

# Summary of results
Write-Header "Verification Summary"

$allPassed = $true

if ($lintFailed) {
    Write-ErrorMsg "ESLint validation: FAILED"
    $allPassed = $false
} else {
    Write-Success "ESLint validation: PASSED"
}

if ($tscFailed) {
    Write-ErrorMsg "TypeScript compilation: FAILED"
    $allPassed = $false
} else {
    Write-Success "TypeScript compilation: PASSED"
}

if ($buildFailed) {
    Write-ErrorMsg "Next.js Production Build: FAILED"
    $allPassed = $false
} else {
    Write-Success "Next.js Production Build: PASSED"
}

if ($allPassed) {
    Write-Host "`nAll checks passed! Your code is clean and ready." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nSome checks failed. Please fix the errors above before committing." -ForegroundColor Red
    exit 1
}
