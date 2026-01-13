# Status System Documentation

This document explains the unified status system used for tracking progress and state across **Levels** and **Sprints** in the Course Pathway data structure.

---

## Overview

The status system provides a clean, scalable way to track:
- **Level Status**: Whether a level is locked, not started, in progress, or complete
- **Sprint Status**: Whether a sprint is locked, ready to start, or complete
- **Progress Tracking**: Which sprint is currently active and which was last completed

---

## Status Values

### Shared Status Values

These status values have the same meaning for both levels and sprints:

| Status | Meaning | Applies To |
|--------|---------|------------|
| `"locked"` | Not accessible yet. User must complete prerequisite content first. | Levels, Sprints |
| `"complete"` | Finished. All content has been completed. | Levels, Sprints |

### Level-Specific Status Values

Levels are **containers** that can have multiple sprints in different states. Level status reflects the overall state of the container:

| Status | Meaning | When Used |
|--------|---------|-----------|
| `"not_started"` | Level is unlocked but no sprints have been started yet. | Level unlocked, `progress.currentSprintId === null` |
| `"in_progress"` | At least one sprint has been started, but not all sprints are complete. | Level has active or completed sprints, but not all complete |
| `"complete"` | All sprints in the level are complete. | All sprints have `status === "complete"` |
| `"locked"` | Level is not accessible yet. Previous level must be completed first. | Default for levels L2+ until prerequisites met |

### Sprint-Specific Status Values

Sprints are **sequential items** within a level. Sprint status indicates position in the sequence:

| Status | Meaning | When Used |
|--------|---------|-----------|
| `"ready"` | Next sprint available to start. Previous sprint is complete. | Previous sprint `status === "complete"`, this sprint is next |
| `"complete"` | Sprint has been finished. | All sessions/lessons in sprint completed |
| `"locked"` | Sprint is not accessible yet. Previous sprint must be completed first. | Default for all sprints except the first in a level |

---

## Status System Architecture

### Unified System with Semantic Differences

The status system is **unified** (shared common states) but allows **semantic differences** where appropriate:

```
┌─────────────────────────────────────────┐
│         Shared States                   │
│  • locked (same meaning)                │
│  • complete (same meaning)               │
└─────────────────────────────────────────┘
           │              │
           ▼              ▼
┌──────────────────┐  ┌──────────────────┐
│  Level States    │  │  Sprint States   │
│  • not_started   │  │  • ready         │
│  • in_progress   │  │                  │
└──────────────────┘  └──────────────────┘
```

**Why Different States?**

1. **Levels are containers**: A level can be `"in_progress"` while containing sprints with mixed states (`complete`, `ready`, `locked`)
2. **Sprints are sequential**: The `"ready"` state indicates the next actionable item in a sequence
3. **Shared semantics**: `"locked"` and `"complete"` mean the same thing for both, maintaining consistency

---

## Progress Tracking

### Level Progress Object

Each level contains a `progress` object that tracks the resume point:

```json
{
  "levelId": "L1",
  "status": "in_progress",
  "progress": {
    "lastCompletedSprintId": "S1.1",
    "currentSprintId": "S1.2"
  }
}
```

**Fields:**
- `lastCompletedSprintId`: Sprint ID of the last completed sprint, or `null` if none
- `currentSprintId`: Sprint ID of the currently active sprint (resume point), or `null` if not started

**Values:**
- Use `null` for unstarted progress (standard JSON practice)
- Use sprint IDs (e.g., `"S1.2"`) when progress exists

### Top-Level Progress Object

The root level also has a `progress` object tracking overall course resume point:

```json
{
  "progress": {
    "currentLevelId": "L1",
    "currentSprintId": "S1.2",
    "lastCompletedLevelId": "L1",
    "lastCompletedSprintId": "S1.1"
  }
}
```

This allows users to resume at the overall course level, while each level maintains its own independent progress tracking.

---

## Status Determination Logic

### Level Status Calculation

```javascript
function calculateLevelStatus(level) {
  const { sprints, progress } = level;
  
  // Check if level is locked (prerequisite not met)
  if (isPrerequisiteLocked(level)) {
    return "locked";
  }
  
  // Check if all sprints are complete
  const allComplete = sprints.every(s => s.status === "complete");
  if (allComplete) {
    return "complete";
  }
  
  // Check if any sprint has been started
  const hasProgress = progress.currentSprintId !== null;
  if (hasProgress) {
    return "in_progress";
  }
  
  // Level is unlocked but not started
  return "not_started";
}
```

### Sprint Status Calculation

```javascript
function calculateSprintStatus(sprint, previousSprint, levelProgress) {
  // Check if previous sprint is complete (unlocks this one)
  if (previousSprint && previousSprint.status !== "complete") {
    return "locked";
  }
  
  // Check if this sprint is complete
  if (sprint.isComplete) {
    return "complete";
  }
  
  // Check if this is the current active sprint
  if (levelProgress.currentSprintId === sprint.sprintId) {
    return "ready"; // Active sprint is always "ready"
  }
  
  // Check if previous sprint is complete (this one is next)
  if (!previousSprint || previousSprint.status === "complete") {
    return "ready";
  }
  
  return "locked";
}
```

---

## UI Implementation Guide

### Determining Active Sprint Card

To highlight the active sprint card in the UI:

```javascript
// Find the active sprint
const activeSprint = level.sprints.find(sprint => 
  sprint.sprintId === level.progress.currentSprintId
);

// Apply active styling
if (activeSprint) {
  // Highlight this sprint card
  applyActiveStyle(activeSprint);
}
```

