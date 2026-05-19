param(
    [string]$Mode = "files"
)

Set-Location "C:\ForgeOSClean"

$TempRequest = ".\scripts\vivus-request.txt"

if (!(Test-Path $TempRequest)) {
    "" | Set-Content $TempRequest
}

Write-Host ""
Write-Host "Opening request editor..." -ForegroundColor Cyan

notepad $TempRequest

Write-Host ""
Write-Host "Paste your request into Notepad, SAVE the file, then CLOSE Notepad." -ForegroundColor Yellow
Pause

$UserRequest = Get-Content $TempRequest -Raw

$PlannerMode = Get-Content ".\.aider-modes\vivusplanner.txt" -Raw
$TargetMode = Get-Content ".\.aider-modes\vivusfiles.txt" -Raw

$PromptInput = @"
You are the Vivus planner.

Convert the user's request into ONE complete copy-paste-ready Aider prompt.

Use these planner rules:
$PlannerMode

Use these target execution rules:
$TargetMode

User request:
$UserRequest
"@

$TempInput = ".\.aider-modes\_planner-input.txt"
$TempPrompt = ".\.aider-modes\_generated-vivus-prompt.txt"

$PromptInput | Set-Content $TempInput -Encoding UTF8

Write-Host ""
Write-Host "Generating strict Vivus prompt..." -ForegroundColor Cyan

Get-Content $TempInput | ollama run qwen3.6:27b | Set-Content $TempPrompt -Encoding UTF8

Write-Host ""
Write-Host "Generated prompt saved to:" -ForegroundColor Green
Write-Host $TempPrompt

Write-Host ""
Write-Host "Creating safety checkpoint..." -ForegroundColor Cyan

git add .
git commit -m "checkpoint before vivus auto task" | Out-Null

Write-Host ""
Write-Host "Running guarded Vivus edit..." -ForegroundColor Cyan

aider `
    .\src\App.tsx `
    .\src\App.css `
    .\src\main.tsx `
    .\src\index.css `
    .\.aider-modes\vivusfiles.txt `
    --model ollama/qwen3-coder-next:latest `
    --editor-model ollama/qwen3-coder-next:latest `
    --weak-model ollama/qwen3.6:27b `
    --edit-format whole `
    --map-tokens 4096 `
    --message-file $TempPrompt `
    --yes

Write-Host ""
Write-Host "Aider finished. Changed files:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "Diff:" -ForegroundColor Cyan
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

Write-Host "Changes reverted." -ForegroundColor Green