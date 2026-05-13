#!/bin/bash

# Install extension from marketplace
# Usage: ./install-extension.sh <extension-id>

EXTENSION_ID=$1

if [ -z "$EXTENSION_ID" ]; then
  echo "Usage: $0 <extension-id>"
  exit 1
fi

echo "Installing extension: $EXTENSION_ID"
echo "=============================="

# Simulate installation process
echo "Downloading extension..."
echo "Verifying compatibility..."
echo "Installing dependencies..."
echo "Setting up extension configuration..."
echo "Extension $EXTENSION_ID installed successfully"
