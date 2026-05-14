$ArchitectModel = "qwen2.5-coder:32b"

$MasterContext = ".\prompts\context\forgeos-master-context.md"
$SegmentationRules = ".\prompts\context\segmentation-rules.md"
$ProjectState = ".\prompts\context\project-state.md"

$ArchitectSystem = ".\prompts\architect-system.md"
$RequestFile = ".\prompts\next-task-request.md"

$OutputFile = ".\prompts\tasks\next-task.md"

$master = Get-Content $MasterContext -Raw
$rules = Get-Content $SegmentationRules -Raw
$state = Get-Content $ProjectState -Raw
$system = Get-Content $ArchitectSystem -Raw
$request = Get-Content $RequestFile -Raw

$RepoTree = git ls-files

$fullPrompt = @"
FORGEOS MASTER CONTEXT:
$master

SEGMENTATION RULES:
$rules

CURRENT PROJECT STATE:
$state

REPOSITORY FILES:
$RepoTree

ARCHITECT SYSTEM RULES:
$system

USER TASK REQUEST:
$request

Generate the next highly focused ForgeOS Aider implementation prompt.
Output ONLY the final prompt.
"@

$fullPrompt | ollama run $ArchitectModel | Out-File -Encoding UTF8 $OutputFile