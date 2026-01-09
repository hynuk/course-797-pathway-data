# Setup Instructions for GitHub Hosting

## Option 1: Create GitHub Repository via Web UI

1. Go to https://github.com/new
2. Create a new repository (e.g., `course-797-pathway-data`)
3. **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/course-797-pathway-data.git`)

Then run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/course-797-pathway-data.git
git branch -M main
git push -u origin main
```

## Option 2: Create GitHub Repository via GitHub CLI (if installed)

```bash
gh repo create course-797-pathway-data --public --source=. --remote=origin --push
```

## After Pushing

Your file will be available at:
```
https://raw.githubusercontent.com/YOUR_USERNAME/course-797-pathway-data/main/data/course-797/course_797_extensions.refined.json
```

## Making Updates

1. Edit `data/course-797/course_797_extensions.refined.json`
2. Commit and push:
   ```bash
   git add data/course-797/course_797_extensions.refined.json
   git commit -m "Update pathway data"
   git push
   ```
3. The file will be immediately updated at the raw URL

## Alternative: GitHub Gist (Simpler for Single File)

If you prefer a simpler option for a single file:

1. Go to https://gist.github.com
2. Create a new gist
3. Name it `course_797_extensions.refined.json`
4. Paste the file contents
5. Click "Create public gist"
6. Use the raw URL: `https://gist.githubusercontent.com/USERNAME/GIST_ID/raw/course_797_extensions.refined.json`

