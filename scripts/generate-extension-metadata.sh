#!/bin/bash

# Generate extension metadata for marketplace
# Usage: ./generate-extension-metadata.sh <extension-name> <version>

EXTENSION_NAME=$1
VERSION=$2

if [ -z "$EXTENSION_NAME" ] || [ -z "$VERSION" ]; then
  echo "Usage: $0 <extension-name> <version>"
  exit 1
fi

echo "Generating metadata for $EXTENSION_NAME v$VERSION"
echo "=============================="

# Create basic metadata structure
cat > metadata.json << EOF
{
  "name": "$EXTENSION_NAME",
  "version": "$VERSION",
  "description": "Extension for ForgeOS marketplace",
  "author": "ForgeOS Team",
  "license": "MIT",
  "category": "Development Tools",
  "tags": ["extension", "forgeos"],
  "compatibility": {
    "os": ["Windows", "macOS", "Linux"],
    "forgeos": ">=2.0.0",
    "node": ">=14.0.0"
  },
  "capabilities": [],
  "permissions": [],
  "dependencies": []
}
EOF

echo "Metadata generated: metadata.json"
