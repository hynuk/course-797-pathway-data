#!/bin/bash

# Create Hotfix Script
# 
# Creates a hotfix branch from main for urgent fixes
#
# Usage:
#   ./scripts/create-hotfix.sh [description]
#
# Examples:
#   ./scripts/create-hotfix.sh "fix-coordinate-bug"
#   ./scripts/create-hotfix.sh "critical-data-validation"

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# Check if description is provided
if [ -z "$1" ]; then
    echo "Usage: ./scripts/create-hotfix.sh [description]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/create-hotfix.sh fix-coordinate-bug"
    echo "  ./scripts/create-hotfix.sh critical-data-validation"
    exit 1
fi

DESCRIPTION="$1"
CURRENT_VERSION=$(cat VERSION)

# Parse version for patch bump
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "Current version: $CURRENT_VERSION"
echo "Hotfix version: $NEW_VERSION"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Warning: You're not on 'main' branch. Current branch: $CURRENT_BRANCH"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Ensure main is up to date
echo "Updating main branch..."
git checkout main
git pull origin main

# Create hotfix branch
HOTFIX_BRANCH="hotfix/v$NEW_VERSION-$DESCRIPTION"
echo "Creating hotfix branch: $HOTFIX_BRANCH"

git checkout -b "$HOTFIX_BRANCH"

echo ""
echo "✓ Hotfix branch created: $HOTFIX_BRANCH"
echo ""
echo "Next steps:"
echo "  1. Make your fixes"
echo "  2. Test thoroughly"
echo "  3. When ready, bump version and commit:"
echo "     node scripts/version-bump.js patch --changelog"
echo "     git add ."
echo "     git commit -m \"fix: [description of fix]\""
echo "     git commit -m \"chore: Bump version to $NEW_VERSION\""
echo "  4. Tag and merge:"
echo "     git tag -a v$NEW_VERSION -m \"Hotfix version $NEW_VERSION\""
echo "     git checkout main"
echo "     git merge $HOTFIX_BRANCH"
echo "     git push origin main"
echo "     git push origin v$NEW_VERSION"
echo "  5. Merge to develop:"
echo "     git checkout develop"
echo "     git merge $HOTFIX_BRANCH"
echo "     git push origin develop"
echo "  6. Delete hotfix branch:"
echo "     git branch -d $HOTFIX_BRANCH"
echo "     git push origin --delete $HOTFIX_BRANCH"
