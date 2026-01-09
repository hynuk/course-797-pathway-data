#!/bin/bash

# Create Release Script
# 
# Creates a release branch, bumps version, and prepares for release
#
# Usage:
#   ./scripts/create-release.sh [major|minor|patch]
#
# Examples:
#   ./scripts/create-release.sh patch
#   ./scripts/create-release.sh minor

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# Check if bump type is provided
if [ -z "$1" ]; then
    echo "Usage: ./scripts/create-release.sh [major|minor|patch]"
    echo ""
    echo "Current version: $(cat VERSION)"
    exit 1
fi

BUMP_TYPE="$1"

# Validate bump type
if [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo "Error: Invalid bump type. Use: major, minor, or patch"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(cat VERSION)
echo "Current version: $CURRENT_VERSION"

# Bump version
node scripts/version-bump.js "$BUMP_TYPE" --changelog
NEW_VERSION=$(cat VERSION)
echo "New version: $NEW_VERSION"

# Check if we're on develop branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "Warning: You're not on 'develop' branch. Current branch: $CURRENT_BRANCH"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create release branch
RELEASE_BRANCH="release/v$NEW_VERSION"
echo "Creating release branch: $RELEASE_BRANCH"

git checkout -b "$RELEASE_BRANCH"

# Commit version bump
git add VERSION CHANGELOG.md
git commit -m "chore: Bump version to $NEW_VERSION"

echo ""
echo "✓ Release branch created: $RELEASE_BRANCH"
echo ""
echo "Next steps:"
echo "  1. Review and update CHANGELOG.md with release notes"
echo "  2. Test the release"
echo "  3. When ready, tag the release:"
echo "     git tag -a v$NEW_VERSION -m \"Release version $NEW_VERSION\""
echo "  4. Merge to main:"
echo "     git checkout main"
echo "     git merge $RELEASE_BRANCH"
echo "     git push origin main"
echo "     git push origin v$NEW_VERSION"
echo "  5. Merge back to develop:"
echo "     git checkout develop"
echo "     git merge $RELEASE_BRANCH"
echo "     git push origin develop"
echo "  6. Delete release branch:"
echo "     git branch -d $RELEASE_BRANCH"
echo "     git push origin --delete $RELEASE_BRANCH"
