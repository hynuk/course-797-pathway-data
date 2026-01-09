# Course 797 Data Relationships

This document explains how `course_797_extensions.refined.json` (the **Pathway Extensions** file) works with `course-797.json` (the **Course Data** file) to create a complete learning pathway experience.

---

## Overview

The **Course Data** file (`course-797.json`) contains the core learning content structure:
- **Units** → **Chapters** → **Lessons**
- Grammar goals, conversation goals, vocabulary counts
- Content metadata (reading, listening, vocab lists)

The **Pathway Extensions** file (`course_797_extensions.refined.json`) adds:
- **Levels** → **Sprints** → **Sessions**
- Visual pathway scenes, waypoints, artifacts
- Progress tracking, sprint statuses
- UI-specific data (images, descriptions, names)

**Together**, they create a complete pathway where learners navigate through visual levels and sprints that map to the underlying course units and chapters.

---

## Core Relationships

### 1. Levels ↔ Units (1:1 Mapping)

Each **Level** in the Pathway Extensions file corresponds to exactly one **Unit** in the Course Data file.

**Mapping:**
- `level.levelId` → identifies the level (e.g., "L1", "L2")
- `level.unitId` → links to `unit.id` in Course Data

**Example:**
```json
// Pathway Extensions (course_797_extensions.refined.json)
{
  "levelId": "L1",
  "unitId": 10002032,  // ← Links to Course Data
  "scene": { ... }
}

// Course Data (course-797.json)
{
  "id": 10002032,  // ← Matches unitId above
  "number": 1,
  "sourceName": "Introductions",
  "chapters": [ ... ]
}
```

**How to use:**
1. Find a level in Pathway Extensions: `level.unitId = 10002032`
2. Look up the unit in Course Data: `units.find(u => u.id === 10002032)`
3. Access unit metadata: `unit.sourceName`, `unit.chapters`, etc.

---

### 2. Sprints ↔ Chapters (1:1 Mapping)

Each **Sprint** in a level corresponds to exactly one **Chapter** in the corresponding unit.

**Mapping:**
- `sprint.sprintId` → identifies the sprint (e.g., "S1.1", "S2.3")
- `sprint.chapterId` → links to `chapter.id` in Course Data

**Example:**
```json
// Pathway Extensions
{
  "levelId": "L1",
  "sprints": [
    {
      "sprintId": "S1.1",
      "chapterId": 10025680,  // ← Links to Course Data
      "name": { ... },
      "description": { ... }
    }
  ]
}

// Course Data
{
  "id": 10002032,  // Unit for L1
  "chapters": [
    {
      "id": 10025680,  // ← Matches chapterId above
      "number": 1,
      "sourceName": "Salutations and Small Talk",
      "lessons": 9,
      "grammarGoals": [ ... ],
      "conversationGoals": [ ... ]
    }
  ]
}
```

**How to use:**
1. Find a sprint: `sprint.chapterId = 10025680`
2. Find the unit: `level.unitId = 10002032`
3. Look up the chapter: `unit.chapters.find(c => c.id === 10025680)`
4. Access chapter content: `chapter.grammarGoals`, `chapter.conversationGoals`, `chapter.lessons`, etc.

---

## Complete Data Flow Example

Let's trace a complete example from Level 1, Sprint 1:

### Step 1: Start with Pathway Extensions
```json
{
  "levelId": "L1",
  "unitId": 10002032,
  "sprints": [
    {
      "sprintId": "S1.1",
      "chapterId": 10025680,
      "name": {
        "target": "挨拶と雑談",
        "romanization": "aisatsu to zatsudan"
      },
      "description": {
        "source": "In this sprint, you'll learn to greet people...",
        "target": "このスプリントでは、人に挨拶し..."
      },
      "status": "complete",
      "foregroundImageId": "https://...",
      "backgroundImageId": "https://..."
    }
  ]
}
```

### Step 2: Look up Unit in Course Data
```json
{
  "id": 10002032,
  "sourceName": "Introductions",
  "chapters": [ ... ]
}
```

### Step 3: Look up Chapter in Course Data
```json
{
  "id": 10025680,
  "sourceName": "Salutations and Small Talk",
  "lessons": 9,
  "vocabCardCount": 93,
  "grammarGoals": [
    {
      "body": [
        {"text": "Form Sentences Using the Copula ", "lang": "s"},
        {"text": "です", "lang": "t"}
      ]
    }
  ],
  "conversationGoals": [
    {
      "body": [{"text": "Greet People", "lang": "s"}]
    }
  ]
}
```

### Step 4: Combine Data for UI

**Pathway Extensions provides:**
- Visual pathway data (scene, waypoints, images)
- UI-friendly names and descriptions
- Progress tracking (status: "complete", "ready", "locked")
- Sprint-level metadata

**Course Data provides:**
- Learning content structure (lessons, vocab)
- Grammar and conversation goals
- Content metadata (hasReading, hasListening)

**Together, you can:**
- Display the sprint card with image and description
- Show progress status
- Link to the actual learning content (lessons)
- Display grammar/conversation goals
- Show vocabulary count

---

## ID Reference Guide

### Level IDs → Unit IDs

| Level ID | Unit ID | Unit Name |
|----------|---------|-----------|
| L1 | 10002032 | Introductions |
| L2 | 10002033 | Connections |
| L3 | 10002034 | Community |
| L4 | 10002035 | Lifestyle |
| L5 | 10002036 | Ambitions |

### Sprint ID Format

Sprint IDs follow the pattern: `S{levelNumber}.{sprintNumber}`

- `S1.1` = Level 1, Sprint 1
- `S2.3` = Level 2, Sprint 3
- `S5.9` = Level 5, Sprint 9

