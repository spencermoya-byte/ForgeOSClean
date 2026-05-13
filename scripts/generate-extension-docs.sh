#!/bin/bash

# Generate documentation for marketplace extensions
# Usage: ./generate-extension-docs.sh <extension-name>

EXTENSION_NAME=$1

if [ -z "$EXTENSION_NAME" ]; then
  echo "Usage: $0 <extension-name>"
  exit 1
fi

echo "Generating documentation for $EXTENSION_NAME"
echo "=============================="

# Create documentation structure
mkdir -p docs/$EXTENSION_NAME

cat > docs/$EXTENSION_NAME/README.md << EOF
# $EXTENSION_NAME

## Description
Extension for ForgeOS marketplace

## Features
- Feature 1
- Feature 2
- Feature 3

## Installation
\`\`\`bash
# Install command
\`\`\`

## Configuration
Configuration options and settings

## Usage
How to use the extension

## Compatibility
- ForgeOS: >=2.0.0
- Node.js: >=14.0.0
- OS: Windows, macOS, Linux

## License
MIT
EOF

echo "Documentation generated in docs/$EXTENSION_NAME"
