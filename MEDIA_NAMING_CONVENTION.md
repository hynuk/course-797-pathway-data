# Media Naming Convention & Organization

This document defines the standardized naming convention and folder structure for all media assets used in Pathway prototypes. The system is designed to support multiple language pairs and courses.

## Overview

All media assets are stored in a GitHub repository and accessed via raw GitHub URLs. This convention ensures:
- **Scalability**: Easy to add new levels, sprints, and asset types
- **Maintainability**: Clear, predictable file names and organization
- **URL Generation**: Consistent pattern for generating GitHub raw URLs
- **Type Safety**: File names encode asset type and purpose

---

## Naming Convention

### Format Pattern

```
{type}-{identifier}-{variant}.{ext}
```

### Components

1. **Type** (required): Asset category
   - `scene` - Level background scenes
   - `sprint` - Sprint thumbnail images

2. **Identifier** (required): Unique identifier
   - For scenes: `l1`, `l2`, `l3`, etc. (level number)
   - For sprints: `l{level}-s{sprint}` format (e.g., `l1-s1`, `l2-s10`, `l5-s9`)
     - Explicitly includes level number to prevent ambiguity across levels
     - Format: `l{level}-s{sprint}` where level and sprint are numbers

3. **Variant** (optional): Image layer/type
   - `fg` - Foreground layer
   - `bg` - Background layer
   - Omitted for single-layer images (e.g., scenes)

4. **Extension** (required): File format
   - `.png` (preferred for transparency)
   - `.jpg` / `.jpeg` (for photos)
   - `.svg` (for vector graphics)
   - `.webp` (for optimized web images)

### Examples

#### Scene Images (Level Backgrounds)
```
scene-l1.png          # Level 1 scene background
scene-l2.png          # Level 2 scene background
scene-l5.png          # Level 5 scene background
```

#### Sprint Images
```
sprint-l1-s1-fg.png    # Level 1, Sprint 1 foreground
sprint-l1-s1-bg.png    # Level 1, Sprint 1 background
sprint-l2-s10-fg.png   # Level 2, Sprint 10 foreground
sprint-l5-s9-bg.png    # Level 5, Sprint 9 background
```

#### Sprint Title Illustrations (SVG)
```
sprint-l1-s1-title.svg    # Level 1, Sprint 1 title illustration
sprint-l1-s2-title.svg    # Level 1, Sprint 2 title illustration
sprint-l2-s10-title.svg   # Level 2, Sprint 10 title illustration
```

---

## Folder Structure

### Multi-Course Structure (Recommended)

The system is designed to support multiple language pairs and courses. Each course has its own directory:

```
assets/
├── course-797/          # Japanese for English speakers
│   ├── scenes/
│   │   ├── scene-l1.png
│   │   ├── scene-l2.png
│   │   └── ...
│   └── sprints/
│       ├── images/          # PNG images (foreground/background)
│       │   ├── sprint-s1.1-fg.png
│       │   ├── sprint-s1.1-bg.png
│       │   └── ...
│       └── titles/          # SVG title illustrations
│           ├── sprint-s1.1-title.svg
│           ├── sprint-s1.2-title.svg
│           └── ...
│
├── course-798/          # Spanish for English speakers (example)
│   ├── scenes/
│   └── sprints/
│       ├── images/
│       └── titles/
│
└── course-799/          # French for English speakers (example)
    ├── scenes/
    └── sprints/
        ├── images/
        └── titles/
```

### Single-Course Structure (Legacy)

For projects with only one course, you can use a flatter structure:

```
assets/
├── scenes/              # Level scene backgrounds
│   ├── scene-l1.png
│   └── ...
└── sprints/             # Sprint thumbnails
    ├── sprint-s1.1-fg.png
    └── ...
```

**Recommendation**: Use the multi-course structure (`course-{id}/`) to support multiple language pairs and future scalability.

---

## URL Generation

### GitHub Raw URL Pattern

For a GitHub repository at `https://github.com/{owner}/{repo}`, the raw URL pattern is:

```
https://raw.githubusercontent.com/{owner}/{repo}/{branch}/assets/{path}
```

### Examples

**Multi-Course Structure (Recommended):**
```
https://raw.githubusercontent.com/hynuk/course-pathway-data/main/assets/course-797/scenes/scene-l1.png
https://raw.githubusercontent.com/hynuk/course-pathway-data/main/assets/course-797/sprints/sprint-s1.1-fg.png
https://raw.githubusercontent.com/hynuk/course-pathway-data/main/assets/course-798/sprints/sprint-s1.1-fg.png
```

**Single-Course Structure:**
```
https://raw.githubusercontent.com/hynuk/course-pathway-data/main/assets/scenes/scene-l1.png
https://raw.githubusercontent.com/hynuk/course-pathway-data/main/assets/sprints/sprint-s1.1-fg.png
```

