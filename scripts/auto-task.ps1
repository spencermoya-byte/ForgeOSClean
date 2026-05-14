$LogFile = ".\logs\aider-latest.log"

Write-Host ""
Write-Host "Creating safety checkpoint..."
Write-Host ""
powershell -ExecutionPolicy Bypass -File .\scripts\create-checkpoint.ps1

Write-Host ""
Write-Host "Collecting repo context..."
Write-Host ""
powershell -ExecutionPolicy Bypass -File .\scripts\collect-repo-context.ps1

Write-Host ""
Write-Host "Generating next ForgeOS prompt..."
Write-Host ""
powershell -ExecutionPolicy Bypass -File .\scripts\generate-next-prompt.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Prompt generation failed. Stopping."
    exit 1
}

Write-Host ""
Write-Host "Starting Aider..."
Write-Host ""
powershell -ExecutionPolicy Bypass -File .\scripts\run-aider-task.ps1 *> $LogFile

Write-Host ""
Write-Host "Running verification..."
Write-Host ""

if (Test-Path ".\package.json") {
    npm run build
}

Write-Host ""
Write-Host "Reviewing task result..."
Write-Host ""
powershell -ExecutionPolicy Bypass -File .\scripts\review-task-result.ps1

Write-Host ""
Write-Host "Updating project memory..."
Write-Host ""
powershell -ExecutionPolicy Bypass -File .\scripts\update-project-state.ps1

Write-Host ""
Write-Host "Task complete."
Write-Host ""