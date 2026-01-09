# Repository Rename Instructions

## Step 1: Rename on GitHub

1. Go to your repository settings:
   https://github.com/hynuk/course-797-pathway-data/settings

2. Scroll down to the "Repository name" section

3. Change the name from `course-797-pathway-data` to `course-pathway-data`

4. Click "Rename"

## Step 2: Update Local Git Remote

After renaming on GitHub, run this command:

```bash
git remote set-url origin https://github.com/hynuk/course-pathway-data.git
```

Verify it worked:
```bash
git remote -v
```

## Step 3: Verify URLs

After renaming, your media URLs will be:
- `https://raw.githubusercontent.com/hynuk/course-pathway-data/main/assets/course-797/scenes/scene-l1.png`
- `https://raw.githubusercontent.com/hynuk/course-pathway-data/main/assets/course-797/sprints/sprint-s1.1-fg.png`

The `manage-media.js` script has already been updated to use the new repository name.

## Benefits

- ✅ Generic name supports all language pairs
- ✅ Course-specific assets organized under `assets/course-{id}/`
- ✅ Easy to add new courses (course-798, course-799, etc.)
- ✅ Clear, maintainable structure