### Chapter ID Lookup

To find a chapter ID from a sprint:
1. Get `sprint.chapterId` from Pathway Extensions
2. Find the unit: `unitId = level.unitId`
3. Find the chapter: `chapter.id = sprint.chapterId`

---

## Data Structure Comparison

### Course Data Structure (course-797.json)
```
Course (id: 797)
└── Units[]
    └── Chapters[]
        ├── Lessons (count)
        ├── Grammar Goals[]
        ├── Conversation Goals[]
        └── Vocabulary (count)
```

### Pathway Extensions Structure (course_797_extensions.refined.json)
```
Course (courseId: 797)
├── SceneStack
│   ├── Scenes[] (visual scenes for each level)
│   ├── Scene Images[]
│   ├── Waypoints[] (sprint locations on scene)
│   └── Artifacts[] (interactive objects)
└── Levels[]
    ├── Scene (visual representation)
    ├── Waypoints[] (linked to sprints)
    └── Sprints[]
        ├── Chapter ID (links to Course Data)
        ├── Name & Description (UI-friendly)
        ├── Status (complete/ready/locked)
        └── Images (foreground/background)
```

---

## Common Use Cases

### Use Case 1: Display Level Menu

**From Pathway Extensions:**
- Level name, scene image, sprint count
- Progress indicators

**From Course Data:**
- Unit description/metadata (if needed)

**Example:**
```javascript
const level = pathwayData.levels.find(l => l.levelId === "L1");
const unit = courseData.units.find(u => u.id === level.unitId);

// Display:
// - level.scene.name.source ("Tokyo Nights")
// - level.scene.name.target ("東京の夜")
// - level.sprints.length (sprint count)
// - unit.sourceName ("Introductions") - for context
```

### Use Case 2: Display Sprint Card

**From Pathway Extensions:**
- Sprint name (Japanese + romanization)
- Description
- Status (complete/ready/locked)
- Images (foreground/background)

**From Course Data:**
- Grammar goals
- Conversation goals
- Lesson count
- Vocabulary count

**Example:**
```javascript
const sprint = level.sprints.find(s => s.sprintId === "S1.1");
const chapter = unit.chapters.find(c => c.id === sprint.chapterId);

// Display:
// - sprint.name.target ("挨拶と雑談")
// - sprint.description.source
// - sprint.status ("complete")
// - sprint.foregroundImageId
// - chapter.grammarGoals (for details)
// - chapter.lessons (9 lessons)
```

### Use Case 3: Navigate to Learning Content

**From Pathway Extensions:**
- Sprint status (determines if content is accessible)
- Chapter ID (links to actual content)

**From Course Data:**
- Chapter structure
- Lessons array
- Content metadata

**Example:**
```javascript
if (sprint.status === "ready" || sprint.status === "complete") {
  // User can access content
  const chapter = getChapter(sprint.chapterId);
  // Navigate to chapter.lessons
}
```

---

## Key Fields Reference

### Pathway Extensions Key Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `levelId` | Unique level identifier | `"L1"` |
| `unitId` | Links to Course Data unit | `10002032` |
| `sprintId` | Unique sprint identifier | `"S1.1"` |
| `chapterId` | Links to Course Data chapter | `10025680` |
| `status` | Sprint progress state | `"complete"`, `"ready"`, `"locked"` |
| `foregroundImageId` | Sprint card foreground image URL | `"https://..."` |
| `backgroundImageId` | Sprint card background image URL | `"https://..."` |

### Course Data Key Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `unit.id` | Unique unit identifier | `10002032` |
| `unit.sourceName` | Unit name | `"Introductions"` |
| `chapter.id` | Unique chapter identifier | `10025680` |
| `chapter.sourceName` | Chapter name | `"Salutations and Small Talk"` |
| `chapter.lessons` | Number of lessons | `9` |
| `chapter.grammarGoals` | Grammar learning objectives | `[{...}]` |
| `chapter.conversationGoals` | Conversation objectives | `[{...}]` |

---

## Best Practices

### 1. Always Validate IDs

Before linking data, verify that IDs exist in both files:
```javascript
const level = pathwayData.levels.find(l => l.levelId === "L1");
const unit = courseData.units.find(u => u.id === level.unitId);
if (!unit) {
  console.error("Unit not found for level", level.levelId);
}
```

### 2. Handle Missing Data Gracefully

Some fields may be empty or use inheritance:
```javascript
// Level name may inherit from unit
if (level.name.source.inheritFromUnit) {
  const unit = getUnit(level.unitId);
  const displayName = unit.sourceName;
}

// Sprint name may inherit from chapter
if (sprint.name.source.inheritFromChapter) {
  const chapter = getChapter(sprint.chapterId);
  const displayName = chapter.sourceName;
}
```

### 3. Use Both Files Together

- **Pathway Extensions**: UI/UX, visual pathway, progress
- **Course Data**: Learning content, goals, structure

Don't duplicate data—reference it via IDs.

---

## Summary

The Pathway Extensions file (`course_797_extensions.refined.json`) and Course Data file (`course-797.json`) work together through **ID relationships**:

- **Levels** (Pathway) ↔ **Units** (Course Data) via `unitId`
- **Sprints** (Pathway) ↔ **Chapters** (Course Data) via `chapterId`

Use Pathway Extensions for:
- Visual pathway navigation
- Progress tracking
- UI-friendly names and descriptions
- Scene/waypoint/artifact data

Use Course Data for:
- Learning content structure
- Grammar and conversation goals
- Lesson and vocabulary metadata
- Content details

Together, they provide a complete pathway experience that combines visual navigation with structured learning content.

