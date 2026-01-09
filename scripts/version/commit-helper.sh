#!/bin/bash

# Commit Helper Script
# 
# Interactive helper for creating properly formatted commits
#
# Usage:
#   ./scripts/commit-helper.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo "=== Commit Helper ==="
echo ""

# Show current status
echo "Current status:"
git status --short
echo ""

# Get commit type
echo "Select commit type:"
echo "  1) feat - New feature"
echo "  2) fix - Bug fix"
echo "  3) docs - Documentation"
echo "  4) style - Formatting"
echo "  5) refactor - Code refactoring"
echo "  6) perf - Performance"
echo "  7) test - Tests"
echo "  8) chore - Maintenance"
echo "  9) media - Media assets"
read -p "Type (1-9): " TYPE_CHOICE

case $TYPE_CHOICE in
    1) TYPE="feat" ;;
    2) TYPE="fix" ;;
    3) TYPE="docs" ;;
    4) TYPE="style" ;;
    5) TYPE="refactor" ;;
    6) TYPE="perf" ;;
    7) TYPE="test" ;;
    8) TYPE="chore" ;;
    9) TYPE="media" ;;
    *) echo "Invalid choice"; exit 1 ;;
esac

# Get scope (optional)
echo ""
read -p "Scope (optional, e.g., levels, sprints, waypoints): " SCOPE

# Get subject
echo ""
read -p "Subject (short description): " SUBJECT

# Build commit message
if [ -z "$SCOPE" ]; then
    COMMIT_MSG="$TYPE: $SUBJECT"
else
    COMMIT_MSG="$TYPE($SCOPE): $SUBJECT"
fi

# Show staged files
echo ""
echo "Staged files:"
git diff --cached --name-only
echo ""

# Confirm
echo "Commit message: $COMMIT_MSG"
read -p "Proceed with commit? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "$COMMIT_MSG"
    echo ""
    echo "✓ Commit created successfully"
else
    echo "Commit cancelled"
    exit 1
fi
