# Course 797 Extensions - Pathway Data

This repository contains the refined JSON data file for course 797 pathway feature, along with media assets, utility scripts, and documentation.

## Project Structure

```
mango-pathway/
├── data/                    # All data files
│   ├── course-797/         # Course 797 data files
│   │   ├── course_797_extensions.refined.json  # Main data file
│   │   ├── course-797.json  # Reference file
│   │   └── course-completion-data.json
│   └── examples/            # Example data files
├── assets/                  # Media assets
│   └── course-797/
│       ├── scenes/          # Level scene backgrounds
│       └── sprints/         # Sprint thumbnails and titles
├── scripts/                 # Utility scripts
│   ├── data/               # Data extraction scripts
│   ├── media/              # Media management scripts
│   ├── git/                # Git/GitHub scripts
│   └── version/            # Version management scripts
├── docs/                    # Documentation
│   ├── architecture/       # Data architecture docs
│   ├── media/              # Media management docs
│   ├── setup/               # Setup instructions
│   └── version/             # Version management docs
├── CHANGELOG.md            # Change history
├── VERSION                 # Current version
└── README.md               # This file
```

## Main Data File

The primary data file is located at:
- `data/course-797/course_797_extensions.refined.json`

This file contains:
- Course metadata and validation information
- Scene stack with scenes, waypoints, artifacts, and placements
- Level configurations with sprints and scene references
- All internationalized content (source, target, romanization)

## Fetching the File

Once pushed to GitHub, you can fetch the file directly using the raw URL:

```
https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO_NAME/main/data/course-797/course_797_extensions.refined.json
```

Or if using a branch:
```
https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO_NAME/BRANCH_NAME/data/course-797/course_797_extensions.refined.json
```

## Making Changes

1. Edit `data/course-797/course_797_extensions.refined.json` locally
2. Commit and push changes:
   ```bash
   git add data/course-797/course_797_extensions.refined.json
   git commit -m "Update pathway data"
   git push
   ```
3. The updated file will be immediately available at the raw URL

## Scripts

This repository includes utility scripts for managing data, media, and versions. See `scripts/README.md` for details.

Common npm scripts:
```bash
npm run extract:levels      # Extract levels menu data
npm run media:report        # Generate media management report
npm run version:patch       # Bump patch version
```

## Documentation

- **Setup**: See `docs/setup/SETUP.md` for GitHub hosting setup
- **Data Architecture**: See `docs/architecture/DATA_ARCHITECTURE.md`
- **Media Management**: See `docs/media/MEDIA_MANAGEMENT.md`
- **Version Management**: See `docs/version/VERSION_MANAGEMENT.md`
- **Scripts**: See `scripts/README.md`

