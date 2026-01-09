# Version Management Guide

This document outlines the version management strategy for the mango-pathway project.

## Version Numbering

We use **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes to data structure or API
- **MINOR**: New features, new levels/sprints, significant content additions
- **PATCH**: Bug fixes, coordinate adjustments, minor content updates

### Current Version
See `VERSION` file for the current version number.

## Branching Strategy

### Main Branches

1. **`main`** - Production-ready code
   - Always stable and deployable
   - Protected branch (requires PR for merges)
   - All commits should be tagged with version numbers

2. **`develop`** - Integration branch for features
   - Where feature branches are merged
   - Should be kept stable but may contain WIP features

### Feature Branches

Format: `feature/description` or `feature/issue-number-description`

Examples:
- `feature/add-level-6`
- `feature/update-waypoint-coordinates`
- `feature/refine-sprint-titles`

### Hotfix Branches

Format: `hotfix/description` or `hotfix/version-description`

For urgent fixes to production:
- `hotfix/fix-coordinate-bug`
- `hotfix/v1.2.1-critical-fix`

### Release Branches

Format: `release/vX.Y.Z`

For preparing new releases:
- `release/v1.3.0`
- Used for final testing and version bumping

## Commit Message Convention

We follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature (new level, sprint, scene)
- `fix`: Bug fix (coordinate correction, data validation)
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc. (no code change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates
- `media`: Media asset updates (images, SVGs)

### Scopes (Optional)

- `levels`: Changes to level structure
- `sprints`: Changes to sprint data
- `waypoints`: Waypoint coordinate updates
- `artifacts`: Artifact data changes
- `media`: Media asset management
- `docs`: Documentation updates

### Examples

```
feat(levels): Add Level 6 with 4 sprints

fix(waypoints): Correct S1.1 waypoint coordinates

docs(media): Update media naming convention guide

chore: Update .gitignore for new asset types

media(sprints): Update Level 1 sprint title illustrations
```

## Version Workflow

### 1. Starting a New Feature

```bash
# Create and switch to feature branch
git checkout -b feature/add-level-6 develop

# Make changes, commit with proper messages
git add .
git commit -m "feat(levels): Add Level 6 structure"

# Push branch
git push origin feature/add-level-6
```

### 2. Completing a Feature

```bash
# Ensure branch is up to date
git checkout develop
git pull origin develop
git checkout feature/add-level-6
git rebase develop

# Push updates
git push origin feature/add-level-6

# Create Pull Request on GitHub
# After PR approval and merge, delete local branch:
git checkout develop
git branch -d feature/add-level-6
```

### 3. Creating a Release

```bash
# Create release branch from develop
git checkout -b release/v1.3.0 develop

# Update VERSION file
echo "1.3.0" > VERSION

# Update CHANGELOG.md with release notes
# Commit version bump
git add VERSION CHANGELOG.md
git commit -m "chore: Bump version to 1.3.0"

# Tag the release
git tag -a v1.3.0 -m "Release version 1.3.0"

# Merge to main
git checkout main
git merge release/v1.3.0
git push origin main
git push origin v1.3.0

# Merge back to develop
git checkout develop
git merge release/v1.3.0
git push origin develop

# Delete release branch
git branch -d release/v1.3.0
git push origin --delete release/v1.3.0
```

### 4. Hotfix Workflow

```bash
# Create hotfix from main
git checkout -b hotfix/v1.2.1 main

# Make fix, commit
git add .
git commit -m "fix(waypoints): Correct critical coordinate bug"

# Update version
echo "1.2.1" > VERSION
git add VERSION
git commit -m "chore: Bump version to 1.2.1"

# Tag and merge
git tag -a v1.2.1 -m "Hotfix version 1.2.1"
git checkout main
git merge hotfix/v1.2.1
git push origin main
git push origin v1.2.1

# Merge to develop
git checkout develop
git merge hotfix/v1.2.1
git push origin develop

# Delete hotfix branch
git branch -d hotfix/v1.2.1
```

## Version Bumping Rules

### Patch (X.Y.Z → X.Y.Z+1)
- Bug fixes
- Coordinate adjustments
- Minor content corrections
- Media asset updates (same content, different format)

### Minor (X.Y.Z → X.Y+1.0)
- New level added
- New sprints added to existing levels
- New scenes or waypoints
- Significant content additions
- New media assets for new content

### Major (X.Y.Z → X+1.0.0)
- Breaking changes to JSON structure
- Major refactoring of data architecture
- Removal of deprecated fields
- Changes that require client code updates

## Tagging Strategy

- All releases should be tagged: `v1.2.3`
- Tags should include release notes
- Use annotated tags: `git tag -a v1.2.3 -m "Release message"`

## Helper Scripts

Use the provided scripts for common version management tasks:

- `scripts/version-bump.js` - Bump version number
- `scripts/create-release.sh` - Create release branch and tag
- `scripts/create-hotfix.sh` - Create hotfix branch
- `scripts/commit-helper.sh` - Interactive commit helper

## Best Practices

1. **Always update CHANGELOG.md** when making significant changes
2. **Tag all releases** with version numbers
3. **Keep commit messages clear and descriptive**
4. **Rebase feature branches** before merging
5. **Test before merging** to main
6. **Update VERSION file** only in release/hotfix branches
7. **Use PRs for code review** before merging to main/develop

## Current Status

- **Current Version**: See `VERSION` file
- **Current Branch**: `main`
- **Last Release**: See latest tag in git