---

## Mapping from JSON Image IDs

The system automatically extracts the `courseId` from the JSON file to determine the correct path.

### Scene Images

| JSON Image ID | Course ID | File Path |
|--------------|-----------|-----------|
| `IMG-SCN-L1` | 797 | `assets/course-797/scenes/scene-l1.png` |
| `IMG-SCN-L2` | 797 | `assets/course-797/scenes/scene-l2.png` |
| `IMG-SCN-L1` | 798 | `assets/course-798/scenes/scene-l1.png` |

### Sprint Images

| JSON Image ID | Course ID | File Path |
|--------------|-----------|-----------|
| `IMG-S1.1-FG` | 797 | `assets/course-797/sprints/images/sprint-l1-s1-fg.png` |
| `IMG-S1.1-BG` | 797 | `assets/course-797/sprints/images/sprint-l1-s1-bg.png` |
| `IMG-S1.1-TITLE` | 797 | `assets/course-797/sprints/titles/sprint-l1-s1-title.svg` |
| `IMG-S2.10-FG` | 797 | `assets/course-797/sprints/images/sprint-l2-s10-fg.png` |
| `IMG-S1.1-FG` | 798 | `assets/course-798/sprints/images/sprint-l1-s1-fg.png` |

### Conversion Rules

1. **Scene Images**: `IMG-SCN-L{N}` → `scene-l{N}.png`
   - Remove `IMG-SCN-` prefix
   - Convert to lowercase
   - Add `scene-` prefix
   - Add `.png` extension

2. **Sprint Images**: `IMG-S{N}.{M}-{TYPE}` → `sprint-l{N}-s{M}-{type}.png`
   - Remove `IMG-` prefix
   - Parse sprint ID: `S{N}.{M}` where N is level, M is sprint number
   - Add `sprint-` prefix
   - Format as `l{N}-s{M}` (explicit level-sprint format)
   - Replace `-FG` with `-fg`, `-BG` with `-bg`
   - Add `.png` extension
   - Store in `sprints/images/` folder
   - Example: `IMG-S2.10-FG` → `sprint-l2-s10-fg.png`

3. **Sprint Title Illustrations**: `IMG-S{N}.{M}-TITLE` → `sprint-l{N}-s{M}-title.svg`
   - Remove `IMG-` prefix
   - Parse sprint ID: `S{N}.{M}` where N is level, M is sprint number
   - Add `sprint-` prefix
   - Format as `l{N}-s{M}` (explicit level-sprint format)
   - Replace `-TITLE` with `-title`
   - Add `.svg` extension
   - Store in `sprints/titles/` folder
   - Example: `IMG-S1.1-TITLE` → `sprint-l1-s1-title.svg`

---

## Best Practices

### 1. File Naming
- ✅ Use lowercase for all identifiers
- ✅ Use hyphens (`-`) as separators
- ✅ Be consistent with variant naming (`fg`/`bg`, not `foreground`/`background`)
- ✅ Use `.png` for images requiring transparency
- ❌ Avoid spaces, underscores, or special characters
- ❌ Don't use descriptive names (e.g., `tokyo-nights.png`) - use IDs

### 2. Organization
- ✅ Group by asset type (scenes vs sprints)
- ✅ Keep folder structure shallow (max 2-3 levels)
- ✅ Use consistent folder names across projects
- ❌ Avoid deep nesting that makes URLs long

### 3. Version Control
- ✅ Commit assets directly to the repository
- ✅ Use descriptive commit messages when adding assets
- ✅ Tag releases that include asset updates
- ❌ Don't store large binary files if avoidable (use Git LFS if needed)

### 4. URL Management
- ✅ Use a base URL constant in your code
- ✅ Generate URLs programmatically from Image IDs
- ✅ Document the repository and branch structure
- ❌ Don't hardcode full URLs throughout the codebase

---

## Migration Guide

### Converting Existing Files

If you have existing files with different naming:

1. **Rename files** to match the new convention
2. **Update JSON references** to use new Image IDs
3. **Update URLs** in JSON if using direct URLs
4. **Run validation**: `node manage-media.js report`

### Example Migration

**Before:**
```
course-797-thumbnails/
├── small-talk-foreground.png
├── directions-background.png
```

**After:**
```
assets/sprints/
├── sprint-s1.1-fg.png    (was small-talk-foreground.png)
├── sprint-s1.2-bg.png    (was directions-background.png)
```

---

## Future Extensions

This convention can be extended for new asset types:

```
artifact-{id}-{variant}.png    # Interactive artifacts
icon-{name}.svg                # UI icons
audio-{id}.mp3                 # Audio files
video-{id}.mp4                 # Video files
```

Follow the same pattern: `{type}-{identifier}-{variant}.{ext}`