### Status-Based UI Rendering

```javascript
// Level status rendering
function renderLevelStatus(level) {
  switch (level.status) {
    case "locked":
      return <LockedIcon />;
    case "not_started":
      return <UnlockedIcon />;
    case "in_progress":
      return <ProgressIndicator progress={calculateProgress(level)} />;
    case "complete":
      return <CheckmarkIcon />;
  }
}

// Sprint status rendering
function renderSprintStatus(sprint, isActive) {
  if (isActive) {
    return <ActiveBadge />;
  }
  
  switch (sprint.status) {
    case "locked":
      return <LockIcon />;
    case "ready":
      return <PlayButton />;
    case "complete":
      return <CheckmarkIcon />;
  }
}
```

### Progress Calculation

```javascript
// Calculate level completion percentage
function calculateLevelProgress(level) {
  const { sprints } = level;
  const completedCount = sprints.filter(s => s.status === "complete").length;
  return (completedCount / sprints.length) * 100;
}

// Check if level can be accessed
function canAccessLevel(level) {
  return level.status !== "locked";
}

// Check if sprint can be started
function canStartSprint(sprint) {
  return sprint.status === "ready";
}
```

---

## Status State Transitions

### Level State Transitions

```
locked → not_started → in_progress → complete
  ↑                                    ↓
  └────────────────────────────────────┘
      (if user goes back to previous level)
```

**Transitions:**
1. `locked` → `not_started`: Prerequisite level completed
2. `not_started` → `in_progress`: First sprint started (`currentSprintId` set)
3. `in_progress` → `complete`: All sprints completed
4. `complete` → `in_progress`: User returns to level (resume point)

### Sprint State Transitions

```
locked → ready → complete
  ↑        ↓
  └────────┘
  (if user goes back)
```

**Transitions:**
1. `locked` → `ready`: Previous sprint completed
2. `ready` → `complete`: Sprint finished
3. `complete` → `ready`: User returns to sprint (if allowed)

---

## Data Structure Examples

### Level with In-Progress Status

```json
{
  "levelId": "L1",
  "unitId": 10002032,
  "status": "in_progress",
  "sprints": [
    {
      "sprintId": "S1.1",
      "status": "complete"
    },
    {
      "sprintId": "S1.2",
      "status": "ready"
    },
    {
      "sprintId": "S1.3",
      "status": "locked"
    },
    {
      "sprintId": "S1.4",
      "status": "locked"
    }
  ],
  "progress": {
    "lastCompletedSprintId": "S1.1",
    "currentSprintId": "S1.2"
  }
}
```

### Level with Locked Status

```json
{
  "levelId": "L2",
  "unitId": 10002033,
  "status": "locked",
  "sprints": [
    {
      "sprintId": "S2.1",
      "status": "locked"
    }
    // ... all sprints locked
  ],
  "progress": {
    "lastCompletedSprintId": null,
    "currentSprintId": null
  }
}
```

### Level with Complete Status

```json
{
  "levelId": "L1",
  "unitId": 10002032,
  "status": "complete",
  "sprints": [
    {
      "sprintId": "S1.1",
      "status": "complete"
    }
    // ... all sprints complete
  ],
  "progress": {
    "lastCompletedSprintId": "S1.4",
    "currentSprintId": "S1.4"
  }
}
```

---

## Best Practices

### 1. Always Check Status Before Access

```javascript
// ✅ Good: Check status before allowing access
if (level.status === "locked") {
  showLockedMessage();
  return;
}

// ❌ Bad: Don't assume access
startLevel(level); // Might be locked!
```

### 2. Use Progress for Resume Points

```javascript
// ✅ Good: Use progress.currentSprintId for resume point
const resumeSprint = level.sprints.find(
  s => s.sprintId === level.progress.currentSprintId
);

// ❌ Bad: Don't guess which sprint to resume
const resumeSprint = level.sprints[0]; // Wrong!
```

### 3. Validate Status Values

```javascript
// ✅ Good: Validate status values
const validLevelStatuses = ["locked", "not_started", "in_progress", "complete"];
const validSprintStatuses = ["locked", "ready", "complete"];

if (!validLevelStatuses.includes(level.status)) {
  console.error("Invalid level status:", level.status);
}
```

### 4. Handle Null Progress Gracefully

```javascript
// ✅ Good: Handle null progress
const currentSprint = level.progress.currentSprintId 
  ? level.sprints.find(s => s.sprintId === level.progress.currentSprintId)
  : null;

// ❌ Bad: Don't assume progress exists
const currentSprint = level.sprints.find(
  s => s.sprintId === level.progress.currentSprintId
); // Might throw error if currentSprintId is null
```

---

## Migration Notes

### From Previous System

If migrating from a system that used different status values:

| Old Value | New Value | Notes |
|-----------|-----------|-------|
| `"not_started"` (progress) | `null` | Use `null` for unstarted progress |
| `"none"` (progress) | `null` | Standard JSON practice |
| `"active"` (sprint) | `"ready"` | More descriptive |
| `"started"` (level) | `"in_progress"` | More accurate for containers |

---

## Summary

The status system provides:

✅ **Unified**: Shared common states (`locked`, `complete`)  
✅ **Semantic**: Entity-specific states where needed (`in_progress`, `ready`)  
✅ **Scalable**: Works for any number of levels and sprints  
✅ **Type-safe**: Uses `null` for uninitialized (standard JSON)  
✅ **Maintainable**: Clear, explicit status values  
✅ **Complete**: Covers all states (started/active/complete/locked)

This system enables clean UI implementation while maintaining data consistency and scalability.
