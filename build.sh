#!/bin/bash
set -e

echo "Starting Expo web build for Vercel..."

# Ensure expo CLI is available
if ! command -v expo &> /dev/null; then
    echo "Installing expo CLI..."
    npm install -g expo-cli
fi

# Run the export
echo "Exporting for web platform..."
expo export --platform web

echo "Build completed successfully!"
