# SVG Title Illustrations

This document describes the SVG title illustration system for sprint names.

## Overview

SVG title illustrations complement sprint names by providing visual representations of the sprint content. These are separate from the foreground/background images and are used specifically for displaying sprint titles.

## Naming Convention

**Format:** `sprint-l{level}-s{sprint}-title.svg`

### Examples
- `sprint-l1-s1-title.svg` - Level 1, Sprint 1 title illustration
- `sprint-l1-s2-title.svg` - Level 1, Sprint 2 title illustration
- `sprint-l2-s10-title.svg` - Level 2, Sprint 10 title illustration

## Folder Structure

```
assets/course-797/sprints/
├── images/              # PNG images (foreground/background)
│   ├── sprint-l1-s1-fg.png
│   ├── sprint-l1-s1-bg.png
│   └── ...
└── titles/              # SVG title illustrations
    ├── sprint-l1-s1-title.svg
    ├── sprint-l1-s2-title.svg
    └── ...
```

## JSON Structure

Title illustrations are added to sprint objects via the `titleIllustrationId` field:

```json
{
  "sprintId": "S1.1",
  "name": {
    "source": { "inheritFromChapter": true },
    "target": "挨拶と雑談",
    "romanization": "aisatsu to zatsudan"
  },
  "foregroundImageId": "https://...",
  "backgroundImageId": "https://...",
  "titleIllustrationId": "https://raw.githubusercontent.com/hynuk/course-pathway-data/main/assets/course-797/sprints/titles/sprint-l1-s1-title.svg"
}
```

## Image ID Format

For Image ID references (instead of full URLs), use:
- `IMG-S1.1-TITLE` → `sprint-l1-s1-title.svg`

## GitHub URLs

Title illustrations are accessed via GitHub raw URLs:
```
https://raw.githubusercontent.com/{owner}/{repo}/{branch}/assets/course-{id}/sprints/titles/sprint-{sprintId}-title.svg
```

**Example:**
```
https://raw.githubusercontent.com/hynuk/course-pathway-data/main/assets/course-797/sprints/titles/sprint-l1-s1-title.svg
```

## Current Status

- ✅ Naming convention established: `sprint-l{level}-s{sprint}-title.svg`
- ✅ Folder structure: `sprints/titles/` for SVGs, `sprints/images/` for PNGs
- ✅ JSON structure: `titleIllustrationId` field added to sprints
- ✅ Media management tools updated to support SVGs
- ✅ Documentation updated

## Notes

- Title illustrations are **additions**, not replacements for sprint names
- Sprint names (source, target, romanization) remain unchanged
- SVGs are stored separately from PNG images for better organization
- The system supports both full URLs and Image ID references

