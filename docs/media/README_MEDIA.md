# Media Assets - Quick Start Guide

This is a quick reference for managing media assets in the Course 797 Pathway prototype.

## 📁 Folder Structure

**Multi-Course Structure (Recommended):**
```
assets/
├── course-797/          # Japanese for English speakers
│   ├── scenes/
│   │   └── scene-l{level}.png
│   └── sprints/
│       └── sprint-s{level}.{sprint}-{fg|bg}.png
├── course-798/          # Other language pairs
│   ├── scenes/
│   └── sprints/
└── ...
```

## 🏷️ Naming Convention

**Format:** `{type}-{identifier}-{variant}.{ext}`

### Examples

- **Scenes**: `scene-l1.png`, `scene-l5.png`
- **Sprints**: `sprint-s1.1-fg.png`, `sprint-s2.10-bg.png`

## 🔗 GitHub URLs

All assets are accessed via GitHub raw URLs. The system automatically includes the course ID in the path:

```
https://raw.githubusercontent.com/{owner}/{repo}/{branch}/assets/course-{id}/{path}
```

**Examples:**
```
# Course 797 (Japanese)
https://raw.githubusercontent.com/hynuk/course-pathway-data/main/assets/course-797/sprints/sprint-s2.1-fg.png

# Course 798 (Spanish - example)
https://raw.githubusercontent.com/hynuk/course-pathway-data/main/assets/course-798/sprints/sprint-s1.1-fg.png
```

## 🛠️ Tools

### 1. Media Management (`manage-media.js`)

Analyze and validate media references:

```bash
node manage-media.js report    # Full report
node manage-media.js missing   # List missing files
node manage-media.js urls      # Generate GitHub URLs
```

### 2. Media Organization (`organize-media.js`)

Organize files according to convention:

```bash
node organize-media.js plan              # Preview plan
node organize-media.js plan --execute    # Execute organization
node organize-media.js structure         # Create folders
```

## 📚 Documentation

- **[MEDIA_NAMING_CONVENTION.md](./MEDIA_NAMING_CONVENTION.md)** - Complete naming convention and organization guide
- **[MEDIA_MANAGEMENT.md](./MEDIA_MANAGEMENT.md)** - Detailed management guide

## 🚀 Quick Workflow

1. **Check status**: `node manage-media.js report`
2. **Generate URLs**: `node manage-media.js urls` (for Image ID references)
3. **Organize files**: `node organize-media.js plan` (preview) then `--execute`
4. **Upload to GitHub**: Commit assets to the repository
5. **Update JSON**: Use generated URLs or Image IDs in JSON

## 📝 Image ID to File Mapping

The system automatically extracts `courseId` from the JSON file:

| Image ID | Course ID | File Path |
|---------|-----------|-----------|
| `IMG-SCN-L1` | 797 | `assets/course-797/scenes/scene-l1.png` |
| `IMG-S1.1-FG` | 797 | `assets/course-797/sprints/sprint-s1.1-fg.png` |
| `IMG-S2.10-BG` | 797 | `assets/course-797/sprints/sprint-s2.10-bg.png` |
| `IMG-S1.1-FG` | 798 | `assets/course-798/sprints/sprint-s1.1-fg.png` |

## ⚙️ Configuration

Edit `MEDIA_CONFIG` in `manage-media.js` to customize:
- GitHub repository (owner, repo, branch)
- Folder structure (organized vs flat)
- Base path in repository

