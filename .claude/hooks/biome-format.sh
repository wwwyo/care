#!/bin/bash

# Read JSON input from stdin
INPUT=$(cat)

# Extract file_path from the JSON input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# If file_path exists, run biome on that file
if [ -n "$FILE_PATH" ]; then
  # Format and lint with auto-fix
  bunx biome check --write "$FILE_PATH"
fi