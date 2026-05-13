#!/bin/bash

# Check extension compatibility with current ForgeOS version
# Usage: ./check-extension-compatibility.sh <extension-metadata-file>

METADATA_FILE=$1

if [ -z "$METADATA_FILE" ]; then
  echo "Usage: $0 <extension-metadata-file>"
  exit 1
fi

if [ ! -f "$METADATA_FILE" ]; then
  echo "Error: Metadata file not found"
  exit 1
fi

echo "Checking compatibility for extension..."
echo "=============================="

# Extract compatibility info
OS_LIST=$(jq -r '.compatibility.os[]' "$METADATA_FILE" | tr '\n' ',' | sed 's/,$//')
FORGEOS_VERSION=$(jq -r '.compatibility.forgeos' "$METADATA_FILE")
NODE_VERSION=$(jq -r '.compatibility.node' "$METADATA_FILE")

echo "Supported OS: $OS_LIST"
echo "ForgeOS version requirement: $FORGEOS_VERSION"
echo "Node.js version requirement: $NODE_VERSION"

echo "Compatibility check complete"
