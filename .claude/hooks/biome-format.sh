#!/bin/bash

# Read JSON input from stdin
INPUT=$(cat)

# Extract file_path from the JSON input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# If file_path exists, check if it's a Biome-supported file type
if [ -n "$FILE_PATH" ]; then
  # Get file extension
  EXT="${FILE_PATH##*.}"

  # List of Biome-supported extensions
  SUPPORTED_EXTS="js jsx ts tsx json jsonc"

  # Check if the file extension is supported
  if echo "$SUPPORTED_EXTS" | grep -wq "$EXT"; then
    # Format and lint with auto-fix
    bunx biome check --write "$FILE_PATH"
  fi
fi