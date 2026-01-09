# Data Architecture Decision Guide

## Current File Size
- **Refined JSON**: ~39KB (38,814 bytes)
- **Original**: ~53KB (52,778 bytes)
- **Compression**: 26.5% reduction

## Recommendation: **Single JSON File** (for prototype)

### Why Single File Works Best Here:

1. **Small File Size**: 39KB is negligible for modern networks
   - Loads in <100ms on most connections
   - Browser caching handles it efficiently
   - No noticeable performance impact

2. **Data Consistency**: 
   - Single source of truth
   - No risk of version mismatches between files
   - Easier to maintain and update

3. **Create With Play Workflow**:
   - One Fetch block loads everything
   - Use Transform blocks to extract what each component needs
   - Simpler setup and debugging

4. **Prototype Phase**:
   - Faster iteration
   - Less file management overhead
   - Easier to experiment with different data views

## When to Split into Multiple Files:

Consider splitting if:
- File grows >500KB
- You need different caching strategies per data type
- Different components update independently
- You're building a production app with strict performance requirements

## Component Data Needs Analysis

Based on your JSON structure, here's what different components would need:

### 1. **Levels Menu Component**
```javascript
// Needs: levels array (simplified)
data.levels.map(level => ({
  levelId, name, description, sprintCount
}))
// Size: ~2KB
```

### 2. **Scene View Component**
```javascript
// Needs: sceneStack.scenes, sceneStack.sceneWaypoints, sceneStack.sceneArtifacts
// Filtered by sceneId
// Size: ~5-8KB per scene
```

### 3. **Sprint List Component**
```javascript
// Needs: levels[].sprints (for a specific level)
// Size: ~3-5KB per level
```

### 4. **Artifact Details Component**
```javascript
// Needs: sceneStack.sceneArtifacts (filtered by sceneId)
// Size: ~2-4KB per scene
```

### 5. **Waypoint Map Component**
```javascript
// Needs: sceneStack.sceneWaypoints (filtered by sceneId)
// Size: ~1KB per scene
```

## Implementation Strategy

### Option A: Single File (Recommended for Prototype)

**Structure in Create With Play:**
```
Fetch Block (loads full JSON)
  ├─ Transform: levels-menu → Extract levels array
  ├─ Transform: scene-data → Extract sceneStack by sceneId
  ├─ Transform: sprint-list → Extract sprints by levelId
  └─ Transform: artifact-data → Extract artifacts by sceneId
```

**Pros:**
- ✅ One network request
- ✅ Data always in sync
- ✅ Simple to maintain
- ✅ Fast enough for prototype

**Cons:**
- ❌ Loads all data even if only using part
- ❌ Slightly larger initial payload

### Option B: Multiple Files (For Production)

**File Structure:**
```
course-797-levels.json          (~2KB) - Levels menu data
course-797-scenes.json           (~15KB) - All scene data
course-797-levels-detailed.json  (~20KB) - Full level data with sprints
```

**Pros:**
- ✅ Smaller individual payloads
- ✅ Better caching granularity
- ✅ Can load on-demand

**Cons:**
- ❌ Multiple network requests
- ❌ Risk of data inconsistency
- ❌ More complex to maintain
- ❌ More Fetch blocks needed

## Hybrid Approach (Best of Both Worlds)

For production, consider:

1. **Initial Load**: Single lightweight file with just menu/summary data
2. **On-Demand**: Load detailed data when user navigates to specific views

```javascript
// Initial load: course-797-summary.json (~5KB)
{
  "levels": [...], // Simplified levels for menu
  "metadata": {...}
}

// On navigation: Load full scene data
// course-797-scene-SCN-L1.json (~8KB)
```

## Recommendation for Your Prototype

**Start with Single File** because:
1. Your file is small (39KB)
2. You're prototyping - speed of iteration matters more
3. Create With Play handles transforms well
4. You can always split later if needed

Use Transform blocks to extract component-specific data:
- Keeps your code clean
- Easy to modify
- No file management overhead

## Example Transform Functions

See `extract-levels-menu.js` for examples of how to extract data for specific components.

