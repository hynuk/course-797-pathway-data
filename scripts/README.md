# Scripts Directory

This directory contains all executable scripts organized by purpose.

## Directory Structure

```
scripts/
├── data/          # Data extraction and transformation scripts
├── media/         # Media asset management scripts
├── git/           # Git and GitHub operation scripts
└── version/       # Version management and release scripts
```

## Script Categories

### Data Scripts (`scripts/data/`)

#### `extract-levels-menu.js`
Extracts levels menu data from the main JSON file.

#### `component-data-extractors.js`
Utility functions for extracting component-specific data (used in Create With Play).

#### `waypoint-coord-converter.py`
Converts pixel coordinates to percentage coordinates for scene waypoints.

```bash
python3 scripts/data/waypoint-coord-converter.py <pixel_x> <pixel_y> <image_width> <image_height>
```

### Media Scripts (`scripts/media/`)

#### `manage-media.js`
Media asset management tool.

```bash
# Generate detailed report
node scripts/media/manage-media.js report

# List missing files
node scripts/media/manage-media.js missing

# Generate GitHub URLs
node scripts/media/manage-media.js urls
```

#### `organize-media.js`
Organizes media files according to naming conventions.

```bash
# Preview organization plan
node scripts/media/organize-media.js plan

# Execute organization
node scripts/media/organize-media.js plan --execute
```

#### `rename-media.js`, `rename-sprint-files.js`, `update-svg-naming.js`
Media file renaming utilities.

### Git Scripts (`scripts/git/`)

#### `create_github_repo.sh`
Creates a new GitHub repository.

#### `push_to_github.sh`
Pushes changes to GitHub and displays the raw URL.

### Version Scripts (`scripts/version/`)

#### `version-bump.js`
Bumps the version number in the VERSION file.

```bash
# Bump patch version (1.2.3 → 1.2.4)
node scripts/version/version-bump.js patch

# Bump minor version (1.2.3 → 1.3.0)
node scripts/version/version-bump.js minor

# Bump major version (1.2.3 → 2.0.0)
node scripts/version/version-bump.js major

# With changelog update
node scripts/version/version-bump.js patch --changelog
```

#### `create-release.sh`
Creates a release branch, bumps version, and prepares for release.

```bash
# Create patch release (1.2.3 → 1.2.4)
./scripts/version/create-release.sh patch

# Create minor release (1.2.3 → 1.3.0)
./scripts/version/create-release.sh minor

# Create major release (1.2.3 → 2.0.0)
./scripts/version/create-release.sh major
```

#### `create-hotfix.sh`
Creates a hotfix branch from `main` for urgent fixes.

```bash
# Create hotfix branch
./scripts/version/create-hotfix.sh fix-coordinate-bug
./scripts/version/create-hotfix.sh critical-data-validation
```

#### `commit-helper.sh`
Interactive helper for creating properly formatted commits.

```bash
./scripts/version/commit-helper.sh
```

## Using npm Scripts

For convenience, common scripts are available via npm:

```bash
# Data extraction
npm run extract:levels

# Media management
npm run media:report
npm run media:missing
npm run media:organize

# Version management
npm run version:patch
npm run version:minor
npm run version:major
```

## Quick Reference

### Common Workflows

#### Starting a New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/add-level-6
# Make changes
./scripts/version/commit-helper.sh
git push origin feature/add-level-6
```

#### Creating a Release
```bash
./scripts/version/create-release.sh minor
# Review CHANGELOG.md, test, then:
git tag -a v1.3.0 -m "Release version 1.3.0"
git checkout main
git merge release/v1.3.0
git push origin main
git push origin v1.3.0
```

#### Creating a Hotfix
```bash
./scripts/version/create-hotfix.sh fix-critical-bug
# Make fixes, then:
node scripts/version/version-bump.js patch --changelog
git add .
git commit -m "fix: Description of fix"
git tag -a v1.2.1 -m "Hotfix version 1.2.1"
git checkout main
git merge hotfix/v1.2.1-fix-critical-bug
git push origin main
git push origin v1.2.1
```

## See Also

- `docs/version/VERSION_MANAGEMENT.md` - Complete version management guide
- `CHANGELOG.md` - Change history
- `VERSION` - Current version number
