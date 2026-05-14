$AiderModel = "ollama/qwen2.5-coder:32b"
$PromptFile = ".\prompts\tasks\next-task.md"

aider --model $AiderModel --message-file $PromptFile --yes-always --edit-format whole