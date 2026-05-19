param(
    [string]$Mode = "files"
)

Set-Location "C:\ForgeOSClean"

Write-Host ""
Write-Host "Creating safety checkpoint..." -ForegroundColor Cyan

git add .
git commit -m "checkpoint before vivus $Mode task" | Out-Null

Write-Host "Starting Vivus mode: $Mode" -ForegroundColor Cyan

switch ($Mode) {
    "planner" { vivusplanner }
    "files" { vivusfiles }
    "architect" { vivusarchitect }
    "full" { vivusfull }
    "vision" { vivusvision }

    default {
        Write-Host "Unknown mode: $Mode" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Aider finished. Showing changed files..." -ForegroundColor Cyan

git status --short

Write-Host ""
Write-Host "Showing diff..." -ForegroundColor Cyan

git diff

Write-Host ""

$choice = Read-Host "Keep these changes? Type YES to keep, anything else to revert"

if ($choice -eq "YES") {
    Write-Host "Keeping changes." -ForegroundColor Green
    exit 0
}

Write-Host "Reverting changes..." -ForegroundColor Yellow

git restore .
git clean -fd

Write-Host "Changes reverted back to checkpoint." -ForegroundColor Green