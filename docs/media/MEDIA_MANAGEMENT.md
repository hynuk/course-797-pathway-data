# Media Management Guide

This guide explains how to manage media assets for the Course 797 Pathway prototype.

## Overview

The `course_797_extensions.refined.json` file references media assets in two ways:
1. **Full URLs** - Direct links to images hosted externally (e.g., GitHub raw URLs)
2. **Image IDs** - Local references that map to files following the standardized naming convention

**📋 See [MEDIA_NAMING_CONVENTION.md](./MEDIA_NAMING_CONVENTION.md) for the complete naming convention and folder structure.**

## File Structure

```
mango-pathway/
├── data/
│   └── course-797/
│       └── course_797_extensions.refined.json  # Main JSON file with media references
├── assets/                             # Organized media directory
│   └── course-797/
│       ├── scenes/                     # Level scene backgrounds
│       │   ├── scene-l1.png
│       │   └── ...
│       └── sprints/                    # Sprint thumbnails
│           ├── sprint-s1.1-fg.png
│           └── ...
└── scripts/
    └── media/
        ├── manage-media.js             # Media management tool
        └── organize-media.js           # Media organization utility
```

## Media Management Tool

The `manage-media.js` script helps you:
- Analyze all media references in the JSON
- Validate which files exist locally
- Identify missing files
- Find orphaned files (files not referenced)
- Generate detailed reports

### Usage

```bash
# Generate a detailed report (default)
node scripts/media/manage-media.js report

# Output report as JSON
node scripts/media/manage-media.js json

# List only missing files
node scripts/media/manage-media.js missing

# List only orphaned files
node scripts/media/manage-media.js orphaned

# Generate GitHub URLs for all Image ID references
node scripts/media/manage-media.js urls
```

### Organization Utility

The `organize-media.js` script helps organize files according to the naming convention:

```bash
# Preview organization plan (dry run)
node scripts/media/organize-media.js plan

# Execute organization (actually move/rename files)
node scripts/media/organize-media.js plan --execute

# Create folder structure template
node scripts/media/organize-media.js structure
```

### Example Output

```
================================================================================
MEDIA MANAGEMENT REPORT
================================================================================

SUMMARY:
  Total Sprints: 41
  Valid Local Files: 8
  Missing Files: 33
  URL References: 8
  Orphaned Files: 0
  Total Local Files: 8

MISSING FILES:
  [FOREGROUND] S2.1:
    Image ID: IMG-S2.1-FG
    Expected: s2.1-foreground.png
  ...
```

## Image ID Naming Convention

The script uses the standardized naming convention. See [MEDIA_NAMING_CONVENTION.md](./MEDIA_NAMING_CONVENTION.md) for complete details.

### Quick Reference

**Sprint Images:**
- `IMG-S2.1-FG` → `sprints/sprint-s2.1-fg.png`
- `IMG-S2.1-BG` → `sprints/sprint-s2.1-bg.png`

**Scene Images:**
- `IMG-SCN-L1` → `scenes/scene-l1.png`

**GitHub URLs:**
- `https://raw.githubusercontent.com/hynuk/course-797-pathway-data/main/assets/sprints/sprint-s2.1-fg.png`

## Current Status

### Level 1 (L1) - Uses Full URLs
All 4 sprints in Level 1 currently use full GitHub URLs:
- `S1.1`: `small-talk-foreground.png` / `small-talk-background.png`
- `S1.2`: `directions-foreground.png` / `directions-background.png`
- `S1.3`: `introductions-professions-foreground.png` / `introductions-professions-background.png`
- `S1.4`: `info-personal-preferences-foreground.png` / `info-personal-preferences-background.png`

### Levels 2-5 (L2-L5) - Use Image IDs
All other sprints use Image ID references that need corresponding local files:
- `IMG-S2.1-FG`, `IMG-S2.2-FG`, etc. (foreground images)
- Background images are mostly `null` in the current JSON

## Adding New Media Files

1. **Create the image file** with the expected filename (see naming convention above)
2. **Place it in** `assets/course-797/` directory (in appropriate subdirectory)
3. **Run the validation**: `node scripts/media/manage-media.js report`
4. **Verify** the file appears in "VALID LOCAL FILES"

## Converting URLs to Local References

If you want to convert external URLs to local file references:

1. **Download the image** from the URL
2. **Save it** in `assets/course-797/` with the appropriate name and subdirectory
3. **Update the JSON** to replace the URL with the Image ID (e.g., `IMG-S1.1-FG`)
4. **Run validation** to confirm

## Best Practices

1. **Use consistent naming**: Follow the `sprintId-foreground.png` / `sprintId-background.png` pattern
2. **Keep files organized**: All media should be in `assets/course-797/` with appropriate subdirectories
3. **Validate regularly**: Run `node scripts/media/manage-media.js report` after adding or removing files
4. **Document changes**: Update this guide if naming conventions change

## Troubleshooting

### "Missing Files" but file exists
- Check the filename matches exactly (case-sensitive on some systems)
- Verify the file extension is `.png`, `.jpg`, `.jpeg`, `.svg`, or `.webp`
- Ensure the file is in `assets/course-797/` directory (in appropriate subdirectory)

### "Orphaned Files"
- These are files in the directory that aren't referenced in the JSON
- Either add references to them in the JSON, or remove the files if they're not needed

### Image ID not resolving
- Check the Image ID format matches the expected pattern
- Update `resolveImageIdToFilename()` in `manage-media.js` if you use a different convention

